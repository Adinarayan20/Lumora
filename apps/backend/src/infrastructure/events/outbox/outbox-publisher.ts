import { Injectable } from '@nestjs/common';
import type { DomainEvent, DomainEventName } from '@lumora/shared';
import { PrismaOutboxRepository } from './prisma-outbox.repository.js';
import { OutboxMessage } from '../../../domain/common/events/index.js';

/**
 * Helper class for staging DomainEvent instances into the PostgreSQL Outbox table
 * within an active database transaction client.
 */
@Injectable()
export class OutboxPublisher {
  constructor(private readonly outboxRepository: PrismaOutboxRepository) {}

  /**
   * Stages a list of domain event contracts into the outbox table using the provided transaction context.
   */
  public async stageEvents(
    events: readonly DomainEvent<DomainEventName, Record<string, unknown>>[],
    transactionContext?: unknown,
  ): Promise<void> {
    for (const event of events) {
      const outboxMessage = OutboxMessage.fromDomainEvent(event);
      await this.outboxRepository.save(outboxMessage, transactionContext);
    }
  }
}
