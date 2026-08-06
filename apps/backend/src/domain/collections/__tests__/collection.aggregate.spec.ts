import { describe, it, expect } from 'vitest';
import { CollectionAggregate } from '../collection.aggregate.js';
import { CollectionSlug } from '../value-objects/collection-slug.js';
import { CollectionType } from '../value-objects/collection-enums.js';
import { UniqueEntityId, DomainValidationException } from '@lumora/shared';

describe('CollectionAggregate Domain Root', () => {
  const workspaceId = new UniqueEntityId();
  const createdById = new UniqueEntityId();
  const slug = CollectionSlug.create('favorite-tasks');

  it('should create static collection and add/remove item entities', () => {
    const collection = CollectionAggregate.create({
      workspaceId,
      createdById,
      slug,
      name: 'Favorite Tasks',
      type: CollectionType.STATIC,
    });

    const objectId = new UniqueEntityId();
    collection.addItem(objectId, 1);

    expect(collection.items).toHaveLength(1);
    expect(collection.items[0].objectId.equals(objectId)).toBe(true);

    collection.removeItem(objectId);
    expect(collection.items).toHaveLength(0);
  });

  it('should reject adding items to dynamic collections', () => {
    const collection = CollectionAggregate.create({
      workspaceId,
      createdById,
      slug,
      name: 'Dynamic Search',
      type: CollectionType.DYNAMIC,
    });

    const objectId = new UniqueEntityId();
    expect(() => collection.addItem(objectId)).toThrow(DomainValidationException);
  });

  it('should prevent adding duplicate object items', () => {
    const collection = CollectionAggregate.create({
      workspaceId,
      createdById,
      slug,
      name: 'Tasks',
      type: CollectionType.STATIC,
    });

    const objectId = new UniqueEntityId();
    collection.addItem(objectId);

    expect(() => collection.addItem(objectId)).toThrow(DomainValidationException);
  });
});
