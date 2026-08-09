/**
 * @deprecated This file is superseded by object-aggregate.repository.interface.ts.
 *
 * The interface formerly named IObjectRepository operating on ObjectAggregate has been
 * renamed to IObjectAggregateRepository to eliminate naming collision with the authoritative
 * platform repository port in @lumora/shared.
 *
 * This re-export exists only to prevent immediate compilation failures in consumers
 * during the migration period. See ADR-016 for migration timeline and target state.
 *
 * DO NOT ADD NEW IMPORTS FROM THIS FILE.
 * Update all imports to: domain/objects/repositories/object-aggregate.repository.interface.ts
 */
export type {
  IObjectAggregateRepository,
  IObjectAggregateRepository as IObjectRepository, // temporary backward-compatibility alias
  ObjectFilter,
} from './object-aggregate.repository.interface.js';
