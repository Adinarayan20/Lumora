import { BaseDomainEvent } from '../base-domain-event.js';

export interface ObjectCreatedPayload extends Record<string, unknown> {
  readonly workspaceId: string;
  readonly objectId: string;
  readonly typeKey: string;
  readonly title: string;
  readonly authorId: string;
  readonly createdAt: string;
}

export interface ObjectUpdatedPayload extends Record<string, unknown> {
  readonly workspaceId: string;
  readonly objectId: string;
  readonly typeKey: string;
  readonly modifierId: string;
  readonly updatedFields: readonly string[];
  readonly updatedAt: string;
}

export interface ObjectDeletedPayload extends Record<string, unknown> {
  readonly workspaceId: string;
  readonly objectId: string;
  readonly typeKey: string;
  readonly deletedAt: string;
}

/**
 * Event emitted when a universal object is created.
 */
export class ObjectCreatedEvent extends BaseDomainEvent<ObjectCreatedPayload> {
  public static readonly EVENT_NAME = 'object.created';

  constructor(payload: ObjectCreatedPayload) {
    super(ObjectCreatedEvent.EVENT_NAME, payload.objectId, payload, payload.workspaceId);
  }
}

/**
 * Event emitted when a universal object is updated.
 */
export class ObjectUpdatedEvent extends BaseDomainEvent<ObjectUpdatedPayload> {
  public static readonly EVENT_NAME = 'object.updated';

  constructor(payload: ObjectUpdatedPayload) {
    super(ObjectUpdatedEvent.EVENT_NAME, payload.objectId, payload, payload.workspaceId);
  }
}

/**
 * Event emitted when a universal object is soft-deleted.
 */
export class ObjectDeletedEvent extends BaseDomainEvent<ObjectDeletedPayload> {
  public static readonly EVENT_NAME = 'object.deleted';

  constructor(payload: ObjectDeletedPayload) {
    super(ObjectDeletedEvent.EVENT_NAME, payload.objectId, payload, payload.workspaceId);
  }
}
