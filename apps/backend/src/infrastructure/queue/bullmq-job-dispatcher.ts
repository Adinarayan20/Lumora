import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import type {
  IBackgroundJobDispatcher,
  DispatchReminderJobDto,
  DispatchNotificationJobDto,
  DispatchEmailJobDto,
} from '../../application/jobs/index.js';
import { QUEUES, QueueName } from './queue.constants.js';
import { QueueOptionsProvider } from './queue.options.js';

@Injectable()
export class BullMQJobDispatcher
  implements IBackgroundJobDispatcher, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(BullMQJobDispatcher.name);
  private readonly queues = new Map<QueueName, Queue>();

  constructor(
    private readonly configService: ConfigService,
    private readonly queueOptionsProvider: QueueOptionsProvider,
  ) {}

  public onModuleInit(): void {
    const redisUrl = this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );
    const urlObj = new URL(redisUrl);

    const connection = {
      host: urlObj.hostname || 'localhost',
      port: parseInt(urlObj.port || '6379', 10),
      username: urlObj.username || undefined,
      password: urlObj.password || undefined,
    };

    // Initialize dedicated queues
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
      'process-reminder',
      payload,
      payload.correlationId,
    );
  }

  public async dispatchNotification(
    payload: DispatchNotificationJobDto,
  ): Promise<void> {
    await this.enqueueJob(
      QUEUES.NOTIFICATION,
      'process-notification',
      payload,
      payload.correlationId,
    );
  }

  public async dispatchEmail(payload: DispatchEmailJobDto): Promise<void> {
    await this.enqueueJob(
      QUEUES.EMAIL,
      'process-email',
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
