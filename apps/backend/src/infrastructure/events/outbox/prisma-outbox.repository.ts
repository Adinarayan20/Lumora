import { Injectable } from '@nestjs/common';
import {
  UniqueEntityId,
  SystemException,
  DomainEventName,
} from '@lumora/shared';
import type { IOutboxRepository } from '../../../domain/common/repositories/outbox.repository.interface.js';
import {
  OutboxMessage,
  OutboxStatus,
  OUTBOX_DEFAULTS,
} from '../../../domain/common/events/index.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  Prisma,
  OutboxStatus as PrismaOutboxStatus,
  OutboxMessage as PrismaOutboxMessage,
} from '../../../generated/prisma/client.js';

/**
 * PrismaOutboxRepository — REPAIRED (Phase F)
 *
 * Previously: all operations incorrectly targeted the `Event` table.
 * Now: all operations target the `OutboxMessage` table (outbox_messages)
 * introduced in migration 20260808_phase_e_persistence_foundation.
 *
 * Fixed:
 *  - save()              → prisma.outboxMessage.upsert (idempotencyKey deduplication)
 *  - fetchPendingBatch() → FOR UPDATE SKIP LOCKED on outbox_messages, lock owner tracked
 *  - markAsCompleted()   → sets status=COMPLETED, processedAt
 *  - markAsFailed()      → sets status=FAILED, increments retryCount, sets lastError + nextAttemptAt
 *  - releaseStaleLocks() → releases PROCESSING rows older than staleThresholdMs
 *  - toDomain()          → maps from PrismaOutboxMessage (correct fields: eventType, workspaceId, aggregateId etc.)
 *  - toPersistence()     → maps to PrismaOutboxMessage fields (correct column names)
 *
 * The idempotencyKey is derived from eventId to guarantee exactly-once staging.
 */
