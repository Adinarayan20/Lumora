/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { RateLimitExceededException } from '@lumora/shared';
import { RedisRateLimiterGuard } from '../redis-rate-limiter.guard.js';

describe('RedisRateLimiterGuard Unit Tests', () => {
  let guard: RedisRateLimiterGuard;
  let mockReflector: any;
  let mockRateLimitStore: any;
  let mockExecutionContext: any;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: vi.fn().mockReturnValue({ limit: 5, ttlSeconds: 60 }),
    };

    mockRateLimitStore = {
      increment: vi.fn(),
    };

    mockRequest = {
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      user: { id: 'usr-123' },
    };

    mockResponse = {
      setHeader: vi.fn(),
    };

    mockExecutionContext = {
      getHandler: vi.fn().mockReturnValue({ name: 'testHandler' }),
      getClass: vi.fn().mockReturnValue({ name: 'TestController' }),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    };

    guard = new RedisRateLimiterGuard(mockReflector, mockRateLimitStore);
  });

  it('should allow request and set rate limit response headers when below threshold', async () => {
    mockRateLimitStore.increment.mockResolvedValue({
      totalHits: 2,
      resetTimeMs: Date.now() + 60000,
    });

    const result = await guard.canActivate(
      mockExecutionContext as ExecutionContext,
    );

    expect(result).toBe(true);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'X-RateLimit-Limit',
      '5',
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'X-RateLimit-Remaining',
      '3',
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'X-RateLimit-Reset',
      expect.any(String),
    );
  });

  it('should throw RateLimitExceededException and set Retry-After header when threshold exceeded', async () => {
    mockRateLimitStore.increment.mockResolvedValue({
      totalHits: 6,
      resetTimeMs: Date.now() + 30000,
    });

    await expect(
      guard.canActivate(mockExecutionContext as ExecutionContext),
    ).rejects.toThrow(RateLimitExceededException);

    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Retry-After',
      expect.any(String),
    );
  });
});
