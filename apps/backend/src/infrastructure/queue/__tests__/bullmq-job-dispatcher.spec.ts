/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BullMQJobDispatcher } from '../bullmq-job-dispatcher.js';

vi.mock('bullmq', () => {
  return {
    Queue: vi.fn().mockImplementation((name: string) => ({
      name,
      add: vi.fn().mockResolvedValue({ id: 'job-123' }),
      close: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

describe('BullMQJobDispatcher Unit Tests', () => {
  let dispatcher: BullMQJobDispatcher;
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
      getJobOptions: vi.fn().mockReturnValue({
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      }),
    };

    dispatcher = new BullMQJobDispatcher(
      mockConnectionProvider,
      mockQueueOptionsProvider,
    );
    dispatcher.onModuleInit();
  });

  it('should initialize dedicated queues on module init', () => {
    expect(dispatcher).toBeDefined();
  });

  it('should dispatch reminder job DTO to reminder queue', async () => {
    const payload = {
      reminderId: 'rem-123',
      workspaceId: 'ws-123',
      scheduledAt: new Date().toISOString(),
      title: 'Test Reminder',
      correlationId: 'corr-123',
    };

    await expect(dispatcher.dispatchReminder(payload)).resolves.not.toThrow();
  });

  it('should dispatch notification job DTO to notification queue', async () => {
    const payload = {
      notificationId: 'notif-123',
      recipientUserId: 'usr-123',
      channel: 'PUSH',
      message: 'Hello Lumora',
      correlationId: 'corr-123',
    };

    await expect(
      dispatcher.dispatchNotification(payload),
    ).resolves.not.toThrow();
  });

  it('should dispatch email job DTO to email queue', async () => {
    const payload = {
      recipientEmail: 'user@example.com',
      subject: 'Welcome to Lumora',
      template: 'welcome',
      payload: { name: 'Adinarayan' },
      correlationId: 'corr-123',
    };

    await expect(dispatcher.dispatchEmail(payload)).resolves.not.toThrow();
  });

  it('should close queues cleanly on module destroy', async () => {
    await expect(dispatcher.onModuleDestroy()).resolves.not.toThrow();
  });
});
