import type { UniqueEntityId, ObjectTypeKey } from '@lumora/shared';
import type { IPaginatedRepository } from '../../common/repositories/paginated.repository.interface.js';
import type { ObjectAggregate } from '../object.aggregate.js';
import type { ObjectKey } from '../value-objects/object-key.js';
import type { ObjectStatus } from '../value-objects/object-status.js';

/**
 * Domain Aggregate Repository Port for ObjectAggregate.
 *
 * Architecture status: APPROVED / PARTIALLY IMPLEMENTED
 *
 * This interface is the domain-layer repository contract operating on ObjectAggregate entities.
 * It is semantically distinct from IObjectRepository in @lumora/shared, which operates on
 * UniversalObject (the platform persistence DTO) and is implemented by PrismaObjectRepository.
 *
 * IObjectAggregateRepository provides domain-specific query capabilities (objectKey lookup,
 * paginated listing, status filtering) that represent domain concepts, not persistence details.
 *
 * DI binding status: Currently bound to Tier 3 ObjectRepository (legacy, raw Prisma).
 * Migration target: A domain-aware adapter that uses PrismaObjectRepository internally.
 * See: ADR-016 — Three-Tier Object Repository Migration Path.
 *
 * RULE: No new feature may create a new binding to Tier 3 ObjectRepository.
 */
export interface ObjectFilter extends Record<string, unknown> {
  workspaceId: UniqueEntityId;
  typeKey?: ObjectTypeKey;
  status?: ObjectStatus;
  isFavorite?: boolean;
}

export interface IObjectAggregateRepository extends IPaginatedRepository<
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

/**
 * @deprecated Use IObjectAggregateRepository instead.
 * This re-export exists only to prevent immediate compilation failures in consumers
 * during the migration to the renamed interface. Remove after all consumers are updated.
 * See ADR-016.
 */
export type IObjectRepository = IObjectAggregateRepository;
