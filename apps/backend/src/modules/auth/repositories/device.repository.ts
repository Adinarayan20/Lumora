import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { Device, DevicePlatform } from '../../../generated/prisma/client.js';
import { PrismaTransaction } from './audit-log.repository';

export interface CreateDeviceData {
  userId: string;
  name: string;
  platform: DevicePlatform;
  appVersion?: string;
  osVersion?: string;
  pushToken?: string;
  trusted?: boolean;
}

@Injectable()
export class DeviceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, tx?: PrismaTransaction): Promise<Device | null> {
    const client = tx ?? this.prisma;
    return client.device.findUnique({ where: { id } });
  }

  async findByUserAndPlatformName(
    userId: string,
    platform: DevicePlatform,
    name: string,
    tx?: PrismaTransaction,
  ): Promise<Device | null> {
    const client = tx ?? this.prisma;
    return client.device.findFirst({
      where: {
        userId,
        platform,
        name,
      },
    });
  }

  async findUserDevices(
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<Device[]> {
    const client = tx ?? this.prisma;
    return client.device.findMany({
      where: { userId },
      orderBy: { lastSeenAt: 'desc' },
    });
  }

  async create(
    data: CreateDeviceData,
    tx?: PrismaTransaction,
  ): Promise<Device> {
    const client = tx ?? this.prisma;
    return client.device.create({
      data: {
        userId: data.userId,
        name: data.name,
        platform: data.platform,
        appVersion: data.appVersion,
        osVersion: data.osVersion,
        pushToken: data.pushToken,
        trusted: data.trusted ?? false,
        lastSeenAt: new Date(),
      },
    });
  }

  async updateLastSeen(id: string, tx?: PrismaTransaction): Promise<Device> {
    const client = tx ?? this.prisma;
    return client.device.update({
      where: { id },
      data: { lastSeenAt: new Date() },
    });
  }

  async setTrustStatus(
    id: string,
    trusted: boolean,
    tx?: PrismaTransaction,
  ): Promise<Device> {
    const client = tx ?? this.prisma;
    return client.device.update({
      where: { id },
      data: { trusted },
    });
  }
}
