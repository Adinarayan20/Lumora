import {
  AggregateRoot,
  UniqueEntityId,
  Guard,
  DomainValidationException,
} from '@lumora/shared';
import { CollectionSlug } from './value-objects/collection-slug.js';
import {
  CollectionType,
  CollectionStatus,
} from './value-objects/collection-enums.js';
import { CollectionItemEntity } from './entities/collection-item.entity.js';
import { CollectionCreatedEvent } from './events/collection.events.js';

export interface CollectionAggregateProps {
  id?: UniqueEntityId;
  workspaceId: UniqueEntityId;
  createdById: UniqueEntityId;
  updatedById?: UniqueEntityId;
  slug: CollectionSlug;
  name: string;
  description?: string;
  type?: CollectionType;
  query?: Record<string, unknown>;
  icon?: string;
  emoji?: string;
  cover?: string;
  color?: string;
  pinnedAt?: Date;
  isFavorite?: boolean;
  status?: CollectionStatus;
  settings?: Record<string, unknown>;
  revision?: number;
  items?: CollectionItemEntity[];
  archivedAt?: Date;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain Aggregate Root representing a Collection grouping of Universal Objects.
 */
export class CollectionAggregate extends AggregateRoot<UniqueEntityId> {
  public readonly workspaceId: UniqueEntityId;
  public readonly createdById: UniqueEntityId;
  public updatedById?: UniqueEntityId | undefined;
  public slug: CollectionSlug;
  public name: string;
  public description?: string | undefined;
  public readonly type: CollectionType;
  public query?: Readonly<Record<string, unknown>> | undefined;
  public icon?: string | undefined;
  public emoji?: string | undefined;
  public cover?: string | undefined;
  public color?: string | undefined;
  public pinnedAt?: Date | undefined;
  public isFavorite: boolean;
  public status: CollectionStatus;
  public settings: Readonly<Record<string, unknown>>;
  public revision: number;
  private _items: Map<string, CollectionItemEntity>;
  public archivedAt?: Date | undefined;
  public deletedAt?: Date | undefined;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: CollectionAggregateProps) {
    super(props.id);
    this.workspaceId = props.workspaceId;
    this.createdById = props.createdById;
    this.updatedById = props.updatedById;
    this.slug = props.slug;
    this.name = props.name;
    this.description = props.description;
    this.type = props.type ?? CollectionType.STATIC;
    this.query = props.query ? Object.freeze({ ...props.query }) : undefined;
    this.icon = props.icon;
    this.emoji = props.emoji;
    this.cover = props.cover;
    this.color = props.color;
    this.pinnedAt = props.pinnedAt;
    this.isFavorite = props.isFavorite ?? false;
    this.status = props.status ?? CollectionStatus.ACTIVE;
    this.settings = Object.freeze({ ...(props.settings ?? {}) });
    this.revision = props.revision ?? 1;

    this._items = new Map();
    if (props.items) {
      for (const item of props.items) {
        this._items.set(item.objectId.toValue(), item);
      }
    }

    this.archivedAt = props.archivedAt;
    this.deletedAt = props.deletedAt;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public get items(): readonly CollectionItemEntity[] {
    return Object.freeze(Array.from(this._items.values()));
  }

  public static create(props: CollectionAggregateProps): CollectionAggregate {
    const wsGuard = Guard.againstNullOrUndefined(
      props.workspaceId,
      'workspaceId',
    );
    if (wsGuard.isFailure) throw wsGuard.getError();

    const userGuard = Guard.againstNullOrUndefined(
      props.createdById,
      'createdById',
    );
    if (userGuard.isFailure) throw userGuard.getError();

    const nameGuard = Guard.againstEmptyString(props.name, 'name');
    if (nameGuard.isFailure) throw nameGuard.getError();

    const collection = new CollectionAggregate(props);
    collection.addDomainEvent(
      new CollectionCreatedEvent(
        collection.id,
        collection.workspaceId,
        collection.slug.toValue(),
        collection.name,
        collection.type,
        collection.createdById,
      ),
    );

    return collection;
  }

  public static reconstitute(
    props: CollectionAggregateProps,
  ): CollectionAggregate {
    return new CollectionAggregate(props);
  }

  public addItem(
    objectId: UniqueEntityId,
    order: number = 0,
  ): CollectionItemEntity {
    if (this.type !== CollectionType.STATIC) {
      throw new DomainValidationException(
        `Cannot add explicit items to dynamic query collection.`,
        { collectionType: [`Items cannot be added to dynamic collections.`] },
      );
    }

    const key = objectId.toValue();
    if (this._items.has(key)) {
      throw new DomainValidationException(
        `Object '${key}' is already an item in collection '${this.id.toValue()}'.`,
        { objectId: [`Object is already in collection.`] },
      );
    }

    const item = CollectionItemEntity.create({
      collectionId: this.id,
      objectId,
      order,
    });

    this._items.set(key, item);
    this.revision += 1;
    this.updatedAt = new Date();

    return item;
  }

  public removeItem(objectId: UniqueEntityId): void {
    const key = objectId.toValue();
    if (!this._items.has(key)) {
      throw new DomainValidationException(
        `Object '${key}' is not an item in collection '${this.id.toValue()}'.`,
        { objectId: [`Item not found in collection.`] },
      );
    }

    this._items.delete(key);
    this.revision += 1;
    this.updatedAt = new Date();
  }
}
