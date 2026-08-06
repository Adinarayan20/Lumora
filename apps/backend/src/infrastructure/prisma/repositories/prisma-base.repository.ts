import type { IBaseRepository } from '../../../domain/common/repositories/base.repository.interface.js';
import { PrismaExceptionMapper } from '../mappers/prisma-exception.mapper.js';

/**
 * Abstract base repository for Prisma-backed persistence implementations.
 * Enforces domain repository contracts while mapping database infrastructure errors.
 */
export abstract class PrismaBaseRepository<TEntity, TId, TPrismaModel>
  implements IBaseRepository<TEntity, TId> {
  protected constructor(protected readonly entityName: string) {}

  public abstract findById(id: TId): Promise<TEntity | null>;
  public abstract save(entity: TEntity): Promise<void>;
  public abstract delete(id: TId): Promise<void>;
  public abstract exists(id: TId): Promise<boolean>;

  /**
   * Abstract mapping method converting database persistence model to Domain Aggregate Entity.
   */
  protected abstract toDomain(model: TPrismaModel): TEntity;

  /**
   * Abstract mapping method converting Domain Aggregate Entity to database persistence payload.
   */
  protected abstract toPersistence(entity: TEntity): Record<string, unknown>;

  /**
   * Executes a database persistence operation safely, catching and mapping Prisma errors.
   */
  protected async executeSafely<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error, this.entityName);
    }
  }
}
