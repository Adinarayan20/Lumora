import type {
  UniversalObject,
  ObjectFilterOptions,
} from "../types/universal-object.types.js";

/**
 * Universal Object Repository Port / Interface.
 * Decouples domain runtime from database, network, and storage engine implementations.
 */
export interface IObjectRepository {
  /**
   * Resolves a Universal Object by its unique ID. Returns null if not found.
   */
  getById(id: string): Promise<UniversalObject | null>;

  /**
   * Persists a new Universal Object. Throws ObjectAlreadyExistsException if ID collides.
   */
  create(object: UniversalObject): Promise<UniversalObject>;

  /**
   * Updates an existing Universal Object. Throws ObjectNotFoundException or ObjectConcurrencyException.
   * If expectedVersion is provided, atomic compare-and-swap verification is required.
   */
  update(
    object: UniversalObject,
    expectedVersion?: number,
  ): Promise<UniversalObject>;

  /**
   * Queries Universal Objects matching optional filter criteria.
   */
  list(options?: ObjectFilterOptions): Promise<readonly UniversalObject[]>;

  /**
   * Soft deletes or archives a Universal Object by ID. Returns updated object.
   */
  archive(
    id: string,
    archivedAtIso: string,
    updatedAtIso: string,
  ): Promise<UniversalObject>;

  /**
   * Restores an archived Universal Object by ID. Returns updated object.
   */
  restore(id: string, updatedAtIso: string): Promise<UniversalObject>;
}
