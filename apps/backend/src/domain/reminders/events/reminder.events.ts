import {
  UniqueEntityId,
  InstantString,
  ReminderEventName,
  DomainEvent,
} from '@lumora/shared';
import { ReminderSource, ReminderTriggerType } from '../value-objects/reminder-enums.js';

export class ReminderScheduledEvent implements DomainEvent<ReminderEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = ReminderEventName.SCHEDULED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly objectId: string;
    readonly createdById: string;
    readonly remindAt: string;
    readonly recurrenceRule?: string;
    readonly source?: ReminderSource;
    readonly triggerType?: ReminderTriggerType;
  };

  constructor(
    reminderId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    objectId: UniqueEntityId,
    createdById: UniqueEntityId,
    remindAt: Date,
    recurrenceRule?: string,
    source?: ReminderSource,
    triggerType?: ReminderTriggerType,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = reminderId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.payload = Object.freeze({
      objectId: objectId.toValue(),
      createdById: createdById.toValue(),
      remindAt: remindAt.toISOString(),
      recurrenceRule,
      source,
      triggerType,
    });
  }
}

export class ReminderTriggeredEvent implements DomainEvent<ReminderEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = ReminderEventName.TRIGGERED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly objectId: string;
    readonly executionId: string;
    readonly triggeredAt: string;
    readonly nextOccurrenceAt?: string;
  };

  constructor(
    reminderId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    objectId: UniqueEntityId,
    executionId: string,
    triggeredAt: Date,
    nextOccurrenceAt?: Date | null,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = reminderId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.payload = Object.freeze({
      objectId: objectId.toValue(),
      executionId,
      triggeredAt: triggeredAt.toISOString(),
      nextOccurrenceAt: nextOccurrenceAt?.toISOString(),
    });
  }
}

export class ReminderCompletedEvent implements DomainEvent<ReminderEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = ReminderEventName.COMPLETED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly objectId: string;
    readonly completedById: string;
    readonly completedAt: string;
  };

  constructor(
    reminderId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    objectId: UniqueEntityId,
    completedById: UniqueEntityId,
    completedAt: Date,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = reminderId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.payload = Object.freeze({
      objectId: objectId.toValue(),
      completedById: completedById.toValue(),
      completedAt: completedAt.toISOString(),
    });
  }
}
