import { UniqueEntityId, Guard } from '@lumora/shared';
import { EmailAddress } from '../../identity/value-objects/email-address.js';
import { InvitationStatus } from '../value-objects/membership-enums.js';

export interface WorkspaceInvitationEntityProps {
  id?: UniqueEntityId;
  workspaceId: UniqueEntityId;
  email: EmailAddress;
  roleId?: UniqueEntityId;
  invitedById: UniqueEntityId;
  token: string;
  status?: InvitationStatus;
  expiresAt: Date;
  createdAt?: Date;
}

/**
 * Domain entity representing a pending membership invitation for a tenant workspace.
 */
export class WorkspaceInvitationEntity {
  public readonly id: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly email: EmailAddress;
  public readonly roleId?: UniqueEntityId | undefined;
  public readonly invitedById: UniqueEntityId;
  public readonly token: string;
  public status: InvitationStatus;
  public readonly expiresAt: Date;
  public readonly createdAt: Date;

  private constructor(props: WorkspaceInvitationEntityProps) {
    this.id = props.id ?? new UniqueEntityId();
    this.workspaceId = props.workspaceId;
    this.email = props.email;
    this.roleId = props.roleId;
    this.invitedById = props.invitedById;
    this.token = props.token;
    this.status = props.status ?? InvitationStatus.PENDING;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt ?? new Date();
  }

  public static create(
    props: WorkspaceInvitationEntityProps,
  ): WorkspaceInvitationEntity {
    const wsGuard = Guard.againstNullOrUndefined(
      props.workspaceId,
      'workspaceId',
    );
    if (wsGuard.isFailure) throw wsGuard.getError();

    const emailGuard = Guard.againstNullOrUndefined(props.email, 'email');
    if (emailGuard.isFailure) throw emailGuard.getError();

    const tokenGuard = Guard.againstEmptyString(props.token, 'token');
    if (tokenGuard.isFailure) throw tokenGuard.getError();

    return new WorkspaceInvitationEntity(props);
  }

  public accept(): void {
    this.status = InvitationStatus.ACCEPTED;
  }

  public revoke(): void {
    this.status = InvitationStatus.REVOKED;
  }
}
