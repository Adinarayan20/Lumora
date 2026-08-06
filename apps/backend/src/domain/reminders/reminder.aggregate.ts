import { AggregateRoot, UniqueEntityId, Guard } from '@lumora/shared';
import { TimezoneId } from './value-objects/timezone-id.js';
import { RecurrenceRule } from './value-objects/recurrence-rule.js';
import {
  ReminderSource,
  ReminderTriggerType,
  ReminderStatus,
  ReminderExecutionStatus,
  ReminderPriority,
} from './value-objects/reminder-enums.js';
import { ReminderSchedulingPolicy } from './policies/reminder-scheduling.policy.js';
import {
  ReminderScheduledEvent,
  ReminderTriggeredEvent,
  ReminderCompletedEvent,
} from './events/reminder.events.js';

export interface ReminderAggregateProps {
  id?: UniqueEntityId;
  workspaceId: UniqueEntityId;
  objectId: UniqueEntityId;
  createdById: UniqueEntityId;
  updatedById?: UniqueEntityId;
  dismissedById?: UniqueEntityId;
  lastExecutionId?: string;
  source?: ReminderSource;
  triggerType?: ReminderTriggerType;
  status?: ReminderStatus;
  executionStatus?: ReminderExecutionStatus;
  remindAt: Date;
  snoozedUntil?: Date;
  nextOccurrenceAt?: Date;
  lastTriggeredAt?: Date;
  completedAt?: Date;
  dismissedAt?: Date;
  cancelledAt?: Date;
  deletedAt?: Date;
  timezone?: TimezoneId;
  recurrenceRule?: RecurrenceRule;
  priority?: ReminderPriority;
  recurrence?: Record<string, unknown>;
  revision?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain Aggregate Root representing a Reminder trigger attached to a Universal Object.
 */
export class ReminderAggregate extends AggregateRoot<UniqueEntityId> {
  public readonly workspaceId: UniqueEntityId;
  public readonly objectId: UniqueEntityId;
  public readonly createdById: UniqueEntityId;
  public updatedById?: UniqueEntityId | undefined;
  public dismissedById?: UniqueEntityId | undefined;
  public lastExecutionId?: string | undefined;
  public readonly source: ReminderSource;
  public readonly triggerType: ReminderTriggerType;
  public status: ReminderStatus;
  public executionStatus: ReminderExecutionStatus;
  public remindAt: Date;
  public snoozedUntil?: Date | undefined;
  public nextOccurrenceAt?: Date | undefined;
  public lastTriggeredAt?: Date | undefined;
  public completedAt?: Date | undefined;
  public dismissedAt?: Date | undefined;
  public cancelledAt?: Date | undefined;
  public deletedAt?: Date | undefined;
  public timezone: TimezoneId;
  public recurrenceRule?: RecurrenceRule | undefined;
  public priority?: ReminderPriority | undefined;
  public recurrence?: Readonly<Record<string, unknown>> | undefined;
  public revision: number;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: ReminderAggregateProps) {
    super(props.id);
    this.workspaceId = props.workspaceId;
    this.objectId = props.objectId;
    this.createdById = props.createdById;
    this.updatedById = props.updatedById;
    this.dismissedById = props.dismissedById;
    this.lastExecutionId = props.lastExecutionId;
    this.source = props.source ?? ReminderSource.MANUAL;
    this.triggerType = props.triggerType ?? ReminderTriggerType.TIME;
    this.status = props.status ?? ReminderStatus.ACTIVE;
    this.executionStatus =
      props.executionStatus ?? ReminderExecutionStatus.PENDING;
    this.remindAt = props.remindAt;
    this.snoozedUntil = props.snoozedUntil;
    this.nextOccurrenceAt =
      props.nextOccurrenceAt ??
      ReminderSchedulingPolicy.calculateNextOccurrence(
        props.remindAt,
        props.recurrenceRule,
      ) ??
      undefined;
    this.lastTriggeredAt = props.lastTriggeredAt;
    this.completedAt = props.completedAt;
    this.dismissedAt = props.dismissedAt;
    this.cancelledAt = props.cancelledAt;
    this.deletedAt = props.deletedAt;
    this.timezone = props.timezone ?? TimezoneId.create('UTC');
    this.recurrenceRule = props.recurrenceRule;
    this.priority = props.priority;
    this.recurrence = props.recurrence
      ? Object.freeze({ ...props.recurrence })
      : undefined;
    this.revision = props.revision ?? 1;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: ReminderAggregateProps): ReminderAggregate {
    const wsGuard = Guard.againstNullOrUndefined(
      props.workspaceId,
      'workspaceId',
    );
    if (wsGuard.isFailure) throw wsGuard.getError();

    const objGuard = Guard.againstNullOrUndefined(props.objectId, 'objectId');
    if (objGuard.isFailure) throw objGuard.getError();

    const userGuard = Guard.againstNullOrUndefined(
      props.createdById,
      'createdById',
    );
    if (userGuard.isFailure) throw userGuard.getError();

    const dateGuard = Guard.againstNullOrUndefined(props.remindAt, 'remindAt');
    if (dateGuard.isFailure) throw dateGuard.getError();

    const reminder = new ReminderAggregate(props);
    reminder.addDomainEvent(
      new ReminderScheduledEvent(
        reminder.id,
        reminder.workspaceId,
        reminder.objectId,
        reminder.createdById,
        reminder.remindAt,
        reminder.recurrenceRule?.toValue(),
        reminder.source,
        reminder.triggerType,
      ),
    );

    return reminder;
  }

  public static reconstitute(props: ReminderAggregateProps): ReminderAggregate {
    return new ReminderAggregate(props);
  }

  public triggerExecution(
    executionId: string,
    triggeredAt: Date = new Date(),
  ): void {
    this.lastExecutionId = executionId;
    this.lastTriggeredAt = triggeredAt;
    this.executionStatus = ReminderExecutionStatus.TRIGGERED;
    this.nextOccurrenceAt =
      ReminderSchedulingPolicy.calculateNextOccurrence(
        this.remindAt,
        this.recurrenceRule,
      ) ?? undefined;
    this.revision += 1;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new ReminderTriggeredEvent(
        this.id,
        this.workspaceId,
        this.objectId,
        executionId,
        triggeredAt,
        this.nextOccurrenceAt,
      ),
    );
  }

  public complete(completedById: UniqueEntityId): void {
    this.status = ReminderStatus.COMPLETED;
    this.executionStatus = ReminderExecutionStatus.COMPLETED;
    this.completedAt = new Date();
    this.updatedById = completedById;
    this.revision += 1;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new ReminderCompletedEvent(
        this.id,
        this.workspaceId,
        this.objectId,
        completedById,
        this.completedAt,
      ),
    );
  }

  public snooze(snoozedUntil: Date, updatedById: UniqueEntityId): void {
    this.status = ReminderStatus.SNOOZED;
    this.snoozedUntil = snoozedUntil;
    this.updatedById = updatedById;
    this.revision += 1;
    this.updatedAt = new Date();
  }
}
