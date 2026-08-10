import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../rbac.service.js';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator.js';
import { PermissionKey } from '../constants/permissions.js';

interface RequestWithUserAndParams {
  user?: { id?: string };
  params?: Record<string, string | undefined>;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionKey[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<RequestWithUserAndParams>();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('Access denied');
    }

    const workspaceId = request.params?.workspaceId;
    if (!workspaceId) {
      throw new BadRequestException(
        'Workspace context missing from route parameters',
      );
    }

    await this.rbacService.authorize(userId, workspaceId, requiredPermissions);
    return true;
  }
}
