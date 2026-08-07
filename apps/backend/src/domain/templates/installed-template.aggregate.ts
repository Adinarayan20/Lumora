import {
  AggregateRoot,
  UniqueEntityId,
  Guard,
  DomainValidationException,
} from '@lumora/shared';

export enum InstalledTemplateStatus {
  DRAFT = 'DRAFT',
  VALIDATING = 'VALIDATING',
  INSTALLING = 'INSTALLING',
  ACTIVE = 'ACTIVE',
  UPGRADED = 'UPGRADED',
  ROLLING_BACK = 'ROLLING_BACK',
  FAILED = 'FAILED',
  DISABLED = 'DISABLED',
  UNINSTALLING = 'UNINSTALLING',
  ARCHIVED = 'ARCHIVED',
  DEPRECATED = 'DEPRECATED',
}

export interface InstalledTemplateProps {
  id?: UniqueEntityId;
  workspaceId: UniqueEntityId;
  templateKey: string;
  installedVersion: string;
  status?: InstalledTemplateStatus;
  installedAt?: Date;
  updatedAt?: Date;
}

export class InstalledTemplateAggregate extends AggregateRoot<UniqueEntityId> {
  public readonly workspaceId: UniqueEntityId;
  public readonly templateKey: string;
  public installedVersion: string;
  private _status: InstalledTemplateStatus;
  public readonly installedAt: Date;
  public updatedAt: Date;

  private constructor(props: InstalledTemplateProps) {
    super(props.id);
    this.workspaceId = props.workspaceId;
    this.templateKey = props.templateKey;
    this.installedVersion = props.installedVersion;
    this._status = props.status ?? InstalledTemplateStatus.ACTIVE;
    this.installedAt = props.installedAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: InstalledTemplateProps): InstalledTemplateAggregate {
    const wsGuard = Guard.againstNullOrUndefined(props.workspaceId, 'workspaceId');
    if (wsGuard.isFailure) throw wsGuard.getError();

    if (!props.templateKey || props.templateKey.trim().length === 0) {
      throw new DomainValidationException('InstalledTemplateAggregate requires a templateKey.');
    }

    return new InstalledTemplateAggregate(props);
  }

  public get status(): InstalledTemplateStatus {
    return this._status;
  }

  public transitionTo(newStatus: InstalledTemplateStatus): void {
    this._status = newStatus;
    this.updatedAt = new Date();
  }
}
