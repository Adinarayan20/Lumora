import type { UniqueEntityId } from '@lumora/shared';
import type { IBaseRepository } from '../common/repositories/base.repository.interface.js';
import type { RoleAggregate } from './role.aggregate.js';

export interface IRoleRepository
  extends IBaseRepository<RoleAggregate, UniqueEntityId> {
  findByName(workspaceId: UniqueEntityId, name: string): Promise<RoleAggregate | null>;
  findSystemRoles(workspaceId: UniqueEntityId): Promise<readonly RoleAggregate[]>;
}
