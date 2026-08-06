import { TimelineRecordEntity } from '../../../domain/timeline/entities/timeline-record.entity.js';
import { TimelineRecordResponseDto } from '../dto/timeline-record-response.dto.js';

export class TimelineRecordResponseMapper {
  public static toResponseDto(entity: TimelineRecordEntity): TimelineRecordResponseDto {
    return {
      id: entity.id.toString(),
      workspaceId: entity.workspaceId.toString(),
      userId: entity.userId.toString(),
      entityCategory: entity.entityCategory.getValue(),
      entityId: entity.entityId.toString(),
      action: entity.action.getValue(),
      timestamp: entity.timestamp.toISOString(),
      metadata: entity.metadata,
    };
  }
}