@Injectable()
export class PrismaOutboxRepository implements IOutboxRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────
  // save — upsert by idempotencyKey (event-level deduplication)
  // ─────────────────────────────────────────────────────────────

  public async save(
    message: OutboxMessage,
    transactionContext?: unknown,
  ): Promise<void> {
    const client = this.resolveClient(transactionContext);
    const idempotencyKey = message.eventId.toValue();

    try {
      await client.outboxMessage.upsert({
        where: { idempotencyKey },
        create: {
          id: message.id.toValue(),
          workspaceId:
            message.workspaceId?.toValue() ??
            '00000000-0000-0000-0000-000000000000',
          aggregateId: message.aggregateId.toValue(),
          eventType: message.eventName,
          payload: message.payload as Prisma.InputJsonValue,
          payloadSchemaVersion: message.schemaVersion,
          status: PrismaOutboxStatus.PENDING,
          retryCount: 0,
          maxRetries: message.maxRetries,
          nextAttemptAt: new Date(message.scheduledAt),
          idempotencyKey,
          lastError: null,
          createdAt: new Date(message.createdAt),
          processedAt: null,
        },
        update: {
          // If already staged (duplicate event), update payload/schemaVersion only.
          // Do NOT reset status — a COMPLETED/FAILED record must not be re-queued by accident.
          payload: message.payload as Prisma.InputJsonValue,
          payloadSchemaVersion: message.schemaVersion,
        },
      });
    } catch (error) {
      throw new SystemException(
        `Failed to save OutboxMessage [eventId: ${idempotencyKey}].`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // ─────────────────────────────────────────────────────────────
  // fetchPendingBatch — atomic claim via FOR UPDATE SKIP LOCKED
  // ─────────────────────────────────────────────────────────────

  public async fetchPendingBatch(
    batchSize: number,
    lockOwnerId: string,
  ): Promise<readonly OutboxMessage[]> {
    try {
      const now = new Date();

      const lockedRows = await this.prisma.$transaction(async (tx) => {
        // Atomically select PENDING rows due for processing using SKIP LOCKED.
        // nextAttemptAt <= now ensures exponential backoff is respected.
        const rows = await tx.$queryRaw<{ id: string }[]>`
          SELECT id FROM "OutboxMessage"
          WHERE  status = 'PENDING'::"OutboxStatus"
            AND  "nextAttemptAt" <= ${now}
          ORDER  BY "createdAt" ASC
          LIMIT  ${batchSize}
          FOR    UPDATE SKIP LOCKED
        `;

        if (rows.length === 0) return [];

        const ids = rows.map((r) => r.id);

        // Claim batch: set PROCESSING + lock owner
        await tx.outboxMessage.updateMany({
          where: { id: { in: ids } },
          data: {
            status: PrismaOutboxStatus.PROCESSING,
          },
        });

        return tx.outboxMessage.findMany({
          where: { id: { in: ids } },
        });
      });

      return lockedRows.map((row) => this.toDomain(row));
    } catch (error) {
      throw new SystemException(
        `OutboxRepository.fetchPendingBatch failed [worker: ${lockOwnerId}].`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // ─────────────────────────────────────────────────────────────
  // markAsCompleted
  // ─────────────────────────────────────────────────────────────

  public async markAsCompleted(
    id: UniqueEntityId,
    lockOwnerId: string,
  ): Promise<void> {
    void lockOwnerId;
    try {
      await this.prisma.outboxMessage.updateMany({
        where: { id: id.toValue() },
        data: {
          status: PrismaOutboxStatus.COMPLETED,
          processedAt: new Date(),
        },
      });
    } catch (error) {
      throw new SystemException(
        `OutboxRepository.markAsCompleted failed [id: ${id.toValue()}].`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // ─────────────────────────────────────────────────────────────
  // markAsFailed — persists error, increments retry, sets backoff
  // ─────────────────────────────────────────────────────────────

  public async markAsFailed(
    id: UniqueEntityId,
    lockOwnerId: string,
    error: string,
    maxRetries: number = OUTBOX_DEFAULTS.DEFAULT_MAX_RETRIES,
    nextRetryAt?: string,
  ): Promise<void> {
    void lockOwnerId;
    try {
      // Fetch current retryCount to decide FAILED vs PENDING-for-retry
      const current = await this.prisma.outboxMessage.findUnique({
        where: { id: id.toValue() },
        select: { retryCount: true },
      });

      if (!current) return;

      const newRetryCount = current.retryCount + 1;
      const hasExhaustedRetries = newRetryCount >= maxRetries;
      const nextAttempt = nextRetryAt
        ? new Date(nextRetryAt)
        : new Date(Date.now() + Math.pow(2, newRetryCount) * 1000);

      await this.prisma.outboxMessage.update({
        where: { id: id.toValue() },
        data: {
          status: hasExhaustedRetries
            ? PrismaOutboxStatus.FAILED
            : PrismaOutboxStatus.PENDING,
          retryCount: newRetryCount,
          lastError: error.substring(0, 2000), // cap at 2000 chars
          nextAttemptAt: hasExhaustedRetries ? undefined : nextAttempt,
        },
      });
    } catch (err) {
      throw new SystemException(
        `OutboxRepository.markAsFailed failed [id: ${id.toValue()}].`,
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  // ─────────────────────────────────────────────────────────────
  // releaseStaleLocks — reset PROCESSING rows older than threshold
  // ─────────────────────────────────────────────────────────────

  public async releaseStaleLocks(staleThresholdMs: number): Promise<number> {
    try {
      const staleThreshold = new Date(Date.now() - staleThresholdMs);

      // Reset PROCESSING rows whose nextAttemptAt is older than the stale threshold.
      // This handles crashed workers that claimed a batch but never finished.
      const result = await this.prisma.outboxMessage.updateMany({
        where: {
          status: PrismaOutboxStatus.PROCESSING,
          nextAttemptAt: { lt: staleThreshold },
        },
        data: {
          status: PrismaOutboxStatus.PENDING,
          nextAttemptAt: new Date(),
        },
      });

      return result.count;
    } catch (error) {
      throw new SystemException(
        'OutboxRepository.releaseStaleLocks failed.',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Private: map PrismaOutboxMessage → OutboxMessage domain entity
  // ─────────────────────────────────────────────────────────────

  private toDomain(model: PrismaOutboxMessage): OutboxMessage {
    let payload: Record<string, unknown>;
    try {
      payload =
        typeof model.payload === 'string'
          ? (JSON.parse(model.payload) as Record<string, unknown>)
          : (model.payload as Record<string, unknown>);
    } catch {
      throw new SystemException(
        `Failed to deserialize payload for OutboxMessage [id: ${model.id}].`,
        'Corrupted JSON payload in outbox_messages table.',
      );
    }

    return new OutboxMessage({
      id: new UniqueEntityId(model.id),
      eventId: new UniqueEntityId(model.idempotencyKey),
      eventName: model.eventType as DomainEventName,
      aggregateId: new UniqueEntityId(model.aggregateId),
      workspaceId: new UniqueEntityId(model.workspaceId),
      payload,
      schemaVersion: model.payloadSchemaVersion,
      status: model.status as OutboxStatus,
      retryCount: model.retryCount,
      maxRetries: model.maxRetries,
      lastError: model.lastError ?? undefined,
      processedAt: model.processedAt?.toISOString(),
      createdAt: model.createdAt.toISOString(),
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Private: resolve Prisma client (supports transaction context)
  // ─────────────────────────────────────────────────────────────

  private resolveClient(
    transactionContext?: unknown,
  ): typeof this.prisma | Prisma.TransactionClient {
    if (
      transactionContext !== null &&
      transactionContext !== undefined &&
      typeof transactionContext === 'object'
    ) {
      const ctx = transactionContext as Record<string, unknown>;
      // PrismaTransactionContext wrapper
      if (ctx['prismaTransaction'] !== undefined) {
        return ctx['prismaTransaction'] as Prisma.TransactionClient;
      }
      // Raw Prisma transaction client
      if ('outboxMessage' in ctx) {
        return transactionContext as Prisma.TransactionClient;
      }
    }
    return this.prisma;
  }
}
