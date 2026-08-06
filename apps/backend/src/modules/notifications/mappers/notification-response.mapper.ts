import { NotificationAggregate } from '../../../domain/notifications/notification.aggregate.js';
import { NotificationResponseDto } from '../dto/notification-response.dto.js';

export class NotificationResponseMapper {
  public static toResponseDto(
    aggregate: NotificationAggregate,
  ): NotificationResponseDto {
    return {
      id: aggregate.id.toString(),
      workspaceId: aggregate.workspaceId.toString(),
      userId: aggregate.userId.toString(),
      reminderId: aggregate.reminderId
        ? aggregate.reminderId.toString()
        : undefined,
      title: aggregate.title.getValue(),
      body: aggregate.body.getValue(),
      type: aggregate.type,
      channel: aggregate.channel,
      status: aggregate.status,
      scheduledFor: aggregate.scheduledFor.toISOString(),
      deliveredAt: aggregate.deliveredAt
        ? aggregate.deliveredAt.toISOString()
        : undefined,
      readAt: aggregate.readAt ? aggregate.readAt.toISOString() : undefined,
      createdAt: aggregate.createdAt.toISOString(),
      updatedAt: aggregate.updatedAt.toISOString(),
    };
  }
}
