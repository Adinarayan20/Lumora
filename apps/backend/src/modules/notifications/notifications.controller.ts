import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DeliverNotificationUseCase } from './use-cases/deliver-notification.use-case.js';
import { MarkNotificationAsReadUseCase } from './use-cases/mark-notification-read.use-case.js';
import { ListUserNotificationsQuery } from './use-cases/list-notifications.query.js';
import { ListNotificationsFilterDto } from './dto/list-notifications-filter.dto.js';
import { NotificationChannel } from '../../domain/notifications/value-objects/notification-enums.js';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly deliverNotificationUseCase: DeliverNotificationUseCase,
    private readonly markAsReadUseCase: MarkNotificationAsReadUseCase,
    private readonly listUserNotificationsQuery: ListUserNotificationsQuery,
  ) {}

  /**
   * GET /notifications
   * Lists all notifications for the authenticated user in a given workspace.
   */
  @Get()
  async listNotifications(
    @CurrentUser('id') userId: string,
    @Query('workspaceId') workspaceId: string,
    @Query() filter: ListNotificationsFilterDto,
  ) {
    const result = await this.listUserNotificationsQuery.execute({
      workspaceId,
      userId,
      filter,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  /**
   * POST /notifications/:id/deliver
   * Marks a notification as delivered on a given channel (defaults to IN_APP).
   */
  @Post(':id/deliver')
  @HttpCode(HttpStatus.OK)
  async deliver(
    @Param('id') notificationId: string,
    @Body('channel') channel?: NotificationChannel,
  ) {
    const result = await this.deliverNotificationUseCase.execute({
      notificationId,
      channel,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  /**
   * POST /notifications/:id/read
   * Marks a notification as read. Only the owning user may mark it.
   */
  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('id') notificationId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.markAsReadUseCase.execute({
      notificationId,
      userId,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }
}
