/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import {
  UniqueEntityId,
  SystemException,
  DomainEventName,
} from '@lumora/shared';
import { IOutboxRepository } from '../../../domain/common/repositories/outbox.repository.interface.js';
import {
  OutboxMessage,
  OutboxStatus,
  OUTBOX_DEFAULTS,
} from '../../../domain/common/events/index.js';
import { PrismaBaseRepository } from '../../prisma/repositories/prisma-base.repository.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Prisma } from '../../../generated/prisma/client.js';

export interface EventPersistenceModel {
  id: string;
  userId: string;
  type: string;
  payload: Prisma.JsonValue;
  status: string;
  createdAt: Date;
  processedAt: Date | null;
}

@Injectable()
export class PrismaOutboxRepository
  extends PrismaBaseRepository<
    OutboxMessage,
    UniqueEntityId,
    EventPersistenceModel
  >
  implements IOutboxRepository
{
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

  public async save(
    message: OutboxMessage,
    transactionContext?: unknown,
  ): Promise<void> {
    return this.executeSafely(async () => {
      const client = this.resolveClient(transactionContext);
      const persistenceData = this.toPersistence(message);

      await client.event.upsert({
        where: { id: message.id.toValue() },
        create: persistenceData,
        update: {
          status: message.status as any,
          type: message.eventName,
          payload: message.payload as Prisma.InputJsonValue,
          processedAt: message.processedAt
            ? new Date(message.processedAt)
            : null,
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
    void lockOwnerId;
    return this.executeSafely(async () => {
      // Atomically select and lock pending records using PostgreSQL FOR UPDATE SKIP LOCKED
      const lockedRows = await this.prisma.$transaction(async (tx) => {
        const rows = await tx.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Event"
          WHERE status = 'PENDING'
          ORDER BY "createdAt" ASC
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
            status: OutboxStatus.PROCESSING as any,
          },
        });

        return tx.event.findMany({
          where: { id: { in: ids } },
        });
      });

      return lockedRows.map((row) =>
        this.toDomain(row as unknown as EventPersistenceModel),
      );
    });
  }

  public async markAsCompleted(
    id: UniqueEntityId,
    lockOwnerId: string,
  ): Promise<void> {
    void lockOwnerId;
    return this.executeSafely(async () => {
      const now = new Date();
      await this.prisma.client.event.updateMany({
        where: {
          id: id.toValue(),
        },
        data: {
          status: OutboxStatus.COMPLETED as any,
          processedAt: now,
        },
      });
    });
  }

  public async markAsFailed(
    id: UniqueEntityId,
    lockOwnerId: string,
    error: string,
    maxRetries?: number,
    nextRetryAt?: string,
  ): Promise<void> {
    void lockOwnerId;
    void error;
    void maxRetries;
    void nextRetryAt;
    return this.executeSafely(async () => {
      await this.prisma.client.event.update({
        where: { id: id.toValue() },
        data: {
          status: OutboxStatus.FAILED as any,
        },
      });
    });
  }

  public async releaseStaleLocks(staleThresholdMs: number): Promise<number> {
    void staleThresholdMs;
    return this.executeSafely(async () => {
      const result = await this.prisma.client.event.updateMany({
        where: {
          status: OutboxStatus.PROCESSING as any,
        },
        data: {
          status: OutboxStatus.PENDING as any,
        },
      });

      return result.count;
    });
  }

  protected toDomain(model: EventPersistenceModel): OutboxMessage {
    let rawPayload: Record<string, unknown>;

    try {
      rawPayload =
        typeof model.payload === 'string'
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
      eventName: model.type as DomainEventName,
      aggregateId: new UniqueEntityId(model.userId),
      payload: rawPayload,
      schemaVersion: 1,
      status: model.status as OutboxStatus,
      retryCount: 0,
      maxRetries: OUTBOX_DEFAULTS.DEFAULT_MAX_RETRIES,
      processedAt: model.processedAt
        ? model.processedAt.toISOString()
        : undefined,
      createdAt: model.createdAt ? model.createdAt.toISOString() : undefined,
    });
  }

  protected toPersistence(entity: OutboxMessage): Record<string, unknown> {
    return {
      id: entity.id.toValue(),
      userId: entity.aggregateId.toValue(),
      type: entity.eventName,
      payload: entity.payload,
      status: entity.status,
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
