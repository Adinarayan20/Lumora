/**
 * Operational status constants for transactional outbox records.
 */
export const OutboxStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type OutboxStatus = (typeof OutboxStatus)[keyof typeof OutboxStatus];
