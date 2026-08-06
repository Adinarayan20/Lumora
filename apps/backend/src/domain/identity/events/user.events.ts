import {
  UniqueEntityId,
  InstantString,
  UserEventName,
  DomainEvent,
} from '@lumora/shared';

export class UserRegisteredEvent implements DomainEvent<UserEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = UserEventName.REGISTERED;
  public readonly aggregateId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly email: string;
    readonly username: string;
  };

  constructor(userId: UniqueEntityId, email: string, username: string) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = userId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.payload = Object.freeze({ email, username });
  }
}

export class UserLoggedInEvent implements DomainEvent<UserEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = UserEventName.LOGGED_IN;
  public readonly aggregateId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly deviceId: string;
  };

  constructor(userId: UniqueEntityId, deviceId: UniqueEntityId) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = userId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.payload = Object.freeze({ deviceId: deviceId.toValue() });
  }
}
