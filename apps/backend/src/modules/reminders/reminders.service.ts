import { Injectable } from '@nestjs/common';
import {
  Result,
  ApplicationException,
  EntityNotFoundException,
  RevisionConflictException,
  ReminderNotActiveForSnoozeException,
  DomainValidationException,
} from '@lumora/shared';
import { ReminderRepository } from './repositories/reminder.repository';
import { ObjectsService } from '../objects/objects.service.js';
import { AuditLogRepository } from '../auth/repositories/audit-log.repository';
import { ReminderSchedulerService } from './services/reminder-scheduler.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { FilterReminderDto } from './dto/filter-reminder.dto';
import { SnoozeReminderDto } from './dto/snooze-reminder.dto';
import {
  Reminder,
  AuditAction,
  ReminderExecutionStatus,
  ReminderStatus,
} from '../../generated/prisma/client.js';
import {
  ReminderCreatedEvent,
  ReminderSnoozedEvent,
  ReminderCompletedEvent,
  ReminderCancelledEvent,
  ReminderRestoredEvent,
} from './events/reminder.events';

@Injectable()
export class RemindersService {
  constructor(
    private readonly reminderRepository: ReminderRepository,
    private readonly objectsService: ObjectsService,
    private readonly auditLogRepository: AuditLogRepository,
    private readonly schedulerService: ReminderSchedulerService,
  ) {}

  async createReminder(
    workspaceId: string,
    objectId: string,
    userId: string,
    dto: CreateReminderDto,
  ): Promise<Result<Reminder, ApplicationException>> {
    const objectExists = await this.objectsService.verifyObjectInWorkspace(workspaceId, objectId);
    if (!objectExists) {
      return Result.fail(new EntityNotFoundException('Object', objectId));
    }

    if (dto.recurrenceRule) {
      this.schedulerService.validateRecurrenceRule(dto.recurrenceRule);
    }

    const remindAt = new Date(dto.remindAt);
    if (isNaN(remindAt.getTime())) {
      return Result.fail(
        new DomainValidationException(
          `Invalid remindAt date string '${dto.remindAt}'. Must be valid ISO 8601 date.`,
        ),
      );
    }

    const nextOccurrenceAt =
      this.schedulerService.calculateNextOccurrence(
        remindAt,
        dto.recurrenceRule,
      ) ?? remindAt;

    const reminder = await this.reminderRepository.create({
      workspaceId,
      objectId: objectId,
      createdById: userId,
      remindAt,
      timezone: dto.timezone,
      recurrenceRule: dto.recurrenceRule,
      source: dto.source,
      triggerType: dto.triggerType,
      nextOccurrenceAt,
    });

    await this.auditLogRepository.create({
      userId,
      entity: 'Reminder',
      entityId: reminder.id,
      action: AuditAction.CREATE,
      newData: {
        workspaceId,
        objectId,
        remindAt: reminder.remindAt,
        status: reminder.status,
        executionStatus: reminder.executionStatus,
      },
    });

    await this.schedulerService.publishCreated(
      new ReminderCreatedEvent(
        reminder.id,
        workspaceId,
        objectId,
        userId,
        reminder.remindAt,
        reminder.recurrenceRule,
        reminder.source,
        reminder.triggerType,
      ),
    );

    return Result.ok(reminder);
  }

  async getWorkspaceReminders(
    workspaceId: string,
    filter: FilterReminderDto,
  ): Promise<Result<Reminder[], ApplicationException>> {
    const reminders = await this.reminderRepository.findWorkspaceReminders(
      workspaceId,
      filter,
    );
    return Result.ok(reminders);
  }

  async getObjectReminders(
    workspaceId: string,
    objectId: string,
  ): Promise<Result<Reminder[], ApplicationException>> {
    const objectExists = await this.objectsService.verifyObjectInWorkspace(workspaceId, objectId);
    if (!objectExists) {
      return Result.fail(new EntityNotFoundException('Object', objectId));
    }
    const reminders = await this.reminderRepository.findByObjectId(
      workspaceId,
      objectId,
    );
    return Result.ok(reminders);
  }

