import { describe, it, expect } from 'vitest';
import { LumoraPlatformKernel } from '../platform-kernel.service.js';
import type { RedisSchemaCache } from '../../catalog/redis-schema.cache.js';

describe('LumoraPlatformKernel', () => {
  it('should execute deterministic bootstrap sequence cleanly', async () => {
    const mockCache = {} as RedisSchemaCache;
    const kernel = new LumoraPlatformKernel(mockCache);

    expect(kernel.isBooted()).toBe(false);
    const result = await kernel.bootstrap();

    expect(result.initialized).toBe(true);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(kernel.isBooted()).toBe(true);
  });
});
