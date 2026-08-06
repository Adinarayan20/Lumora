import { describe, it, expect, vi } from 'vitest';
import { IdGenerator, UniqueEntityId } from '@lumora/shared';
import { MarkNotificationAsReadUseCase } from '../mark-notification-read.use-case.js';
import { NotificationAggregate } from '../../../../domain/notifications/notification.aggregate.js';
import { NotificationChannel, NotificationStatus } from '../../../../domain/notifications/value-objects/notification-enums.js';
import type { INotificationRepository } from '../../../../domain/notifications/repositories/notification.repository.interface.js';

describe('MarkNotificationAsReadUseCase', () => {
  it('should mark notification as read for matching owner', async () => {
    const wsId = IdGenerator.generate();
    const userId = IdGenerator.generate();
    const notifId = IdGenerator.generate();

    const aggregate = NotificationAggregate.create({
      id: new UniqueEntityId(notifId),
      workspaceId: new UniqueEntityId(wsId),
      userId: new UniqueEntityId(userId),
      title: 'Alert',
      body: 'Body text',
      scheduledFor: new Date(),
    });
    aggregate.markAsDelivered(NotificationChannel.IN_APP);

    const mockRepo: INotificationRepository = {
      findById: vi.fn().mockResolvedValue(aggregate),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
      findPaginated: vi.fn(),
      findUserNotifications: vi.fn(),
      findPendingNotifications: vi.fn(),
    };

    const useCase = new MarkNotificationAsReadUseCase(mockRepo);
    const result = await useCase.execute({
      notificationId: notifId,
      userId: userId,
    });

    expect(result.isSuccess).toBe(true);
    const dto = result.getValue();
    expect(dto.status).toBe(NotificationStatus.READ);
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('should fail if user does not match notification recipient', async () => {
    const wsId = IdGenerator.generate();
    const userId = IdGenerator.generate();
    const otherUserId = IdGenerator.generate();
    const notifId = IdGenerator.generate();

    const aggregate = NotificationAggregate.create({
      id: new UniqueEntityId(notifId),
      workspaceId: new UniqueEntityId(wsId),
      userId: new UniqueEntityId(userId),
      title: 'Alert',
      body: 'Body text',
      scheduledFor: new Date(),
    });

    const mockRepo: INotificationRepository = {
      findById: vi.fn().mockResolvedValue(aggregate),
      save: vi.fn(),
      delete: vi.fn(),
      findPaginated: vi.fn(),
      findUserNotifications: vi.fn(),
      findPendingNotifications: vi.fn(),
    };

    const useCase = new MarkNotificationAsReadUseCase(mockRepo);
    const result = await useCase.execute({
      notificationId: notifId,
      userId: otherUserId,
    });

    expect(result.isSuccess).toBe(false);
    expect(result.getError().message).toContain('cannot access');
  });
});
