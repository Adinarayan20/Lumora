import { describe, it, expect } from 'vitest';
import { UniqueEntityId, SystemTrait } from '@lumora/shared';
import { ObjectDefinitionRegistryAggregate } from '../object-definition-registry.aggregate.js';

describe('ObjectDefinitionRegistryAggregate', () => {
  it('should instantiate a valid ObjectDefinitionRegistryAggregate', () => {
    const workspaceId = new UniqueEntityId();
    const def = ObjectDefinitionRegistryAggregate.create({
      workspaceId,
      typeKey: 'habit',
      name: 'Habit Log',
      pluralName: 'Habit Logs',
      icon: 'habit-icon',
      color: '#4F46E5',
      allowedCapabilities: ['timeline', 'reminders'],
      traits: [SystemTrait.FAVORITABLE, SystemTrait.RECURRING],
      schemaVersion: 1,
    });

    expect(def.typeKey).toBe('habit');
    expect(def.allowedCapabilities).toContain('timeline');
    expect(def.traits).toContain(SystemTrait.RECURRING);
  });
});
