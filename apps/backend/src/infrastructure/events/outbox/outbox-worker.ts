import { Injectable, Logger } from '@nestjs/common';
import {
  IDomainEventPublisher,
  UniqueEntityId,
  createDomainEvent,
} from '@lumora/shared';
import { IOutboxRepository } from '../../../domain/common/repositories/outbox.repository.interface.js';
import {
  OutboxMessage,
  OUTBOX_DEFAULTS,
} from '../../../domain/common/events/index.js';

export interface OutboxWorkerConfig {
  readonly pollIntervalMs?: number | undefined;
  readonly batchSize?: number | undefined;
  readonly maxRetries?: number | undefined;
  readonly staleLockThresholdMs?: number | undefined;
}

/**
 * Background polling worker executing outbox event dispatching and backoff retries.
 * Designed for horizontal scaling across multiple background server nodes using UniqueEntityId worker IDs.
 */
@Injectable()
export class OutboxWorker {
  private readonly logger = new Logger(OutboxWorker.name);
  public readonly workerId: string;
  private isRunning: boolean = false;
  private pollTimer?: NodeJS.Timeout | undefined;
  private readonly pollIntervalMs: number;
  private readonly batchSize: number;
  private readonly maxRetries: number;
  private readonly staleLockThresholdMs: number;

  constructor(
    private readonly outboxRepository: IOutboxRepository,
    private readonly eventPublisher: IDomainEventPublisher,
    config?: OutboxWorkerConfig,
  ) {
    this.workerId = `worker-${new UniqueEntityId().toValue()}`;
    this.pollIntervalMs =
      config?.pollIntervalMs ?? OUTBOX_DEFAULTS.DEFAULT_POLL_INTERVAL_MS;
    this.batchSize = config?.batchSize ?? OUTBOX_DEFAULTS.DEFAULT_BATCH_SIZE;
    this.maxRetries = config?.maxRetries ?? OUTBOX_DEFAULTS.DEFAULT_MAX_RETRIES;
    this.staleLockThresholdMs =
      config?.staleLockThresholdMs ??
      OUTBOX_DEFAULTS.DEFAULT_STALE_LOCK_THRESHOLD_MS;
  }

  /**
   * Starts the background outbox polling process.
   */
  public start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.logger.log(`OutboxWorker [${this.workerId}] started.`);

    this.scheduleNextPoll();
  }

  /**
   * Stops the background outbox polling process gracefully.
   */
  public stop(): void {
    this.isRunning = false;
    if (this.pollTimer !== undefined) {
      clearTimeout(this.pollTimer);
      this.pollTimer = undefined;
    }
    this.logger.log(`OutboxWorker [${this.workerId}] stopped.`);
  }

  /**
   * Executes a single polling cycle: releases stale locks, fetches pending batch, and dispatches.
   */
  public async processBatch(): Promise<number> {
    try {
      // Release stale locks held by crashed workers
      await this.outboxRepository.releaseStaleLocks(this.staleLockThresholdMs);

      // Claim non-overlapping batch using SKIP LOCKED
      const batch = await this.outboxRepository.fetchPendingBatch(
        this.batchSize,
        this.workerId,
      );

      if (batch.length === 0) {
        return 0;
      }

      for (const message of batch) {
        await this.dispatchMessage(message);
      }

      return batch.length;
    } catch (error) {
      this.logger.error(
        `OutboxWorker [${this.workerId}] batch processing error`,
        error instanceof Error ? error.stack : String(error),
      );
      return 0;
    }
  }

  private async dispatchMessage(message: OutboxMessage): Promise<void> {
    try {
      const eventContract = createDomainEvent({
        eventId: message.eventId,
        eventName: message.eventName,
        aggregateId: message.aggregateId,
        workspaceId: message.workspaceId,
        occurredAt: message.createdAt,
        schemaVersion: message.schemaVersion,
        payload: message.payload,
      });

      await this.eventPublisher.publish([eventContract]);
      await this.outboxRepository.markAsCompleted(message.id, this.workerId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const nextRetryCount = message.retryCount + 1;

      // Exponential backoff: 2^retryCount * 1000ms
      const backoffMs = Math.pow(2, nextRetryCount) * 1000;
      const nextRetryAt = new Date(Date.now() + backoffMs).toISOString();

      await this.outboxRepository.markAsFailed(
        message.id,
        this.workerId,
        errorMessage,
        this.maxRetries,
        nextRetryAt,
      );
    }
  }

  private scheduleNextPoll(): void {
    if (!this.isRunning) {
      return;
    }

    this.pollTimer = setTimeout(() => {
      void this.processBatch().then(() => {
        this.scheduleNextPoll();
      });
    }, this.pollIntervalMs);
  }
}
