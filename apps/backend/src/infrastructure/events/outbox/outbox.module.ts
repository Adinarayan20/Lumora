import {
  Global,
  Module,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  Optional,
} from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { PrismaOutboxRepository } from './prisma-outbox.repository.js';
import { OutboxPublisher } from './outbox-publisher.js';
import { OutboxWorker } from './outbox-worker.js';
import { NestEventPublisher } from './nest-event-publisher.js';
import { OutboxEventHandlerService } from './outbox-event-handler.service.js';
import type { IOutboxRepository } from '../../../domain/common/repositories/outbox.repository.interface.js';
import type { IDomainEventPublisher } from '@lumora/shared';
import {
  BACKGROUND_JOB_DISPATCHER_TOKEN,
  type IBackgroundJobDispatcher,
} from '../../../application/jobs/interfaces/background-job-dispatcher.interface.js';
import { TimelineModule } from '../../../modules/timeline/timeline.module.js';
import { SearchModule } from '../../../modules/search/search.module.js';

export const OUTBOX_REPOSITORY_TOKEN = 'IOutboxRepository';
export const DOMAIN_EVENT_PUBLISHER_TOKEN = 'IDomainEventPublisher';

/**
 * OutboxModule — Global infrastructure module for the Transactional Outbox.
 *
 * IDomainEventPublisher is now wired to OutboxEventHandlerService which routes
 * dispatched events to real consumers:
 *   - ObjectCreatedEvent / UpdatedEvent / DeletedEvent → RecordTimelineActivityUseCase
 *   - ObjectCreatedEvent / UpdatedEvent → IndexEntityUseCase
 *   - ObjectDeletedEvent → RemoveSearchIndexUseCase
 *
 * NestEventPublisher remains as a fallback logger for unhandled event types.
 */
@Global()
@Module({
  imports: [PrismaModule, TimelineModule, SearchModule],
  providers: [
    PrismaOutboxRepository,
    NestEventPublisher,
    OutboxEventHandlerService,

    {
      provide: OUTBOX_REPOSITORY_TOKEN,
      useClass: PrismaOutboxRepository,
    },

    // Wire real event handler as the IDomainEventPublisher
    {
      provide: DOMAIN_EVENT_PUBLISHER_TOKEN,
      useClass: OutboxEventHandlerService,
    },

    OutboxPublisher,

    {
      provide: OutboxWorker,
      useFactory: (
        outboxRepo: IOutboxRepository,
        eventPublisher: IDomainEventPublisher,
        jobDispatcher?: IBackgroundJobDispatcher,
      ) =>
        new OutboxWorker(outboxRepo, eventPublisher, jobDispatcher, {
          pollIntervalMs: 2000,
          batchSize: 50,
          maxRetries: 5,
          staleLockThresholdMs: 30_000,
        }),
      inject: [
        OUTBOX_REPOSITORY_TOKEN,
        DOMAIN_EVENT_PUBLISHER_TOKEN,
        { token: BACKGROUND_JOB_DISPATCHER_TOKEN, optional: true },
      ],
    },
  ],
  exports: [
    OutboxPublisher,
    PrismaOutboxRepository,
    OUTBOX_REPOSITORY_TOKEN,
    OutboxWorker,
    OutboxEventHandlerService,
  ],
})
export class OutboxModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly outboxWorker: OutboxWorker) {}

  public onModuleInit(): void {
    this.outboxWorker.start();
  }

  public onModuleDestroy(): void {
    this.outboxWorker.stop();
  }
}
