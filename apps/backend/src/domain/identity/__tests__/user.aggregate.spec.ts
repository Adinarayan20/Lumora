import { describe, it, expect } from 'vitest';
import { UserAggregate } from '../user.aggregate.js';
import { EmailAddress } from '../value-objects/email-address.js';
import { Username } from '../value-objects/username.js';
import { HashedPassword } from '../value-objects/hashed-password.js';
import { DomainValidationException, UniqueEntityId } from '@lumora/shared';

describe('UserAggregate Domain Root', () => {
  const validEmail = EmailAddress.create('user@example.com');
  const validUsername = Username.create('valid_user');
  const validHash = HashedPassword.create('$2b$10$abcdefghijklmnopqrstuvwxyz123456');

  it('should create user aggregate and record UserRegisteredEvent', () => {
    const user = UserAggregate.create({
      email: validEmail,
      username: validUsername,
      displayName: 'Valid User',
      passwordHash: validHash,
    });

    expect(user.id).toBeDefined();
    expect(user.email.toValue()).toBe('user@example.com');
    expect(user.hasUncommittedEvents()).toBe(true);
    expect(user.domainEvents[0].eventName).toBe('user.registered');
  });

  it('should reconstitute existing user without emitting events', () => {
    const user = UserAggregate.reconstitute({
      id: new UniqueEntityId(),
      email: validEmail,
      username: validUsername,
      displayName: 'Existing User',
      passwordHash: validHash,
    });

    expect(user.hasUncommittedEvents()).toBe(false);
  });

  it('should reject invalid email format', () => {
    expect(() => EmailAddress.create('invalid-email')).toThrow(DomainValidationException);
  });

  it('should reject invalid username', () => {
    expect(() => Username.create('a')).toThrow(DomainValidationException);
    expect(() => Username.create('user with spaces')).toThrow(DomainValidationException);
  });
});
