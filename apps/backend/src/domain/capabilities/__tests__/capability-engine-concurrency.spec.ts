import { describe, it, expect, vi } from 'vitest';
import {
  ExecutionPolicy,
  FailurePolicy,
  AggregateCapabilityException,
  UniqueEntityId,
  ObjectTypeKey,
  FieldType,
} from '@lumora/shared';
import type { ExecutionContext } from '@lumora/shared';
import { ObjectAggregate } from '../../objects/object.aggregate.js';
import { ObjectTitle } from '../../objects/value-objects/object-title.js';
import { ObjectKey } from '../../objects/value-objects/object-key.js';
import { CapabilityRegistry } from '../capability-registry.js';
import { CapabilityExecutor } from '../capability-executor.js';
import { UniversalCapabilityEngine } from '../universal-capability-engine.js';
import { LumoraObjectRuntime } from '../../runtime/lumora-object-runtime.js';

describe('Capability Engine Deterministic Concurrency & Aggregated Exception Tests', () => {
  it('should throw AggregateCapabilityException with detailed metadata when parallel capabilities fail', async () => {
    const registry = new CapabilityRegistry();
    const executor = new CapabilityExecutor(registry);
    const engine = new UniversalCapabilityEngine(registry, executor);

    registry.register({
      key: 'p1',
      name: 'P1',
      description: 'P1',
      version: '1.0.0',
      priority: 1,
      executionOrder: 1,
      defaultEnabled: true,
      systemRequired: false,
      cannotDisable: false,
      isExperimental: false,
      executionPolicy: ExecutionPolicy.PARALLEL,
      failurePolicy: FailurePolicy.FAIL_FAST,
      supportsOffline: true,
      supportsUndo: true,
      dependencies: [],
      requiredTraits: [],
    });

    registry.register({
      key: 'p2',
      name: 'P2',
      description: 'P2',
      version: '1.0.0',
      priority: 2,
      executionOrder: 1,
      defaultEnabled: true,
      systemRequired: false,
      cannotDisable: false,
      isExperimental: false,
      executionPolicy: ExecutionPolicy.PARALLEL,
      failurePolicy: FailurePolicy.FAIL_FAST,
      supportsOffline: true,
      supportsUndo: true,
      dependencies: [],
      requiredTraits: [],
    });

    executor.registerHandler('p1', {
      beforeExecution: vi.fn().mockRejectedValue(new Error('P1 failed')),
    });
    executor.registerHandler('p2', {
      beforeExecution: vi.fn().mockRejectedValue(new Error('P2 failed')),
    });

    const workspaceId = new UniqueEntityId();
    const userId = new UniqueEntityId();
    const typeKey = ObjectTypeKey.NOTE;

    const aggregate = ObjectAggregate.create({
      workspaceId,
      createdById: userId,
      objectKey: ObjectKey.create('note-parallel'),
      typeKey,
      title: ObjectTitle.create('Parallel Test'),
    });

    const runtime = LumoraObjectRuntime.create({
      aggregate,
      schema: {
        typeKey,
        schemaVersion: 1,
        fields: [{ key: 'title', label: 'Title', type: FieldType.STRING }],
      },
      definition: {
        typeKey,
        name: 'Note',
        pluralName: 'Notes',
        icon: 'note-icon',
        allowedCapabilities: ['p1', 'p2'],
        traits: [],
        schemaVersion: 1,
      },
      activeCapabilities: [
        { key: 'p1', version: '1.0.0', enabled: true },
        { key: 'p2', version: '1.0.0', enabled: true },
      ],
    });

    const context: ExecutionContext = {
      workspaceId: workspaceId.toValue(),
      userId: userId.toValue(),
      transactionId: 'tx-parallel-123',
      timezone: 'UTC',
      locale: 'en-US',
      permissions: [],
      device: { platform: 'web', isOffline: false, appVersion: '1.0.0' },
      featureFlags: {},
      timestamp: new Date(),
    };

    const updateRes = await runtime.updateAttribute(
      'title',
      'New Title',
      context,
      engine.executor,
    );
    expect(updateRes.isFailure).toBe(true);
    const err = updateRes.getError();
    expect(err).toBeInstanceOf(AggregateCapabilityException);
    if (err instanceof AggregateCapabilityException) {
      expect(err.failures.length).toBe(2);
      expect(err.failures[0].transactionId).toBe('tx-parallel-123');
      expect(err.failures[0].objectId).toBe(aggregate.id.toValue());
    }
  });

  it('should increment revision atomically and reject stale competing revisions', async () => {
    const registry = new CapabilityRegistry();
    const executor = new CapabilityExecutor(registry);
    const engine = new UniversalCapabilityEngine(registry, executor);

    const workspaceId = new UniqueEntityId();
    const userId = new UniqueEntityId();
    const typeKey = ObjectTypeKey.NOTE;

    const aggregate = ObjectAggregate.create({
      workspaceId,
      createdById: userId,
      objectKey: ObjectKey.create('note-revision'),
      typeKey,
      title: ObjectTitle.create('Revision Test'),
    });

    const runtime = LumoraObjectRuntime.create({
      aggregate,
      schema: {
        typeKey,
        schemaVersion: 1,
        fields: [{ key: 'title', label: 'Title', type: FieldType.STRING }],
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
    });

    const context: ExecutionContext = {
      workspaceId: workspaceId.toValue(),
      userId: userId.toValue(),
      transactionId: 'tx-rev',
      timezone: 'UTC',
      locale: 'en-US',
      permissions: [],
      device: { platform: 'web', isOffline: false, appVersion: '1.0.0' },
      featureFlags: {},
      timestamp: new Date(),
    };

    const initialRevision = runtime.revision;
    expect(initialRevision).toBe(1);

    // Valid update with matching expected revision
    const validRes = await runtime.updateAttribute(
      'title',
      'Valid Update 1',
      context,
      engine.executor,
      1,
    );
    expect(validRes.isSuccess).toBe(true);
    expect(runtime.revision).toBe(2); // Revision incremented atomically!

    // Stale update with previous revision (1)
    const staleRes = await runtime.updateAttribute(
      'title',
      'Stale Update',
      context,
      engine.executor,
      1, // Stale revision
    );
    expect(staleRes.isFailure).toBe(true);

    // Second valid update with new revision (2)
    const validRes2 = await runtime.updateAttribute(
      'title',
      'Valid Update 2',
      context,
      engine.executor,
      2,
    );
    expect(validRes2.isSuccess).toBe(true);
    expect(runtime.revision).toBe(3);
  });
});
