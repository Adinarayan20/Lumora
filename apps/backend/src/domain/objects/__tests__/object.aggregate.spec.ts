import { describe, it, expect } from 'vitest';
import { ObjectAggregate } from '../object.aggregate.js';
import { ObjectTitle } from '../value-objects/object-title.js';
import { ObjectKey } from '../value-objects/object-key.js';
import {
  UniqueEntityId,
  ObjectTypeKey,
  DomainValidationException,
} from '@lumora/shared';

describe('ObjectAggregate Domain Root', () => {
  const workspaceId = new UniqueEntityId();
  const createdById = new UniqueEntityId();
  const title = ObjectTitle.create('Project Architecture Note');
  const objectKey = ObjectKey.create('note-123');

  it('should create valid object aggregate and record ObjectCreatedEvent', () => {
    const object = ObjectAggregate.create({
      workspaceId,
      createdById,
      objectKey,
      typeKey: ObjectTypeKey.NOTE,
      title,
    });

    expect(object.id).toBeDefined();
    expect(object.typeKey).toBe(ObjectTypeKey.NOTE);
    expect(object.hasUncommittedEvents()).toBe(true);
    expect(object.domainEvents[0].eventName).toBe('object.created');
  });

  it('should throw exception if typeKey is unregistered', () => {
    expect(() =>
      ObjectAggregate.create({
        workspaceId,
        createdById,
        objectKey,
        typeKey: 'INVALID_TYPE' as ObjectTypeKey,
        title,
      }),
    ).toThrow(DomainValidationException);
  });

  it('should soft delete object aggregate and emit ObjectDeletedEvent', () => {
    const object = ObjectAggregate.create({
      workspaceId,
      createdById,
      objectKey,
      typeKey: ObjectTypeKey.NOTE,
      title,
    });

    object.pullDomainEvents(); // Clear creation event
    object.softDelete(createdById);

    expect(object.status).toBe('DELETED');
    expect(
      object.domainEvents.some((e) => e.eventName === 'object.deleted'),
    ).toBe(true);
  });
});
