/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateLimiterStore } from '../providers/rate-limiter-store.js';

describe('RateLimiterStore Unit Tests', () => {
  let store: RateLimiterStore;
  let mockRedisClient: any;
  let mockRedisProvider: any;

  beforeEach(() => {
    mockRedisClient = {
      eval: vi.fn(),
      get: vi.fn(),
      del: vi.fn(),
    };

    mockRedisProvider = {
      getClient: vi.fn().mockReturnValue(mockRedisClient),
    };

    store = new RateLimiterStore(mockRedisProvider);
  });

  it('should execute atomic Lua script to increment rate limit counter', async () => {
    mockRedisClient.eval.mockResolvedValue([1, 60]);

    const result = await store.increment('ip-127.0.0.1', 60);

    expect(result.totalHits).toBe(1);
    expect(result.resetTimeMs).toBeGreaterThan(Date.now());
    expect(mockRedisClient.eval).toHaveBeenCalled();
  });

  it('should fallback safely without crashing when Redis eval throws error', async () => {
    mockRedisClient.eval.mockRejectedValue(new Error('Redis connection lost'));

    const result = await store.increment('ip-127.0.0.1', 60);

    expect(result.totalHits).toBe(1);
    expect(result.resetTimeMs).toBeGreaterThan(Date.now());
  });

  it('should get current rate limit count for identifier', async () => {
    mockRedisClient.get.mockResolvedValue('5');

    const count = await store.get('ip-127.0.0.1');

    expect(count).toBe(5);
  });

  it('should reset rate limit counter', async () => {
    await store.reset('ip-127.0.0.1');

    expect(mockRedisClient.del).toHaveBeenCalledWith(
      'lumora:rate-limit:ip-127.0.0.1',
    );
  });
});
