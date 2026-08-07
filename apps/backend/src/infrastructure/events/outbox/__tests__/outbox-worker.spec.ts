import { describe, it, expect, vi } from 'vitest';
import { OutboxWorker } from '../outbox-worker.js';
import { OutboxMessage } from '../../../../domain/common/events/index.js';
import type { IOutboxRepository } from '../../../../domain/common/repositories/outbox.repository.interface.js';
import type { IBackgroundJobDispatcher } from '../../../../application/jobs/index.js';
import {
  UniqueEntityId,
  IDomainEventPublisher,
  UserEventName,
  ReminderEventName,
} from '@lumora/shared';

describe('OutboxWorker Engine', () => {
  it('should process pending outbox batch and mark as completed on success', async () => {
    const message = new OutboxMessage({
      eventId: new UniqueEntityId(),
      eventName: UserEventName.REGISTERED,
      aggregateId: new UniqueEntityId(),
      payload: { userId: 'usr-1' },
      schemaVersion: 1,
    });

    const mockRepo: IOutboxRepository = {
      save: vi.fn(),
      fetchPendingBatch: vi.fn().mockResolvedValue([message]),
      markAsCompleted: vi.fn().mockResolvedValue(undefined),
      markAsFailed: vi.fn().mockResolvedValue(undefined),
      releaseStaleLocks: vi.fn().mockResolvedValue(0),
    };

    const mockPublisher: IDomainEventPublisher = {
      publish: vi.fn().mockResolvedValue(undefined),
    };

    const worker = new OutboxWorker(mockRepo, mockPublisher, undefined, {
      batchSize: 10,
    });
    const processedCount = await worker.processBatch();

    expect(processedCount).toBe(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockPublisher.publish).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepo.markAsCompleted).toHaveBeenCalledWith(
      message.id,
      worker.workerId,
    );
  });

  it('should dispatch background reminder job through IBackgroundJobDispatcher without BullMQ coupling', async () => {
    const aggregateId = new UniqueEntityId();
    const workspaceId = new UniqueEntityId();
    const message = new OutboxMessage({
      eventId: new UniqueEntityId(),
      eventName: ReminderEventName.SCHEDULED,
      aggregateId,
      workspaceId,
      payload: { title: 'Water Plants' },
      schemaVersion: 1,
    });

    const mockRepo: IOutboxRepository = {
      save: vi.fn(),
      fetchPendingBatch: vi.fn().mockResolvedValue([message]),
      markAsCompleted: vi.fn().mockResolvedValue(undefined),
      markAsFailed: vi.fn().mockResolvedValue(undefined),
      releaseStaleLocks: vi.fn().mockResolvedValue(0),
    };

    const mockPublisher: IDomainEventPublisher = {
      publish: vi.fn().mockResolvedValue(undefined),
    };

    const mockJobDispatcher: IBackgroundJobDispatcher = {
      dispatchReminder: vi.fn().mockResolvedValue(undefined),
      dispatchNotification: vi.fn().mockResolvedValue(undefined),
      dispatchEmail: vi.fn().mockResolvedValue(undefined),
    };

    const worker = new OutboxWorker(mockRepo, mockPublisher, mockJobDispatcher);
    await worker.processBatch();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockJobDispatcher.dispatchReminder).toHaveBeenCalledWith(
      expect.objectContaining({
        reminderId: aggregateId.toValue(),
        workspaceId: workspaceId.toValue(),
        title: 'Water Plants',
      }),
    );
  });

  it('should calculate backoff and mark as failed on dispatch exception', async () => {
    const message = new OutboxMessage({
      eventId: new UniqueEntityId(),
      eventName: UserEventName.REGISTERED,
      aggregateId: new UniqueEntityId(),
      payload: { userId: 'usr-1' },
      schemaVersion: 1,
      retryCount: 1,
    });

    const mockRepo: IOutboxRepository = {
      save: vi.fn(),
      fetchPendingBatch: vi.fn().mockResolvedValue([message]),
      markAsCompleted: vi.fn().mockResolvedValue(undefined),
      markAsFailed: vi.fn().mockResolvedValue(undefined),
      releaseStaleLocks: vi.fn().mockResolvedValue(0),
    };

    const mockPublisher: IDomainEventPublisher = {
      publish: vi.fn().mockRejectedValue(new Error('Event bus unavailable')),
    };

    const worker = new OutboxWorker(mockRepo, mockPublisher);
    await worker.processBatch();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepo.markAsFailed).toHaveBeenCalledWith(
      message.id,
      worker.workerId,
      'Event bus unavailable',
      5,
      expect.any(String),
    );
  });
});
