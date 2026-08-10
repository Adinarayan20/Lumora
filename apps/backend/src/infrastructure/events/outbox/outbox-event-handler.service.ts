import { Injectable, Logger } from '@nestjs/common';
import type {
  IDomainEventPublisher,
  DomainEvent,
  DomainEventName,
} from '@lumora/shared';
import { ObjectEventName } from '@lumora/shared';
import { RecordTimelineActivityUseCase } from '../../../modules/timeline/use-cases/record-timeline-activity.use-case.js';
import { IndexEntityUseCase } from '../../../modules/search/use-cases/index-entity.use-case.js';
import { RemoveSearchIndexUseCase } from '../../../modules/search/use-cases/remove-search-index.use-case.js';
import type {
  ObjectCreatedEvent,
  ObjectUpdatedEvent,
  ObjectDeletedEvent,
} from '../../../domain/objects/events/object.events.js';

type ObjectDomainEvent = DomainEvent<DomainEventName, Record<string, unknown>>;

/**
 * OutboxEventHandlerService — wires Outbox-dispatched domain events to real consumers.
 *
 * This service implements IDomainEventPublisher and replaces the no-op NestEventPublisher
 * logging shell for the events this application currently needs to handle:
 *   - ObjectCreatedEvent  → Timeline record + Search index entry
 *   - ObjectUpdatedEvent  → Timeline record + Search index update
 *   - ObjectDeletedEvent  → Timeline record + Search index removal
 *
 * Architecture: Outbox worker dispatches via IDomainEventPublisher.publish().
 * This service receives that call and routes to the appropriate use cases.
 *
 * Each handler is fire-and-ignore-individual-failures: one failing handler
 * must not prevent others from executing (IGNORE failure policy for async projections).
 */
@Injectable()
export class OutboxEventHandlerService implements IDomainEventPublisher {
  private readonly logger = new Logger(OutboxEventHandlerService.name);

  constructor(
    private readonly recordTimelineActivity: RecordTimelineActivityUseCase,
    private readonly indexEntity: IndexEntityUseCase,
    private readonly removeSearchIndex: RemoveSearchIndexUseCase,
  ) {}

  public async publish(events: readonly ObjectDomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.handleEvent(event);
    }
  }

  private async handleEvent(event: ObjectDomainEvent): Promise<void> {
    const handlers: Array<() => Promise<void>> = [];

    switch (event.eventName) {
      case ObjectEventName.CREATED:
        handlers.push(
          () =>
            this.handleObjectCreated(event as unknown as ObjectCreatedEvent),
          () => this.handleSearchIndex(event, 'created'),
        );
        break;

      case ObjectEventName.UPDATED:
        handlers.push(
          () =>
            this.handleObjectUpdated(event as unknown as ObjectUpdatedEvent),
          () => this.handleSearchIndex(event, 'updated'),
        );
        break;

      case ObjectEventName.DELETED:
        handlers.push(
          () =>
            this.handleObjectDeleted(event as unknown as ObjectDeletedEvent),
          () => this.handleSearchRemove(event),
        );
        break;

      case ObjectEventName.ARCHIVED:
        handlers.push(() =>
          this.handleTimelineRecord(event, ObjectEventName.ARCHIVED),
        );
        break;

      case ObjectEventName.RESTORED:
        handlers.push(() =>
          this.handleTimelineRecord(event, ObjectEventName.RESTORED),
        );
        break;

      default:
        // Unknown event type — log and skip, do not throw
        this.logger.debug(
          `[OutboxEventHandler] No handler registered for event: ${event.eventName}`,
        );
        return;
    }

    // Execute all handlers, collecting failures without aborting others
    await Promise.allSettled(
      handlers.map(async (h) => {
        try {
          await h();
        } catch (err) {
          this.logger.error(
            `[OutboxEventHandler] Handler failed for event '${event.eventName}' [aggregateId: ${event.aggregateId?.toValue()}]: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }),
    );
  }

  // ─── Timeline handlers ──────────────────────────────────────────────────────

  private async handleObjectCreated(event: ObjectCreatedEvent): Promise<void> {
    const workspaceId = event.workspaceId?.toValue();
    if (!workspaceId) return;

    await this.recordTimelineActivity.execute({
      dto: {
        workspaceId,
        userId: event.payload.createdById,
        entityCategory: 'OBJECT',
        entityId: event.aggregateId.toValue(),
        action: ObjectEventName.CREATED,
        metadata: {
          objectKey: event.payload.objectKey,
          typeKey: event.payload.typeKey,
          title: event.payload.title,
        },
      },
    });
  }

  private async handleObjectUpdated(event: ObjectUpdatedEvent): Promise<void> {
    const workspaceId = event.workspaceId?.toValue();
    if (!workspaceId) return;

    await this.recordTimelineActivity.execute({
      dto: {
        workspaceId,
        userId: event.payload.updatedById,
        entityCategory: 'OBJECT',
        entityId: event.aggregateId.toValue(),
        action: ObjectEventName.UPDATED,
        metadata: {
          updatedById: event.payload.updatedById,
        },
      },
    });
  }

  private async handleObjectDeleted(event: ObjectDeletedEvent): Promise<void> {
    const workspaceId = event.workspaceId?.toValue();
    if (!workspaceId) return;

    await this.recordTimelineActivity.execute({
      dto: {
        workspaceId,
        userId: event.payload.deletedById,
        entityCategory: 'OBJECT',
        entityId: event.aggregateId.toValue(),
        action: ObjectEventName.DELETED,
        metadata: {
          deletedById: event.payload.deletedById,
        },
      },
    });
  }

  private async handleTimelineRecord(
    event: ObjectDomainEvent,
    action: string,
  ): Promise<void> {
    const workspaceId = event.workspaceId?.toValue();
    if (!workspaceId) return;

    const actorId =
      (event.payload.updatedById as string) ||
      (event.payload.deletedById as string) ||
      (event.payload.createdById as string);

    await this.recordTimelineActivity.execute({
      dto: {
        workspaceId,
        userId: actorId,
        entityCategory: 'OBJECT',
        entityId: event.aggregateId.toValue(),
        action,
        metadata: { ...event.payload },
      },
    });
  }

  // ─── Search handlers ─────────────────────────────────────────────────────────

  private async handleSearchIndex(
    event: ObjectDomainEvent,
    _operation: 'created' | 'updated',
  ): Promise<void> {
    const workspaceId = event.workspaceId?.toValue();
    if (!workspaceId) return;

    const title =
      (event.payload.title as string) ||
      (event.payload.objectKey as string) ||
      event.aggregateId.toValue();

    await this.indexEntity.execute({
      dto: {
        workspaceId,
        entityCategory: 'OBJECT',
        entityId: event.aggregateId.toValue(),
        title,
        content: title,
      },
    });
  }

  private async handleSearchRemove(event: ObjectDomainEvent): Promise<void> {
    const workspaceId = event.workspaceId?.toValue();
    if (!workspaceId) return;

    await this.removeSearchIndex.execute({
      workspaceId,
      entityCategory: 'OBJECT',
      entityId: event.aggregateId.toValue(),
    });
  }
}
