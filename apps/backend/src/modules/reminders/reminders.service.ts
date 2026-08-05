import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ReminderRepository } from './repositories/reminder.repository';
import { ObjectRepository } from '../objects/repositories/object.repository';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { SnoozeReminderDto, SnoozeDuration } from './dto/snooze-reminder.dto';
import { FilterReminderDto } from './dto/filter-reminder.dto';
import { AuditLogRepository } from '../auth/repositories/audit-log.repository';
import {
  Reminder as LumoraReminder,
  AuditAction,
  ReminderStatus,
} from '../../generated/prisma/client';

@Injectable()
export class RemindersService {
  constructor(
    private readonly reminderRepository: ReminderRepository,
    private readonly objectRepository: ObjectRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async createReminder(
    workspaceId: string,
    objectId: string,
    createdById: string,
    dto: CreateReminderDto,
  ): Promise<LumoraReminder> {
    const object = await this.objectRepository.findById(objectId);
    if (!object || object.workspaceId !== workspaceId) {
      throw new NotFoundException(
        'Universal Object not found in this workspace',
      );
    }

    const existing = await this.reminderRepository.findByObjectId(objectId);
    if (existing) {
      throw new ConflictException(
        'Universal Object already has an active reminder attached',
      );
    }

    const remindAt = new Date(dto.remindAt);
    const reminder = await this.reminderRepository.create({
      workspaceId,
      objectId,
      createdById,
      remindAt,
      priority: dto.priority,
      recurrence: dto.recurrence,
    });

    await this.auditLogRepository.create({
      userId: createdById,
      entity: 'Reminder',
      entityId: reminder.id,
      action: AuditAction.CREATE,
      newData: {
        workspaceId,
        objectId,
        remindAt,
        priority: reminder.priority,
      },
    });

    return reminder;
  }

  async getWorkspaceReminders(
    workspaceId: string,
    filter: FilterReminderDto,
  ): Promise<LumoraReminder[]> {
    return this.reminderRepository.findWorkspaceReminders(workspaceId, filter);
  }

  async getObjectReminder(
    workspaceId: string,
    objectId: string,
  ): Promise<LumoraReminder> {
    const reminder = await this.reminderRepository.findByObjectId(objectId);
    if (!reminder || reminder.workspaceId !== workspaceId) {
      throw new NotFoundException('Reminder not found for this object');
    }
    return reminder;
  }

  async updateReminder(
    workspaceId: string,
    objectId: string,
    userId: string,
    dto: UpdateReminderDto,
  ): Promise<LumoraReminder> {
    const reminder = await this.getObjectReminder(workspaceId, objectId);

    if (dto.revision !== undefined && dto.revision !== reminder.revision) {
      throw new ConflictException(
        `Reminder revision mismatch: current is ${reminder.revision}, update expected ${dto.revision}`,
      );
    }

    const remindAt = dto.remindAt ? new Date(dto.remindAt) : undefined;
    const completedAt =
      dto.status === ReminderStatus.COMPLETED ? new Date() : undefined;

    const updated = await this.reminderRepository.update(reminder.id, {
      updatedById: userId,
      remindAt,
      priority: dto.priority,
      status: dto.status,
      recurrence: dto.recurrence,
      completedAt,
    });

    await this.auditLogRepository.create({
      userId,
      entity: 'Reminder',
      entityId: reminder.id,
      action: AuditAction.UPDATE,
      newData: {
        remindAt: updated.remindAt,
        status: updated.status,
        revision: updated.revision,
      },
    });

    return updated;
  }

  async snoozeReminder(
    workspaceId: string,
    objectId: string,
    userId: string,
    dto: SnoozeReminderDto,
  ): Promise<LumoraReminder> {
    const reminder = await this.getObjectReminder(workspaceId, objectId);

    let snoozedUntil: Date;

    if (dto.until) {
      snoozedUntil = new Date(dto.until);
    } else if (dto.duration) {
      const now = Date.now();
      let offsetMs = 15 * 60 * 1000;
      switch (dto.duration) {
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
      }
      snoozedUntil = new Date(now + offsetMs);
    } else {
      throw new BadRequestException(
        'Snooze requires either a preset duration or explicit until timestamp',
      );
    }

    const updated = await this.reminderRepository.update(reminder.id, {
      updatedById: userId,
      status: ReminderStatus.SNOOZED,
      snoozedUntil,
    });

    await this.auditLogRepository.create({
      userId,
      entity: 'Reminder',
      entityId: reminder.id,
      action: AuditAction.UPDATE,
      newData: {
        status: ReminderStatus.SNOOZED,
        snoozedUntil,
      },
    });

    return updated;
  }

  async completeReminder(
    workspaceId: string,
    objectId: string,
    userId: string,
  ): Promise<LumoraReminder> {
    const reminder = await this.getObjectReminder(workspaceId, objectId);

    const updated = await this.reminderRepository.update(reminder.id, {
      updatedById: userId,
      status: ReminderStatus.COMPLETED,
      completedAt: new Date(),
    });

    await this.auditLogRepository.create({
      userId,
      entity: 'Reminder',
      entityId: reminder.id,
      action: AuditAction.UPDATE,
      newData: {
        status: ReminderStatus.COMPLETED,
        completedAt: updated.completedAt,
      },
    });

    return updated;
  }

  async softDeleteReminder(
    workspaceId: string,
    objectId: string,
    userId: string,
  ): Promise<LumoraReminder> {
    const reminder = await this.getObjectReminder(workspaceId, objectId);

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
