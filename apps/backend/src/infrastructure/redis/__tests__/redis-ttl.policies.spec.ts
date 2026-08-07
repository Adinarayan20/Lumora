/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RedisTtlPolicies } from '../ttl/redis-ttl.policies.js';

describe('RedisTtlPolicies Unit Tests', () => {
  let policies: RedisTtlPolicies;
  let mockConfigService: any;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn((key: string, defaultValue: number) => defaultValue),
    };
    policies = new RedisTtlPolicies(mockConfigService);
  });

  it('should define expected TTL default values for all domain entities', () => {
    expect(policies.objectCacheTtlSeconds).toBe(3600);
    expect(policies.workspaceCacheTtlSeconds).toBe(7200);
    expect(policies.userCacheTtlSeconds).toBe(86400);
    expect(policies.defaultRateLimitTtlSeconds).toBe(60);
    expect(policies.refreshTokenTtlSeconds).toBe(604800);
  });

  it('should override TTL values from environment configuration via ConfigService', () => {
    mockConfigService.get.mockImplementation(
      (key: string, defaultValue: number) => {
        if (key === 'OBJECT_CACHE_TTL_SECONDS') return 1800;
        return defaultValue;
      },
    );

    expect(policies.objectCacheTtlSeconds).toBe(1800);
  });
});
