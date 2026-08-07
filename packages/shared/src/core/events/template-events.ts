import type { DomainEvent } from './domain-event.interface.js';
import { UniqueEntityId } from '../primitives/unique-entity-id.js';
import { TemplateEventName } from './event-names.js';
import type { InstantString } from './instant-string.js';

export class TemplateInstalledEvent
  implements DomainEvent<TemplateEventName, { templateKey: string; version: string }>
{
  public readonly eventId: UniqueEntityId;
  public readonly eventName = TemplateEventName.INSTALLED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion: number;
  public readonly payload: Readonly<{ templateKey: string; version: string }>;

  constructor(
    aggregateId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    templateKey: string,
    version: string,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = aggregateId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.schemaVersion = 1;
    this.payload = Object.freeze({ templateKey, version });
  }
}

export class TemplateInstallationFailedEvent
  implements DomainEvent<TemplateEventName, { templateKey: string; reason: string }>
{
  public readonly eventId: UniqueEntityId;
  public readonly eventName = TemplateEventName.INSTALLATION_FAILED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion: number;
  public readonly payload: Readonly<{ templateKey: string; reason: string }>;

  constructor(
    aggregateId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    templateKey: string,
    reason: string,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = aggregateId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.schemaVersion = 1;
    this.payload = Object.freeze({ templateKey, reason });
  }
}

export class TemplateUpgradedEvent
  implements DomainEvent<TemplateEventName, { templateKey: string; previousVersion: string; newVersion: string }>
{
  public readonly eventId: UniqueEntityId;
  public readonly eventName = TemplateEventName.UPGRADED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion: number;
  public readonly payload: Readonly<{ templateKey: string; previousVersion: string; newVersion: string }>;

  constructor(
    aggregateId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    templateKey: string,
    previousVersion: string,
    newVersion: string,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = aggregateId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.schemaVersion = 1;
    this.payload = Object.freeze({ templateKey, previousVersion, newVersion });
  }
}

export class TemplateRollbackStartedEvent
  implements DomainEvent<TemplateEventName, { templateKey: string }>
{
  public readonly eventId: UniqueEntityId;
  public readonly eventName = TemplateEventName.ROLLBACK_STARTED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion: number;
  public readonly payload: Readonly<{ templateKey: string }>;

  constructor(
    aggregateId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    templateKey: string,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = aggregateId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.schemaVersion = 1;
    this.payload = Object.freeze({ templateKey });
  }
}

export class TemplateRollbackCompletedEvent
  implements DomainEvent<TemplateEventName, { templateKey: string }>
{
  public readonly eventId: UniqueEntityId;
  public readonly eventName = TemplateEventName.ROLLBACK_COMPLETED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion: number;
  public readonly payload: Readonly<{ templateKey: string }>;

  constructor(
    aggregateId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    templateKey: string,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = aggregateId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.schemaVersion = 1;
    this.payload = Object.freeze({ templateKey });
  }
}

export class TemplateArchivedEvent
  implements DomainEvent<TemplateEventName, { templateKey: string }>
{
  public readonly eventId: UniqueEntityId;
  public readonly eventName = TemplateEventName.ARCHIVED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion: number;
  public readonly payload: Readonly<{ templateKey: string }>;

  constructor(
    aggregateId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    templateKey: string,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = aggregateId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.schemaVersion = 1;
    this.payload = Object.freeze({ templateKey });
  }
}

export class TemplateDeletedEvent
  implements DomainEvent<TemplateEventName, { templateKey: string }>
{
  public readonly eventId: UniqueEntityId;
  public readonly eventName = TemplateEventName.DELETED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion: number;
  public readonly payload: Readonly<{ templateKey: string }>;

  constructor(
    aggregateId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    templateKey: string,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = aggregateId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.schemaVersion = 1;
    this.payload = Object.freeze({ templateKey });
  }
}

export class TemplateImportedEvent
  implements DomainEvent<TemplateEventName, { templateKey: string }>
{
  public readonly eventId: UniqueEntityId;
  public readonly eventName = TemplateEventName.IMPORTED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion: number;
  public readonly payload: Readonly<{ templateKey: string }>;

  constructor(
    aggregateId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    templateKey: string,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = aggregateId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.schemaVersion = 1;
    this.payload = Object.freeze({ templateKey });
  }
}

export class TemplateExportedEvent
  implements DomainEvent<TemplateEventName, { templateKey: string }>
{
  public readonly eventId: UniqueEntityId;
  public readonly eventName = TemplateEventName.EXPORTED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion: number;
  public readonly payload: Readonly<{ templateKey: string }>;

  constructor(
    aggregateId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    templateKey: string,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = aggregateId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.schemaVersion = 1;
    this.payload = Object.freeze({ templateKey });
  }
}
