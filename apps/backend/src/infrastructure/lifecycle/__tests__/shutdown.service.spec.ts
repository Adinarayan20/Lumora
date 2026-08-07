/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GracefulShutdownService } from '../shutdown.service.js';

describe('GracefulShutdownService Unit Tests', () => {
  let service: GracefulShutdownService;
  let mockConfigService: any;
  let mockPrismaService: any;
  let mockRedisClientProvider: any;
  let mockTracingProvider: any;
  let mockOutboxWorker: any;
  let mockJobDispatcher: any;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn().mockReturnValue(5000),
    };

    mockPrismaService = {
      onModuleDestroy: vi.fn().mockResolvedValue(undefined),
    };

    mockRedisClientProvider = {
      onModuleDestroy: vi.fn().mockResolvedValue(undefined),
    };

    mockTracingProvider = {
      onModuleDestroy: vi.fn().mockResolvedValue(undefined),
    };

    mockOutboxWorker = {
      stop: vi.fn(),
    };

    mockJobDispatcher = {
      onModuleDestroy: vi.fn().mockResolvedValue(undefined),
    };

    service = new GracefulShutdownService(
      mockConfigService,
      mockPrismaService,
      mockRedisClientProvider,
      mockTracingProvider,
      mockOutboxWorker,
      mockJobDispatcher,
    );
  });

  it('should execute shutdown steps in deterministic order upon receiving SIGTERM', async () => {
    const callOrder: string[] = [];

    mockOutboxWorker.stop.mockImplementation(() => {
      callOrder.push('outbox');
    });
    mockJobDispatcher.onModuleDestroy.mockImplementation(() => {
      callOrder.push('bullmq');
      return Promise.resolve();
    });
    mockRedisClientProvider.onModuleDestroy.mockImplementation(() => {
      callOrder.push('redis');
      return Promise.resolve();
    });
    mockPrismaService.onModuleDestroy.mockImplementation(() => {
      callOrder.push('prisma');
      return Promise.resolve();
    });
    mockTracingProvider.onModuleDestroy.mockImplementation(() => {
      callOrder.push('tracing');
      return Promise.resolve();
    });

    await service.beforeApplicationShutdown('SIGTERM');

    expect(callOrder).toEqual([
      'outbox',
      'bullmq',
      'redis',
      'prisma',
      'tracing',
    ]);
  });

  it('should continue executing shutdown steps gracefully even if a step throws an error', async () => {
    mockRedisClientProvider.onModuleDestroy.mockRejectedValue(
      new Error('Redis connection lost during shutdown'),
    );

    await expect(
      service.beforeApplicationShutdown('SIGINT'),
    ).resolves.not.toThrow();

    expect(mockPrismaService.onModuleDestroy).toHaveBeenCalled();
    expect(mockTracingProvider.onModuleDestroy).toHaveBeenCalled();
  });
});
