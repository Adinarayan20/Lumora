import { DomainValidationException } from '@lumora/shared';
import { WorkspacePlan } from '../value-objects/workspace-enums.js';

/**
 * Domain Policy encapsulating member quota limits and membership invariant rules per Workspace plan.
 */
export class WorkspaceMemberPolicy {
  public static readonly PLAN_MEMBER_LIMITS: Readonly<Record<WorkspacePlan, number>> =
    Object.freeze({
      [WorkspacePlan.FREE]: 5,
      [WorkspacePlan.PRO]: 25,
      [WorkspacePlan.BUSINESS]: 100,
      [WorkspacePlan.ENTERPRISE]: 10000,
    });

  public static validateMemberAddition(
    currentMemberCount: number,
    plan: WorkspacePlan,
  ): void {
    const limit = WorkspaceMemberPolicy.PLAN_MEMBER_LIMITS[plan] ?? 5;
    if (currentMemberCount >= limit) {
      throw new DomainValidationException(
        `Workspace plan '${plan}' maximum member limit (${limit}) reached. Upgrade workspace plan to invite more members.`,
        { plan: [`Member quota exceeded for plan ${plan}.`] },
      );
    }
  }
}
