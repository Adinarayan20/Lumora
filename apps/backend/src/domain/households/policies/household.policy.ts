import { DomainValidationException } from '@lumora/shared';
import { HouseholdMemberEntity } from '../entities/household-member.entity.js';

export class HouseholdPolicy {
  public static readonly MAX_HOUSEHOLD_MEMBERS = 10;

  /**
   * Validates maximum member capacity in a family/household context.
   */
  public static validateMemberCapacity(currentMemberCount: number): void {
    if (currentMemberCount >= this.MAX_HOUSEHOLD_MEMBERS) {
      throw new DomainValidationException(
        `Household member capacity limit of ${this.MAX_HOUSEHOLD_MEMBERS} exceeded.`,
        { capacity: [`Household cannot exceed ${this.MAX_HOUSEHOLD_MEMBERS} members.`] },
      );
    }
  }

  /**
   * Validates duplicate member prevention.
   */
  public static validateUniqueMember(
    members: HouseholdMemberEntity[],
    newMemberUserId: string,
  ): void {
    if (members.some((m) => m.userId.toString() === newMemberUserId)) {
      throw new DomainValidationException(
        `User '${newMemberUserId}' is already a member of this household.`,
        { member: ['User is already in household.'] },
      );
    }
  }
}
