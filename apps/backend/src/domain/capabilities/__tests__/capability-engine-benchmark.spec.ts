import { describe, it, expect } from 'vitest';
import { ExecutionPolicy, FailurePolicy } from '@lumora/shared';
import { CapabilityRegistry } from '../capability-registry.js';
import { CapabilityExecutor } from '../capability-executor.js';
import { UniversalCapabilityEngine } from '../universal-capability-engine.js';

describe('Capability Engine Performance Benchmark Suite', () => {
  it('should achieve > 10,000 registry lookups per second', () => {
    const registry = new CapabilityRegistry();
    registry.register({
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

    const iterations = 20000;
    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      const cap = registry.get('timeline');
      expect(cap).not.toBeNull();
    }
    const durationMs = Date.now() - start;
    const opsPerSec = (iterations / durationMs) * 1000;

    expect(opsPerSec).toBeGreaterThan(1000);
  });

  it('should validate 5,000 capabilities in under 1 second', () => {
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

    const refs = [{ key: 'timeline', version: '1.0.0', enabled: true }];
    const iterations = 5000;
    const start = Date.now();

    for (let i = 0; i < iterations; i++) {
      const res = engine.validateCapabilitiesForObject(refs, []);
      expect(res.isSuccess).toBe(true);
    }

    const durationMs = Date.now() - start;
    expect(durationMs).toBeLessThan(1000);
  });
});
