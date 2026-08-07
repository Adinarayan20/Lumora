/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RedisClientProvider } from '../redis-client.provider.js';

describe('RedisClientProvider Unit Tests', () => {
  let provider: RedisClientProvider;
  let mockConfigService: any;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn().mockReturnValue('redis://localhost:6379'),
    };

    provider = new RedisClientProvider(mockConfigService);
  });

  it('should throw error when getClient() is called before initialization', () => {
    expect(() => provider.getClient()).toThrow(
      'RedisClientProvider has not been initialized. Ensure RedisModule is loaded.',
    );
  });

  it('should throw explicit error in production if REDIS_URL is missing', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    mockConfigService.get.mockReturnValue(undefined);

    const prodProvider = new RedisClientProvider(mockConfigService);

    await expect(prodProvider.onModuleInit()).rejects.toThrow(
      'REDIS_URL environment variable is required in production environment.',
    );

    process.env.NODE_ENV = originalEnv;
  });
});
