import { describe, it, expect } from 'vitest';
import {
  UserEventName,
  WorkspaceEventName,
  ObjectEventName,
  ReminderEventName,
  createDomainEvent,
  IDomainEventPublisher,
} from '../index.js';
import type { DomainEvent } from '../domain-event.interface.js';
import { UniqueEntityId } from '../../primitives/unique-entity-id.js';
import type { ObjectCreatedPayload } from '../payloads/object-payloads.js';

describe('Domain Event Contracts (Data Contract Model)', () => {
  describe('createDomainEvent Factory', () => {
    it('should create immutable domain event contract with auto-generated eventId and ISO timestamp', () => {
      const aggregateId = new UniqueEntityId();
      const workspaceId = new UniqueEntityId();
      const authorId = new UniqueEntityId();

      const event = createDomainEvent<typeof ObjectEventName.CREATED, ObjectCreatedPayload>({
        eventName: ObjectEventName.CREATED,
        aggregateId,
        workspaceId,
        payload: {
          workspaceId,
          objectId: aggregateId,
          typeKey: 'TASK',
          title: 'Master Domain Architecture',
          authorId,
          createdAt: new Date().toISOString(),
        },
      });

      expect(event.eventName).toBe('object.created');
      expect(event.aggregateId.equals(aggregateId)).toBe(true);
      expect(event.workspaceId?.equals(workspaceId)).toBe(true);
      expect(event.eventId).toBeInstanceOf(UniqueEntityId);
      expect(typeof event.occurredAt).toBe('string');
      expect(event.schemaVersion).toBe(1);
      expect(Object.isFrozen(event.payload)).toBe(true);
    });

    it('should allow custom eventId, custom occurredAt timestamp, and custom schemaVersion for outbox replay', () => {
      const customEventId = new UniqueEntityId();
      const customAggregateId = new UniqueEntityId();
      const customTimestamp = '2026-01-01T00:00:00.000Z';

      const event = createDomainEvent({
        eventName: UserEventName.REGISTERED,
        aggregateId: customAggregateId,
        eventId: customEventId,
        occurredAt: customTimestamp,
        schemaVersion: 2,
        payload: {
          userId: customAggregateId,
          email: 'admin@lumora.io',
          username: 'admin',
          registeredAt: customTimestamp,
        },
      });

      expect(event.eventId.equals(customEventId)).toBe(true);
      expect(event.occurredAt).toBe(customTimestamp);
      expect(event.schemaVersion).toBe(2);
    });
  });

  describe('IDomainEventPublisher API Contract', () => {
    it('should publish a single-method array of DomainEvent contracts', async () => {
      const publishedEvents: DomainEvent<any, any>[] = [];

      const mockPublisher: IDomainEventPublisher = {
        async publish(events: readonly DomainEvent<any, any>[]): Promise<void> {
          publishedEvents.push(...events);
        },
      };

      const event1 = createDomainEvent({
        eventName: WorkspaceEventName.CREATED,
        aggregateId: new UniqueEntityId(),
        payload: {
          workspaceId: new UniqueEntityId(),
          ownerId: new UniqueEntityId(),
          name: 'Engineering',
          slug: 'engineering',
          createdAt: new Date().toISOString(),
        },
      });

      const event2 = createDomainEvent({
        eventName: ReminderEventName.TRIGGERED,
        aggregateId: new UniqueEntityId(),
        payload: {
          workspaceId: new UniqueEntityId(),
          reminderId: new UniqueEntityId(),
          objectId: new UniqueEntityId(),
          executionId: 'exec-123',
          triggeredAt: new Date().toISOString(),
        },
      });

      await mockPublisher.publish([event1, event2]);

      expect(publishedEvents.length).toBe(2);
      expect(publishedEvents[0]?.eventName).toBe(WorkspaceEventName.CREATED);
      expect(publishedEvents[1]?.eventName).toBe(ReminderEventName.TRIGGERED);
    });
  });
});
