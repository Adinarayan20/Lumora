import type { UniqueEntityId } from '@lumora/shared';
import type { IPaginatedRepository } from '../../common/repositories/paginated.repository.interface.js';
import type { SpaceAggregate } from '../space.aggregate.js';
import type { SpaceSlug } from '../value-objects/space-slug.js';
import type { SpaceStatus } from '../value-objects/space-status.js';

export interface SpaceFilter extends Record<string, unknown> {
  workspaceId: UniqueEntityId;
  parentId?: UniqueEntityId;
  status?: SpaceStatus;
  isFavorite?: boolean;
}

export interface ISpaceRepository
  extends IPaginatedRepository<SpaceAggregate, UniqueEntityId, SpaceFilter> {
  findBySlug(
    workspaceId: UniqueEntityId,
    slug: SpaceSlug,
  ): Promise<SpaceAggregate | null>;
  existsBySlug(
    workspaceId: UniqueEntityId,
    slug: SpaceSlug,
  ): Promise<boolean>;
}
