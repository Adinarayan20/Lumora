import {
  UniqueEntityId,
  InstantString,
  TimelineEventName,
  DomainEvent,
} from '@lumora/shared';

export class TimelineRecordRecordedEvent implements DomainEvent<TimelineEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = TimelineEventName.RECORDED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly userId: string;
    readonly entityCategory: string;
    readonly entityId: string;
    readonly action: string;
  };

  constructor(
    timelineRecordId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    userId: UniqueEntityId,
    entityCategory: string,
    entityId: UniqueEntityId,
    action: string,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = timelineRecordId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.payload = Object.freeze({
      userId: userId.toString(),
      entityCategory,
      entityId: entityId.toString(),
      action,
    });
  }
}
