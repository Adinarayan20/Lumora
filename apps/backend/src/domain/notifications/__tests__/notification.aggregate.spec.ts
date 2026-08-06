import { describe, it, expect } from 'vitest';
import { IdGenerator, DomainValidationException } from '@lumora/shared';
import { NotificationAggregate } from '../notification.aggregate.js';
import { NotificationChannel, NotificationStatus } from '../value-objects/notification-enums.js';

describe('NotificationAggregate Invariants & Rules', () => {
  it('should successfully create a valid NotificationAggregate and emit initial state', () => {
    const wsId = IdGenerator.generate();
    const userId = IdGenerator.generate();

    const notif = NotificationAggregate.create({
      workspaceId: wsId,
      userId: userId,
      title: 'Reminder Due',
      body: 'Your scheduled reminder is ready.',
      scheduledFor: new Date(),
    });

    expect(notif.workspaceId.toString()).toBe(wsId.toString());
    expect(notif.userId.toString()).toBe(userId.toString());
    expect(notif.title.getValue()).toBe('Reminder Due');
    expect(notif.status).toBe(NotificationStatus.PENDING);
  });

  it('should mark notification as delivered and emit NotificationDeliveredEvent', () => {
    const wsId = IdGenerator.generate();
    const userId = IdGenerator.generate();

    const notif = NotificationAggregate.create({
      workspaceId: wsId,
      userId: userId,
      title: 'Reminder Due',
      body: 'Your scheduled reminder is ready.',
      scheduledFor: new Date(),
    });

    notif.markAsDelivered(NotificationChannel.PUSH);

    expect(notif.status).toBe(NotificationStatus.DELIVERED);
    expect(notif.deliveredAt).toBeDefined();
    expect(notif.pullDomainEvents()).toHaveLength(1);
  });

  it('should throw DomainValidationException on duplicate delivery attempt', () => {
    const wsId = IdGenerator.generate();
    const userId = IdGenerator.generate();

    const notif = NotificationAggregate.create({
      workspaceId: wsId,
      userId: userId,
      title: 'Alert',
      body: 'Body text',
      scheduledFor: new Date(),
    });

    notif.markAsDelivered(NotificationChannel.IN_APP);

    expect(() => notif.markAsDelivered(NotificationChannel.IN_APP)).toThrow(
      DomainValidationException,
    );
  });

  it('should throw DomainValidationException when attempting to modify a CANCELLED notification', () => {
    const wsId = IdGenerator.generate();
    const userId = IdGenerator.generate();

    const notif = NotificationAggregate.create({
      workspaceId: wsId,
      userId: userId,
      title: 'Alert',
      body: 'Body text',
      scheduledFor: new Date(),
    });

    notif.cancel();
    expect(notif.status).toBe(NotificationStatus.CANCELLED);

    expect(() => notif.markAsDelivered(NotificationChannel.PUSH)).toThrow(
      DomainValidationException,
    );
  });

  it('should throw DomainValidationException when creating notification with invalid channel', () => {
    const wsId = IdGenerator.generate();
    const userId = IdGenerator.generate();

    expect(() =>
      NotificationAggregate.create({
        workspaceId: wsId,
        userId: userId,
        title: 'Title',
        body: 'Body',
        channel: 'INVALID_CHANNEL' as any,
        scheduledFor: new Date(),
      }),
    ).toThrow(DomainValidationException);
  });
});
