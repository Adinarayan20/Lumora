import { Inject, Injectable } from '@nestjs/common';
import { Result, UniqueEntityId, EntityNotFoundException } from '@lumora/shared';
import { NotificationChannel, NotificationStatus } from '../../../domain/notifications/value-objects/notification-enums.js';
import { NotificationDeliveryAttempt } from '../../../domain/notifications/value-objects/notification-attempt.vo.js';
import type { INotificationRepository } from '../../../domain/notifications/repositories/notification.repository.interface.js';
import { NotificationResponseDto } from '../dto/notification-response.dto.js';
import { NotificationResponseMapper } from '../mappers/notification-response.mapper.js';

export const NOTIFICATION_REPOSITORY_TOKEN = 'INotificationRepository';

export interface DeliverNotificationCommand {
  notificationId: string;
  channel?: NotificationChannel;
}

@Injectable()
export class DeliverNotificationUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  public async execute(
    command: DeliverNotificationCommand,
  ): Promise<Result<NotificationResponseDto, Error>> {
    try {
      const { notificationId, channel = NotificationChannel.IN_APP } = command;

      const aggregate = await this.notificationRepository.findById(
        new UniqueEntityId(notificationId),
      );

      if (!aggregate) {
        return Result.fail(
          new EntityNotFoundException('Notification', notificationId),
        );
      }

      const startTime = Date.now();

      const attempt = NotificationDeliveryAttempt.create({
        notificationId: aggregate.id,
        channel,
        status: NotificationStatus.DELIVERED,
        durationMs: Date.now() - startTime,
      });

      aggregate.recordAttempt(attempt);
      aggregate.markAsDelivered(channel);

      await this.notificationRepository.save(aggregate);

      const responseDto = NotificationResponseMapper.toResponseDto(aggregate);
      return Result.ok(responseDto);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
