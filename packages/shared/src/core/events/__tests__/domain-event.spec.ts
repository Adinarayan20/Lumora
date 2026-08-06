import { describe, it, expect } from 'vitest';
import {
  UserRegisteredEvent,
  WorkspaceCreatedEvent,
  ObjectCreatedEvent,
  ObjectUpdatedEvent,
  ObjectDeletedEvent,
  ReminderScheduledEvent,
  ReminderTriggeredEvent,
  ReminderCompletedEvent,
} from '../index.js';
import { UniqueEntityId } from '../../primitives/unique-entity-id.js';

describe('Domain Event Contracts', () => {
  describe('UserRegisteredEvent', () => {
    it('should initialize with valid aggregateId, eventName, and payload', () => {
      const event = new UserRegisteredEvent({
        userId: 'usr-100',
        email: 'dev@lumora.io',
        username: 'devuser',
        registeredAt: new Date().toISOString(),
      });

      expect(event.eventName).toBe('user.registered');
      expect(event.aggregateId).toBe('usr-100');
      expect(event.eventId).toBeInstanceOf(UniqueEntityId);
      expect(event.occurredAt).toBeInstanceOf(Date);
      expect(event.payload.email).toBe('dev@lumora.io');
      expect(Object.isFrozen(event.payload)).toBe(true);
    });
  });

  describe('WorkspaceCreatedEvent', () => {
    it('should set workspaceId metadata and payload correctly', () => {
      const event = new WorkspaceCreatedEvent({
        workspaceId: 'ws-200',
        ownerId: 'usr-100',
        name: 'Engineering',
        slug: 'engineering',
        createdAt: new Date().toISOString(),
      });

      expect(event.eventName).toBe('workspace.created');
      expect(event.workspaceId).toBe('ws-200');
      expect(event.aggregateId).toBe('ws-200');
      expect(event.payload.slug).toBe('engineering');
    });
  });

  describe('Object Events', () => {
    it('should correctly format ObjectCreated, ObjectUpdated, and ObjectDeleted events', () => {
      const created = new ObjectCreatedEvent({
        workspaceId: 'ws-200',
        objectId: 'obj-300',
        typeKey: 'TASK',
        title: 'Build Unit 1.5',
        authorId: 'usr-100',
        createdAt: new Date().toISOString(),
      });

      const updated = new ObjectUpdatedEvent({
        workspaceId: 'ws-200',
        objectId: 'obj-300',
        typeKey: 'TASK',
        modifierId: 'usr-100',
        updatedFields: ['title'],
        updatedAt: new Date().toISOString(),
      });

      const deleted = new ObjectDeletedEvent({
        workspaceId: 'ws-200',
        objectId: 'obj-300',
        typeKey: 'TASK',
        deletedAt: new Date().toISOString(),
      });

      expect(created.eventName).toBe('object.created');
      expect(updated.eventName).toBe('object.updated');
      expect(deleted.eventName).toBe('object.deleted');
      expect(created.workspaceId).toBe('ws-200');
      expect(updated.payload.updatedFields).toContain('title');
    });
  });

  describe('Reminder Events', () => {
    it('should correctly format ReminderScheduled, ReminderTriggered, and ReminderCompleted events', () => {
      const scheduled = new ReminderScheduledEvent({
        workspaceId: 'ws-200',
        reminderId: 'rem-400',
        objectId: 'obj-300',
        remindAt: new Date().toISOString(),
      });

      const triggered = new ReminderTriggeredEvent({
        workspaceId: 'ws-200',
        reminderId: 'rem-400',
        objectId: 'obj-300',
        executionId: 'exec-500',
        triggeredAt: new Date().toISOString(),
      });

      const completed = new ReminderCompletedEvent({
        workspaceId: 'ws-200',
        reminderId: 'rem-400',
        objectId: 'obj-300',
        completedAt: new Date().toISOString(),
      });

      expect(scheduled.eventName).toBe('reminder.scheduled');
      expect(triggered.eventName).toBe('reminder.triggered');
      expect(completed.eventName).toBe('reminder.completed');
      expect(triggered.payload.executionId).toBe('exec-500');
    });
  });
});
