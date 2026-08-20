import { describe, it, expect, vi } from 'vitest';
import { LumoraPlatformKernel } from '../platform-kernel.service.js';
import type { RedisSchemaCache } from '../../catalog/redis-schema.cache.js';

//
// Capability engine mocks removed — see cleanup report §10.
// LumoraPlatformKernel no longer depends on CapabilityRegistry/
// CapabilityExecutor/UniversalCapabilityEngine; it only verifies the
// catalog is loaded and probes Redis Schema Cache connectivity.
//
describe('LumoraPlatformKernel', () => {
  function makeKernel() {
    const mockCache = {
      getSchema: vi.fn().mockResolvedValue(null),
    } as unknown as RedisSchemaCache;
    return new LumoraPlatformKernel(mockCache);
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

  it('should not throw when Redis Schema Cache is unavailable (non-fatal probe)', async () => {
    const failingCache = {
      getSchema: vi.fn().mockRejectedValue(new Error('connection refused')),
    } as unknown as RedisSchemaCache;
    const kernel = new LumoraPlatformKernel(failingCache);
    const result = await kernel.bootstrap();
    expect(result.initialized).toBe(true);
  });
});
