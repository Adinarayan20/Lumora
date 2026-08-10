import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from '../permissions.guard.js';
import { RbacService } from '../../rbac.service.js';
import { Permissions } from '../../constants/permissions.js';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;
  let rbacService: RbacService;

  beforeEach(() => {
    reflector = new Reflector();
    rbacService = {
      authorize: vi.fn(),
    } as unknown as RbacService;
    guard = new PermissionsGuard(reflector, rbacService);
  });

  function createMockContext(request: unknown): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it('allows request if no permissions are required', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext({});
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('throws ForbiddenException if user identity is missing', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      Permissions.Object.Read,
    ]);
    const context = createMockContext({
      user: undefined,
      params: { workspaceId: 'ws-123' },
    });
    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('throws BadRequestException if workspaceId is missing from params', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      Permissions.Object.Read,
    ]);
    const context = createMockContext({ user: { id: 'user-123' }, params: {} });
    await expect(guard.canActivate(context)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws BadRequestException if only an unrelated id parameter is present without workspaceId', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      Permissions.Object.Read,
    ]);
    const context = createMockContext({
      user: { id: 'user-123' },
      params: { id: 'object-999' },
    });
    await expect(guard.canActivate(context)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('authorizes user when workspaceId is present and user is authorized', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      Permissions.Object.Read,
    ]);
    const authSpy = vi
      .spyOn(rbacService, 'authorize')
      .mockResolvedValue(undefined);
    const context = createMockContext({
      user: { id: 'user-123' },
      params: { workspaceId: 'ws-123', id: 'object-999' },
    });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(authSpy).toHaveBeenCalledWith('user-123', 'ws-123', [
      Permissions.Object.Read,
    ]);
  });
});
