import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { rrulestr } from 'rrule';
import { RecurrenceRuleInvalidException } from '@lumora/shared';
import { EventRepository } from '../../auth/repositories/event.repository';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { SnoozeDuration } from '../dto/snooze-reminder.dto';
import {
  ReminderExecutionStatus,
  ReminderStatus,
} from '../../../generated/prisma/client.js';
import {
  ReminderCreatedEvent,
  ReminderTriggeredEvent,
  ReminderSnoozedEvent,
  ReminderCompletedEvent,
  ReminderCancelledEvent,
  ReminderRestoredEvent,
} from '../events/reminder.events';

@Injectable()
export class ReminderSchedulerService {
  private readonly logger = new Logger(ReminderSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventRepository: EventRepository,
    private readonly configService: ConfigService,
  ) {}

  getSchedulerConfig() {
    return {
      batchSize: this.configService.get<number>(
        'REMINDER_SCHEDULER_BATCH_SIZE',
        100,
      ),
      missedGraceMinutes: this.configService.get<number>(
        'REMINDER_MISSED_GRACE_MINUTES',
        60,
      ),
      defaultSnoozeMinutes: this.configService.get<number>(
        'REMINDER_DEFAULT_SNOOZE_MINUTES',
        15,
      ),
      retryLimit: this.configService.get<number>('REMINDER_RETRY_LIMIT', 3),
    };
  }

  validateRecurrenceRule(recurrenceRule: string): void {
    if (!recurrenceRule || !recurrenceRule.trim()) {
      return;
    }
    try {
      rrulestr(recurrenceRule);
    } catch (err: unknown) {
      const cause =
        err instanceof Error ? err.message : 'Invalid RFC 5545 RRULE string';
      throw new RecurrenceRuleInvalidException(recurrenceRule, cause);
    }
  }

