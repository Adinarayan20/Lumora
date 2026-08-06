import { AggregateRoot, UniqueEntityId, Guard } from '@lumora/shared';
import { EmailAddress } from './value-objects/email-address.js';
import { Username } from './value-objects/username.js';
import { HashedPassword } from './value-objects/hashed-password.js';
import { UserStatus } from './value-objects/user-status.js';
import { UserRegisteredEvent, UserLoggedInEvent } from './events/user.events.js';

export interface UserAggregateProps {
  id?: UniqueEntityId;
  email: EmailAddress;
  username: Username;
  displayName: string;
  passwordHash: HashedPassword;
  avatarUrl?: string;
  timezone?: string;
  locale?: string;
  emailVerified?: boolean;
  onboardingDone?: boolean;
  status?: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain Aggregate Root representing a Lumora User.
 */
export class UserAggregate extends AggregateRoot<UniqueEntityId> {
  public email: EmailAddress;
  public username: Username;
  public displayName: string;
  public passwordHash: HashedPassword;
  public avatarUrl?: string | undefined;
  public timezone: string;
  public locale: string;
  public emailVerified: boolean;
  public onboardingDone: boolean;
  public status: UserStatus;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: UserAggregateProps) {
    super(props.id);
    this.email = props.email;
    this.username = props.username;
    this.displayName = props.displayName;
    this.passwordHash = props.passwordHash;
    this.avatarUrl = props.avatarUrl;
    this.timezone = props.timezone ?? 'UTC';
    this.locale = props.locale ?? 'en';
    this.emailVerified = props.emailVerified ?? false;
    this.onboardingDone = props.onboardingDone ?? false;
    this.status = props.status ?? UserStatus.ACTIVE;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Factory method creating a new UserAggregate instance and emitting UserRegisteredEvent.
   */
  public static create(props: UserAggregateProps): UserAggregate {
    const displayGuard = Guard.againstEmptyString(props.displayName, 'displayName');
    if (displayGuard.isFailure) throw displayGuard.getError();

    const user = new UserAggregate(props);
    user.addDomainEvent(
      new UserRegisteredEvent(
        user.id,
        user.email.toValue(),
        user.username.toValue(),
      ),
    );
    return user;
  }

  /**
   * Reconstitution factory rehydrating an existing UserAggregate from database state.
   */
  public static reconstitute(props: UserAggregateProps): UserAggregate {
    return new UserAggregate(props);
  }

  public recordLogin(deviceId: UniqueEntityId): void {
    this.updatedAt = new Date();
    this.addDomainEvent(new UserLoggedInEvent(this.id, deviceId));
  }

  public updatePassword(newPasswordHash: HashedPassword): void {
    this.passwordHash = newPasswordHash;
    this.updatedAt = new Date();
  }

  public updateProfile(displayName: string, avatarUrl?: string): void {
    const displayGuard = Guard.againstEmptyString(displayName, 'displayName');
    if (displayGuard.isFailure) throw displayGuard.getError();

    this.displayName = displayName;
    this.avatarUrl = avatarUrl;
    this.updatedAt = new Date();
  }
}
