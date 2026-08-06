import { UniqueEntityId } from "./unique-entity-id.js";
import type { DomainEvent } from "../events/domain-event.interface.js";

/**
 * Abstract base class for Domain Aggregate Roots.
 * Encapsulates identity equality semantics and tracks internal domain event lifecycle.
 */
export abstract class AggregateRoot<
  TId extends UniqueEntityId = UniqueEntityId,
> {
  public readonly id: TId;
  private _domainEvents: DomainEvent[] = [];

  protected constructor(id?: TId) {
    this.id = id ?? (new UniqueEntityId() as TId);
  }

  /**
   * Returns a read-only snapshot of uncommitted domain events emitted by this aggregate.
   */
  public get domainEvents(): readonly DomainEvent[] {
    return Object.freeze([...this._domainEvents]);
  }

  /**
   * Evaluates whether the aggregate root has pending uncommitted domain events.
   */
  public hasUncommittedEvents(): boolean {
    return this._domainEvents.length > 0;
  }

  /**
   * Records a domain event within the aggregate lifecycle queue.
   */
  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  /**
   * Retrieves and clears all pending domain events accumulated by this aggregate root instance.
   */
  public pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  /**
   * Clears pending domain events without returning them.
   */
  public clearEvents(): void {
    this._domainEvents = [];
  }

  /**
   * Evaluates identity equality against another aggregate root.
   */
  public equals(aggregate?: AggregateRoot<TId> | undefined): boolean {
    if (aggregate === null || aggregate === undefined) {
      return false;
    }

    if (this === aggregate) {
      return true;
    }

    if (this.constructor !== aggregate.constructor) {
      return false;
    }

    return this.id.equals(aggregate.id);
  }
}
