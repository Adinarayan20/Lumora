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

    // Warm-up pass
    for (let i = 0; i < 1000; i++) {
      registry.get('timeline');
    }

    const iterations = 50000;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      const cap = registry.get('timeline');
      expect(cap).not.toBeNull();
    }
    const durationMs = performance.now() - start;
    const opsPerSec = (iterations / durationMs) * 1000;

    expect(opsPerSec).toBeGreaterThan(10000);
  });

  it('should handle 10,000 unique registrations and randomized lookups efficiently', () => {
    const registry = new CapabilityRegistry();
    const count = 10000;

    const startReg = performance.now();
    for (let i = 0; i < count; i++) {
      registry.register({
        key: `cap_unique_${i}`,
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
    const regDurationMs = performance.now() - startReg;
    expect(regDurationMs).toBeLessThan(1000);

    const startLookup = performance.now();
    for (let i = 0; i < count; i++) {
      const randomIndex = (i * 37) % count;
      const cap = registry.get(`cap_unique_${randomIndex}`);
      expect(cap).not.toBeNull();
    }
    const lookupDurationMs = performance.now() - startLookup;
    expect(lookupDurationMs).toBeLessThan(500);
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

    // Warm-up
    for (let i = 0; i < 100; i++) {
      engine.validateCapabilitiesForObject(refs, []);
    }

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      const res = engine.validateCapabilitiesForObject(refs, []);
      expect(res.isSuccess).toBe(true);
    }

    const durationMs = performance.now() - start;
    expect(durationMs).toBeLessThan(1000);
  });
});