  calculateNextOccurrence(
    remindAt: Date,
    recurrenceRule?: string | null,
  ): Date | null {
    if (!recurrenceRule) {
      return null;
    }
    try {
      const rule = rrulestr(recurrenceRule, { dtstart: remindAt });
      const nextDates = rule.after(remindAt, false);
      return nextDates ?? null;
    } catch (err: unknown) {
      this.logger.error(
        `Failed to calculate next occurrence for rule "${recurrenceRule}": ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return null;
    }
  }

  calculateSnoozeTarget(duration?: SnoozeDuration, until?: string): Date {
    if (until) {
      const target = new Date(until);
      if (isNaN(target.getTime())) {
        throw new RecurrenceRuleInvalidException(
          until,
          'Snooze until value is not a valid ISO 8601 timestamp',
        );
      }
      return target;
    }

    const config = this.getSchedulerConfig();
    const now = Date.now();
    let offsetMs = config.defaultSnoozeMinutes * 60 * 1000;

    switch (duration) {
      case SnoozeDuration.FIVE_MINUTES:
        offsetMs = 5 * 60 * 1000;
        break;
      case SnoozeDuration.FIFTEEN_MINUTES:
        offsetMs = 15 * 60 * 1000;
        break;
      case SnoozeDuration.ONE_HOUR:
        offsetMs = 60 * 60 * 1000;
        break;
      case SnoozeDuration.ONE_DAY:
        offsetMs = 24 * 60 * 60 * 1000;
        break;
      default:
        offsetMs = config.defaultSnoozeMinutes * 60 * 1000;
    }

    return new Date(now + offsetMs);
  }

  async executeReminder(
    reminderId: string,
    scheduledFor: Date,
    executionId: string,
  ): Promise<{ executed: boolean; duplicate: boolean }> {
    const existingExecution = await this.prisma.reminderExecution.findUnique({
      where: { executionId },
    });

    if (existingExecution) {
      this.logger.warn(
        `Idempotency check: Execution ${executionId} for reminder ${reminderId} already processed. Skipping.`,
      );
      return { executed: false, duplicate: true };
    }

    const reminder = await this.prisma.reminder.findUnique({
      where: { id: reminderId },
    });

    if (!reminder || reminder.status !== ReminderStatus.ACTIVE) {
      this.logger.warn(
        `Execution bypassed: Reminder ${reminderId} is not ACTIVE (status: ${reminder?.status}).`,
      );
      return { executed: false, duplicate: false };
    }

    const startTime = Date.now();
    const triggeredAt = new Date();
    const nextOccurrenceAt = this.calculateNextOccurrence(
      reminder.remindAt,
      reminder.recurrenceRule,
    );

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.reminderExecution.create({
          data: {
            reminderId,
            scheduledFor,
            executedAt: triggeredAt,
            status: ReminderExecutionStatus.TRIGGERED,
            executionId,
            durationMs: Date.now() - startTime,
          },
        });

        await tx.reminder.update({
          where: { id: reminderId },
          data: {
            lastExecutionId: executionId,
            lastTriggeredAt: triggeredAt,
            nextOccurrenceAt,
            executionStatus: ReminderExecutionStatus.TRIGGERED,
            revision: { increment: 1 },
          },
        });
      });

      await this.publishTriggered(
        new ReminderTriggeredEvent(
          reminder.id,
          reminder.workspaceId,
          reminder.objectId,
          executionId,
          triggeredAt,
          nextOccurrenceAt,
        ),
      );

      this.logger.log(
        `Reminder ${reminderId} executed successfully in ${Date.now() - startTime}ms (Execution: ${executionId}).`,
      );

      return { executed: true, duplicate: false };
    } catch (err: unknown) {
      const durationMs = Date.now() - startTime;
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown database error';
      this.logger.error(
        `Execution failed for reminder ${reminderId} (Execution: ${executionId}) after ${durationMs}ms: ${errorMessage}`,
      );

      try {
        await this.prisma.reminderExecution.create({
          data: {
            reminderId,
            scheduledFor,
            executedAt: triggeredAt,
            status: ReminderExecutionStatus.MISSED,
            executionId,
            errorMessage,
            durationMs,
          },
        });
      } catch (logErr: unknown) {
        this.logger.error(
          `Failed to persist error log for execution ${executionId}: ${
            logErr instanceof Error ? logErr.message : String(logErr)
          }`,
        );
      }

      throw err;
    }
  }

  async publishCreated(event: ReminderCreatedEvent): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: ReminderCreated - ${event.reminderId}`,
    );
    await this.eventRepository.create({
      userId: event.createdById,
      type: ReminderCreatedEvent.EVENT_NAME,
      payload: {
        reminderId: event.reminderId,
        workspaceId: event.workspaceId,
        objectId: event.objectId,
        remindAt: event.remindAt.toISOString(),
        recurrenceRule: event.recurrenceRule,
        source: event.source,
        triggerType: event.triggerType,
      },
    });
  }

  async publishTriggered(event: ReminderTriggeredEvent): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: ReminderTriggered - ${event.reminderId} (Execution: ${event.executionId})`,
    );
    await this.eventRepository.create({
      userId: '00000000-0000-0000-0000-000000000000',
      type: ReminderTriggeredEvent.EVENT_NAME,
      payload: {
        reminderId: event.reminderId,
        workspaceId: event.workspaceId,
        objectId: event.objectId,
        executionId: event.executionId,
        triggeredAt: event.triggeredAt.toISOString(),
        nextOccurrenceAt: event.nextOccurrenceAt?.toISOString(),
      },
    });
  }

  async publishSnoozed(event: ReminderSnoozedEvent): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: ReminderSnoozed - ${event.reminderId}`,
    );
    await this.eventRepository.create({
      userId: event.userId,
      type: ReminderSnoozedEvent.EVENT_NAME,
      payload: {
        reminderId: event.reminderId,
        workspaceId: event.workspaceId,
        objectId: event.objectId,
        snoozedUntil: event.snoozedUntil.toISOString(),
      },
    });
  }

  async publishCompleted(event: ReminderCompletedEvent): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: ReminderCompleted - ${event.reminderId}`,
    );
    await this.eventRepository.create({
      userId: event.userId,
      type: ReminderCompletedEvent.EVENT_NAME,
      payload: {
        reminderId: event.reminderId,
        workspaceId: event.workspaceId,
        objectId: event.objectId,
        completedAt: event.completedAt.toISOString(),
      },
    });
  }

  async publishCancelled(event: ReminderCancelledEvent): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: ReminderCancelled - ${event.reminderId}`,
    );
    await this.eventRepository.create({
      userId: event.userId,
      type: ReminderCancelledEvent.EVENT_NAME,
      payload: {
        reminderId: event.reminderId,
        workspaceId: event.workspaceId,
        objectId: event.objectId,
        cancelledAt: event.cancelledAt.toISOString(),
      },
    });
  }

  async publishRestored(event: ReminderRestoredEvent): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: ReminderRestored - ${event.reminderId}`,
    );
    await this.eventRepository.create({
      userId: event.userId,
      type: ReminderRestoredEvent.EVENT_NAME,
      payload: {
        reminderId: event.reminderId,
        workspaceId: event.workspaceId,
        objectId: event.objectId,
      },
    });
  }
}
