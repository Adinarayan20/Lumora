import {
  AggregateRoot,
  UniqueEntityId,
  Guard,
  DomainValidationException,
  ObjectCatalogRegistry,
  ObjectTypeKey,
} from '@lumora/shared';
import { ObjectTitle } from './value-objects/object-title.js';
import { ObjectKey } from './value-objects/object-key.js';
import { ObjectStatus } from './value-objects/object-status.js';
import {
  ObjectCreatedEvent,
  ObjectUpdatedEvent,
  ObjectDeletedEvent,
} from './events/object.events.js';

export interface ObjectAggregateProps {
  id?: UniqueEntityId;
  workspaceId: UniqueEntityId;
  spaceId?: UniqueEntityId;
  createdById: UniqueEntityId;
  updatedById?: UniqueEntityId;
  objectKey: ObjectKey;
  typeKey: ObjectTypeKey;
  title: ObjectTitle;
  description?: string;
  icon?: string;
  emoji?: string;
  cover?: string;
  color?: string;
  pinnedAt?: Date;
  isFavorite?: boolean;
  status?: ObjectStatus;
  systemData?: Record<string, unknown>;
  attributes?: Record<string, unknown>;
  revision?: number;
  archivedAt?: Date;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain Aggregate Root representing a Lumora Universal Object instance.
 */
export class ObjectAggregate extends AggregateRoot<UniqueEntityId> {
  public readonly workspaceId: UniqueEntityId;
  public spaceId?: UniqueEntityId | undefined;
  public readonly createdById: UniqueEntityId;
  public updatedById?: UniqueEntityId | undefined;
  public readonly objectKey: ObjectKey;
  public readonly typeKey: ObjectTypeKey;
  public title: ObjectTitle;
  public description?: string | undefined;
  public icon?: string | undefined;
  public emoji?: string | undefined;
  public cover?: string | undefined;
  public color?: string | undefined;
  public pinnedAt?: Date | undefined;
  public isFavorite: boolean;
  public status: ObjectStatus;
  public systemData: Readonly<Record<string, unknown>>;
  public attributes: Readonly<Record<string, unknown>>;
  public revision: number;
  public archivedAt?: Date | undefined;
  public deletedAt?: Date | undefined;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: ObjectAggregateProps) {
    super(props.id);
    this.workspaceId = props.workspaceId;
    this.spaceId = props.spaceId;
    this.createdById = props.createdById;
    this.updatedById = props.updatedById;
    this.objectKey = props.objectKey;
    this.typeKey = props.typeKey;
    this.title = props.title;
    this.description = props.description;
    this.icon = props.icon;
    this.emoji = props.emoji;
    this.cover = props.cover;
    this.color = props.color;
    this.pinnedAt = props.pinnedAt;
    this.isFavorite = props.isFavorite ?? false;
    this.status = props.status ?? ObjectStatus.ACTIVE;
    this.systemData = Object.freeze({ ...(props.systemData ?? {}) });
    this.attributes = Object.freeze({ ...(props.attributes ?? {}) });
    this.revision = props.revision ?? 1;
    this.archivedAt = props.archivedAt;
    this.deletedAt = props.deletedAt;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: ObjectAggregateProps): ObjectAggregate {
    const wsGuard = Guard.againstNullOrUndefined(props.workspaceId, 'workspaceId');
    if (wsGuard.isFailure) throw wsGuard.getError();

    const userGuard = Guard.againstNullOrUndefined(props.createdById, 'createdById');
    if (userGuard.isFailure) throw userGuard.getError();

    if (!ObjectCatalogRegistry.has(props.typeKey)) {
      throw new DomainValidationException(
        `Object typeKey '${props.typeKey}' is not registered in the Lumora Catalog.`,
        { typeKey: [`Invalid typeKey ${props.typeKey}.`] },
      );
    }

    const aggregate = new ObjectAggregate(props);
    aggregate.addDomainEvent(
      new ObjectCreatedEvent(
        aggregate.id,
        aggregate.workspaceId,
        aggregate.objectKey.toValue(),
        aggregate.typeKey,
        aggregate.title.toValue(),
        aggregate.createdById,
        aggregate.spaceId,
      ),
    );

    return aggregate;
  }

  public static reconstitute(props: ObjectAggregateProps): ObjectAggregate {
    return new ObjectAggregate(props);
  }

  public updateDetails(
    updatedById: UniqueEntityId,
    title: ObjectTitle,
    description?: string,
    attributes?: Record<string, unknown>,
  ): void {
    this.title = title;
    this.description = description;
    if (attributes) {
      this.attributes = Object.freeze({ ...attributes });
    }
    this.updatedById = updatedById;
    this.revision += 1;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new ObjectUpdatedEvent(this.id, this.workspaceId, updatedById),
    );
  }

  public softDelete(deletedById: UniqueEntityId): void {
    this.status = ObjectStatus.DELETED;
    this.deletedAt = new Date();
    this.updatedById = deletedById;
    this.revision += 1;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new ObjectDeletedEvent(this.id, this.workspaceId, deletedById),
    );
  }
}
