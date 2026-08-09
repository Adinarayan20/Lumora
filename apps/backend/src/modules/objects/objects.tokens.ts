/**
 * DI token for the ObjectAggregateRepositoryAdapter factory.
 *
 * The factory accepts (workspaceId: string, userId: string) and returns
 * an IObjectAggregateRepository scoped to that workspace execution context.
 *
 * Use cases inject this token and call factory(workspaceId, userId) per command.
 * This avoids REQUEST-scoped providers while keeping workspace isolation correct.
 *
 * ADR-016: OBJECT_REPOSITORY_TOKEN (Tier 3 binding) has been retired.
 */
export const OBJECT_AGGREGATE_REPOSITORY_FACTORY_TOKEN =
  'IObjectAggregateRepositoryFactory';

export type ObjectAggregateRepositoryFactory = (
  workspaceId: string,
  userId: string,
) => import('../../domain/objects/repositories/object-aggregate.repository.interface.js').IObjectAggregateRepository;
