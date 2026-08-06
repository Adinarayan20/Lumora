import { describe, it, expect, vi } from 'vitest';
import { IdGenerator, UniqueEntityId } from '@lumora/shared';
import { DeliverNotificationUseCase } from '../deliver-notification.use-case.js';
import { NotificationAggregate } from '../../../../domain/notifications/notification.aggregate.js';
import { NotificationChannel, NotificationStatus } from '../../../../domain/notifications/value-objects/notification-enums.js';
import type { INotificationRepository } from '../../../../domain/notifications/repositories/notification.repository.interface.js';

describe('DeliverNotificationUseCase', () => {
  it('should deliver notification and return NotificationResponseDto', async () => {
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

    const mockRepo: INotificationRepository = {
      findById: vi.fn().mockResolvedValue(aggregate),
      exists: vi.fn().mockResolvedValue(true),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
      findPaginated: vi.fn(),
      findUserNotifications: vi.fn(),
      findPendingNotifications: vi.fn(),
    };

    const useCase = new DeliverNotificationUseCase(mockRepo);
    const result = await useCase.execute({
      notificationId: notifId,
      channel: NotificationChannel.PUSH,
    });

    expect(result.isSuccess).toBe(true);
    const dto = result.getValue();
    expect(dto.status).toBe(NotificationStatus.DELIVERED);
    expect(dto.channel).toBe(NotificationChannel.PUSH);
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('should return failure Result when notification is not found', async () => {
    const notifId = IdGenerator.generate();

    const mockRepo: INotificationRepository = {
      findById: vi.fn().mockResolvedValue(null),
      exists: vi.fn().mockResolvedValue(false),
      save: vi.fn(),
      delete: vi.fn(),
      findPaginated: vi.fn(),
      findUserNotifications: vi.fn(),
      findPendingNotifications: vi.fn(),
    };

    const useCase = new DeliverNotificationUseCase(mockRepo);
    const result = await useCase.execute({ notificationId: notifId });

    expect(result.isSuccess).toBe(false);
    expect(result.getError().message).toContain('not found');
  });
});
