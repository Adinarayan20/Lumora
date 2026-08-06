import type { UniqueEntityId, ObjectTypeKey } from '@lumora/shared';
import type { IPaginatedRepository } from '../../common/repositories/paginated.repository.interface.js';
import type { ObjectAggregate } from '../object.aggregate.js';
import type { ObjectKey } from '../value-objects/object-key.js';
import type { ObjectStatus } from '../value-objects/object-status.js';

export interface ObjectFilter extends Record<string, unknown> {
  workspaceId: UniqueEntityId;
  spaceId?: UniqueEntityId;
  typeKey?: ObjectTypeKey;
  status?: ObjectStatus;
  isFavorite?: boolean;
}

export interface IObjectRepository extends IPaginatedRepository<
  ObjectAggregate,
  UniqueEntityId,
  ObjectFilter
> {
  findByObjectKey(
    workspaceId: UniqueEntityId,
    objectKey: ObjectKey,
  ): Promise<ObjectAggregate | null>;
  existsByObjectKey(
    workspaceId: UniqueEntityId,
    objectKey: ObjectKey,
  ): Promise<boolean>;
}
