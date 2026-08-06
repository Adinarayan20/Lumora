import type { DomainEvent } from './domain-event.interface.js';

/**
 * Pure contract interface for domain event publishing abstractions.
 * Accepts a read-only list of DomainEvent data contracts.
 * Concrete dispatchers, outbox persistence, and background queues belong in infrastructure layers.
 */
export interface IDomainEventPublisher {
  /**
   * Publishes one or more domain event contracts.
   */
  publish(events: readonly DomainEvent<any, any>[]): Promise<void>;
}
