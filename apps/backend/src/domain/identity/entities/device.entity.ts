import { UniqueEntityId, Guard } from '@lumora/shared';

export const DevicePlatform = {
  WEB: 'WEB',
  WINDOWS: 'WINDOWS',
  MACOS: 'MACOS',
  LINUX: 'LINUX',
  ANDROID: 'ANDROID',
  IOS: 'IOS',
} as const;

export type DevicePlatform =
  (typeof DevicePlatform)[keyof typeof DevicePlatform];

export interface DeviceEntityProps {
  id?: UniqueEntityId;
  userId: UniqueEntityId;
  name: string;
  platform: DevicePlatform;
  appVersion?: string;
  osVersion?: string;
  pushToken?: string;
  trusted?: boolean;
  lastSeenAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain entity representing a user's client hardware device.
 */
export class DeviceEntity {
  public readonly id: UniqueEntityId;
  public readonly userId: UniqueEntityId;
  public name: string;
  public readonly platform: DevicePlatform;
  public appVersion?: string | undefined;
  public osVersion?: string | undefined;
  public pushToken?: string | undefined;
  public trusted: boolean;
  public lastSeenAt?: Date | undefined;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: DeviceEntityProps) {
    this.id = props.id ?? new UniqueEntityId();
    this.userId = props.userId;
    this.name = props.name;
    this.platform = props.platform;
    this.appVersion = props.appVersion;
    this.osVersion = props.osVersion;
    this.pushToken = props.pushToken;
    this.trusted = props.trusted ?? false;
    this.lastSeenAt = props.lastSeenAt;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: DeviceEntityProps): DeviceEntity {
    const userGuard = Guard.againstNullOrUndefined(props.userId, 'userId');
    if (userGuard.isFailure) throw userGuard.getError();

    const nameGuard = Guard.againstEmptyString(props.name, 'name');
    if (nameGuard.isFailure) throw nameGuard.getError();

    return new DeviceEntity(props);
  }

  public setTrust(trusted: boolean): void {
    this.trusted = trusted;
    this.updatedAt = new Date();
  }

  public touch(): void {
    this.lastSeenAt = new Date();
    this.updatedAt = new Date();
  }
}
