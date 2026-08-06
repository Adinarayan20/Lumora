import { Inject, Injectable } from '@nestjs/common';
import {
  Result,
  UniqueEntityId,
  EntityNotFoundException,
  DomainValidationException,
} from '@lumora/shared';
import type { INotificationRepository } from '../../../domain/notifications/repositories/notification.repository.interface.js';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../notifications.tokens.js';
import { NotificationResponseDto } from '../dto/notification-response.dto.js';
import { NotificationResponseMapper } from '../mappers/notification-response.mapper.js';

export interface MarkNotificationAsReadCommand {
  notificationId: string;
  userId: string;
}

@Injectable()
export class MarkNotificationAsReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  public async execute(
    command: MarkNotificationAsReadCommand,
  ): Promise<Result<NotificationResponseDto, Error>> {
    try {
      const { notificationId, userId } = command;

      const aggregate = await this.notificationRepository.findById(
        new UniqueEntityId(notificationId),
      );

      if (!aggregate) {
        return Result.fail(
          new EntityNotFoundException('Notification', notificationId),
        );
      }

      if (aggregate.userId.toString() !== userId) {
        return Result.fail(
          new DomainValidationException(
            `User '${userId}' cannot access notification '${notificationId}'.`,
          ),
        );
      }

      aggregate.markAsRead();

      await this.notificationRepository.save(aggregate);

      const responseDto = NotificationResponseMapper.toResponseDto(aggregate);
      return Result.ok(responseDto);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
