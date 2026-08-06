import { BaseDomainEvent } from '../base-domain-event.js';

export interface UserRegisteredPayload extends Record<string, unknown> {
  readonly userId: string;
  readonly email: string;
  readonly username: string;
  readonly registeredAt: string;
}

/**
 * Event emitted when a new user registers on the platform.
 */
export class UserRegisteredEvent extends BaseDomainEvent<UserRegisteredPayload> {
  public static readonly EVENT_NAME = 'user.registered';

  constructor(payload: UserRegisteredPayload) {
    super(UserRegisteredEvent.EVENT_NAME, payload.userId, payload);
  }
}
