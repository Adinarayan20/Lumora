import {
  UniqueEntityId,
  InstantString,
  SettingsEventName,
  DomainEvent,
} from '@lumora/shared';

export class UserSettingsUpdatedEvent implements DomainEvent<SettingsEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = SettingsEventName.USER_SETTINGS_UPDATED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly userId: string;
    readonly theme: string;
    readonly timezone: string;
  };

  constructor(
    settingsId: UniqueEntityId,
    userId: UniqueEntityId,
    theme: string,
    timezone: string,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = settingsId;
    this.workspaceId = userId; // Uses user identity for single-user setting scope
    this.occurredAt = new Date().toISOString();
    this.payload = Object.freeze({
      userId: userId.toString(),
      theme,
      timezone,
    });
  }
}
