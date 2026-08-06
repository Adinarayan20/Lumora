import type { UniqueEntityId } from '@lumora/shared';
import type { IPaginatedRepository } from '../../common/repositories/paginated.repository.interface.js';
import type { CollectionAggregate } from '../collection.aggregate.js';
import type { CollectionSlug } from '../value-objects/collection-slug.js';
import type { CollectionType, CollectionStatus } from '../value-objects/collection-enums.js';

export interface CollectionFilter extends Record<string, unknown> {
  workspaceId: UniqueEntityId;
  type?: CollectionType;
  status?: CollectionStatus;
  isFavorite?: boolean;
}

export interface ICollectionRepository
  extends IPaginatedRepository<CollectionAggregate, UniqueEntityId, CollectionFilter> {
  findBySlug(
    workspaceId: UniqueEntityId,
    slug: CollectionSlug,
  ): Promise<CollectionAggregate | null>;
  existsBySlug(
    workspaceId: UniqueEntityId,
    slug: CollectionSlug,
  ): Promise<boolean>;
}
