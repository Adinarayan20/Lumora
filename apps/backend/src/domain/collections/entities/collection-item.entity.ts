import { UniqueEntityId, Guard } from '@lumora/shared';

export interface CollectionItemEntityProps {
  id?: UniqueEntityId;
  collectionId: UniqueEntityId;
  objectId: UniqueEntityId;
  order?: number;
  addedAt?: Date;
}

/**
 * Domain entity representing an ordered item reference from a Collection to an Object.
 */
export class CollectionItemEntity {
  public readonly id: UniqueEntityId;
  public readonly collectionId: UniqueEntityId;
  public readonly objectId: UniqueEntityId;
  public order: number;
  public readonly addedAt: Date;

  private constructor(props: CollectionItemEntityProps) {
    this.id = props.id ?? new UniqueEntityId();
    this.collectionId = props.collectionId;
    this.objectId = props.objectId;
    this.order = props.order ?? 0;
    this.addedAt = props.addedAt ?? new Date();
  }

  public static create(props: CollectionItemEntityProps): CollectionItemEntity {
    const colGuard = Guard.againstNullOrUndefined(props.collectionId, 'collectionId');
    if (colGuard.isFailure) throw colGuard.getError();

    const objGuard = Guard.againstNullOrUndefined(props.objectId, 'objectId');
    if (objGuard.isFailure) throw objGuard.getError();

    return new CollectionItemEntity(props);
  }
}
