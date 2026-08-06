import {
  UniqueEntityId,
  InstantString,
  NotificationEventName,
  DomainEvent,
} from '@lumora/shared';
import { NotificationChannel } from '../value-objects/notification-enums.js';

export class NotificationDeliveredEvent implements DomainEvent<NotificationEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = NotificationEventName.DELIVERED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly userId: string;
    readonly channel: NotificationChannel;
    readonly deliveredAt: string;
  };

  constructor(
    notificationId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    userId: UniqueEntityId,
    channel: NotificationChannel,
    deliveredAt: Date,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = notificationId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString();
    this.payload = Object.freeze({
      userId: userId.toString(),
      channel,
      deliveredAt: deliveredAt.toISOString(),
    });
  }
}

export class NotificationFailedEvent implements DomainEvent<NotificationEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = NotificationEventName.FAILED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly userId: string;
    readonly channel: NotificationChannel;
    readonly reason: string;
  };

  constructor(
    notificationId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    userId: UniqueEntityId,
    channel: NotificationChannel,
    reason: string,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = notificationId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString();
    this.payload = Object.freeze({
      userId: userId.toString(),
      channel,
      reason,
    });
  }
}

export class NotificationReadEvent implements DomainEvent<NotificationEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = NotificationEventName.READ;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly userId: string;
    readonly readAt: string;
  };

  constructor(
    notificationId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    userId: UniqueEntityId,
    readAt: Date,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = notificationId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString();
    this.payload = Object.freeze({
      userId: userId.toString(),
      readAt: readAt.toISOString(),
    });
  }
}
