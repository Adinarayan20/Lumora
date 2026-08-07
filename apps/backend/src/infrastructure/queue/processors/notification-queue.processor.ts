import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, Job } from 'bullmq';
import { QUEUES } from '../queue.constants.js';
import { QueueOptionsProvider } from '../queue.options.js';
import type { DispatchNotificationJobDto } from '../../../application/jobs/index.js';

@Injectable()
export class NotificationQueueProcessor
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(NotificationQueueProcessor.name);
  private worker: Worker | null = null;

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

    this.worker = new Worker<DispatchNotificationJobDto>(
      QUEUES.NOTIFICATION,
      async (job: Job<DispatchNotificationJobDto>) => {
        const startTime = Date.now();
        this.logger.log(
          `Processing notification job [jobId: ${job.id}, queue: ${QUEUES.NOTIFICATION}, attempt: ${job.attemptsMade + 1}, correlationId: ${job.data.correlationId || 'none'}]`,
        );

        await this.processNotification(job.data);

        const executionTime = Date.now() - startTime;
        this.logger.log(
          `Completed notification job successfully [jobId: ${job.id}, executionTime: ${executionTime}ms]`,
        );
      },
      {
        connection,
        concurrency: this.queueOptionsProvider.concurrency,
      },
    );

    this.worker.on(
      'failed',
      (job: Job<DispatchNotificationJobDto> | undefined, err: Error) => {
        this.logger.error(
          `Notification job failed [jobId: ${job?.id || 'unknown'}, queue: ${QUEUES.NOTIFICATION}, attempt: ${job?.attemptsMade || 0}]: ${err.message}`,
          err.stack,
        );
      },
    );
  }

  private async processNotification(
    data: DispatchNotificationJobDto,
  ): Promise<void> {
    await Promise.resolve(data);
  }

  public async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      this.logger.log('Closing NotificationQueueProcessor worker...');
      await this.worker.close();
      this.worker = null;
    }
  }
}
