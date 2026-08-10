import { Injectable, Logger } from '@nestjs/common';
import type { IDomainEventPublisher, DomainEvent } from '@lumora/shared';

/**
 * NestEventPublisher — in-process domain event publisher.
 *
 * At the current scale (single-node PostgreSQL outbox) this publisher logs
 * dispatched events. Future phases can replace with NestJS EventEmitter2,
 * BullMQ, or an external message bus without touching domain code.
 *
 * This is the concrete IDomainEventPublisher injected into OutboxWorker.
 */
@Injectable()
export class NestEventPublisher implements IDomainEventPublisher {
  private readonly logger = new Logger(NestEventPublisher.name);

  public publish(events: readonly DomainEvent<any, any>[]): Promise<void> {
    for (const event of events) {
      this.logger.log(
        `[OutboxPublished] eventName=${event.eventName} aggregateId=${event.aggregateId?.toValue()} workspaceId=${event.workspaceId?.toValue()}`,
      );
    }
    return Promise.resolve();
  }
}
