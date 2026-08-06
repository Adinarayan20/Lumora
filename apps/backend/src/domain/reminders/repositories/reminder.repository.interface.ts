import type { UniqueEntityId } from '@lumora/shared';
import type { IPaginatedRepository } from '../../common/repositories/paginated.repository.interface.js';
import type { ReminderAggregate } from '../reminder.aggregate.js';
import type {
  ReminderStatus,
  ReminderExecutionStatus,
  ReminderPriority,
} from '../value-objects/reminder-enums.js';

export interface ReminderFilter extends Record<string, unknown> {
  workspaceId: UniqueEntityId;
  objectId?: UniqueEntityId;
  status?: ReminderStatus;
  executionStatus?: ReminderExecutionStatus;
  priority?: ReminderPriority;
  dueBefore?: Date;
}

export interface IReminderRepository
  extends IPaginatedRepository<ReminderAggregate, UniqueEntityId, ReminderFilter> {
  findDueReminders(
    dueBefore: Date,
    limit?: number,
  ): Promise<readonly ReminderAggregate[]>;
}
