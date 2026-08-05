import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ReminderRepository } from './repositories/reminder.repository';
import { ObjectRepository } from '../objects/repositories/object.repository';
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
} from '../../generated/prisma/client';
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
    private readonly objectRepository: ObjectRepository,
    private readonly auditLogRepository: AuditLogRepository,
    private readonly schedulerService: ReminderSchedulerService,
  ) {}

  async createReminder(
    workspaceId: string,
    objectId: string,
    userId: string,
    dto: CreateReminderDto,
  ): Promise<Reminder> {
    const object = await this.objectRepository.findById(objectId);
    if (!object || object.workspaceId !== workspaceId) {
      throw new NotFoundException(
        'Universal Object not found in this workspace',
      );
    }

    if (dto.recurrenceRule) {
      this.schedulerService.validateRecurrenceRule(dto.recurrenceRule);
    }

    const remindAt = new Date(dto.remindAt);
    if (isNaN(remindAt.getTime())) {
      throw new BadRequestException('Invalid remindAt ISO date string');
    }

    const nextOccurrenceAt =
      this.schedulerService.calculateNextOccurrence(
        remindAt,
        dto.recurrenceRule,
      ) ?? remindAt;

    const reminder = await this.reminderRepository.create({
      workspaceId,
      objectId: object.id,
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

    return reminder;
  }

  async getWorkspaceReminders(
    workspaceId: string,
    filter: FilterReminderDto,
  ): Promise<Reminder[]> {
    return this.reminderRepository.findWorkspaceReminders(workspaceId, filter);
  }

  async getObjectReminders(
    workspaceId: string,
    objectId: string,
  ): Promise<Reminder[]> {
    const object = await this.objectRepository.findById(objectId);
    if (!object || object.workspaceId !== workspaceId) {
      throw new NotFoundException(
        'Universal Object not found in this workspace',
      );
    }
    return this.reminderRepository.findByObjectId(workspaceId, objectId);
  }

  async getReminderById(
    workspaceId: string,
    reminderId: string,
  ): Promise<Reminder> {
    const reminder = await this.reminderRepository.findById(reminderId);
    if (!reminder || reminder.workspaceId !== workspaceId) {
      throw new NotFoundException('Reminder not found');
    }
    return reminder;
  }

  async updateReminder(
    workspaceId: string,
    reminderId: string,
    userId: string,
    dto: UpdateReminderDto,
  ): Promise<Reminder> {
    const reminder = await this.getReminderById(workspaceId, reminderId);

    if (dto.revision !== undefined && dto.revision !== reminder.revision) {
      throw new ConflictException(
        `Reminder revision mismatch: current is ${reminder.revision}, update expected ${dto.revision}`,
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

    return updated;
  }

  async snoozeReminder(
    workspaceId: string,
    reminderId: string,
    userId: string,
    dto: SnoozeReminderDto,
  ): Promise<Reminder> {
    const reminder = await this.getReminderById(workspaceId, reminderId);

    if (reminder.status !== ReminderStatus.ACTIVE) {
      throw new ConflictException('Only ACTIVE reminders can be snoozed');
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

    return updated;
  }

  async completeReminder(
    workspaceId: string,
    reminderId: string,
    userId: string,
  ): Promise<Reminder> {
    const reminder = await this.getReminderById(workspaceId, reminderId);

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

    return updated;
  }

  async cancelReminder(
    workspaceId: string,
    reminderId: string,
    userId: string,
  ): Promise<Reminder> {
    const reminder = await this.getReminderById(workspaceId, reminderId);

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

    return updated;
  }

  async restoreReminder(
    workspaceId: string,
    reminderId: string,
    userId: string,
  ): Promise<Reminder> {
    const reminder = await this.getReminderById(workspaceId, reminderId);

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

    return updated;
  }

  async softDeleteReminder(
    workspaceId: string,
    reminderId: string,
    userId: string,
  ): Promise<Reminder> {
    const reminder = await this.getReminderById(workspaceId, reminderId);

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

    return deleted;
  }
}
