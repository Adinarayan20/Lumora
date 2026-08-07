/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthService } from '../health.service.js';

describe('HealthService Unit Tests', () => {
  let service: HealthService;
  let mockPrismaService: any;
  let mockRedisClientProvider: any;
  let mockBullmqConnectionProvider: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockPrismaService = {
      $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    };

    mockRedisClientProvider = {
      getClient: vi.fn().mockReturnValue({
        ping: vi.fn().mockResolvedValue('PONG'),
      }),
    };

    mockBullmqConnectionProvider = {
      getConnectionOptions: vi.fn().mockReturnValue({
        host: 'localhost',
        port: 6379,
      }),
    };

    mockConfigService = {
      get: vi.fn().mockReturnValue('1.0.0'),
    };

    service = new HealthService(
      mockPrismaService,
      mockRedisClientProvider,
      mockBullmqConnectionProvider,
      mockConfigService,
    );
  });

  it('should return instant up status for liveness probe', () => {
    const result = service.checkLiveness();

    expect(result.status).toBe('up');
    expect(result.details.process.status).toBe('up');
    expect(result.version).toBe('1.0.0');
  });

  it('should return up status for startup probe after onModuleInit', () => {
    service.onModuleInit();
    const result = service.checkStartup();

    expect(result.status).toBe('up');
    expect(result.details.startup.status).toBe('up');
  });

  it('should return up status for readiness probe when PostgreSQL, Redis, and BullMQ pass', async () => {
    const result = await service.checkReadiness();

    expect(result.status).toBe('up');
    expect(result.details.postgres.status).toBe('up');
    expect(result.details.redis.status).toBe('up');
    expect(result.details.bullmq.status).toBe('up');
    expect(result.details.config.status).toBe('up');
  });

  it('should return down status for readiness probe when PostgreSQL query fails', async () => {
    mockPrismaService.$queryRaw.mockRejectedValue(
      new Error('DB connection refused'),
    );

    const result = await service.checkReadiness();

    expect(result.status).toBe('down');
    expect(result.details.postgres.status).toBe('down');
    expect(result.details.postgres.error).toBe('DB connection refused');
    expect(result.details.redis.status).toBe('up');
  });
});
