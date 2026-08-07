/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReminderQueueProcessor } from '../processors/reminder-queue.processor.js';
import { NotificationQueueProcessor } from '../processors/notification-queue.processor.js';
import { EmailQueueProcessor } from '../processors/email-queue.processor.js';

vi.mock('bullmq', () => {
  return {
    Worker: vi.fn().mockImplementation((name: string) => ({
      name,
      on: vi.fn(),
      close: vi.fn().mockResolvedValue(undefined),
    })),
    QueueEvents: vi.fn().mockImplementation((name: string) => ({
      name,
      on: vi.fn(),
      close: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

describe('Queue Processors Unit Tests', () => {
  let mockConnectionProvider: any;
  let mockQueueOptionsProvider: any;

  beforeEach(() => {
    mockConnectionProvider = {
      getConnectionOptions: vi.fn().mockReturnValue({
        host: 'localhost',
        port: 6379,
      }),
    };
    mockQueueOptionsProvider = {
      concurrency: 5,
    };
  });

  it('should initialize and destroy ReminderQueueProcessor worker cleanly', async () => {
    const processor = new ReminderQueueProcessor(
      mockConnectionProvider,
      mockQueueOptionsProvider,
    );

    processor.onModuleInit();
    await expect(processor.onModuleDestroy()).resolves.not.toThrow();
  });

  it('should initialize and destroy NotificationQueueProcessor worker cleanly', async () => {
    const processor = new NotificationQueueProcessor(
      mockConnectionProvider,
      mockQueueOptionsProvider,
    );

    processor.onModuleInit();
    await expect(processor.onModuleDestroy()).resolves.not.toThrow();
  });

  it('should initialize and destroy EmailQueueProcessor worker cleanly', async () => {
    const processor = new EmailQueueProcessor(
      mockConnectionProvider,
      mockQueueOptionsProvider,
    );

    processor.onModuleInit();
    await expect(processor.onModuleDestroy()).resolves.not.toThrow();
  });
});
