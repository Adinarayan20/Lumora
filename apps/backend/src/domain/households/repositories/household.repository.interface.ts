import type { UniqueEntityId } from '@lumora/shared';
import type { HouseholdAggregate } from '../household.aggregate.js';

export interface IHouseholdRepository {
  findById(id: UniqueEntityId): Promise<HouseholdAggregate | null>;
  findByWorkspaceId(
    workspaceId: UniqueEntityId,
  ): Promise<HouseholdAggregate | null>;
  save(household: HouseholdAggregate): Promise<void>;
  delete(id: UniqueEntityId): Promise<void>;
}
