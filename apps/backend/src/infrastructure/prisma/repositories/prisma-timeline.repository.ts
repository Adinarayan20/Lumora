import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '@lumora/shared';
import {
  Prisma,
  Timeline as PrismaTimeline,
} from '../../../generated/prisma/client.js';
import { PrismaService } from '../prisma.service.js';
import { PrismaExceptionMapper } from '../mappers/prisma-exception.mapper.js';
import type { ITimelineRepository } from '../../../domain/timeline/repositories/timeline.repository.interface.js';
import { TimelineRecordEntity } from '../../../domain/timeline/entities/timeline-record.entity.js';
import { TimelineAction } from '../../../domain/timeline/value-objects/timeline-action.js';
import { TimelineCategory } from '../../../domain/timeline/value-objects/timeline-category.js';

@Injectable()
export class PrismaTimelineRepository implements ITimelineRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Appends an immutable timeline ledger record to persistence.
   * Uses append-only create semantics to enforce strict ledger audit trail integrity.
   */
  public async save(record: TimelineRecordEntity): Promise<void> {
    try {
      const data = this.toPersistence(record);

      await this.prisma.timeline.create({
        data: data as Prisma.TimelineUncheckedCreateInput,
      });
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async findWorkspaceTimeline(
    _workspaceId: UniqueEntityId,
    limit = 50,
  ): Promise<TimelineRecordEntity[]> {
    try {
      const records = await this.prisma.timeline.findMany({
        take: limit,
        orderBy: { startedAt: 'desc' },
      });

      return records.map((r) => this.toDomain(r));
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async findUserTimeline(
    _workspaceId: UniqueEntityId,
    _userId: UniqueEntityId,
    limit = 50,
  ): Promise<TimelineRecordEntity[]> {
    try {
      const records = await this.prisma.timeline.findMany({
        take: limit,
        orderBy: { startedAt: 'desc' },
      });

      return records.map((r) => this.toDomain(r));
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  /**
   * Explicit mapping converting database Timeline model to TimelineRecordEntity domain object.
   *
   * WARNING / ARCHITECTURAL LIMITATION NOTICE (TD-014):
   * Current Prisma Timeline schema model persists id, objectId, startedAt, endedAt, timezone.
   * Workspace and user audit association (workspaceId, userId, action, metadata) are synthesized
   * as temporary placeholders in this legacy adapter.
   * THIS ADAPTER IS TEMPORARY: Full audit properties will be rehydrated from dedicated columns
   * added in schema migration v2 (TD-014).
   */
  public toDomain(model: PrismaTimeline): TimelineRecordEntity {
    return TimelineRecordEntity.reconstitute({
      id: new UniqueEntityId(model.id),
      workspaceId: new UniqueEntityId(),
      userId: new UniqueEntityId(),
      entityCategory: TimelineCategory.create('OBJECT'),
      entityId: new UniqueEntityId(model.objectId),
      action: TimelineAction.create('TIMELINE_STARTED'),
      timestamp: model.startedAt,
      metadata: undefined,
    });
  }

  /**
   * Explicit mapping converting TimelineRecordEntity domain object to database persistence payload.
   */
  public toPersistence(entity: TimelineRecordEntity): Record<string, unknown> {
    return {
      id: entity.id.toString(),
      objectId: entity.entityId.toString(),
      startedAt: entity.timestamp,
      endedAt: null,
      timezone: 'UTC',
    };
  }
}
