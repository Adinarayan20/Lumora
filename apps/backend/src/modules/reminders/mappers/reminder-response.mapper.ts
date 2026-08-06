import { ReminderAggregate } from '../../../domain/reminders/reminder.aggregate.js';
import { ReminderResponseDto } from '../dto/reminder-response.dto.js';

export class ReminderResponseMapper {
  public static toResponseDto(aggregate: ReminderAggregate): ReminderResponseDto {
    return {
      id: aggregate.id.toString(),
      workspaceId: aggregate.workspaceId.toString(),
      objectId: aggregate.objectId.toString(),
      createdById: aggregate.createdById.toString(),
      remindAt: aggregate.remindAt.toISOString(),
      status: aggregate.status,
      priority: aggregate.priority ?? 'MEDIUM',
      recurrenceRule: aggregate.recurrenceRule ? aggregate.recurrenceRule.toValue() : undefined,
      timezone: aggregate.timezone ? aggregate.timezone.toValue() : 'UTC',
      snoozedUntil: aggregate.snoozedUntil ? aggregate.snoozedUntil.toISOString() : undefined,
      completedAt: aggregate.completedAt ? aggregate.completedAt.toISOString() : undefined,
      executionCount: 0,
      createdAt: aggregate.createdAt.toISOString(),
      updatedAt: aggregate.updatedAt.toISOString(),
    };
  }
}
