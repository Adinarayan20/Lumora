import type { IDomainEvent } from './domain-event.interface.js';

/**
 * Pure contract interface for domain event publishing abstractions.
 * Concrete dispatching, queues, and outbox transports belong in infrastructure layers.
 */
export interface IDomainEventPublisher {
  /**
   * Publishes a single domain event contract.
   */
  publish(event: IDomainEvent<any>): Promise<void>;

  /**
   * Publishes a batch of domain event contracts atomically.
   */
  publishAll(events: readonly IDomainEvent<any>[]): Promise<void>;
}
