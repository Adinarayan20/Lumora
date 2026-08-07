import { describe, it, expect } from 'vitest';
import { RedisTtlPolicies } from '../ttl/redis-ttl.policies.js';

describe('RedisTtlPolicies Unit Tests', () => {
  it('should define expected TTL values for all domain entities', () => {
    expect(RedisTtlPolicies.OBJECT_CACHE_TTL_SECONDS).toBe(3600);
    expect(RedisTtlPolicies.WORKSPACE_CACHE_TTL_SECONDS).toBe(7200);
    expect(RedisTtlPolicies.USER_CACHE_TTL_SECONDS).toBe(86400);
    expect(RedisTtlPolicies.DEFAULT_RATE_LIMIT_TTL_SECONDS).toBe(60);
    expect(RedisTtlPolicies.REFRESH_TOKEN_TTL_SECONDS).toBe(604800);
  });
});
