import type { UniqueEntityId } from '@lumora/shared';
import type { TimelineRecordEntity } from '../entities/timeline-record.entity.js';

export interface ITimelineRepository {
  save(record: TimelineRecordEntity): Promise<void>;

  findWorkspaceTimeline(
    workspaceId: UniqueEntityId,
    limit?: number,
  ): Promise<TimelineRecordEntity[]>;

  findUserTimeline(
    workspaceId: UniqueEntityId,
    userId: UniqueEntityId,
    limit?: number,
  ): Promise<TimelineRecordEntity[]>;

  /** Returns timeline records for a specific object. Workspace isolation enforced. */
  findObjectTimeline(
    workspaceId: UniqueEntityId,
    objectId: UniqueEntityId,
    limit?: number,
  ): Promise<TimelineRecordEntity[]>;
}
