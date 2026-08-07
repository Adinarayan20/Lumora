import {
  AggregateRoot,
  UniqueEntityId,
  Guard,
  DomainValidationException,
  TemplateInstalledEvent,
  TemplateInstallationFailedEvent,
  TemplateUpgradedEvent,
  TemplateRollbackStartedEvent,
  TemplateRollbackCompletedEvent,
  TemplateArchivedEvent,
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

const ALLOWED_TRANSITIONS: Record<InstalledTemplateStatus, Set<InstalledTemplateStatus>> = {
  [InstalledTemplateStatus.DRAFT]: new Set([
    InstalledTemplateStatus.VALIDATING,
    InstalledTemplateStatus.FAILED,
  ]),
  [InstalledTemplateStatus.VALIDATING]: new Set([
    InstalledTemplateStatus.INSTALLING,
    InstalledTemplateStatus.FAILED,
  ]),
  [InstalledTemplateStatus.INSTALLING]: new Set([
    InstalledTemplateStatus.ACTIVE,
    InstalledTemplateStatus.UPGRADED,
    InstalledTemplateStatus.ROLLING_BACK,
    InstalledTemplateStatus.FAILED,
  ]),

  [InstalledTemplateStatus.ACTIVE]: new Set([
    InstalledTemplateStatus.INSTALLING,
    InstalledTemplateStatus.UPGRADED,
    InstalledTemplateStatus.DISABLED,
    InstalledTemplateStatus.UNINSTALLING,
    InstalledTemplateStatus.ARCHIVED,
    InstalledTemplateStatus.DEPRECATED,
  ]),
  [InstalledTemplateStatus.UPGRADED]: new Set([
    InstalledTemplateStatus.ACTIVE,
    InstalledTemplateStatus.INSTALLING,
    InstalledTemplateStatus.DISABLED,
    InstalledTemplateStatus.UNINSTALLING,
    InstalledTemplateStatus.ARCHIVED,
  ]),
  [InstalledTemplateStatus.ROLLING_BACK]: new Set([
    InstalledTemplateStatus.ACTIVE,
    InstalledTemplateStatus.FAILED,
  ]),
  [InstalledTemplateStatus.FAILED]: new Set([
    InstalledTemplateStatus.INSTALLING,
    InstalledTemplateStatus.ROLLING_BACK,
    InstalledTemplateStatus.ARCHIVED,
  ]),
  [InstalledTemplateStatus.DISABLED]: new Set([
    InstalledTemplateStatus.ACTIVE,
    InstalledTemplateStatus.UNINSTALLING,
    InstalledTemplateStatus.ARCHIVED,
  ]),
  [InstalledTemplateStatus.UNINSTALLING]: new Set([
    InstalledTemplateStatus.ARCHIVED,
    InstalledTemplateStatus.DISABLED,
  ]),
  [InstalledTemplateStatus.ARCHIVED]: new Set([
    InstalledTemplateStatus.ACTIVE,
  ]),
  [InstalledTemplateStatus.DEPRECATED]: new Set([
    InstalledTemplateStatus.UNINSTALLING,
    InstalledTemplateStatus.ARCHIVED,
  ]),
};

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

  public canTransitionTo(newStatus: InstalledTemplateStatus): boolean {
    const allowed = ALLOWED_TRANSITIONS[this._status];
    return allowed ? allowed.has(newStatus) : false;
  }

  public transitionTo(newStatus: InstalledTemplateStatus): void {
    if (this._status === newStatus) return;

    if (!this.canTransitionTo(newStatus)) {
      throw new DomainValidationException(
        `Illegal template state transition from '${this._status}' to '${newStatus}' for template '${this.templateKey}'.`,
      );
    }

    this._status = newStatus;
    this.updatedAt = new Date();
  }

  public markInstalling(): void {
    this.transitionTo(InstalledTemplateStatus.INSTALLING);
  }

  public markActive(version?: string): void {
    if (version) {
      this.installedVersion = version;
    }
    this.transitionTo(InstalledTemplateStatus.ACTIVE);
    this.addDomainEvent(
      new TemplateInstalledEvent(this.id, this.workspaceId, this.templateKey, this.installedVersion),
    );
  }

  public markUpgraded(newVersion: string): void {
    const previousVersion = this.installedVersion;
    this.installedVersion = newVersion;
    this.transitionTo(InstalledTemplateStatus.UPGRADED);
    this.addDomainEvent(
      new TemplateUpgradedEvent(
        this.id,
        this.workspaceId,
        this.templateKey,
        previousVersion,
        newVersion,
      ),
    );
  }

  public markRollingBack(): void {
    this.transitionTo(InstalledTemplateStatus.ROLLING_BACK);
    this.addDomainEvent(
      new TemplateRollbackStartedEvent(this.id, this.workspaceId, this.templateKey),
    );
  }

  public markRollbackCompleted(): void {
    this.transitionTo(InstalledTemplateStatus.ACTIVE);
    this.addDomainEvent(
      new TemplateRollbackCompletedEvent(this.id, this.workspaceId, this.templateKey),
    );
  }

  public markFailed(reason: string): void {
    this.transitionTo(InstalledTemplateStatus.FAILED);
    this.addDomainEvent(
      new TemplateInstallationFailedEvent(this.id, this.workspaceId, this.templateKey, reason),
    );
  }

  public markUninstalling(): void {
    this.transitionTo(InstalledTemplateStatus.UNINSTALLING);
  }

  public markArchived(): void {
    this.transitionTo(InstalledTemplateStatus.ARCHIVED);
    this.addDomainEvent(
      new TemplateArchivedEvent(this.id, this.workspaceId, this.templateKey),
    );
  }

  public markDisabled(): void {
    this.transitionTo(InstalledTemplateStatus.DISABLED);
  }
}
