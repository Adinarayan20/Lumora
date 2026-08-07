/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BullMQConnectionProvider } from '../bullmq-connection.provider.js';

describe('BullMQConnectionProvider Unit Tests', () => {
  let provider: BullMQConnectionProvider;
  let mockConfigService: any;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn().mockReturnValue('redis://localhost:6379'),
    };
    provider = new BullMQConnectionProvider(mockConfigService);
  });

  it('should parse valid REDIS_URL string into BullMQ connection options', () => {
    const conn = provider.getConnectionOptions();

    expect(conn.host).toBe('localhost');
    expect(conn.port).toBe(6379);
    expect(conn.maxRetriesPerRequest).toBeNull();
  });

  it('should throw error when REDIS_URL cannot be parsed as valid URL', () => {
    mockConfigService.get.mockReturnValue('invalid-redis-url-format');

    expect(() => provider.getConnectionOptions()).toThrow(
      'Invalid REDIS_URL configuration for BullMQ',
    );
  });
});
