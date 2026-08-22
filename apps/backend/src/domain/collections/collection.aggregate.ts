import {
  AggregateRoot,
  UniqueEntityId,
  Guard,
  DomainValidationException,
} from '@lumora/shared';
import { CollectionSlug } from './value-objects/collection-slug.js';
import { CollectionType } from './value-objects/collection-enums.js';
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
  items?: CollectionItemEntity[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain Aggregate Root representing a Collection: a saved static list or
 * saved dynamic query grouping of Universal Objects within a workspace.
 *
 * Deliberately minimal — see cleanup report §12. This is NOT a peer
 * aggregate to Object. It has no lifecycle (no status/archivedAt/deletedAt),
 * no CAS revision (it is not a concurrently-edited source of truth the way
 * Object is), and no presentation state (icon/emoji/cover/color/pinnedAt/
 * isFavorite/settings) — those were duplicating concerns that belong to
 * Object or to the user's own preferences, not to the grouping construct.
 *
 * A Collection either exists or is hard-deleted.
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
  private _items: Map<string, CollectionItemEntity>;
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

    this._items = new Map();
    if (props.items) {
      for (const item of props.items) {
        this._items.set(item.objectId.toValue(), item);
      }
    }

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

  public updateDetails(
    updatedById: UniqueEntityId,
    props: {
      name?: string;
      description?: string;
      query?: Record<string, unknown>;
    },
  ): void {
    if (props.name !== undefined) this.name = props.name;
    if (props.description !== undefined) this.description = props.description;
    if (props.query !== undefined) {
      this.query = Object.freeze({ ...props.query });
    }
    this.updatedById = updatedById;
    this.updatedAt = new Date();
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
    this.updatedAt = new Date();
  }
}
