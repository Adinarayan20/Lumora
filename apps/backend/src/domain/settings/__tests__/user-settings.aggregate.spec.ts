import { describe, it, expect } from 'vitest';
import {
  IdGenerator,
  UniqueEntityId,
  DomainValidationException,
} from '@lumora/shared';
import { UserSettingsAggregate } from '../user-settings.aggregate.js';

describe('UserSettingsAggregate Invariants & Rules', () => {
  it('should successfully create UserSettingsAggregate with default preferences', () => {
    const userId = new UniqueEntityId(IdGenerator.generate());

    const settings = UserSettingsAggregate.create({ userId });

    expect(settings.userId.toString()).toBe(userId.toString());
    expect(settings.theme.getValue()).toBe('SYSTEM');
    expect(settings.timezone.getValue()).toBe('UTC');
    expect(settings.notificationsEnabled).toBe(true);
  });

  it('should update theme and timezone preferences', () => {
    const userId = new UniqueEntityId(IdGenerator.generate());
    const settings = UserSettingsAggregate.create({ userId });

    settings.updatePreferences('DARK', 'America/New_York');

    expect(settings.theme.getValue()).toBe('DARK');
    expect(settings.timezone.getValue()).toBe('America/New_York');
  });

  it('should throw DomainValidationException for invalid theme string', () => {
    const userId = new UniqueEntityId(IdGenerator.generate());

    expect(() =>
      UserSettingsAggregate.create({
        userId,
        theme: 'INVALID_THEME',
      }),
    ).toThrow(DomainValidationException);
  });
});
