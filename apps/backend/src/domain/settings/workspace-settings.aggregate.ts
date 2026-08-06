import { AggregateRoot, UniqueEntityId, Guard } from '@lumora/shared';
import { RetentionDays } from './value-objects/retention-days.js';

export interface WorkspaceSettingsAggregateProps {
  id?: UniqueEntityId;
  workspaceId: UniqueEntityId;
  defaultRole: string;
  allowGuestAccess: boolean;
  retentionDays: RetentionDays;
  enforceMfa: boolean;
  updatedAt?: Date;
}

export class WorkspaceSettingsAggregate extends AggregateRoot<UniqueEntityId> {
  public readonly workspaceId: UniqueEntityId;
  public defaultRole: string;
  public allowGuestAccess: boolean;
  public retentionDays: RetentionDays;
  public enforceMfa: boolean;
  public updatedAt: Date;

  private constructor(props: WorkspaceSettingsAggregateProps) {
    super(props.id);
    this.workspaceId = props.workspaceId;
    this.defaultRole = props.defaultRole;
    this.allowGuestAccess = props.allowGuestAccess;
    this.retentionDays = props.retentionDays;
    this.enforceMfa = props.enforceMfa;
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public static create(
    props: {
      id?: UniqueEntityId;
      workspaceId: UniqueEntityId;
      defaultRole?: string;
      allowGuestAccess?: boolean;
      retentionDays?: RetentionDays | number;
      enforceMfa?: boolean;
      updatedAt?: Date;
    },
  ): WorkspaceSettingsAggregate {
    const wsGuard = Guard.againstNullOrUndefined(
      props.workspaceId,
      'workspaceId',
    );
    if (wsGuard.isFailure) throw wsGuard.getError();

    const retentionObj =
      typeof props.retentionDays === 'number'
        ? RetentionDays.create(props.retentionDays)
        : (props.retentionDays ?? RetentionDays.create(365));

    return new WorkspaceSettingsAggregate({
      ...props,
      defaultRole: props.defaultRole ?? 'MEMBER',
      allowGuestAccess: props.allowGuestAccess ?? false,
      retentionDays: retentionObj,
      enforceMfa: props.enforceMfa ?? false,
    });
  }

  public static reconstitute(
    props: WorkspaceSettingsAggregateProps,
  ): WorkspaceSettingsAggregate {
    return new WorkspaceSettingsAggregate(props);
  }

  public updateRetentionPolicy(retentionDays: RetentionDays | number): void {
    this.retentionDays =
      typeof retentionDays === 'number'
        ? RetentionDays.create(retentionDays)
        : retentionDays;
    this.updatedAt = new Date();
  }

  public toggleGuestAccess(allowed: boolean): void {
    this.allowGuestAccess = allowed;
    this.updatedAt = new Date();
  }
}
