import { Injectable } from '@nestjs/common';
import {
  Result,
  ApplicationException,
  EntityNotFoundException,
} from '@lumora/shared';
import { UserRepository } from './repositories/user.repository';
import { DeviceService } from '../auth/services/device.service';
import { SessionService } from '../auth/services/session.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, Device, Session } from '../../generated/prisma/client.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly deviceService: DeviceService,
    private readonly sessionService: SessionService,
  ) {}

  async getProfile(
    userId: string,
  ): Promise<Result<Omit<User, 'passwordHash'>, ApplicationException>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return Result.fail(new EntityNotFoundException('User', userId));
    }
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Record<string, any>).passwordHash;
    return Result.ok(userWithoutPassword);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<Result<Omit<User, 'passwordHash'>, ApplicationException>> {
    const user = await this.userRepository.update(userId, dto);
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Record<string, any>).passwordHash;
    return Result.ok(userWithoutPassword);
  }

  async getUserDevices(
    userId: string,
  ): Promise<Result<Device[], ApplicationException>> {
    const devices = await this.deviceService.getUserDevices(userId);
    return Result.ok(devices);
  }

  async trustDevice(
    userId: string,
    deviceId: string,
    trusted: boolean,
  ): Promise<Result<Device, ApplicationException>> {
    const device = await this.deviceService.trustDevice(
      userId,
      deviceId,
      trusted,
    );
    return Result.ok(device);
  }

  async getUserSessions(
    userId: string,
  ): Promise<Result<Session[], ApplicationException>> {
    const sessions = await this.sessionService.getUserSessions(userId);
    return Result.ok(sessions);
  }

  async revokeSession(
    userId: string,
    sessionId: string,
  ): Promise<Result<Session, ApplicationException>> {
    const session = await this.sessionService.revokeSession(
      userId,
      sessionId,
      'Revoked by user profile',
    );
    return Result.ok(session);
  }
}