  async getReminderById(
    workspaceId: string,
    reminderId: string,
  ): Promise<Result<Reminder, ApplicationException>> {
    const reminder = await this.reminderRepository.findById(reminderId);
    if (!reminder || reminder.workspaceId !== workspaceId) {
      return Result.fail(new EntityNotFoundException('Reminder', reminderId));
    }
    return Result.ok(reminder);
  }

  async updateReminder(
    workspaceId: string,
    reminderId: string,
    userId: string,
    dto: UpdateReminderDto,
  ): Promise<Result<Reminder, ApplicationException>> {
    const reminderResult = await this.getReminderById(workspaceId, reminderId);
    if (reminderResult.isFailure) {
      return Result.fail(reminderResult.getError());
    }

    const reminder = reminderResult.getValue();

    if (dto.revision !== undefined && dto.revision !== reminder.revision) {
      return Result.fail(
        new RevisionConflictException(
          'Reminder',
          reminder.revision,
          dto.revision,
        ),
      );
    }

    if (dto.recurrenceRule) {
      this.schedulerService.validateRecurrenceRule(dto.recurrenceRule);
    }

    const remindAt = dto.remindAt ? new Date(dto.remindAt) : undefined;
    const recurrenceRule =
      dto.recurrenceRule !== undefined
        ? dto.recurrenceRule
        : reminder.recurrenceRule;

    const nextOccurrenceAt = remindAt
      ? (this.schedulerService.calculateNextOccurrence(
          remindAt,
          recurrenceRule,
        ) ?? remindAt)
      : undefined;

    const updated = await this.reminderRepository.update(reminder.id, {
      updatedById: userId,
      remindAt,
      timezone: dto.timezone,
      recurrenceRule: dto.recurrenceRule,
      status: dto.status,
      executionStatus: dto.executionStatus,
      nextOccurrenceAt,
    });

    await this.auditLogRepository.create({
      userId,
      entity: 'Reminder',
      entityId: reminder.id,
      action: AuditAction.UPDATE,
      newData: {
        remindAt: updated.remindAt,
        status: updated.status,
        executionStatus: updated.executionStatus,
        revision: updated.revision,
      },
    });

    return Result.ok(updated);
  }

  async snoozeReminder(
    workspaceId: string,
    reminderId: string,
    userId: string,
    dto: SnoozeReminderDto,
  ): Promise<Result<Reminder, ApplicationException>> {
    const reminderResult = await this.getReminderById(workspaceId, reminderId);
    if (reminderResult.isFailure) {
      return Result.fail(reminderResult.getError());
    }

    const reminder = reminderResult.getValue();

    if (reminder.status !== ReminderStatus.ACTIVE) {
      return Result.fail(
        new ReminderNotActiveForSnoozeException(reminder.id, reminder.status),
      );
    }

    const snoozedUntil = this.schedulerService.calculateSnoozeTarget(
      dto.duration,
      dto.until,
    );

    const updated = await this.reminderRepository.update(reminder.id, {
      updatedById: userId,
      snoozedUntil,
      executionStatus: ReminderExecutionStatus.SNOOZED,
      nextOccurrenceAt: snoozedUntil,
    });

    await this.schedulerService.publishSnoozed(
      new ReminderSnoozedEvent(
        reminder.id,
        workspaceId,
        reminder.objectId,
        userId,
        snoozedUntil,
      ),
    );

    await this.auditLogRepository.create({
      userId,
      entity: 'Reminder',
      entityId: reminder.id,
      action: AuditAction.UPDATE,
      newData: {
        executionStatus: ReminderExecutionStatus.SNOOZED,
        snoozedUntil,
      },
    });

    return Result.ok(updated);
  }

