import type { UniqueEntityId } from '@lumora/shared';
import type { OutboxMessage } from '../events/outbox-message.entity.js';

/**
 * Domain repository contract interface for transactional outbox persistence.
 * Domain interfaces MUST NOT depend on infrastructure implementations.
 */
export interface IOutboxRepository {
  /**
   * Persists an outbox message entity (optionally within an active Prisma transaction context).
   */
  save(message: OutboxMessage, transactionContext?: unknown): Promise<void>;

  /**
   * Atomically claims a non-overlapping batch of pending outbox messages for worker processing.
   */
  fetchPendingBatch(batchSize: number, lockOwnerId: string): Promise<readonly OutboxMessage[]>;

  /**
   * Marks an outbox message as successfully dispatched.
   */
  markAsCompleted(id: UniqueEntityId, lockOwnerId: string): Promise<void>;

  /**
   * Marks an outbox message as failed and updates retry metadata / error logs using configured maxRetries limit.
   */
  markAsFailed(
    id: UniqueEntityId,
    lockOwnerId: string,
    error: string,
    maxRetries?: number | undefined,
    nextRetryAt?: string | undefined,
  ): Promise<void>;

  /**
   * Releases stale worker locks held longer than the threshold timeout.
   */
  releaseStaleLocks(staleThresholdMs: number): Promise<number>;
}
