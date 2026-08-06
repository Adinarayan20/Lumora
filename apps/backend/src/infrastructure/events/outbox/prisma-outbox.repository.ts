import { Injectable } from '@nestjs/common';
import { UniqueEntityId, SystemException } from '@lumora/shared';
import { IOutboxRepository } from '../../../domain/common/repositories/outbox.repository.interface.js';
import {
  OutboxMessage,
  OutboxStatus,
  OUTBOX_DEFAULTS,
} from '../../../domain/common/events/index.js';
import { PrismaBaseRepository } from '../../prisma/repositories/prisma-base.repository.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Prisma } from '../../../generated/prisma/index.js';

export interface EventPersistenceModel {
  id: string;
  name: string;
  aggregateId: string;
  workspaceId: string | null;
  payload: Prisma.JsonValue;
  schemaVersion: number;
  status: string;
  retryCount: number;
  lastError: string | null;
  lockOwnerId: string | null;
  lockedAt: Date | null;
  scheduledAt: Date;
  processedAt: Date | null;
  createdAt: Date;
}

@Injectable()
export class PrismaOutboxRepository
  extends PrismaBaseRepository<OutboxMessage, UniqueEntityId, EventPersistenceModel>
  implements IOutboxRepository {
  constructor(private readonly prisma: PrismaService) {
    super('OutboxMessage');
  }

  public async findById(id: UniqueEntityId): Promise<OutboxMessage | null> {
    return this.executeSafely(async () => {
      const raw = await this.prisma.client.event.findUnique({
        where: { id: id.toValue() },
      });
      return raw ? this.toDomain(raw as EventPersistenceModel) : null;
    });
  }

  public async save(message: OutboxMessage, transactionContext?: unknown): Promise<void> {
    return this.executeSafely(async () => {
      const client = this.resolveClient(transactionContext);
      const persistenceData = this.toPersistence(message);

      await client.event.upsert({
        where: { id: message.id.toValue() },
        create: persistenceData,
        update: {
          status: message.status,
          retryCount: message.retryCount,
          lastError: message.lastError,
          lockOwnerId: message.lockOwnerId,
          lockedAt: message.lockedAt ? new Date(message.lockedAt) : null,
          scheduledAt: new Date(message.scheduledAt),
          processedAt: message.processedAt ? new Date(message.processedAt) : null,
        },
      });
    });
  }

  public async delete(id: UniqueEntityId): Promise<void> {
    return this.executeSafely(async () => {
      await this.prisma.client.event.delete({
        where: { id: id.toValue() },
      });
    });
  }

  public async exists(id: UniqueEntityId): Promise<boolean> {
    return this.executeSafely(async () => {
      const count = await this.prisma.client.event.count({
        where: { id: id.toValue() },
      });
      return count > 0;
    });
  }

  public async fetchPendingBatch(
    batchSize: number,
    lockOwnerId: string,
  ): Promise<readonly OutboxMessage[]> {
    return this.executeSafely(async () => {
      const now = new Date();

      // Atomically select and lock pending records using PostgreSQL FOR UPDATE SKIP LOCKED
      const lockedRows = await this.prisma.$transaction(async (tx) => {
        const rows = await tx.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Event"
          WHERE status = 'PENDING' AND ("scheduledAt" <= ${now})
          ORDER BY "scheduledAt" ASC
          LIMIT ${batchSize}
          FOR UPDATE SKIP LOCKED
        `;

        if (rows.length === 0) {
          return [];
        }

        const ids = rows.map((r) => r.id);

        await tx.event.updateMany({
          where: { id: { in: ids } },
          data: {
            status: OutboxStatus.PROCESSING,
            lockOwnerId,
            lockedAt: now,
          },
        });

        return tx.event.findMany({
          where: { id: { in: ids } },
        });
      });

      return lockedRows.map((row) => this.toDomain(row as EventPersistenceModel));
    });
  }

  public async markAsCompleted(id: UniqueEntityId, lockOwnerId: string): Promise<void> {
    return this.executeSafely(async () => {
      const now = new Date();
      await this.prisma.client.event.updateMany({
        where: {
          id: id.toValue(),
          lockOwnerId,
        },
        data: {
          status: OutboxStatus.COMPLETED,
          lockOwnerId: null,
          lockedAt: null,
          processedAt: now,
        },
      });
    });
  }

  public async markAsFailed(
    id: UniqueEntityId,
    lockOwnerId: string,
    error: string,
    maxRetries?: number | undefined,
    nextRetryAt?: string | undefined,
  ): Promise<void> {
    return this.executeSafely(async () => {
      const current = await this.prisma.client.event.findUnique({
        where: { id: id.toValue() },
      });

      if (!current) {
        return;
      }

      const effectiveMaxRetries = maxRetries ?? OUTBOX_DEFAULTS.DEFAULT_MAX_RETRIES;
      const nextRetryCount = current.retryCount + 1;
      const isFailedPermanently = nextRetryCount >= effectiveMaxRetries;

      await this.prisma.client.event.update({
        where: { id: id.toValue() },
        data: {
          status: isFailedPermanently ? OutboxStatus.FAILED : OutboxStatus.PENDING,
          retryCount: nextRetryCount,
          lastError: error,
          lockOwnerId: null,
          lockedAt: null,
          scheduledAt: nextRetryAt ? new Date(nextRetryAt) : new Date(),
        },
      });
    });
  }

  public async releaseStaleLocks(staleThresholdMs: number): Promise<number> {
    return this.executeSafely(async () => {
      const thresholdDate = new Date(Date.now() - staleThresholdMs);

      const result = await this.prisma.client.event.updateMany({
        where: {
          status: OutboxStatus.PROCESSING,
          lockedAt: { lt: thresholdDate },
        },
        data: {
          status: OutboxStatus.PENDING,
          lockOwnerId: null,
          lockedAt: null,
        },
      });

      return result.count;
    });
  }

  protected toDomain(model: EventPersistenceModel): OutboxMessage {
    let rawPayload: Record<string, unknown>;

    try {
      rawPayload = typeof model.payload === 'string'
        ? (JSON.parse(model.payload) as Record<string, unknown>)
        : (model.payload as Record<string, unknown>);
    } catch (error) {
      throw new SystemException(
        `Failed to deserialize payload for OutboxMessage [ID: ${model.id}]. Corrupted JSON format.`,
        error instanceof Error ? error.message : String(error),
      );
    }

    return new OutboxMessage({
      id: new UniqueEntityId(model.id),
      eventId: new UniqueEntityId(model.id),
      eventName: model.name as any,
      aggregateId: new UniqueEntityId(model.aggregateId),
      workspaceId: model.workspaceId ? new UniqueEntityId(model.workspaceId) : undefined,
      payload: rawPayload,
      schemaVersion: model.schemaVersion ?? 1,
      status: model.status as OutboxStatus,
      retryCount: model.retryCount ?? 0,
      maxRetries: OUTBOX_DEFAULTS.DEFAULT_MAX_RETRIES,
      lastError: model.lastError ?? undefined,
      lockOwnerId: model.lockOwnerId ?? undefined,
      lockedAt: model.lockedAt ? model.lockedAt.toISOString() : undefined,
      scheduledAt: model.scheduledAt ? model.scheduledAt.toISOString() : undefined,
      processedAt: model.processedAt ? model.processedAt.toISOString() : undefined,
      createdAt: model.createdAt ? model.createdAt.toISOString() : undefined,
    });
  }

  protected toPersistence(entity: OutboxMessage): Record<string, unknown> {
    return {
      id: entity.id.toValue(),
      name: entity.eventName,
      aggregateId: entity.aggregateId.toValue(),
      workspaceId: entity.workspaceId?.toValue() ?? null,
      payload: entity.payload as Prisma.InputJsonValue,
      schemaVersion: entity.schemaVersion,
      status: entity.status,
      retryCount: entity.retryCount,
      lastError: entity.lastError ?? null,
      lockOwnerId: entity.lockOwnerId ?? null,
      lockedAt: entity.lockedAt ? new Date(entity.lockedAt) : null,
      scheduledAt: new Date(entity.scheduledAt),
      processedAt: entity.processedAt ? new Date(entity.processedAt) : null,
      createdAt: new Date(entity.createdAt),
    };
  }

  private resolveClient(transactionContext?: unknown) {
    if (
      transactionContext !== null &&
      typeof transactionContext === 'object' &&
      'event' in (transactionContext as Record<string, unknown>)
    ) {
      return transactionContext as { event: typeof this.prisma.client.event };
    }
    return this.prisma.client;
  }
}
