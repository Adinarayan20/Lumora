import { Inject, Injectable } from '@nestjs/common';
import { Result, UniqueEntityId } from '@lumora/shared';
import { ReminderAggregate } from '../../../domain/reminders/reminder.aggregate.js';
import { RecurrenceRule } from '../../../domain/reminders/value-objects/recurrence-rule.js';
import { TimezoneId } from '../../../domain/reminders/value-objects/timezone-id.js';
import { ReminderPriority } from '../../../domain/reminders/value-objects/reminder-enums.js';
import type { IReminderRepository } from '../../../domain/reminders/repositories/reminder.repository.interface.js';
import { CreateReminderDto } from '../dto/create-reminder.dto.js';
import { ReminderResponseDto } from '../dto/reminder-response.dto.js';
import { ReminderResponseMapper } from '../mappers/reminder-response.mapper.js';

import { REMINDER_REPOSITORY_TOKEN } from '../reminders.tokens.js';

export interface ScheduleReminderCommand {
  workspaceId: string;
  createdById: string;
  dto: CreateReminderDto;
}

@Injectable()
export class ScheduleReminderUseCase {
  constructor(
    @Inject(REMINDER_REPOSITORY_TOKEN)
    private readonly reminderRepository: IReminderRepository,
  ) {}

  public async execute(
    command: ScheduleReminderCommand,
  ): Promise<Result<ReminderResponseDto, Error>> {
    try {
      const { workspaceId, createdById, dto } = command;

      const remindDate = new Date(dto.remindAt);
      if (isNaN(remindDate.getTime())) {
        return Result.fail(
          new Error(
            `Invalid remindAt date string '${dto.remindAt}'. Must be valid ISO date.`,
          ),
        );
      }

      const recurrence = dto.recurrenceRule
        ? RecurrenceRule.create(dto.recurrenceRule)
        : undefined;
      const tz = dto.timezone ? TimezoneId.create(dto.timezone) : undefined;

      const aggregate = ReminderAggregate.create({
        workspaceId: new UniqueEntityId(workspaceId),
        objectId: new UniqueEntityId(dto.objectId),
        createdById: new UniqueEntityId(createdById),
        remindAt: remindDate,
        priority: dto.priority ? (dto.priority as ReminderPriority) : undefined,
        recurrenceRule: recurrence,
        timezone: tz,
      });

      await this.reminderRepository.save(aggregate);

      const responseDto = ReminderResponseMapper.toResponseDto(aggregate);
      return Result.ok(responseDto);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
