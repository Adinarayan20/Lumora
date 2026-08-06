import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '@lumora/shared';
import { IOutboxRepository } from '../../../domain/common/repositories/outbox.repository.interface.js';
import { PrismaBaseRepository } from '../../prisma/repositories/prisma-base.repository.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OutboxMessage } from './outbox-message.entity.js';
import { OutboxStatus } from './outbox-status.js';

@Injectable()
export class PrismaOutboxRepository
  extends PrismaBaseRepository<OutboxMessage, UniqueEntityId, any>
  implements IOutboxRepository {
  constructor(private readonly prisma: PrismaService) {
    super('OutboxMessage');
  }

  public async findById(id: UniqueEntityId): Promise<OutboxMessage | null> {
    return this.executeSafely(async () => {
      const raw = await this.prisma.client.event.findUnique({
        where: { id: id.toValue() },
      });
      return raw ? this.toDomain(raw) : null;
    });
  }

  public async save(message: OutboxMessage, transactionContext?: unknown): Promise<void> {
    return this.executeSafely(async () => {
      const client = (transactionContext as any) ?? this.prisma.client;
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
      const lockedRows = await this.prisma.$transaction(async (tx: any) => {
        const rows: any[] = await tx.$queryRaw`
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

      return lockedRows.map((row: any) => this.toDomain(row));
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
    nextRetryAt?: string | undefined,
  ): Promise<void> {
    return this.executeSafely(async () => {
      const current = await this.prisma.client.event.findUnique({
        where: { id: id.toValue() },
      });

      if (!current) {
        return;
      }

      const nextRetryCount = current.retryCount + 1;
      const isFailedPermanently = nextRetryCount >= 5;

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

  protected toDomain(model: any): OutboxMessage {
    const rawPayload = typeof model.payload === 'string'
      ? JSON.parse(model.payload)
      : (model.payload as Record<string, unknown>);

    return new OutboxMessage({
      id: new UniqueEntityId(model.id),
      eventId: new UniqueEntityId(model.id),
      eventName: model.name,
      aggregateId: new UniqueEntityId(model.aggregateId),
      workspaceId: model.workspaceId ? new UniqueEntityId(model.workspaceId) : undefined,
      payload: rawPayload,
      schemaVersion: model.schemaVersion ?? 1,
      status: model.status as OutboxStatus,
      retryCount: model.retryCount ?? 0,
      maxRetries: 5,
      lastError: model.lastError ?? undefined,
      lockOwnerId: model.lockOwnerId ?? undefined,
      lockedAt: model.lockedAt ? model.lockedAt.toISOString() : undefined,
      scheduledAt: model.scheduledAt ? model.scheduledAt.toISOString() : undefined,
      processedAt: model.processedAt ? model.processedAt.toISOString() : undefined,
      createdAt: model.createdAt ? model.createdAt.toISOString() : undefined,
    });
  }

  protected toPersistence(entity: OutboxMessage): Record<string, any> {
    return {
      id: entity.id.toValue(),
      name: entity.eventName,
      aggregateId: entity.aggregateId.toValue(),
      workspaceId: entity.workspaceId?.toValue() ?? null,
      payload: entity.payload,
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
}
