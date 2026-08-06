import type { UniqueEntityId } from "../../primitives/unique-entity-id.js";
import type { InstantString } from "../instant-string.js";
import type { BaseObjectPayload } from "./base-payloads.js";

export interface ObjectCreatedPayload extends BaseObjectPayload {
  readonly title: string;
  readonly authorId: UniqueEntityId;
  readonly createdAt: InstantString;
}

export interface ObjectUpdatedPayload extends BaseObjectPayload {
  readonly modifierId: UniqueEntityId;
  readonly updatedFields: readonly string[];
  readonly updatedAt: InstantString;
}

export interface ObjectDeletedPayload extends BaseObjectPayload {
  readonly deletedAt: InstantString;
}