  async completeReminder(
    workspaceId: string,
    reminderId: string,
    userId: string,
  ): Promise<Result<Reminder, ApplicationException>> {
    const reminderResult = await this.getReminderById(workspaceId, reminderId);
    if (reminderResult.isFailure) {
      return Result.fail(reminderResult.getError());
    }

    const reminder = reminderResult.getValue();

    const now = new Date();
    const updated = await this.reminderRepository.update(reminder.id, {
      updatedById: userId,
      completedAt: now,
      executionStatus: ReminderExecutionStatus.COMPLETED,
    });

    await this.schedulerService.publishCompleted(
      new ReminderCompletedEvent(
        reminder.id,
        workspaceId,
        reminder.objectId,
        userId,
        now,
      ),
    );

    await this.auditLogRepository.create({
      userId,
      entity: 'Reminder',
      entityId: reminder.id,
      action: AuditAction.UPDATE,
      newData: {
        executionStatus: ReminderExecutionStatus.COMPLETED,
        completedAt: now,
      },
    });

    return Result.ok(updated);
  }

  async cancelReminder(
    workspaceId: string,
    reminderId: string,
    userId: string,
  ): Promise<Result<Reminder, ApplicationException>> {
    const reminderResult = await this.getReminderById(workspaceId, reminderId);
    if (reminderResult.isFailure) {
      return Result.fail(reminderResult.getError());
    }

    const reminder = reminderResult.getValue();

    const now = new Date();
    const updated = await this.reminderRepository.update(reminder.id, {
      updatedById: userId,
      cancelledAt: now,
      status: ReminderStatus.CANCELLED,
    });

    await this.schedulerService.publishCancelled(
      new ReminderCancelledEvent(
        reminder.id,
        workspaceId,
        reminder.objectId,
        userId,
        now,
      ),
    );

    await this.auditLogRepository.create({
      userId,
      entity: 'Reminder',
      entityId: reminder.id,
      action: AuditAction.UPDATE,
      newData: {
        status: ReminderStatus.CANCELLED,
        cancelledAt: now,
      },
    });

    return Result.ok(updated);
  }

  async restoreReminder(
    workspaceId: string,
    reminderId: string,
    userId: string,
  ): Promise<Result<Reminder, ApplicationException>> {
    const reminderResult = await this.getReminderById(workspaceId, reminderId);
    if (reminderResult.isFailure) {
      return Result.fail(reminderResult.getError());
    }

    const reminder = reminderResult.getValue();

    const updated = await this.reminderRepository.update(reminder.id, {
      updatedById: userId,
      status: ReminderStatus.ACTIVE,
      executionStatus: ReminderExecutionStatus.PENDING,
      cancelledAt: null,
    });

    await this.schedulerService.publishRestored(
      new ReminderRestoredEvent(
        reminder.id,
        workspaceId,
        reminder.objectId,
        userId,
      ),
    );

    await this.auditLogRepository.create({
      userId,
      entity: 'Reminder',
      entityId: reminder.id,
      action: AuditAction.UPDATE,
      newData: {
        status: ReminderStatus.ACTIVE,
        executionStatus: ReminderExecutionStatus.PENDING,
      },
    });

    return Result.ok(updated);
  }

  async softDeleteReminder(
    workspaceId: string,
    reminderId: string,
    userId: string,
  ): Promise<Result<Reminder, ApplicationException>> {
    const reminderResult = await this.getReminderById(workspaceId, reminderId);
    if (reminderResult.isFailure) {
      return Result.fail(reminderResult.getError());
    }

    const reminder = reminderResult.getValue();

    const deleted = await this.reminderRepository.softDelete(
      reminder.id,
      userId,
    );

    await this.auditLogRepository.create({
      userId,
      entity: 'Reminder',
      entityId: reminder.id,
      action: AuditAction.DELETE,
    });

    return Result.ok(deleted);
  }
}




