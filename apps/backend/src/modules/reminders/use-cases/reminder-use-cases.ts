/**
 * Application-layer façade use cases for the Reminders bounded context.
 *
 * All use cases delegate to RemindersService, which owns legacy business logic
 * (recurrence validation, snooze computation, event publish, audit logs) until
 * Phase 3 DDD migration replaces it with ScheduleReminderUseCase (aggregate-backed).
 */
import { Injectable } from '@nestjs/common';
import { Result, ApplicationException } from '@lumora/shared';
import { RemindersService } from '../reminders.service.js';
import { CreateReminderDto } from '../dto/create-reminder.dto.js';
import { UpdateReminderDto } from '../dto/update-reminder.dto.js';
import { FilterReminderDto } from '../dto/filter-reminder.dto.js';
import { SnoozeReminderDto } from '../dto/snooze-reminder.dto.js';
import { ReminderResponseDto } from '../dto/reminder-response.dto.js';

// ─── Commands ────────────────────────────────────────────────────────────────

export interface CreateReminderCommand {
  workspaceId: string;
  objectId: string;
  userId: string;
  dto: CreateReminderDto;
}

/**
 * @deprecated — Replaced by ScheduleReminderUseCase (aggregate-backed). Scheduled for removal in Phase 4.
 */
@Injectable()
export class CreateReminderFacadeUseCase {
  constructor(private readonly service: RemindersService) {}
  async execute(
    cmd: CreateReminderCommand,
  ): Promise<Result<ReminderResponseDto, ApplicationException>> {
    return this.service.createReminder(
      cmd.workspaceId,
      cmd.objectId,
      cmd.userId,
      cmd.dto,
    );
  }
}

export interface UpdateReminderCommand {
  workspaceId: string;
  reminderId: string;
  userId: string;
  dto: UpdateReminderDto;
}

@Injectable()
export class UpdateReminderUseCase {
  constructor(private readonly service: RemindersService) {}
  async execute(
    cmd: UpdateReminderCommand,
  ): Promise<Result<ReminderResponseDto, ApplicationException>> {
    return this.service.updateReminder(
      cmd.workspaceId,
      cmd.reminderId,
      cmd.userId,
      cmd.dto,
    );
  }
}

export interface SnoozeReminderCommand {
  workspaceId: string;
  reminderId: string;
  userId: string;
  dto: SnoozeReminderDto;
}

@Injectable()
export class SnoozeReminderUseCase {
  constructor(private readonly service: RemindersService) {}
  async execute(
    cmd: SnoozeReminderCommand,
  ): Promise<Result<ReminderResponseDto, ApplicationException>> {
    return this.service.snoozeReminder(
      cmd.workspaceId,
      cmd.reminderId,
      cmd.userId,
      cmd.dto,
    );
  }
}

export interface CompleteReminderCommand {
  workspaceId: string;
  reminderId: string;
  userId: string;
}

@Injectable()
export class CompleteReminderUseCase {
  constructor(private readonly service: RemindersService) {}
  async execute(
    cmd: CompleteReminderCommand,
  ): Promise<Result<ReminderResponseDto, ApplicationException>> {
    return this.service.completeReminder(
      cmd.workspaceId,
      cmd.reminderId,
      cmd.userId,
    );
  }
}

export interface CancelReminderCommand {
  workspaceId: string;
  reminderId: string;
  userId: string;
}

@Injectable()
export class CancelReminderUseCase {
  constructor(private readonly service: RemindersService) {}
  async execute(
    cmd: CancelReminderCommand,
  ): Promise<Result<ReminderResponseDto, ApplicationException>> {
    return this.service.cancelReminder(
      cmd.workspaceId,
      cmd.reminderId,
      cmd.userId,
    );
  }
}

export interface RestoreReminderCommand {
  workspaceId: string;
  reminderId: string;
  userId: string;
}

@Injectable()
export class RestoreReminderUseCase {
  constructor(private readonly service: RemindersService) {}
  async execute(
    cmd: RestoreReminderCommand,
  ): Promise<Result<ReminderResponseDto, ApplicationException>> {
    return this.service.restoreReminder(
      cmd.workspaceId,
      cmd.reminderId,
      cmd.userId,
    );
  }
}

export interface DeleteReminderCommand {
  workspaceId: string;
  reminderId: string;
  userId: string;
}

@Injectable()
export class DeleteReminderUseCase {
  constructor(private readonly service: RemindersService) {}
  async execute(
    cmd: DeleteReminderCommand,
  ): Promise<Result<ReminderResponseDto, ApplicationException>> {
    return this.service.softDeleteReminder(
      cmd.workspaceId,
      cmd.reminderId,
      cmd.userId,
    );
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export interface GetWorkspaceRemindersQueryInput {
  workspaceId: string;
  filter: FilterReminderDto;
}

@Injectable()
export class GetWorkspaceRemindersQuery {
  constructor(private readonly service: RemindersService) {}
  async execute(
    input: GetWorkspaceRemindersQueryInput,
  ): Promise<Result<ReminderResponseDto[], ApplicationException>> {
    return this.service.getWorkspaceReminders(input.workspaceId, input.filter);
  }
}

export interface GetObjectRemindersQueryInput {
  workspaceId: string;
  objectId: string;
}

@Injectable()
export class GetObjectRemindersQuery {
  constructor(private readonly service: RemindersService) {}
  async execute(
    input: GetObjectRemindersQueryInput,
  ): Promise<Result<ReminderResponseDto[], ApplicationException>> {
    return this.service.getObjectReminders(input.workspaceId, input.objectId);
  }
}

export interface GetReminderQueryInput {
  workspaceId: string;
  reminderId: string;
}

@Injectable()
export class GetReminderQuery {
  constructor(private readonly service: RemindersService) {}
  async execute(
    input: GetReminderQueryInput,
  ): Promise<Result<ReminderResponseDto, ApplicationException>> {
    return this.service.getReminderById(input.workspaceId, input.reminderId);
  }
}


