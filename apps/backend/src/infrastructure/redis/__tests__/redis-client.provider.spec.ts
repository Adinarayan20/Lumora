/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
});
