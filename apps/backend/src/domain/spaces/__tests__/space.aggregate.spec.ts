import { describe, it, expect } from 'vitest';
import { SpaceAggregate } from '../space.aggregate.js';
import { SpaceSlug } from '../value-objects/space-slug.js';
import { SpaceHierarchyPolicy } from '../policies/space-hierarchy.policy.js';
import { UniqueEntityId, DomainValidationException } from '@lumora/shared';

describe('SpaceAggregate Domain Root', () => {
  const workspaceId = new UniqueEntityId();
  const createdById = new UniqueEntityId();
  const slug = SpaceSlug.create('engineering');

  it('should create space aggregate and record SpaceCreatedEvent', () => {
    const space = SpaceAggregate.create({
      workspaceId,
      createdById,
      slug,
      name: 'Engineering',
    });

    expect(space.id).toBeDefined();
    expect(space.slug.toValue()).toBe('engineering');
    expect(space.hasUncommittedEvents()).toBe(true);
    expect(space.domainEvents[0].eventName).toBe('space.created');
  });

  it('should prevent setting space as its own parent', () => {
    const id = new UniqueEntityId();
    expect(() =>
      SpaceHierarchyPolicy.validateParentAssignment(id, id, 0),
    ).toThrow(DomainValidationException);
  });

  it('should enforce maximum hierarchy depth limit', () => {
    const id = new UniqueEntityId();
    const parentId = new UniqueEntityId();

    expect(() =>
      SpaceHierarchyPolicy.validateParentAssignment(id, parentId, 5),
    ).toThrow(DomainValidationException);
  });
});
