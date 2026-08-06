import { describe, it, expect } from 'vitest';
import { OutboxMessage } from '../outbox-message.entity.js';
import { OutboxStatus } from '../outbox-status.js';
import { UniqueEntityId, createDomainEvent, UserEventName } from '@lumora/shared';

describe('OutboxMessage Entity', () => {
  it('should construct OutboxMessage directly from a DomainEvent contract', () => {
    const aggregateId = new UniqueEntityId();
    const event = createDomainEvent({
      eventName: UserEventName.REGISTERED,
      aggregateId,
      payload: {
        userId: aggregateId,
        email: 'dev@lumora.io',
        username: 'devuser',
        registeredAt: new Date().toISOString(),
      },
    });

    const message = OutboxMessage.fromDomainEvent(event, 5);

    expect(message.eventId.equals(event.eventId)).toBe(true);
    expect(message.eventName).toBe(UserEventName.REGISTERED);
    expect(message.status).toBe(OutboxStatus.PENDING);
    expect(message.retryCount).toBe(0);
    expect(message.maxRetries).toBe(5);
    expect(message.hasExceededMaxRetries()).toBe(false);
  });

  it('should detect max retries exceeded', () => {
    const aggregateId = new UniqueEntityId();
    const message = new OutboxMessage({
      eventId: new UniqueEntityId(),
      eventName: UserEventName.REGISTERED,
      aggregateId,
      payload: {},
      schemaVersion: 1,
      retryCount: 5,
      maxRetries: 5,
    });

    expect(message.hasExceededMaxRetries()).toBe(true);
  });
});
