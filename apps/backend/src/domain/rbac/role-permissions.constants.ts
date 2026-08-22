import { Permissions } from '../../modules/rbac/constants/permissions.js';

export const SYSTEM_ROLE_NAMES = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
} as const;

export type SystemRoleName =
  (typeof SYSTEM_ROLE_NAMES)[keyof typeof SYSTEM_ROLE_NAMES];

export const SYSTEM_ROLES_PERMISSIONS_MAP: Readonly<
  Record<SystemRoleName, readonly string[]>
> = Object.freeze({
  [SYSTEM_ROLE_NAMES.OWNER]: Object.freeze([
    Permissions.Workspace.Read,
    Permissions.Workspace.Update,
    Permissions.Workspace.Delete,
    Permissions.Workspace.TransferOwnership,
    Permissions.Member.List,
    Permissions.Member.Invite,
    Permissions.Member.Remove,
    Permissions.Member.RoleUpdate,
    Permissions.Role.List,
    Permissions.Role.Create,
    Permissions.Role.Update,
    Permissions.Role.Delete,
    Permissions.Object.Create,
    Permissions.Object.Read,
    Permissions.Object.Update,
    Permissions.Object.Delete,
    Permissions.Collection.Create,
    Permissions.Collection.Read,
    Permissions.Collection.Update,
    Permissions.Collection.Delete,
    Permissions.Reminder.Create,
    Permissions.Reminder.Read,
    Permissions.Reminder.Update,
    Permissions.Reminder.Delete,
  ]),
  [SYSTEM_ROLE_NAMES.ADMIN]: Object.freeze([
    Permissions.Workspace.Read,
    Permissions.Workspace.Update,
    Permissions.Member.List,
    Permissions.Member.Invite,
    Permissions.Member.Remove,
    Permissions.Role.List,
    Permissions.Object.Create,
    Permissions.Object.Read,
    Permissions.Object.Update,
    Permissions.Object.Delete,
    Permissions.Collection.Create,
    Permissions.Collection.Read,
    Permissions.Collection.Update,
    Permissions.Collection.Delete,
    Permissions.Reminder.Create,
    Permissions.Reminder.Read,
    Permissions.Reminder.Update,
    Permissions.Reminder.Delete,
  ]),
  [SYSTEM_ROLE_NAMES.MEMBER]: Object.freeze([
    Permissions.Workspace.Read,
    Permissions.Member.List,
    Permissions.Object.Create,
    Permissions.Object.Read,
    Permissions.Object.Update,
    Permissions.Collection.Create,
    Permissions.Collection.Read,
    Permissions.Collection.Update,
    Permissions.Reminder.Create,
    Permissions.Reminder.Read,
    Permissions.Reminder.Update,
  ]),
  [SYSTEM_ROLE_NAMES.VIEWER]: Object.freeze([
    Permissions.Workspace.Read,
    Permissions.Member.List,
    Permissions.Object.Read,
    Permissions.Collection.Read,
    Permissions.Reminder.Read,
  ]),
});
