import type { UniqueEntityId } from "../../primitives/unique-entity-id.js";
import type { InstantString } from "../instant-string.js";

export interface WorkspaceCreatedPayload extends Record<string, unknown> {
  readonly workspaceId: UniqueEntityId;
  readonly ownerId: UniqueEntityId;
  readonly name: string;
  readonly slug: string;
  readonly createdAt: InstantString;
}
