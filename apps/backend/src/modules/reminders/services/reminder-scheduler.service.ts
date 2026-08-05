import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { EventRepository } from '../../auth/repositories/event.repository';
import { SnoozeDuration } from '../dto/snooze-reminder.dto';
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

  constructor(private readonly eventRepository: EventRepository) {}

  calculateNextOccurrence(
    remindAt: Date,
    recurrenceRule?: string | null,
  ): Date | null {
    if (!recurrenceRule) {
      return null;
    }
    const ruleUpper = recurrenceRule.toUpperCase();
    let intervalMs = 24 * 60 * 60 * 1000;

    if (ruleUpper.includes('FREQ=HOURLY')) {
      intervalMs = 60 * 60 * 1000;
    } else if (ruleUpper.includes('FREQ=WEEKLY')) {
      intervalMs = 7 * 24 * 60 * 60 * 1000;
    } else if (ruleUpper.includes('FREQ=MONTHLY')) {
      intervalMs = 30 * 24 * 60 * 60 * 1000;
    }

    return new Date(remindAt.getTime() + intervalMs);
  }

  calculateSnoozeTarget(duration?: SnoozeDuration, until?: string): Date {
    if (until) {
      const target = new Date(until);
      if (isNaN(target.getTime())) {
        throw new BadRequestException('Invalid snooze ISO timestamp');
      }
      return target;
    }

    const now = Date.now();
    let offsetMs = 15 * 60 * 1000;

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
        offsetMs = 15 * 60 * 1000;
    }

    return new Date(now + offsetMs);
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
