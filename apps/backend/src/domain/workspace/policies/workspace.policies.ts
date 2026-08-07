export class WorkspacePolicies {
  static readonly PERSONAL_SLUG_SUFFIX = 'personal' as const;

  static personalWorkspaceName(displayName: string): string {
    return `${displayName}'s Workspace`;
  }

  static personalWorkspaceSlug(baseSlug: string): string {
    return `${baseSlug}-${WorkspacePolicies.PERSONAL_SLUG_SUFFIX}`;
  }
}
