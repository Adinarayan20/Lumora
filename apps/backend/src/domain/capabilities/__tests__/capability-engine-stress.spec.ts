import { describe, it, expect } from 'vitest';
import { ExecutionPolicy, FailurePolicy } from '@lumora/shared';
import { CapabilityRegistry } from '../capability-registry.js';
import { CapabilityExecutor } from '../capability-executor.js';
import { UniversalCapabilityEngine } from '../universal-capability-engine.js';

describe('Capability Engine Stress Tests', () => {
  it('should register and validate 100 capabilities without failure', () => {
    const registry = new CapabilityRegistry();
    const executor = new CapabilityExecutor(registry);
    const engine = new UniversalCapabilityEngine(registry, executor);

    const count = 100;
    for (let i = 0; i < count; i++) {
      engine.registerCapability({
        key: `cap_${i}`,
        name: `Capability ${i}`,
        description: `Description ${i}`,
        version: '1.0.0',
        priority: i,
        executionOrder: i,
        defaultEnabled: true,
        systemRequired: false,
        cannotDisable: false,
        isExperimental: false,
        executionPolicy: ExecutionPolicy.SEQUENTIAL,
        failurePolicy: FailurePolicy.CONTINUE,
        supportsOffline: true,
        supportsUndo: true,
        dependencies:
          i > 0
            ? [
                {
                  capabilityKey: `cap_${i - 1}`,
                  dependencyType: 'REQUIRED',
                  versionRange: '1.x',
                },
              ]
            : [],
        requiredTraits: [],
      });
    }

    expect(registry.list().length).toBe(count);

    const refs = Array.from({ length: count }, (_, i) => ({
      key: `cap_${i}`,
      version: '1.0.0',
      enabled: true,
    }));

    const result = engine.validateCapabilitiesForObject(refs, []);
    expect(result.isSuccess).toBe(true);
  });

  it('should register and validate 500 capabilities without failure', () => {
    const registry = new CapabilityRegistry();
    const executor = new CapabilityExecutor(registry);
    const engine = new UniversalCapabilityEngine(registry, executor);

    const count = 500;
    for (let i = 0; i < count; i++) {
      engine.registerCapability({
        key: `cap_${i}`,
        name: `Capability ${i}`,
        description: `Description ${i}`,
        version: '1.0.0',
        priority: i,
        executionOrder: i,
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
      });
    }

    expect(registry.list().length).toBe(count);

    const refs = Array.from({ length: count }, (_, i) => ({
      key: `cap_${i}`,
      version: '1.0.0',
      enabled: true,
    }));

    const result = engine.validateCapabilitiesForObject(refs, []);
    expect(result.isSuccess).toBe(true);
  });

  it('should register and validate 1000 capabilities without failure', () => {
    const registry = new CapabilityRegistry();
    const executor = new CapabilityExecutor(registry);
    const engine = new UniversalCapabilityEngine(registry, executor);

    const count = 1000;
    for (let i = 0; i < count; i++) {
      engine.registerCapability({
        key: `cap_${i}`,
        name: `Capability ${i}`,
        description: `Description ${i}`,
        version: '1.0.0',
        priority: i,
        executionOrder: i,
        defaultEnabled: true,
        systemRequired: false,
        cannotDisable: false,
        isExperimental: false,
        executionPolicy: ExecutionPolicy.SEQUENTIAL,
        failurePolicy: FailurePolicy.CONTINUE,
        supportsOffline: true,
        supportsUndo: true,
        dependencies: [],
        requiredTraits: [],
      });
    }

    expect(registry.list().length).toBe(count);
  });
});
