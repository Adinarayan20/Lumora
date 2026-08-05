export const Permissions = {
  Workspace: {
    Read: 'workspace.read',
    Update: 'workspace.update',
    Delete: 'workspace.delete',
    TransferOwnership: 'workspace.transfer_ownership',
  },
  Member: {
    List: 'workspace.member.list',
    Invite: 'workspace.member.invite',
    Remove: 'workspace.member.remove',
    RoleUpdate: 'workspace.member.role.update',
  },
  Role: {
    List: 'workspace.role.list',
    Create: 'workspace.role.create',
    Update: 'workspace.role.update',
    Delete: 'workspace.role.delete',
  },
  Space: {
    Create: 'workspace.space.create',
    Read: 'workspace.space.read',
    Update: 'workspace.space.update',
    Delete: 'workspace.space.delete',
  },
  Object: {
    Create: 'workspace.object.create',
    Read: 'workspace.object.read',
    Update: 'workspace.object.update',
    Delete: 'workspace.object.delete',
  },
  Collection: {
    Create: 'workspace.collection.create',
    Read: 'workspace.collection.read',
    Update: 'workspace.collection.update',
    Delete: 'workspace.collection.delete',
  },
} as const;

type NestedValues<T> = T extends string
  ? T
  : T extends object
    ? NestedValues<T[keyof T]>
    : never;

export type PermissionKey = NestedValues<typeof Permissions>;

export const OWNER_ONLY_PERMISSIONS = new Set<PermissionKey>([
  Permissions.Workspace.Delete,
  Permissions.Workspace.TransferOwnership,
]);
