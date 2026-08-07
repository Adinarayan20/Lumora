import { describe, it, expect, vi } from 'vitest';
import {
  UniqueEntityId,
  FieldType,
  SystemTrait,
  ExecutionPolicy,
  FailurePolicy,
  ObjectTypeKey,
  DomainValidationException,
  CatalogEventName,
} from '@lumora/shared';
import type { ExecutionContext } from '@lumora/shared';
import { ObjectAggregate } from '../../objects/object.aggregate.js';
import { ObjectTitle } from '../../objects/value-objects/object-title.js';
import { ObjectKey } from '../../objects/value-objects/object-key.js';
import { CapabilityRegistry } from '../../capabilities/capability-registry.js';
import { CapabilityExecutor } from '../../capabilities/capability-executor.js';
import { UniversalCapabilityEngine } from '../../capabilities/universal-capability-engine.js';
import { LumoraObjectRuntime } from '../lumora-object-runtime.js';

describe('LumoraObjectRuntime & UniversalCapabilityEngine', () => {
  it('should validate capabilities against required traits and prerequisite dependencies with version ranges', () => {
    const registry = new CapabilityRegistry();
    const executor = new CapabilityExecutor(registry);
    const engine = new UniversalCapabilityEngine(registry, executor);

    engine.registerCapability({
      key: 'timeline',
      name: 'Timeline Audit',
      description: 'Timeline audit tracking',
      version: '1.0.0',
      priority: 1,
      executionOrder: 1,
      defaultEnabled: true,
      systemRequired: true,
      cannotDisable: true,
      isExperimental: false,
      executionPolicy: ExecutionPolicy.SEQUENTIAL,
      failurePolicy: FailurePolicy.CONTINUE,
      supportsOffline: true,
      supportsUndo: true,
      dependencies: [],
      requiredTraits: [],
    });

    engine.registerCapability({
      key: 'reminders',
      name: 'Reminders Engine',
      description: 'Scheduled alerts',
      version: '1.0.0',
      priority: 2,
      executionOrder: 10,
      defaultEnabled: true,
      systemRequired: false,
      cannotDisable: false,
      isExperimental: false,
      executionPolicy: ExecutionPolicy.SEQUENTIAL,
      failurePolicy: FailurePolicy.FAIL_FAST,
      supportsOffline: true,
      supportsUndo: false,
      dependencies: [
        {
          capabilityKey: 'timeline',
          dependencyType: 'REQUIRED',
          versionRange: '1.x',
        },
      ],
      requiredTraits: [SystemTrait.RECURRING],
    });

    const validResult = engine.validateCapabilitiesForObject(
      [
        { key: 'timeline', version: '1.0.0', enabled: true },
        { key: 'reminders', version: '1.0.0', enabled: true },
      ],
      [SystemTrait.RECURRING],
    );
    expect(validResult.isSuccess).toBe(true);

    const invalidTraitResult = engine.validateCapabilitiesForObject(
      [{ key: 'reminders', version: '1.0.0', enabled: true }],
      [],
    );
    expect(invalidTraitResult.isFailure).toBe(true);
  });

  it('should throw DomainValidationException when circular dependencies exist', () => {
    const registry = new CapabilityRegistry();
    const executor = new CapabilityExecutor(registry);
    const engine = new UniversalCapabilityEngine(registry, executor);

    registry.register({
      key: 'a',
      name: 'A',
      description: 'A',
      version: '1.0.0',
      priority: 1,
      executionOrder: 1,
      defaultEnabled: true,
      systemRequired: false,
      cannotDisable: false,
      isExperimental: false,
      executionPolicy: ExecutionPolicy.SEQUENTIAL,
      failurePolicy: FailurePolicy.FAIL_FAST,
      supportsOffline: true,
      supportsUndo: false,
      dependencies: [
        {
          capabilityKey: 'b',
          dependencyType: 'REQUIRED',
          versionRange: '1.0.0',
        },
      ],
      requiredTraits: [],
    });

    expect(() =>
      engine.registerCapability({
        key: 'b',
        name: 'B',
        description: 'B',
        version: '1.0.0',
        priority: 2,
        executionOrder: 2,
        defaultEnabled: true,
        systemRequired: false,
        cannotDisable: false,
        isExperimental: false,
        executionPolicy: ExecutionPolicy.SEQUENTIAL,
        failurePolicy: FailurePolicy.FAIL_FAST,
        supportsOffline: true,
        supportsUndo: false,
        dependencies: [
          {
            capabilityKey: 'a',
            dependencyType: 'REQUIRED',
            versionRange: '1.0.0',
          },
        ],
        requiredTraits: [],
      }),
    ).toThrow(DomainValidationException);
  });

  it('should reject attribute updates with invalid schema types', async () => {
    const registry = new CapabilityRegistry();
    const executor = new CapabilityExecutor(registry);
    const engine = new UniversalCapabilityEngine(registry, executor);

    const workspaceId = new UniqueEntityId();
    const userId = new UniqueEntityId();
    const typeKey = ObjectTypeKey.NOTE;

    const aggregate = ObjectAggregate.create({
      workspaceId,
      createdById: userId,
      objectKey: ObjectKey.create('task-123'),
      typeKey,
      title: ObjectTitle.create('Complete Task'),
    });

    const runtime = LumoraObjectRuntime.create({
      aggregate,
      schema: {
        typeKey,
        schemaVersion: 1,
        fields: [
          {
            key: 'priorityNumber',
            label: 'Priority Number',
            type: FieldType.NUMBER,
            validation: { min: 1, max: 10 },
          },
        ],
      },
      definition: {
        typeKey,
        name: 'Task',
        pluralName: 'Tasks',
        icon: 'task-icon',
        allowedCapabilities: [],
        traits: [],
        schemaVersion: 1,
      },
      activeCapabilities: [],
    });

    const context: ExecutionContext = {
      workspaceId: workspaceId.toValue(),
      userId: userId.toValue(),
      transactionId: 'tx-123',
      timezone: 'UTC',
      locale: 'en-US',
      permissions: ['task:write'],
      device: { platform: 'web', isOffline: false, appVersion: '1.0.0' },
      featureFlags: {},
      timestamp: new Date(),
    };

    const invalidResult = await runtime.updateAttribute(
      'priorityNumber',
      'NOT_A_NUMBER',
      context,
      engine.executor,
    );

    expect(invalidResult.isFailure).toBe(true);
  });

  it('should execute attribute updates and emit CAPABILITY_EXECUTED event', async () => {
    const registry = new CapabilityRegistry();
    const executor = new CapabilityExecutor(registry);
    const engine = new UniversalCapabilityEngine(registry, executor);

    const beforeHook = vi.fn().mockResolvedValue(undefined);
    registry.register({
      key: 'timeline',
      name: 'Timeline Audit',
      description: 'Timeline tracking',
      version: '1.0.0',
      priority: 1,
      executionOrder: 1,
      defaultEnabled: true,
      systemRequired: true,
      cannotDisable: true,
      isExperimental: false,
      executionPolicy: ExecutionPolicy.SEQUENTIAL,
      failurePolicy: FailurePolicy.FAIL_FAST,
      supportsOffline: true,
      supportsUndo: true,
      dependencies: [],
      requiredTraits: [],
    });

    executor.registerHandler('timeline', {
      beforeExecution: beforeHook,
    });

    const workspaceId = new UniqueEntityId();
    const userId = new UniqueEntityId();
    const typeKey = ObjectTypeKey.NOTE;

    const aggregate = ObjectAggregate.create({
      workspaceId,
      createdById: userId,
      objectKey: ObjectKey.create('task-123'),
      typeKey,
      title: ObjectTitle.create('Complete Task'),
    });

    const runtime = LumoraObjectRuntime.create({
      aggregate,
      schema: {
        typeKey,
        schemaVersion: 1,
        fields: [
          {
            key: 'priority',
            label: 'Priority',
            type: FieldType.STRING,
          },
        ],
      },
      definition: {
        typeKey,
        name: 'Task',
        pluralName: 'Tasks',
        icon: 'task-icon',
        allowedCapabilities: ['timeline'],
        traits: [],
        schemaVersion: 1,
      },
      activeCapabilities: [
        { key: 'timeline', version: '1.0.0', enabled: true },
      ],
    });

    const context: ExecutionContext = {
      workspaceId: workspaceId.toValue(),
      userId: userId.toValue(),
      transactionId: 'tx-123',
      timezone: 'UTC',
      locale: 'en-US',
      permissions: ['task:write'],
      device: { platform: 'web', isOffline: false, appVersion: '1.0.0' },
      featureFlags: {},
      timestamp: new Date(),
    };

    const updateResult = await runtime.updateAttribute(
      'priority',
      'HIGH',
      context,
      engine.executor,
    );

    expect(updateResult.isSuccess).toBe(true);
    expect(beforeHook).toHaveBeenCalled();
    expect(runtime.getAttribute('priority')).toBe('HIGH');
    expect(
      runtime.domainEvents[runtime.domainEvents.length - 1].eventName,
    ).toBe(CatalogEventName.CAPABILITY_EXECUTED);
  });
});
