import { UniqueEntityId, InstantString, DomainEventName, DomainEvent } from '@lumora/shared';
import { OutboxStatus } from './outbox-status.js';

export interface OutboxMessageProps {
  readonly id?: UniqueEntityId | undefined;
  readonly eventId: UniqueEntityId;
  readonly eventName: DomainEventName;
  readonly aggregateId: UniqueEntityId;
  readonly workspaceId?: UniqueEntityId | undefined;
  readonly payload: Record<string, unknown>;
  readonly schemaVersion: number;
  readonly status?: OutboxStatus | undefined;
  readonly retryCount?: number | undefined;
  readonly maxRetries?: number | undefined;
  readonly lastError?: string | undefined;
  readonly lockOwnerId?: string | undefined;
  readonly lockedAt?: InstantString | undefined;
  readonly scheduledAt?: InstantString | undefined;
  readonly processedAt?: InstantString | undefined;
  readonly createdAt?: InstantString | undefined;
}

/**
 * Domain entity representing an outbox message record.
 */
export class OutboxMessage {
  public readonly id: UniqueEntityId;
  public readonly eventId: UniqueEntityId;
  public readonly eventName: DomainEventName;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId?: UniqueEntityId | undefined;
  public readonly payload: Readonly<Record<string, unknown>>;
  public readonly schemaVersion: number;
  public status: OutboxStatus;
  public retryCount: number;
  public readonly maxRetries: number;
  public lastError?: string | undefined;
  public lockOwnerId?: string | undefined;
  public lockedAt?: InstantString | undefined;
  public scheduledAt: InstantString;
  public processedAt?: InstantString | undefined;
  public readonly createdAt: InstantString;

  constructor(props: OutboxMessageProps) {
    this.id = props.id ?? new UniqueEntityId();
    this.eventId = props.eventId;
    this.eventName = props.eventName;
    this.aggregateId = props.aggregateId;
    this.workspaceId = props.workspaceId;
    this.payload = Object.freeze({ ...props.payload });
    this.schemaVersion = props.schemaVersion;
    this.status = props.status ?? OutboxStatus.PENDING;
    this.retryCount = props.retryCount ?? 0;
    this.maxRetries = props.maxRetries ?? 5;
    this.lastError = props.lastError;
    this.lockOwnerId = props.lockOwnerId;
    this.lockedAt = props.lockedAt;
    this.scheduledAt = props.scheduledAt ?? new Date().toISOString();
    this.processedAt = props.processedAt;
    this.createdAt = props.createdAt ?? new Date().toISOString();
  }

  /**
   * Factory method constructing an OutboxMessage directly from a DomainEvent contract.
   */
  public static fromDomainEvent(
    event: DomainEvent<any, any>,
    maxRetries: number = 5,
  ): OutboxMessage {
    return new OutboxMessage({
      eventId: event.eventId,
      eventName: event.eventName,
      aggregateId: event.aggregateId,
      workspaceId: event.workspaceId,
      payload: event.payload as Record<string, unknown>,
      schemaVersion: event.schemaVersion,
      maxRetries,
    });
  }

  /**
   * Evaluates whether the outbox message has exceeded its maximum retry limit.
   */
  public hasExceededMaxRetries(): boolean {
    return this.retryCount >= this.maxRetries;
  }
}
