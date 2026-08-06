/**
 * Application-layer façade use cases for the Users bounded context.
 *
 * All use cases delegate to UsersService, which manages profile reads/updates
 * and delegates device/session management to DeviceService and SessionService.
 */
import { Injectable } from '@nestjs/common';
import { Result } from '@lumora/shared';
import { UsersService } from '../users.service.js';
import { UpdateProfileDto } from '../dto/update-profile.dto.js';

// ─── Queries ──────────────────────────────────────────────────────────────────

export interface GetProfileQueryInput {
  userId: string;
}

@Injectable()
export class GetProfileQuery {
  constructor(private readonly service: UsersService) {}
  async execute(input: GetProfileQueryInput): Promise<Result<unknown, Error>> {
    try {
      return Result.ok(await this.service.getProfile(input.userId));
    } catch (e) {
      return Result.fail(e instanceof Error ? e : new Error(String(e)));
    }
  }
}

export interface GetUserDevicesQueryInput {
  userId: string;
}

@Injectable()
export class GetUserDevicesQuery {
  constructor(private readonly service: UsersService) {}
  async execute(
    input: GetUserDevicesQueryInput,
  ): Promise<Result<unknown[], Error>> {
    try {
      return Result.ok(await this.service.getUserDevices(input.userId));
    } catch (e) {
      return Result.fail(e instanceof Error ? e : new Error(String(e)));
    }
  }
}

export interface GetUserSessionsQueryInput {
  userId: string;
}

@Injectable()
export class GetUserSessionsQuery {
  constructor(private readonly service: UsersService) {}
  async execute(
    input: GetUserSessionsQueryInput,
  ): Promise<Result<unknown[], Error>> {
    try {
      return Result.ok(await this.service.getUserSessions(input.userId));
    } catch (e) {
      return Result.fail(e instanceof Error ? e : new Error(String(e)));
    }
  }
}

// ─── Commands ────────────────────────────────────────────────────────────────

export interface UpdateProfileCommand {
  userId: string;
  dto: UpdateProfileDto;
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(private readonly service: UsersService) {}
  async execute(cmd: UpdateProfileCommand): Promise<Result<unknown, Error>> {
    try {
      return Result.ok(await this.service.updateProfile(cmd.userId, cmd.dto));
    } catch (e) {
      return Result.fail(e instanceof Error ? e : new Error(String(e)));
    }
  }
}

export interface TrustDeviceCommand {
  userId: string;
  deviceId: string;
  trusted: boolean;
}

@Injectable()
export class TrustDeviceUseCase {
  constructor(private readonly service: UsersService) {}
  async execute(cmd: TrustDeviceCommand): Promise<Result<unknown, Error>> {
    try {
      return Result.ok(
        await this.service.trustDevice(cmd.userId, cmd.deviceId, cmd.trusted),
      );
    } catch (e) {
      return Result.fail(e instanceof Error ? e : new Error(String(e)));
    }
  }
}

export interface RevokeSessionCommand {
  userId: string;
  sessionId: string;
}

@Injectable()
export class RevokeSessionUseCase {
  constructor(private readonly service: UsersService) {}
  async execute(cmd: RevokeSessionCommand): Promise<Result<unknown, Error>> {
    try {
      return Result.ok(
        await this.service.revokeSession(cmd.userId, cmd.sessionId),
      );
    } catch (e) {
      return Result.fail(e instanceof Error ? e : new Error(String(e)));
    }
  }
}
