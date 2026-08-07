import { describe, it, expect } from 'vitest';
import {
  UniqueEntityId,
  ObjectTypeKey,
  RuntimeState,
  DomainValidationException,
} from '@lumora/shared';
import type { ExecutionContext } from '@lumora/shared';
import { ObjectAggregate } from '../../objects/object.aggregate.js';
import { ObjectTitle } from '../../objects/value-objects/object-title.js';
import { ObjectKey } from '../../objects/value-objects/object-key.js';
import { LumoraObjectRuntime } from '../lumora-object-runtime.js';
import { CapabilityRegistry } from '../../capabilities/capability-registry.js';
import { CapabilityExecutor } from '../../capabilities/capability-executor.js';

describe('LumoraObjectRuntime State Machine Tests', () => {
  function createTestRuntime(state = RuntimeState.ACTIVE) {
    const workspaceId = new UniqueEntityId();
    const userId = new UniqueEntityId();
    const typeKey = ObjectTypeKey.NOTE;

    const aggregate = ObjectAggregate.create({
      workspaceId,
      createdById: userId,
      objectKey: ObjectKey.create('note-99'),
      typeKey,
      title: ObjectTitle.create('Test Note'),
    });

    return LumoraObjectRuntime.create({
      aggregate,
      schema: {
        typeKey,
        schemaVersion: 1,
        fields: [],
      },
      definition: {
        typeKey,
        name: 'Note',
        pluralName: 'Notes',
        icon: 'note-icon',
        allowedCapabilities: [],
        traits: [],
        schemaVersion: 1,
      },
      activeCapabilities: [],
      state,
    });
  }

  it('should transition through ACTIVE -> LOCKED -> ACTIVE cleanly', () => {
    const runtime = createTestRuntime(RuntimeState.ACTIVE);
    expect(runtime.state).toBe(RuntimeState.ACTIVE);

    runtime.lock();
    expect(runtime.state).toBe(RuntimeState.LOCKED);

    runtime.unlock();
    expect(runtime.state).toBe(RuntimeState.ACTIVE);
  });

  it('should transition through ACTIVE -> ARCHIVED -> RESTORED (ACTIVE)', () => {
    const runtime = createTestRuntime(RuntimeState.ACTIVE);
    runtime.archive();
    expect(runtime.state).toBe(RuntimeState.ARCHIVED);

    runtime.restore();
    expect(runtime.state).toBe(RuntimeState.ACTIVE);
  });

  it('should transition through ACTIVE -> SOFT_DELETED -> RESTORED (ACTIVE)', () => {
    const runtime = createTestRuntime(RuntimeState.ACTIVE);
    runtime.softDelete();
    expect(runtime.state).toBe(RuntimeState.SOFT_DELETED);

    runtime.restore();
    expect(runtime.state).toBe(RuntimeState.ACTIVE);
  });

  it('should block attribute mutations when runtime state is not ACTIVE', async () => {
    const registry = new CapabilityRegistry();
    const executor = new CapabilityExecutor(registry);

    const runtime = createTestRuntime(RuntimeState.LOCKED);

    const context: ExecutionContext = {
      workspaceId: 'ws-123',
      userId: 'usr-123',
      transactionId: 'tx-1',
      timezone: 'UTC',
      locale: 'en-US',
      permissions: [],
      device: { platform: 'web', isOffline: false, appVersion: '1.0.0' },
      featureFlags: {},
      timestamp: new Date(),
    };

    const result = await runtime.updateAttribute(
      'title',
      'New Title',
      context,
      executor,
    );
    expect(result.isFailure).toBe(true);
  });

  it('should throw DomainValidationException on invalid state transitions', () => {
    const runtime = createTestRuntime(RuntimeState.ARCHIVED);
    expect(() => runtime.lock()).toThrow(DomainValidationException);
    expect(() => runtime.unlock()).toThrow(DomainValidationException);
  });
});
