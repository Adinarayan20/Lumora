import { describe, it, expect } from 'vitest';
import { IdGenerator } from '@lumora/shared';
import { NotificationAggregate } from '../notification.aggregate.js';
import { NotificationChannel, NotificationStatus } from '../value-objects/notification-enums.js';

describe('NotificationAggregate', () => {
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
    expect(notif.title).toBe('Reminder Due');
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

  it('should mark notification as read and emit NotificationReadEvent', () => {
    const wsId = IdGenerator.generate();
    const userId = IdGenerator.generate();

    const notif = NotificationAggregate.create({
      workspaceId: wsId,
      userId: userId,
      title: 'Reminder Due',
      body: 'Your scheduled reminder is ready.',
      scheduledFor: new Date(),
    });

    notif.markAsDelivered(NotificationChannel.IN_APP);
    notif.pullDomainEvents(); // Clear delivered event

    notif.markAsRead();

    expect(notif.status).toBe(NotificationStatus.READ);
    expect(notif.readAt).toBeDefined();
    expect(notif.pullDomainEvents()).toHaveLength(1);
  });

  it('should throw DomainValidationException on empty title or body', () => {
    const wsId = IdGenerator.generate();
    const userId = IdGenerator.generate();

    expect(() =>
      NotificationAggregate.create({
        workspaceId: wsId,
        userId: userId,
        title: '',
        body: 'Body text',
        scheduledFor: new Date(),
      }),
    ).toThrow();
  });
});
