/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GracefulShutdownService } from '../shutdown.service.js';

describe('GracefulShutdownService Unit Tests', () => {
  let service: GracefulShutdownService;
  let mockConfigService: any;
  let mockPrismaService: any;
  let mockRedisClientProvider: any;
  let mockTracingProvider: any;
  let mockLogger: any;
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

    mockLogger = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
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
      mockLogger,
      mockOutboxWorker,
      mockJobDispatcher,
    );
  });

  it('should execute shutdown steps in deterministic order and emit structured log reports', async () => {
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
    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringContaining('GracefulShutdownReport'),
      'GracefulShutdownService',
    );
  });

  it('should continue executing shutdown steps gracefully without process.exit() if a step throws an error', async () => {
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as any);

    mockRedisClientProvider.onModuleDestroy.mockRejectedValue(
      new Error('Redis connection lost during shutdown'),
    );

    await expect(
      service.beforeApplicationShutdown('SIGINT'),
    ).resolves.not.toThrow();

    expect(mockPrismaService.onModuleDestroy).toHaveBeenCalled();
    expect(mockTracingProvider.onModuleDestroy).toHaveBeenCalled();
    expect(exitSpy).not.toHaveBeenCalled();

    exitSpy.mockRestore();
  });
});
