/**
 * Opaque token interface representing an active transaction context.
 * Domain repositories accept this token to participate in an ambient transaction
 * without depending on Prisma or underlying ORM types.
 */
export interface ITransactionContext {
  /**
   * Unique transaction execution identifier string.
   */
  readonly transactionId: string;
}
