import type { ITransactionContext } from './transaction-context.interface.js';

export const UNIT_OF_WORK = Symbol('IUnitOfWork');

/**
 * Domain port interface defining atomic transaction boundaries.
 * Domain interfaces MUST NOT depend on database or ORM infrastructure details.
 */
export interface IUnitOfWork {
  /**
   * Executes a set of domain operations atomically within a database transaction client.
   */
  execute<T>(work: (tx: ITransactionContext) => Promise<T>): Promise<T>;
}
