import { Injectable, NotFoundException } from '@nestjs/common';
import { DeviceRepository } from '../repositories/device.repository';
import { Device, DevicePlatform } from '../../../generated/prisma/client.js';
import { PrismaTransaction } from '../repositories/audit-log.repository';
import { EventPublisherService } from './event-publisher.service';
import { DeviceTrustedEvent } from '../events/identity.events';

export interface DeviceMetadata {
  platform?: DevicePlatform;
  deviceName?: string;
  appVersion?: string;
  osVersion?: string;
  pushToken?: string;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class DeviceService {
  constructor(
    private readonly deviceRepository: DeviceRepository,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async findOrCreateDevice(
    userId: string,
    meta: DeviceMetadata,
    tx?: PrismaTransaction,
  ): Promise<Device> {
    const platform = meta.platform ?? DevicePlatform.WEB;
    const name =
      meta.deviceName ??
      (meta.userAgent ? meta.userAgent.slice(0, 30) : 'Unknown Device');

    let device = await this.deviceRepository.findByUserAndPlatformName(
      userId,
      platform,
      name,
      tx,
    );

    if (!device) {
      device = await this.deviceRepository.create(
        {
          userId,
          platform,
          name,
          appVersion: meta.appVersion,
          osVersion: meta.osVersion,
          pushToken: meta.pushToken,
          trusted: false,
        },
        tx,
      );
    } else {
      device = await this.deviceRepository.updateLastSeen(device.id, tx);
    }

    return device;
  }

  async getUserDevices(
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<Device[]> {
    return this.deviceRepository.findUserDevices(userId, tx);
  }

  async trustDevice(
    userId: string,
    deviceId: string,
    trusted: boolean,
    tx?: PrismaTransaction,
  ): Promise<Device> {
    const device = await this.deviceRepository.findById(deviceId, tx);
    if (!device || device.userId !== userId) {
      throw new NotFoundException('Device not found or unauthorized');
    }

    const updated = await this.deviceRepository.setTrustStatus(
      deviceId,
      trusted,
      tx,
    );

    if (trusted) {
      await this.eventPublisher.publishDeviceTrusted(
        new DeviceTrustedEvent(deviceId, userId, trusted),
        tx,
      );
    }

    return updated;
  }
}
