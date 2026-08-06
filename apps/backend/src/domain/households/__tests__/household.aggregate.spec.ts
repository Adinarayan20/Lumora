import { describe, it, expect } from 'vitest';
import { IdGenerator, UniqueEntityId, DomainValidationException } from '@lumora/shared';
import { HouseholdAggregate } from '../household.aggregate.js';

describe('HouseholdAggregate Invariants & Rules', () => {
  it('should create HouseholdAggregate with owner member', () => {
    const wsId = new UniqueEntityId(IdGenerator.generate());
    const ownerId = new UniqueEntityId(IdGenerator.generate());

    const household = HouseholdAggregate.create({
      workspaceId: wsId,
      name: 'Smith Family Household',
      ownerUserId: ownerId,
    });

    expect(household.name.getValue()).toBe('Smith Family Household');
    expect(household.members).toHaveLength(1);
    expect(household.members[0].role).toBe('OWNER');
  });

  it('should add members and prevent duplicate members', () => {
    const wsId = new UniqueEntityId(IdGenerator.generate());
    const ownerId = new UniqueEntityId(IdGenerator.generate());
    const memberId = new UniqueEntityId(IdGenerator.generate());

    const household = HouseholdAggregate.create({
      workspaceId: wsId,
      name: 'Household',
      ownerUserId: ownerId,
    });

    household.addMember(memberId, 'MEMBER');

    expect(household.members).toHaveLength(2);
    expect(() => household.addMember(memberId, 'MEMBER')).toThrow(
      DomainValidationException,
    );
  });
});
