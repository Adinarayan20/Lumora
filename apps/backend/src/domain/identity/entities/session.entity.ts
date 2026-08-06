import { UniqueEntityId, Guard } from '@lumora/shared';

export const SessionStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED',
} as const;

export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

export interface SessionEntityProps {
  id?: UniqueEntityId;
  userId: UniqueEntityId;
  deviceId: UniqueEntityId;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  status?: SessionStatus;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain entity representing an authenticated JWT user session.
 */
export class SessionEntity {
  public readonly id: UniqueEntityId;
  public readonly userId: UniqueEntityId;
  public readonly deviceId: UniqueEntityId;
  public readonly accessToken: string;
  public readonly refreshToken: string;
  public readonly expiresAt: Date;
  public status: SessionStatus;
  public readonly ipAddress?: string | undefined;
  public readonly userAgent?: string | undefined;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: SessionEntityProps) {
    this.id = props.id ?? new UniqueEntityId();
    this.userId = props.userId;
    this.deviceId = props.deviceId;
    this.accessToken = props.accessToken;
    this.refreshToken = props.refreshToken;
    this.expiresAt = props.expiresAt;
    this.status = props.status ?? SessionStatus.ACTIVE;
    this.ipAddress = props.ipAddress;
    this.userAgent = props.userAgent;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: SessionEntityProps): SessionEntity {
    const userGuard = Guard.againstNullOrUndefined(props.userId, 'userId');
    if (userGuard.isFailure) throw userGuard.getError();

    const deviceGuard = Guard.againstNullOrUndefined(
      props.deviceId,
      'deviceId',
    );
    if (deviceGuard.isFailure) throw deviceGuard.getError();

    const accessGuard = Guard.againstEmptyString(
      props.accessToken,
      'accessToken',
    );
    if (accessGuard.isFailure) throw accessGuard.getError();

    const refreshGuard = Guard.againstEmptyString(
      props.refreshToken,
      'refreshToken',
    );
    if (refreshGuard.isFailure) throw refreshGuard.getError();

    return new SessionEntity(props);
  }

  public revoke(): void {
    this.status = SessionStatus.REVOKED;
    this.updatedAt = new Date();
  }

  public isExpired(): boolean {
    return (
      this.expiresAt.getTime() <= Date.now() ||
      this.status === SessionStatus.EXPIRED ||
      this.status === SessionStatus.REVOKED
    );
  }
}
