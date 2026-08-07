/**
 * Application-layer façade use cases for the Users bounded context.
 *
 * All use cases delegate to UsersService, which manages profile reads/updates
 * and delegates device/session management to DeviceService and SessionService.
 */
import { Injectable } from '@nestjs/common';
import { Result, ApplicationException } from '@lumora/shared';
import { UsersService } from '../users.service.js';
import { UpdateProfileDto } from '../dto/update-profile.dto.js';
import { User, Device, Session } from '../../../generated/prisma/client.js';

// ─── Queries ──────────────────────────────────────────────────────────────────

export interface GetProfileQueryInput {
  userId: string;
}

@Injectable()
export class GetProfileQuery {
  constructor(private readonly service: UsersService) {}
  async execute(
    input: GetProfileQueryInput,
  ): Promise<Result<Omit<User, 'passwordHash'>, ApplicationException>> {
    return this.service.getProfile(input.userId);
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
  ): Promise<Result<Device[], ApplicationException>> {
    return this.service.getUserDevices(input.userId);
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
  ): Promise<Result<Session[], ApplicationException>> {
    return this.service.getUserSessions(input.userId);
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
  async execute(
    cmd: UpdateProfileCommand,
  ): Promise<Result<Omit<User, 'passwordHash'>, ApplicationException>> {
    return this.service.updateProfile(cmd.userId, cmd.dto);
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
  async execute(
    cmd: TrustDeviceCommand,
  ): Promise<Result<Device, ApplicationException>> {
    return this.service.trustDevice(cmd.userId, cmd.deviceId, cmd.trusted);
  }
}

export interface RevokeSessionCommand {
  userId: string;
  sessionId: string;
}

@Injectable()
export class RevokeSessionUseCase {
  constructor(private readonly service: UsersService) {}
  async execute(
    cmd: RevokeSessionCommand,
  ): Promise<Result<Session, ApplicationException>> {
    return this.service.revokeSession(cmd.userId, cmd.sessionId);
  }
}
