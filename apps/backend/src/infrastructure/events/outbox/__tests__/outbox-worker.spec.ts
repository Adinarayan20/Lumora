import { describe, it, expect, vi } from 'vitest';
import { OutboxWorker } from '../outbox-worker.js';
import { OutboxMessage } from '../outbox-message.entity.js';
import { OutboxStatus } from '../outbox-status.js';
import type { IOutboxRepository } from '../../../../domain/common/repositories/outbox.repository.interface.js';
import { UniqueEntityId, IDomainEventPublisher, UserEventName } from '@lumora/shared';

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

    const worker = new OutboxWorker(mockRepo, mockPublisher, { batchSize: 10 });
    const processedCount = await worker.processBatch();

    expect(processedCount).toBe(1);
    expect(mockPublisher.publish).toHaveBeenCalled();
    expect(mockRepo.markAsCompleted).toHaveBeenCalledWith(message.id, worker.workerId);
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

    expect(mockRepo.markAsFailed).toHaveBeenCalledWith(
      message.id,
      worker.workerId,
      'Event bus unavailable',
      expect.any(String),
    );
  });
});
