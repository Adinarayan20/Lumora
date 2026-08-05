import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { DeviceService } from '../auth/services/device.service';
import { SessionService } from '../auth/services/session.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, Device, Session } from '../../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly deviceService: DeviceService,
    private readonly sessionService: SessionService,
  ) {}

  async getProfile(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Record<string, any>).passwordHash;
    return userWithoutPassword;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.update(userId, dto);
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Record<string, any>).passwordHash;
    return userWithoutPassword;
  }

  async getUserDevices(userId: string): Promise<Device[]> {
    return this.deviceService.getUserDevices(userId);
  }

  async trustDevice(
    userId: string,
    deviceId: string,
    trusted: boolean,
  ): Promise<Device> {
    return this.deviceService.trustDevice(userId, deviceId, trusted);
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    return this.sessionService.getUserSessions(userId);
  }

  async revokeSession(userId: string, sessionId: string): Promise<Session> {
    return this.sessionService.revokeSession(
      userId,
      sessionId,
      'Revoked by user profile',
    );
  }
}
