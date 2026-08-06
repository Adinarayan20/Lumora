import { Inject, Injectable } from '@nestjs/common';
import { Result, UniqueEntityId } from '@lumora/shared';
import { TimelineRecordEntity } from '../../../domain/timeline/entities/timeline-record.entity.js';
import { TimelineRecordRecordedEvent } from '../../../domain/timeline/events/timeline.events.js';
import type { ITimelineRepository } from '../../../domain/timeline/repositories/timeline.repository.interface.js';
import { TIMELINE_REPOSITORY_TOKEN } from '../timeline.tokens.js';
import { RecordTimelineActivityDto } from '../dto/record-timeline-activity.dto.js';
import { TimelineRecordResponseDto } from '../dto/timeline-record-response.dto.js';
import { TimelineRecordResponseMapper } from '../mappers/timeline-record-response.mapper.js';

export interface RecordTimelineActivityCommand {
  dto: RecordTimelineActivityDto;
}

@Injectable()
export class RecordTimelineActivityUseCase {
  constructor(
    @Inject(TIMELINE_REPOSITORY_TOKEN)
    private readonly timelineRepository: ITimelineRepository,
  ) {}

  public async execute(
    command: RecordTimelineActivityCommand,
  ): Promise<Result<TimelineRecordResponseDto, Error>> {
    try {
      const { dto } = command;

      const record = TimelineRecordEntity.create({
        workspaceId: new UniqueEntityId(dto.workspaceId),
        userId: new UniqueEntityId(dto.userId),
        entityCategory: dto.entityCategory,
        entityId: new UniqueEntityId(dto.entityId),
        action: dto.action,
        metadata: dto.metadata,
      });

      const event = new TimelineRecordRecordedEvent(
        record.id,
        record.workspaceId,
        record.userId,
        record.entityCategory.getValue(),
        record.entityId,
        record.action.getValue(),
      );

      await this.timelineRepository.save(record);

      const responseDto = TimelineRecordResponseMapper.toResponseDto(record);
      return Result.ok(responseDto);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
