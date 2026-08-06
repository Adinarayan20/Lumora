import { IsEnum, IsOptional } from 'class-validator';
import { NotificationChannel, NotificationStatus } from '../../../domain/notifications/value-objects/notification-enums.js';

export class ListNotificationsFilterDto {
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;
}
