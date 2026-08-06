import { describe, it, expect } from 'vitest';
import { DomainValidationException } from '@lumora/shared';
import { HouseholdPolicy } from '../policies/household.policy.js';

describe('HouseholdPolicy Capacity Rules', () => {
  it('should allow members within 10 member capacity', () => {
    expect(() => HouseholdPolicy.validateMemberCapacity(5)).not.toThrow();
  });

  it('should throw DomainValidationException when capacity reaches 10 members', () => {
    expect(() => HouseholdPolicy.validateMemberCapacity(10)).toThrow(
      DomainValidationException,
    );
  });
});
