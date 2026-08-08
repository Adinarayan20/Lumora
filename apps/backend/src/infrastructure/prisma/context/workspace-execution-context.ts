/**
 * Immutable workspace execution context injected into PrismaObjectRepository per request or operational scope.
 * Guarantees zero cross-tenant data leaks by providing immutable tenant boundaries.
 */
export class WorkspaceExecutionContext {
  constructor(
    public readonly workspaceId: string,
    public readonly userId: string,
  ) {
    if (!workspaceId) {
      throw new Error(
        'WorkspaceExecutionContext requires a non-empty workspaceId.',
      );
    }
    if (!userId) {
      throw new Error('WorkspaceExecutionContext requires a non-empty userId.');
    }
    Object.freeze(this);
  }
}
