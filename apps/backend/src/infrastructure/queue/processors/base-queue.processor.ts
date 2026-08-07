import { Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker, QueueEvents, Job } from 'bullmq';
import { QueueName } from '../queue.constants.js';
import { QueueOptionsProvider } from '../queue.options.js';
import { BullMQConnectionProvider } from '../bullmq-connection.provider.js';

export abstract class BaseQueueProcessor<T extends { correlationId?: string }>
  implements OnModuleInit, OnModuleDestroy
{
  protected readonly logger: Logger;
  private worker: Worker<T> | null = null;
  private queueEvents: QueueEvents | null = null;

  constructor(
    protected readonly queueName: QueueName,
    protected readonly connectionProvider: BullMQConnectionProvider,
    protected readonly queueOptionsProvider: QueueOptionsProvider,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  public onModuleInit(): void {
    const connection = this.connectionProvider.getConnectionOptions();

    // 1. Initialize BullMQ Worker
    this.worker = new Worker<T>(
      this.queueName,
      async (job: Job<T>) => {
        const startTime = Date.now();
        this.logger.log(
          `Processing job [jobId: ${job.id}, queue: ${this.queueName}, attempt: ${job.attemptsMade + 1}, correlationId: ${job.data.correlationId || 'none'}]`,
        );

        await this.processJobPayload(job.data);

        const executionTime = Date.now() - startTime;
        this.logger.log(
          `Completed job successfully [jobId: ${job.id}, queue: ${this.queueName}, executionTime: ${executionTime}ms]`,
        );
      },
      {
        connection,
        concurrency: this.queueOptionsProvider.concurrency,
      },
    );

    this.worker.on('failed', (job: Job<T> | undefined, err: Error) => {
      this.logger.error(
        `Job execution failed [jobId: ${job?.id || 'unknown'}, queue: ${this.queueName}, attempt: ${job?.attemptsMade || 0}]: ${err.message}`,
        err.stack,
      );
    });

    // 2. Initialize QueueEvents listener for observability hooks (Unit 5 extension point)
    this.queueEvents = new QueueEvents(this.queueName, { connection });

    this.queueEvents.on('waiting', ({ jobId }) => {
      this.logger.debug(
        `[QueueEvent:waiting] jobId: ${jobId}, queue: ${this.queueName}`,
      );
    });

    this.queueEvents.on('active', ({ jobId }) => {
      this.logger.debug(
        `[QueueEvent:active] jobId: ${jobId}, queue: ${this.queueName}`,
      );
    });

    this.queueEvents.on('completed', ({ jobId }) => {
      this.logger.debug(
        `[QueueEvent:completed] jobId: ${jobId}, queue: ${this.queueName}`,
      );
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.warn(
        `[QueueEvent:failed] jobId: ${jobId}, queue: ${this.queueName}, reason: ${failedReason}`,
      );
    });

    this.queueEvents.on('stalled', ({ jobId }) => {
      this.logger.warn(
        `[QueueEvent:stalled] jobId: ${jobId}, queue: ${this.queueName}`,
      );
    });
  }

  protected abstract processJobPayload(data: T): Promise<void>;

  public async onModuleDestroy(): Promise<void> {
    if (this.queueEvents) {
      await this.queueEvents.close();
      this.queueEvents = null;
    }
    if (this.worker) {
      this.logger.log(
        `Closing worker for queue '${this.queueName}' cleanly...`,
      );
      await this.worker.close();
      this.worker = null;
    }
  }
}
