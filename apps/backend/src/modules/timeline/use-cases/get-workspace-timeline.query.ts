import { Inject, Injectable } from '@nestjs/common';
import { Result, UniqueEntityId, ApplicationException } from '@lumora/shared';
import type { ITimelineRepository } from '../../../domain/timeline/repositories/timeline.repository.interface.js';
import { TIMELINE_REPOSITORY_TOKEN } from '../timeline.tokens.js';
import { TimelineRecordResponseDto } from '../dto/timeline-record-response.dto.js';
import { TimelineRecordResponseMapper } from '../mappers/timeline-record-response.mapper.js';

export interface GetWorkspaceTimelineQueryInput {
  workspaceId: string;
  userId?: string;
  /** Filter records for a specific object (e.g. Object Detail timeline view) */
  objectId?: string;
  limit?: number;
}

@Injectable()
export class GetWorkspaceTimelineQuery {
  constructor(
    @Inject(TIMELINE_REPOSITORY_TOKEN)
    private readonly timelineRepository: ITimelineRepository,
  ) {}

  public async execute(
    input: GetWorkspaceTimelineQueryInput,
  ): Promise<Result<TimelineRecordResponseDto[], ApplicationException>> {
    try {
      const { workspaceId, userId, objectId, limit = 50 } = input;
      const wsId = new UniqueEntityId(workspaceId);

      let records;

      if (objectId) {
        // Object-level timeline filter — for Object Detail view
        records = await this.timelineRepository.findObjectTimeline(
          wsId,
          new UniqueEntityId(objectId),
          limit,
        );
      } else if (userId) {
        records = await this.timelineRepository.findUserTimeline(
          wsId,
          new UniqueEntityId(userId),
          limit,
        );
      } else {
        records = await this.timelineRepository.findWorkspaceTimeline(wsId, limit);
      }

      return Result.ok(records.map((r) => TimelineRecordResponseMapper.toResponseDto(r)));
    } catch (error) {
      if (error instanceof ApplicationException) return Result.fail(error);
      throw error;
    }
  }
}
