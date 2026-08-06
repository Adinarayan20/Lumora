/**
 * Generic domain repository interface defining standard CRUD persistence contracts.
 * Domain contracts MUST NOT expose Prisma, ORM, or database connection details.
 */
export interface IBaseRepository<TEntity, TId> {
  /**
   * Resolves a domain aggregate entity by its unique identifier.
   */
  findById(id: TId): Promise<TEntity | null>;

  /**
   * Persists an aggregate entity (handles insert or update based on entity state).
   */
  save(entity: TEntity): Promise<void>;

  /**
   * Soft-deletes or removes an aggregate entity by its unique identifier.
   */
  delete(id: TId): Promise<void>;

  /**
   * Evaluates whether an aggregate entity exists for the given unique identifier.
   */
  exists(id: TId): Promise<boolean>;
}
