import type { UniqueEntityId } from '@lumora/shared';
import type { IPaginatedRepository } from '../../common/repositories/paginated.repository.interface.js';
import type { WorkspaceAggregate } from '../workspace.aggregate.js';
import type { WorkspaceSlug } from '../value-objects/workspace-slug.js';
import type { WorkspaceStatus, WorkspaceType } from '../value-objects/workspace-enums.js';

export interface WorkspaceFilter extends Record<string, unknown> {
  ownerId?: UniqueEntityId;
  status?: WorkspaceStatus;
  type?: WorkspaceType;
}

export interface IWorkspaceRepository
  extends IPaginatedRepository<WorkspaceAggregate, UniqueEntityId, WorkspaceFilter> {
  findBySlug(slug: WorkspaceSlug): Promise<WorkspaceAggregate | null>;
  existsBySlug(slug: WorkspaceSlug): Promise<boolean>;
}
