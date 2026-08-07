import { describe, it, expect } from 'vitest';
import { RedisKeyStrategy } from '../key-strategy/redis-key.strategy.js';

describe('RedisKeyStrategy Unit Tests', () => {
  it('should generate standardized workspace cache key', () => {
    const key = RedisKeyStrategy.workspaceKey('ws-123');
    expect(key).toBe('lumora:workspace:ws-123');
  });

  it('should generate standardized object cache key', () => {
    const key = RedisKeyStrategy.objectKey('obj-456');
    expect(key).toBe('lumora:object:obj-456');
  });

  it('should generate standardized user cache key', () => {
    const key = RedisKeyStrategy.userKey('usr-789');
    expect(key).toBe('lumora:user:usr-789');
  });

  it('should generate standardized rate limit key', () => {
    const key = RedisKeyStrategy.rateLimitKey('127.0.0.1');
    expect(key).toBe('lumora:rate-limit:127.0.0.1');
  });

  it('should generate standardized token key', () => {
    const key = RedisKeyStrategy.tokenKey('usr-100');
    expect(key).toBe('lumora:token:usr-100');
  });
});
