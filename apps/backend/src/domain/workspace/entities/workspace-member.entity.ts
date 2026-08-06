import { UniqueEntityId, Guard } from '@lumora/shared';
import { WorkspaceMemberStatus } from '../value-objects/membership-enums.js';

export interface WorkspaceMemberEntityProps {
  id?: UniqueEntityId;
  workspaceId: UniqueEntityId;
  userId: UniqueEntityId;
  roleId?: UniqueEntityId;
  status?: WorkspaceMemberStatus;
  joinedAt?: Date;
}

/**
 * Domain entity representing a User's membership inside a Workspace tenant context.
 */
export class WorkspaceMemberEntity {
  public readonly id: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly userId: UniqueEntityId;
  public roleId?: UniqueEntityId | undefined;
  public status: WorkspaceMemberStatus;
  public readonly joinedAt: Date;

  private constructor(props: WorkspaceMemberEntityProps) {
    this.id = props.id ?? new UniqueEntityId();
    this.workspaceId = props.workspaceId;
    this.userId = props.userId;
    this.roleId = props.roleId;
    this.status = props.status ?? WorkspaceMemberStatus.ACTIVE;
    this.joinedAt = props.joinedAt ?? new Date();
  }

  public static create(
    props: WorkspaceMemberEntityProps,
  ): WorkspaceMemberEntity {
    const wsGuard = Guard.againstNullOrUndefined(
      props.workspaceId,
      'workspaceId',
    );
    if (wsGuard.isFailure) throw wsGuard.getError();

    const userGuard = Guard.againstNullOrUndefined(props.userId, 'userId');
    if (userGuard.isFailure) throw userGuard.getError();

    return new WorkspaceMemberEntity(props);
  }

  public assignRole(roleId: UniqueEntityId): void {
    this.roleId = roleId;
  }
}
