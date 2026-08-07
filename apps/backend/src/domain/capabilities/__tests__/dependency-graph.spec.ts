import { describe, it, expect } from 'vitest';
import {
  ExecutionPolicy,
  FailurePolicy,
  DomainValidationException,
} from '@lumora/shared';
import { CapabilityRegistry } from '../capability-registry.js';
import { CapabilityExecutor } from '../capability-executor.js';
import { UniversalCapabilityEngine } from '../universal-capability-engine.js';

describe('Capability Dependency Graph Tests', () => {
  it('should validate simple linear chain (A -> B -> C)', () => {
    const registry = new CapabilityRegistry();
    const executor = new CapabilityExecutor(registry);
    const engine = new UniversalCapabilityEngine(registry, executor);

    engine.registerCapability({
      key: 'c',
      name: 'C',
      description: 'C',
      version: '1.0.0',
      priority: 3,
      executionOrder: 3,
      defaultEnabled: true,
      systemRequired: false,
      cannotDisable: false,
      isExperimental: false,
      executionPolicy: ExecutionPolicy.SEQUENTIAL,
      failurePolicy: FailurePolicy.FAIL_FAST,
      supportsOffline: true,
      supportsUndo: true,
      dependencies: [],
      requiredTraits: [],
    });

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
      supportsUndo: true,
      dependencies: [
        { capabilityKey: 'c', dependencyType: 'REQUIRED', versionRange: '1.x' },
      ],
      requiredTraits: [],
    });

    engine.registerCapability({
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
      supportsUndo: true,
      dependencies: [
        { capabilityKey: 'b', dependencyType: 'REQUIRED', versionRange: '1.x' },
      ],
      requiredTraits: [],
    });

    const result = engine.validateCapabilitiesForObject(
      [
        { key: 'a', version: '1.0.0', enabled: true },
        { key: 'b', version: '1.0.0', enabled: true },
        { key: 'c', version: '1.0.0', enabled: true },
      ],
      [],
    );
    expect(result.isSuccess).toBe(true);
  });

  it('should detect circular dependency (A -> B -> C -> A)', () => {
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
      supportsUndo: true,
      dependencies: [
        { capabilityKey: 'b', dependencyType: 'REQUIRED', versionRange: '1.x' },
      ],
      requiredTraits: [],
    });

    registry.register({
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
      supportsUndo: true,
      dependencies: [
        { capabilityKey: 'c', dependencyType: 'REQUIRED', versionRange: '1.x' },
      ],
      requiredTraits: [],
    });

    expect(() =>
      engine.registerCapability({
        key: 'c',
        name: 'C',
        description: 'C',
        version: '1.0.0',
        priority: 3,
        executionOrder: 3,
        defaultEnabled: true,
        systemRequired: false,
        cannotDisable: false,
        isExperimental: false,
        executionPolicy: ExecutionPolicy.SEQUENTIAL,
        failurePolicy: FailurePolicy.FAIL_FAST,
        supportsOffline: true,
        supportsUndo: true,
        dependencies: [
          {
            capabilityKey: 'a',
            dependencyType: 'REQUIRED',
            versionRange: '1.x',
          },
        ],
        requiredTraits: [],
      }),
    ).toThrow(DomainValidationException);
  });

  it('should support optional dependencies without failing validation if missing', () => {
    const registry = new CapabilityRegistry();
    const executor = new CapabilityExecutor(registry);
    const engine = new UniversalCapabilityEngine(registry, executor);

    engine.registerCapability({
      key: 'analytics',
      name: 'Analytics',
      description: 'Optional analytics',
      version: '1.0.0',
      priority: 1,
      executionOrder: 1,
      defaultEnabled: true,
      systemRequired: false,
      cannotDisable: false,
      isExperimental: false,
      executionPolicy: ExecutionPolicy.SEQUENTIAL,
      failurePolicy: FailurePolicy.IGNORE,
      supportsOffline: true,
      supportsUndo: false,
      dependencies: [
        {
          capabilityKey: 'telemetry',
          dependencyType: 'OPTIONAL',
          versionRange: '1.x',
        },
      ],
      requiredTraits: [],
    });

    const result = engine.validateCapabilitiesForObject(
      [{ key: 'analytics', version: '1.0.0', enabled: true }],
      [],
    );
    expect(result.isSuccess).toBe(true);
  });
});
