import { Global, Module, OnModuleInit, OnModuleDestroy, Inject, Optional } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { PrismaOutboxRepository } from './prisma-outbox.repository.js';
import { OutboxPublisher } from './outbox-publisher.js';
import { OutboxWorker } from './outbox-worker.js';
import { NestEventPublisher } from './nest-event-publisher.js';
import type { IOutboxRepository } from '../../../domain/common/repositories/outbox.repository.interface.js';
import {
  BACKGROUND_JOB_DISPATCHER_TOKEN,
  type IBackgroundJobDispatcher,
} from '../../../application/jobs/interfaces/background-job-dispatcher.interface.js';

export const OUTBOX_REPOSITORY_TOKEN = 'IOutboxRepository';
export const DOMAIN_EVENT_PUBLISHER_TOKEN = 'IDomainEventPublisher';

/**
 * OutboxModule — Global infrastructure module for the Transactional Outbox.
 *
 * Provides:
 *   - PrismaOutboxRepository (repaired to use outbox_messages table)
 *   - OutboxPublisher (stages domain events into the outbox within a transaction)
 *   - OutboxWorker (background polling, started on module init, stopped on destroy)
 *   - NestEventPublisher (in-process IDomainEventPublisher for current scale)
 *
 * Exported: OutboxPublisher — consumed by use cases that need to stage events.
 *
 * Phase F fix: OutboxWorker is now started via OnModuleInit.
 * Previously it was never started because no module provided it.
 */
@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    PrismaOutboxRepository,
    NestEventPublisher,

    {
      provide: OUTBOX_REPOSITORY_TOKEN,
      useClass: PrismaOutboxRepository,
    },
    {
      provide: DOMAIN_EVENT_PUBLISHER_TOKEN,
      useClass: NestEventPublisher,
    },

    OutboxPublisher,

    {
      provide: OutboxWorker,
      useFactory: (
        outboxRepo: IOutboxRepository,
        eventPublisher: NestEventPublisher,
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
