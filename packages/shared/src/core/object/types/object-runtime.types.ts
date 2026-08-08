import type { ObjectDefinition } from '../../catalog/object-definition.js';
import type { SchemaDefinition } from '../../catalog/schema-definition.js';
import type { IObjectRepository } from '../repository/object-repository.interface.js';

/**
 * Pluggable clock abstraction for deterministic timestamping in tests and execution environments.
 */
export interface ClockProvider {
  nowIso(): string;
}

/**
 * Pluggable ID generator abstraction for unique identity generation.
 */
export interface IdGeneratorProvider {
  generate(): string;
}

/**
 * Dependency injection container options for constructing an ObjectRuntime instance.
 */
export interface ObjectRuntimeDependencies {
  readonly repository: IObjectRepository;
  readonly clock?: ClockProvider;
  readonly idGenerator?: IdGeneratorProvider;
}

/**
 * Options for creating a new Universal Object via ObjectRuntime.
 */
export interface CreateObjectOptions {
  readonly definition: ObjectDefinition;
  readonly schema: SchemaDefinition;
  readonly attributes: Record<string, unknown>;
  readonly id?: string;
}

/**
 * Options for patching an existing Universal Object via ObjectRuntime.
 */
export interface UpdateObjectOptions {
  readonly id: string;
  readonly schema: SchemaDefinition;
  readonly attributes: Record<string, unknown>;
  readonly expectedVersion?: number;
}
