import { Permissions } from '../../src/modules/rbac/constants/permissions';

export interface PermissionSeedData {
  key: string;
  resource: string;
  action: string;
  description: string;
}

export const GLOBAL_PERMISSIONS_SEED: PermissionSeedData[] = [
  // Workspace
  {
    key: Permissions.Workspace.Read,
    resource: 'workspace',
    action: 'read',
    description: 'Read workspace details',
  },
  {
    key: Permissions.Workspace.Update,
    resource: 'workspace',
    action: 'update',
    description: 'Update workspace metadata and settings',
  },
  {
    key: Permissions.Workspace.Delete,
    resource: 'workspace',
    action: 'delete',
    description: 'Delete workspace (Owner only)',
  },
  {
    key: Permissions.Workspace.TransferOwnership,
    resource: 'workspace',
    action: 'transfer_ownership',
    description: 'Transfer workspace ownership (Owner only)',
  },
  // Member
  {
    key: Permissions.Member.List,
    resource: 'workspace.member',
    action: 'list',
    description: 'List workspace members',
  },
  {
    key: Permissions.Member.Invite,
    resource: 'workspace.member',
    action: 'invite',
    description: 'Invite new member to workspace',
  },
  {
    key: Permissions.Member.Remove,
    resource: 'workspace.member',
    action: 'remove',
    description: 'Remove member from workspace',
  },
  {
    key: Permissions.Member.RoleUpdate,
    resource: 'workspace.member',
    action: 'role_update',
    description: 'Update member role in workspace',
  },
  // Role
  {
    key: Permissions.Role.List,
    resource: 'workspace.role',
    action: 'list',
    description: 'List workspace roles',
  },
  {
    key: Permissions.Role.Create,
    resource: 'workspace.role',
    action: 'create',
    description: 'Create custom workspace role',
  },
  {
    key: Permissions.Role.Update,
    resource: 'workspace.role',
    action: 'update',
    description: 'Update workspace role permissions',
  },
  {
    key: Permissions.Role.Delete,
    resource: 'workspace.role',
    action: 'delete',
    description: 'Delete custom workspace role',
  },
  // Object
  {
    key: Permissions.Object.Create,
    resource: 'workspace.object',
    action: 'create',
    description: 'Create universal objects within workspace',
  },
  {
    key: Permissions.Object.Read,
    resource: 'workspace.object',
    action: 'read',
    description: 'Read universal objects within workspace',
  },
  {
    key: Permissions.Object.Update,
    resource: 'workspace.object',
    action: 'update',
    description: 'Update universal objects within workspace',
  },
  {
    key: Permissions.Object.Delete,
    resource: 'workspace.object',
    action: 'delete',
    description: 'Delete universal objects within workspace',
  },
  // Collection
  {
    key: Permissions.Collection.Create,
    resource: 'workspace.collection',
    action: 'create',
    description: 'Create collections within workspace',
  },
  {
    key: Permissions.Collection.Read,
    resource: 'workspace.collection',
    action: 'read',
    description: 'Read collections within workspace',
  },
  {
    key: Permissions.Collection.Update,
    resource: 'workspace.collection',
    action: 'update',
    description: 'Update collections within workspace',
  },
  {
    key: Permissions.Collection.Delete,
    resource: 'workspace.collection',
    action: 'delete',
    description: 'Delete collections within workspace',
  },
  // Reminder
  {
    key: Permissions.Reminder.Create,
    resource: 'workspace.reminder',
    action: 'create',
    description: 'Create reminders within workspace',
  },
  {
    key: Permissions.Reminder.Read,
    resource: 'workspace.reminder',
    action: 'read',
    description: 'Read reminders within workspace',
  },
  {
    key: Permissions.Reminder.Update,
    resource: 'workspace.reminder',
    action: 'update',
    description: 'Update reminders within workspace',
  },
  {
    key: Permissions.Reminder.Delete,
    resource: 'workspace.reminder',
    action: 'delete',
    description: 'Delete reminders within workspace',
  },
];
