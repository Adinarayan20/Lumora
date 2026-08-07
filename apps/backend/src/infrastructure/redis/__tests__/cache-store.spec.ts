/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CacheStore } from '../providers/cache-store.js';

describe('CacheStore Unit Tests', () => {
  let cacheStore: CacheStore;
  let mockRedisClient: any;
  let mockRedisProvider: any;

  beforeEach(() => {
    mockRedisClient = {
      get: vi.fn(),
      set: vi.fn(),
      setex: vi.fn(),
      del: vi.fn(),
      exists: vi.fn(),
    };

    mockRedisProvider = {
      getClient: vi.fn().mockReturnValue(mockRedisClient),
    };

    cacheStore = new CacheStore(mockRedisProvider);
  });

  it('should get and deserialize JSON payload from Redis', async () => {
    mockRedisClient.get.mockResolvedValue(
      JSON.stringify({ id: '123', name: 'Test' }),
    );

    const result = await cacheStore.get<{ id: string; name: string }>(
      'lumora:test:123',
    );

    expect(result).toEqual({ id: '123', name: 'Test' });
    expect(mockRedisClient.get).toHaveBeenCalledWith('lumora:test:123');
  });

  it('should return null when key does not exist', async () => {
    mockRedisClient.get.mockResolvedValue(null);

    const result = await cacheStore.get('lumora:nonexistent');

    expect(result).toBeNull();
  });

  it('should handle corrupt JSON gracefully by returning null', async () => {
    mockRedisClient.get.mockResolvedValue('{corrupt-json-string');

    const result = await cacheStore.get('lumora:corrupt');

    expect(result).toBeNull();
  });

  it('should return null without crashing when Redis get throws error', async () => {
    mockRedisClient.get.mockRejectedValue(new Error('Connection timed out'));

    const result = await cacheStore.get('lumora:error');

    expect(result).toBeNull();
  });

  it('should set serialized JSON payload with TTL in Redis', async () => {
    await cacheStore.set('lumora:test:123', { name: 'Test' }, 3600);

    expect(mockRedisClient.setex).toHaveBeenCalledWith(
      'lumora:test:123',
      3600,
      JSON.stringify({ name: 'Test' }),
    );
  });

  it('should delete key from Redis', async () => {
    await cacheStore.delete('lumora:test:123');

    expect(mockRedisClient.del).toHaveBeenCalledWith('lumora:test:123');
  });

  it('should check existence of key in Redis', async () => {
    mockRedisClient.exists.mockResolvedValue(1);

    const exists = await cacheStore.exists('lumora:test:123');

    expect(exists).toBe(true);
    expect(mockRedisClient.exists).toHaveBeenCalledWith('lumora:test:123');
  });
});
