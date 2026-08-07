import { describe, it, expect, vi } from 'vitest';
import { RedisSchemaCache } from '../redis-schema.cache.js';
import type { RedisClientProvider } from '../../redis/redis-client.provider.js';
import { FieldType } from '@lumora/shared';

describe('RedisSchemaCache', () => {
  it('should cache and retrieve schema definition cleanly', async () => {
    const mockRedisClient = {
      get: vi.fn(),
      setex: vi.fn().mockResolvedValue('OK'),
    };
    const mockProvider = {
      getClient: () => mockRedisClient,
    } as unknown as RedisClientProvider;

    const cache = new RedisSchemaCache(mockProvider);
    const schema = {
      typeKey: 'habit',
      schemaVersion: 1,
      fields: [
        {
          key: 'streak',
          label: 'Streak',
          type: FieldType.NUMBER,
        },
      ],
    };

    await cache.setSchema('ws-1', 'habit', schema);
    expect(mockRedisClient.setex).toHaveBeenCalledWith(
      'lumora:schema:ws-1:habit',
      86400,
      JSON.stringify(schema),
    );

    mockRedisClient.get.mockResolvedValue(JSON.stringify(schema));
    const cached = await cache.getSchema('ws-1', 'habit');
    expect(cached).toEqual(schema);
  });
});
