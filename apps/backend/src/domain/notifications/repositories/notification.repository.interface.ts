import type { UniqueEntityId } from '@lumora/shared';
import type { IPaginatedRepository } from '../../common/repositories/paginated.repository.interface.js';
import type { NotificationAggregate } from '../notification.aggregate.js';
import type {
  NotificationStatus,
  NotificationChannel,
} from '../value-objects/notification-enums.js';

export interface NotificationFilter extends Record<string, unknown> {
  workspaceId: UniqueEntityId;
  userId?: UniqueEntityId;
  status?: NotificationStatus;
  channel?: NotificationChannel;
}

export interface INotificationRepository extends IPaginatedRepository<
  NotificationAggregate,
  UniqueEntityId,
  NotificationFilter
> {
  findUserNotifications(
    workspaceId: UniqueEntityId,
    userId: UniqueEntityId,
    filter?: NotificationFilter,
  ): Promise<NotificationAggregate[]>;

  findPendingNotifications(limit?: number): Promise<NotificationAggregate[]>;
}
