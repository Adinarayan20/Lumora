import type { ObjectStatus } from '../../catalog/object-status.js';

/**
 * Canonical domain model representing an instance of a Universal Object in Lumora.
 */
export interface UniversalObject {
  readonly id: string;
  readonly typeKey: string;
  readonly schemaVersion: number;
  readonly status: ObjectStatus;
  readonly attributes: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
  readonly archivedAt?: string | undefined;
}

/**
 * DTO for creating a new Universal Object instance.
 */
export interface CreateObjectInput {
  readonly typeKey: string;
  readonly attributes: Record<string, unknown>;
  readonly id?: string | undefined;
}

/**
 * DTO for updating an existing Universal Object instance attributes.
 */
export interface UpdateObjectInput {
  readonly attributes?: Record<string, unknown> | undefined;
  readonly expectedVersion?: number | undefined;
}

/**
 * Optional pagination and filter options for listing Universal Objects.
 */
export interface ObjectFilterOptions {
  readonly typeKey?: string | undefined;
  readonly status?: ObjectStatus | undefined;
  readonly limit?: number | undefined;
  readonly offset?: number | undefined;
}
