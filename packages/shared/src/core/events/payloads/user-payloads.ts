import type { UniqueEntityId } from '../../primitives/unique-entity-id.js';
import type { InstantString } from '../instant-string.js';

export interface UserRegisteredPayload extends Record<string, unknown> {
  readonly userId: UniqueEntityId;
  readonly email: string;
  readonly username: string;
  readonly registeredAt: InstantString;
}
