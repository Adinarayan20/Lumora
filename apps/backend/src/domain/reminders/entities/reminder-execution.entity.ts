import { UniqueEntityId, Guard } from '@lumora/shared';
import { ReminderExecutionStatus } from '../value-objects/reminder-enums.js';

export interface ReminderExecutionEntityProps {
  id?: UniqueEntityId;
  reminderId: UniqueEntityId;
  scheduledFor: Date;
  executedAt?: Date;
  status?: ReminderExecutionStatus;
  executionId: string;
  errorMessage?: string;
  durationMs?: number;
  createdAt?: Date;
}

/**
 * Domain entity representing an idempotent execution log record for a reminder trigger.
 */
export class ReminderExecutionEntity {
  public readonly id: UniqueEntityId;
  public readonly reminderId: UniqueEntityId;
  public readonly scheduledFor: Date;
  public readonly executedAt: Date;
  public readonly status: ReminderExecutionStatus;
  public readonly executionId: string;
  public readonly errorMessage?: string | undefined;
  public readonly durationMs?: number | undefined;
  public readonly createdAt: Date;

  private constructor(props: ReminderExecutionEntityProps) {
    this.id = props.id ?? new UniqueEntityId();
    this.reminderId = props.reminderId;
    this.scheduledFor = props.scheduledFor;
    this.executedAt = props.executedAt ?? new Date();
    this.status = props.status ?? ReminderExecutionStatus.TRIGGERED;
    this.executionId = props.executionId;
    this.errorMessage = props.errorMessage;
    this.durationMs = props.durationMs;
    this.createdAt = props.createdAt ?? new Date();
  }

  public static create(props: ReminderExecutionEntityProps): ReminderExecutionEntity {
    const remGuard = Guard.againstNullOrUndefined(props.reminderId, 'reminderId');
    if (remGuard.isFailure) throw remGuard.getError();

    const execGuard = Guard.againstEmptyString(props.executionId, 'executionId');
    if (execGuard.isFailure) throw execGuard.getError();

    return new ReminderExecutionEntity(props);
  }
}
