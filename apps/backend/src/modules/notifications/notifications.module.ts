import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module.js';
import { PrismaNotificationRepository } from '../../infrastructure/prisma/repositories/prisma-notification.repository.js';
import { NotificationsService } from './notifications.service.js';
import { NotificationsController } from './notifications.controller.js';
import {
  DeliverNotificationUseCase,
  NOTIFICATION_REPOSITORY_TOKEN,
} from './use-cases/deliver-notification.use-case.js';
import { MarkNotificationAsReadUseCase } from './use-cases/mark-notification-read.use-case.js';
import { ListUserNotificationsQuery } from './use-cases/list-notifications.query.js';

@Module({
  imports: [PrismaModule],
  providers: [
    NotificationsService,
    {
      provide: NOTIFICATION_REPOSITORY_TOKEN,
      useClass: PrismaNotificationRepository,
    },
    DeliverNotificationUseCase,
    MarkNotificationAsReadUseCase,
    ListUserNotificationsQuery,
  ],
  controllers: [NotificationsController],
  exports: [
    DeliverNotificationUseCase,
    MarkNotificationAsReadUseCase,
    ListUserNotificationsQuery,
    NOTIFICATION_REPOSITORY_TOKEN,
  ],
})
export class NotificationsModule {}
