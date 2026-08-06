import { UniqueEntityId, DomainValidationException } from '@lumora/shared';

/**
 * Domain Policy encapsulating hierarchical space depth and parent assignment invariants.
 */
export class SpaceHierarchyPolicy {
  public static readonly MAX_DEPTH = 5;

  public static validateParentAssignment(
    spaceId: UniqueEntityId,
    parentId?: UniqueEntityId,
    parentDepth: number = 0,
  ): void {
    if (parentId && spaceId.equals(parentId)) {
      throw new DomainValidationException(
        `Space '${spaceId.toValue()}' cannot be set as its own parent.`,
        { parentId: [`Circular space hierarchy detected.`] },
      );
    }

    if (parentDepth >= SpaceHierarchyPolicy.MAX_DEPTH) {
      throw new DomainValidationException(
        `Space hierarchy maximum depth limit (${SpaceHierarchyPolicy.MAX_DEPTH}) exceeded.`,
        {
          parentId: [
            `Hierarchy depth cannot exceed ${SpaceHierarchyPolicy.MAX_DEPTH}.`,
          ],
        },
      );
    }
  }
}
