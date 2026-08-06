import type { UniqueEntityId } from '../../primitives/unique-entity-id.js';
import type { BaseObjectPayload } from './base-payloads.js';

export interface ObjectCreatedPayload extends BaseObjectPayload {
  readonly title: string;
  readonly authorId: UniqueEntityId;
  readonly createdAt: string;
}

export interface ObjectUpdatedPayload extends BaseObjectPayload {
  readonly modifierId: UniqueEntityId;
  readonly updatedFields: readonly string[];
  readonly updatedAt: string;
}

export interface ObjectDeletedPayload extends BaseObjectPayload {
  readonly deletedAt: string;
}
