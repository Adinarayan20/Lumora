import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { RoleRepository } from './repositories/role.repository';
import { WorkspaceMemberRepository } from './repositories/workspace-member.repository';
import { PermissionKey, OWNER_ONLY_PERMISSIONS } from './constants/permissions';
import {
  SYSTEM_ROLE_NAMES,
  SYSTEM_ROLES_PERMISSIONS_MAP,
} from '../../domain/rbac/role-permissions.constants.js';
import { PrismaTransaction } from '../auth/repositories/audit-log.repository';

export interface ResourceContext {
  objectId?: string;
  spaceId?: string;
}

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);

  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly memberRepository: WorkspaceMemberRepository,
  ) {}

  /**
   * Authorize user access for a workspace context.
   * Throws a generic ForbiddenException on failure. Internal details belong only in logs.
   */
  async authorize(
    userId: string,
    workspaceId: string,
    requiredPermissions: PermissionKey[],
    resourceContext?: ResourceContext,
  ): Promise<void> {
    const member = await this.memberRepository.findMemberWithRolePermissions(
      workspaceId,
      userId,
    );

    if (!member || member.status !== 'ACTIVE') {
      this.logger.warn(
        `Authorization failed: User ${userId} is not an active member of workspace ${workspaceId}`,
      );
      throw new ForbiddenException('Access denied');
    }

    if (!member.role) {
      this.logger.warn(
        `Authorization failed: Member ${userId} in workspace ${workspaceId} has no assigned role`,
      );
      throw new ForbiddenException('Access denied');
    }

    const assignedKeys = new Set(
      member.role.permissions.map((rp) => rp.permission.key as PermissionKey),
    );

    for (const required of requiredPermissions) {
      if (!assignedKeys.has(required)) {
        this.logger.warn(
          `Authorization failed: User ${userId} in workspace ${workspaceId} missing permission ${required}`,
        );
        throw new ForbiddenException('Access denied');
      }

      if (
        OWNER_ONLY_PERMISSIONS.has(required) &&
        member.workspace.ownerId !== userId
      ) {
        this.logger.warn(
          `Authorization failed: User ${userId} attempted owner-only operation ${required} in workspace ${workspaceId}`,
        );
        throw new ForbiddenException('Access denied');
      }
    }

    if (resourceContext) {
      // Future extension point for Universal Objects, Sharing, Family, AI & Automation
    }
  }

  /**
   * Seeds system roles (Owner, Admin, Member, Guest) for a workspace and assigns Owner role to creator.
   */
  async seedDefaultWorkspaceRoles(
    workspaceId: string,
    ownerUserId: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    let ownerRoleId = '';

    const allPermissionKeys = Array.from(
      new Set(Object.values(SYSTEM_ROLES_PERMISSIONS_MAP).flat()),
    );
    const globalPermissions =
      await this.roleRepository.findGlobalPermissionsByKeys(
        allPermissionKeys,
        tx,
      );
    const permMap = new Map(globalPermissions.map((p) => [p.key, p.id]));

    for (const [roleName, permissionKeys] of Object.entries(
      SYSTEM_ROLES_PERMISSIONS_MAP,
    )) {
      const role = await this.roleRepository.createRole(
        workspaceId,
        roleName,
        `System default ${roleName} role`,
        true,
        tx,
      );

      const permissionIds = permissionKeys
        .map((k) => permMap.get(k))
        .filter((id): id is string => Boolean(id));

      if (permissionIds.length > 0) {
        await this.roleRepository.assignPermissionsToRole(
          role.id,
          permissionIds,
          tx,
        );
      }

      if (roleName === SYSTEM_ROLE_NAMES.OWNER) {
        ownerRoleId = role.id;
      }
    }

    if (ownerRoleId) {
      await this.memberRepository.updateMemberRole(
        workspaceId,
        ownerUserId,
        ownerRoleId,
        tx,
      );
    }
  }
}
