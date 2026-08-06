import { AggregateRoot, UniqueEntityId, Guard } from '@lumora/shared';
import { SpaceSlug } from './value-objects/space-slug.js';
import { SpaceStatus } from './value-objects/space-status.js';
import { SpaceHierarchyPolicy } from './policies/space-hierarchy.policy.js';
import { SpaceCreatedEvent } from './events/space.events.js';

export interface SpaceAggregateProps {
  id?: UniqueEntityId;
  workspaceId: UniqueEntityId;
  parentId?: UniqueEntityId;
  createdById: UniqueEntityId;
  updatedById?: UniqueEntityId;
  slug: SpaceSlug;
  name: string;
  description?: string;
  icon?: string;
  emoji?: string;
  cover?: string;
  color?: string;
  pinnedAt?: Date;
  isFavorite?: boolean;
  status?: SpaceStatus;
  settings?: Record<string, unknown>;
  revision?: number;
  archivedAt?: Date;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain Aggregate Root representing an organizational Space container within a Workspace.
 */
export class SpaceAggregate extends AggregateRoot<UniqueEntityId> {
  public readonly workspaceId: UniqueEntityId;
  public parentId?: UniqueEntityId | undefined;
  public readonly createdById: UniqueEntityId;
  public updatedById?: UniqueEntityId | undefined;
  public slug: SpaceSlug;
  public name: string;
  public description?: string | undefined;
  public icon?: string | undefined;
  public emoji?: string | undefined;
  public cover?: string | undefined;
  public color?: string | undefined;
  public pinnedAt?: Date | undefined;
  public isFavorite: boolean;
  public status: SpaceStatus;
  public settings: Readonly<Record<string, unknown>>;
  public revision: number;
  public archivedAt?: Date | undefined;
  public deletedAt?: Date | undefined;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: SpaceAggregateProps) {
    super(props.id);
    this.workspaceId = props.workspaceId;
    this.parentId = props.parentId;
    this.createdById = props.createdById;
    this.updatedById = props.updatedById;
    this.slug = props.slug;
    this.name = props.name;
    this.description = props.description;
    this.icon = props.icon;
    this.emoji = props.emoji;
    this.cover = props.cover;
    this.color = props.color;
    this.pinnedAt = props.pinnedAt;
    this.isFavorite = props.isFavorite ?? false;
    this.status = props.status ?? SpaceStatus.ACTIVE;
    this.settings = Object.freeze({ ...(props.settings ?? {}) });
    this.revision = props.revision ?? 1;
    this.archivedAt = props.archivedAt;
    this.deletedAt = props.deletedAt;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public static create(
    props: SpaceAggregateProps,
    parentDepth: number = 0,
  ): SpaceAggregate {
    Guard.againstNullOrUndefined(props.workspaceId, 'workspaceId');
    Guard.againstNullOrUndefined(props.createdById, 'createdById');

    const nameGuard = Guard.againstEmptyString(props.name, 'name');
    if (nameGuard.isFailure) throw nameGuard.getError();

    const tempId = props.id ?? new UniqueEntityId();
    SpaceHierarchyPolicy.validateParentAssignment(tempId, props.parentId, parentDepth);

    const space = new SpaceAggregate({ ...props, id: tempId });
    space.addDomainEvent(
      new SpaceCreatedEvent(
        space.id,
        space.workspaceId,
        space.slug.toValue(),
        space.name,
        space.createdById,
        space.parentId,
      ),
    );

    return space;
  }

  public static reconstitute(props: SpaceAggregateProps): SpaceAggregate {
    return new SpaceAggregate(props);
  }

  public reparent(newParentId?: UniqueEntityId, parentDepth: number = 0): void {
    SpaceHierarchyPolicy.validateParentAssignment(this.id, newParentId, parentDepth);
    this.parentId = newParentId;
    this.revision += 1;
    this.updatedAt = new Date();
  }
}
