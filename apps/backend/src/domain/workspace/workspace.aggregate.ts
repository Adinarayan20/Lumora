import {
  AggregateRoot,
  UniqueEntityId,
  Guard,
  DomainValidationException,
} from '@lumora/shared';
import { WorkspaceSlug } from './value-objects/workspace-slug.js';
import {
  WorkspaceType,
  WorkspaceVisibility,
  WorkspaceStatus,
  WorkspacePlan,
} from './value-objects/workspace-enums.js';
import {
  WorkspaceCreatedEvent,
  WorkspaceOwnershipTransferredEvent,
} from './events/workspace.events.js';

export interface WorkspaceAggregateProps {
  id?: UniqueEntityId;
  name: string;
  slug: WorkspaceSlug;
  description?: string;
  icon?: string;
  emoji?: string;
  cover?: string;
  color?: string;
  type?: WorkspaceType;
  visibility?: WorkspaceVisibility;
  status?: WorkspaceStatus;
  plan?: WorkspacePlan;
  ownerId: UniqueEntityId;
  settings?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain Aggregate Root representing a multi-tenant Workspace boundary.
 */
export class WorkspaceAggregate extends AggregateRoot<UniqueEntityId> {
  public name: string;
  public slug: WorkspaceSlug;
  public description?: string | undefined;
  public icon?: string | undefined;
  public emoji?: string | undefined;
  public cover?: string | undefined;
  public color?: string | undefined;
  public readonly type: WorkspaceType;
  public visibility: WorkspaceVisibility;
  public status: WorkspaceStatus;
  public plan: WorkspacePlan;
  public ownerId: UniqueEntityId;
  public settings: Readonly<Record<string, unknown>>;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: WorkspaceAggregateProps) {
    super(props.id);
    this.name = props.name;
    this.slug = props.slug;
    this.description = props.description;
    this.icon = props.icon;
    this.emoji = props.emoji;
    this.cover = props.cover;
    this.color = props.color;
    this.type = props.type ?? WorkspaceType.CUSTOM;
    this.visibility = props.visibility ?? WorkspaceVisibility.PRIVATE;
    this.status = props.status ?? WorkspaceStatus.ACTIVE;
    this.plan = props.plan ?? WorkspacePlan.FREE;
    this.ownerId = props.ownerId;
    this.settings = Object.freeze({ ...(props.settings ?? {}) });
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: WorkspaceAggregateProps): WorkspaceAggregate {
    const nameGuard = Guard.againstEmptyString(props.name, 'name');
    if (nameGuard.isFailure) throw nameGuard.getError();

    const ownerGuard = Guard.againstNullOrUndefined(props.ownerId, 'ownerId');
    if (ownerGuard.isFailure) throw ownerGuard.getError();

    const workspace = new WorkspaceAggregate(props);
    workspace.addDomainEvent(
      new WorkspaceCreatedEvent(
        workspace.id,
        workspace.ownerId,
        workspace.name,
        workspace.slug.toValue(),
        workspace.type,
        workspace.plan,
      ),
    );

    return workspace;
  }

  public static reconstitute(
    props: WorkspaceAggregateProps,
  ): WorkspaceAggregate {
    return new WorkspaceAggregate(props);
  }

  public transferOwnership(newOwnerId: UniqueEntityId): void {
    if (this.ownerId.equals(newOwnerId)) {
      throw new DomainValidationException(
        `New owner ID is already the current workspace owner.`,
        { ownerId: [`User is already workspace owner.`] },
      );
    }

    const previousOwnerId = this.ownerId;
    this.ownerId = newOwnerId;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new WorkspaceOwnershipTransferredEvent(
        this.id,
        previousOwnerId,
        newOwnerId,
      ),
    );
  }
}
