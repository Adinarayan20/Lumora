import { describe, it, expect } from 'vitest';
import {
  ExecutionPolicy,
  FailurePolicy,
  SystemTrait,
  DomainValidationException,
} from '@lumora/shared';
import { CapabilityRegistry } from '../capability-registry.js';

describe('CapabilityRegistry', () => {
  it('should register and retrieve capability descriptors cleanly', () => {
    const registry = new CapabilityRegistry();
    registry.register({
      key: 'reminders',
      name: 'Reminders Engine',
      description: 'Scheduled notifications and alerts',
      version: '1.0.0',
      priority: 1,
      executionOrder: 10,
      defaultEnabled: true,
      systemRequired: false,
      cannotDisable: false,
      isExperimental: false,
      executionPolicy: ExecutionPolicy.SEQUENTIAL,
      failurePolicy: FailurePolicy.FAIL_FAST,
      supportsOffline: true,
      supportsUndo: false,
      dependencies: [],
      requiredTraits: [SystemTrait.RECURRING],
    });

    expect(registry.has('reminders')).toBe(true);
    const descriptor = registry.get('reminders');
    expect(descriptor?.name).toBe('Reminders Engine');
    expect(descriptor?.requiredTraits).toContain(SystemTrait.RECURRING);
  });

  it('should throw DomainValidationException when registering duplicate keys', () => {
    const registry = new CapabilityRegistry();
    const descriptor = {
      key: 'media',
      name: 'Media Attachments',
      description: 'File upload and assets',
      version: '1.0.0',
      priority: 2,
      executionOrder: 20,
      defaultEnabled: true,
      systemRequired: false,
      cannotDisable: false,
      isExperimental: false,
      executionPolicy: ExecutionPolicy.PARALLEL,
      failurePolicy: FailurePolicy.CONTINUE,
      supportsOffline: true,
      supportsUndo: true,
      dependencies: [],
      requiredTraits: [],
    };

    registry.register(descriptor);
    expect(() => registry.register(descriptor)).toThrow(
      DomainValidationException,
    );
  });
});
