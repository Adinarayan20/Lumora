import { describe, it, expect } from 'vitest';
import { RoleAggregate } from '../role.aggregate.js';
import { UniqueEntityId, DomainValidationException } from '@lumora/shared';

describe('RoleAggregate Domain Root', () => {
  const workspaceId = new UniqueEntityId();

  it('should create custom role and grant/revoke permissions', () => {
    const role = RoleAggregate.create({
      workspaceId,
      name: 'Custom Editor',
      permissions: new Set(['workspace.object.create']),
    });

    expect(role.hasPermission('workspace.object.create')).toBe(true);
    expect(role.hasPermission('workspace.object.delete')).toBe(false);

    role.grantPermission('workspace.object.delete');
    expect(role.hasPermission('workspace.object.delete')).toBe(true);

    role.revokePermission('workspace.object.create');
    expect(role.hasPermission('workspace.object.create')).toBe(false);
  });

  it('should throw exception when trying to modify system role permissions', () => {
    const systemRole = RoleAggregate.create({
      workspaceId,
      name: 'Owner',
      system: true,
      permissions: new Set(['workspace.delete']),
    });

    expect(() => systemRole.grantPermission('workspace.update')).toThrow(
      DomainValidationException,
    );
    expect(() => systemRole.revokePermission('workspace.delete')).toThrow(
      DomainValidationException,
    );
  });
});
