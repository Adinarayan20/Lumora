import { describe, it, expect, vi } from 'vitest';
import { LumoraPlatformKernel } from '../platform-kernel.service.js';
import type { RedisSchemaCache } from '../../catalog/redis-schema.cache.js';
import { CapabilityRegistry } from '../../../domain/capabilities/capability-registry.js';
import { CapabilityExecutor } from '../../../domain/capabilities/capability-executor.js';
import { UniversalCapabilityEngine } from '../../../domain/capabilities/universal-capability-engine.js';

describe('LumoraPlatformKernel', () => {
  function makeKernel() {
    const mockCache = {
      getSchema: vi.fn().mockResolvedValue(null),
    } as unknown as RedisSchemaCache;
    const registry = new CapabilityRegistry();
    const executor = new CapabilityExecutor(registry);
    const engine = new UniversalCapabilityEngine(registry, executor);
    return new LumoraPlatformKernel(mockCache, registry, engine);
  }

  it('should execute deterministic bootstrap sequence cleanly', async () => {
    const kernel = makeKernel();
    expect(kernel.isBooted()).toBe(false);
    const result = await kernel.bootstrap();
    expect(result.initialized).toBe(true);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(kernel.isBooted()).toBe(true);
  });

  it('should be idempotent — second bootstrap call skips re-initialization', async () => {
    const kernel = makeKernel();
    await kernel.bootstrap();
    const second = await kernel.bootstrap();
    expect(second.durationMs).toBe(0);
    expect(kernel.isBooted()).toBe(true);
  });
});
