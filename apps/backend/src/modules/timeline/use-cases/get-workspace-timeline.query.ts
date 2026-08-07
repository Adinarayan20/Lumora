import { Inject, Injectable } from '@nestjs/common';
import { Result, UniqueEntityId, ApplicationException } from '@lumora/shared';
import type { ITimelineRepository } from '../../../domain/timeline/repositories/timeline.repository.interface.js';
import { TIMELINE_REPOSITORY_TOKEN } from '../timeline.tokens.js';
import { TimelineRecordResponseDto } from '../dto/timeline-record-response.dto.js';
import { TimelineRecordResponseMapper } from '../mappers/timeline-record-response.mapper.js';

export interface GetWorkspaceTimelineQueryInput {
  workspaceId: string;
  userId?: string;
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
      const { workspaceId, userId, limit = 50 } = input;
      const wsEntityId = new UniqueEntityId(workspaceId);

      let records: import('../../../domain/timeline/entities/timeline-record.entity.js').TimelineRecordEntity[];

      if (userId) {
        records = await this.timelineRepository.findUserTimeline(
          wsEntityId,
          new UniqueEntityId(userId),
          limit,
        );
      } else {
        records = await this.timelineRepository.findWorkspaceTimeline(
          wsEntityId,
          limit,
        );
      }

      const dtos = records.map((r) =>
        TimelineRecordResponseMapper.toResponseDto(r),
      );
      return Result.ok(dtos);
    } catch (error) {
      if (error instanceof ApplicationException) {
        return Result.fail(error);
      }
      throw error;
    }
  }
}
