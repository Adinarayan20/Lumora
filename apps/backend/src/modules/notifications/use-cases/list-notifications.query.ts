import { Inject, Injectable } from '@nestjs/common';
import { Result, UniqueEntityId } from '@lumora/shared';
import type { INotificationRepository } from '../../../domain/notifications/repositories/notification.repository.interface.js';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../notifications.tokens.js';
import { ListNotificationsFilterDto } from '../dto/list-notifications-filter.dto.js';
import { NotificationResponseDto } from '../dto/notification-response.dto.js';
import { NotificationResponseMapper } from '../mappers/notification-response.mapper.js';

export interface ListUserNotificationsQueryInput {
  workspaceId: string;
  userId: string;
  filter?: ListNotificationsFilterDto;
}

@Injectable()
export class ListUserNotificationsQuery {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  public async execute(
    input: ListUserNotificationsQueryInput,
  ): Promise<Result<NotificationResponseDto[], Error>> {
    try {
      const { workspaceId, userId, filter } = input;

      const aggregates = await this.notificationRepository.findUserNotifications(
        new UniqueEntityId(workspaceId),
        new UniqueEntityId(userId),
        filter
          ? {
              workspaceId: new UniqueEntityId(workspaceId),
              status: filter.status,
              channel: filter.channel,
            }
          : undefined,
      );

      const dtos = aggregates.map((a) => NotificationResponseMapper.toResponseDto(a));
      return Result.ok(dtos);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
