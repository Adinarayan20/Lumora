import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import type {
  IBackgroundJobDispatcher,
  DispatchReminderJobDto,
  DispatchNotificationJobDto,
  DispatchEmailJobDto,
} from '../../application/jobs/index.js';
import { QUEUES, JOB_NAMES, QueueName } from './queue.constants.js';
import { QueueOptionsProvider } from './queue.options.js';
import { BullMQConnectionProvider } from './bullmq-connection.provider.js';

@Injectable()
export class BullMQJobDispatcher
  implements IBackgroundJobDispatcher, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(BullMQJobDispatcher.name);
  private readonly queues = new Map<QueueName, Queue>();

  constructor(
    private readonly connectionProvider: BullMQConnectionProvider,
    private readonly queueOptionsProvider: QueueOptionsProvider,
  ) {}

  public onModuleInit(): void {
    const connection = this.connectionProvider.getConnectionOptions();

    // Initialize dedicated queues using central BullMQConnectionProvider
    for (const queueName of Object.values(QUEUES)) {
      const queue = new Queue(queueName, { connection });
      this.queues.set(queueName, queue);
    }

    this.logger.log(
      'BullMQJobDispatcher initialized dedicated queues successfully.',
    );
  }

  public async dispatchReminder(
    payload: DispatchReminderJobDto,
  ): Promise<void> {
    await this.enqueueJob(
      QUEUES.REMINDER,
      JOB_NAMES.PROCESS_REMINDER,
      payload,
      payload.correlationId,
    );
  }

  public async dispatchNotification(
    payload: DispatchNotificationJobDto,
  ): Promise<void> {
    await this.enqueueJob(
      QUEUES.NOTIFICATION,
      JOB_NAMES.PROCESS_NOTIFICATION,
      payload,
      payload.correlationId,
    );
  }

  public async dispatchEmail(payload: DispatchEmailJobDto): Promise<void> {
    await this.enqueueJob(
      QUEUES.EMAIL,
      JOB_NAMES.PROCESS_EMAIL,
      payload,
      payload.correlationId,
    );
  }

  private async enqueueJob<T>(
    queueName: QueueName,
    jobName: string,
    payload: T,
    correlationId?: string,
  ): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(
        `Queue '${queueName}' is not initialized in BullMQJobDispatcher.`,
      );
    }

    const jobOptions = this.queueOptionsProvider.getJobOptions();
    const job = await queue.add(jobName, payload, jobOptions);

    this.logger.log(
      `Job dispatched successfully [jobId: ${job.id}, queue: ${queueName}, eventType: ${jobName}, correlationId: ${correlationId || 'none'}]`,
    );
  }

  public async onModuleDestroy(): Promise<void> {
    this.logger.log('Closing BullMQ queues cleanly...');
    for (const [name, queue] of this.queues.entries()) {
      await queue.close();
      this.logger.log(`Queue '${name}' closed.`);
    }
    this.queues.clear();
  }
}
