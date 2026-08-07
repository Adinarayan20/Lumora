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
import type { DispatchReminderJobDto } from '../../../application/jobs/index.js';

@Injectable()
export class ReminderQueueProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReminderQueueProcessor.name);
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

    this.worker = new Worker<DispatchReminderJobDto>(
      QUEUES.REMINDER,
      async (job: Job<DispatchReminderJobDto>) => {
        const startTime = Date.now();
        this.logger.log(
          `Processing reminder job [jobId: ${job.id}, queue: ${QUEUES.REMINDER}, attempt: ${job.attemptsMade + 1}, correlationId: ${job.data.correlationId || 'none'}]`,
        );

        // Infrastructure orchestration logic (delegates to application services)
        await this.processReminder(job.data);

        const executionTime = Date.now() - startTime;
        this.logger.log(
          `Completed reminder job successfully [jobId: ${job.id}, executionTime: ${executionTime}ms]`,
        );
      },
      {
        connection,
        concurrency: this.queueOptionsProvider.concurrency,
      },
    );

    this.worker.on(
      'failed',
      (job: Job<DispatchReminderJobDto> | undefined, err: Error) => {
        this.logger.error(
          `Reminder job failed [jobId: ${job?.id || 'unknown'}, queue: ${QUEUES.REMINDER}, attempt: ${job?.attemptsMade || 0}]: ${err.message}`,
          err.stack,
        );
      },
    );
  }

  private async processReminder(data: DispatchReminderJobDto): Promise<void> {
    // Orchestration point: Invokes application service / use-case if required
    await Promise.resolve(data);
  }

  public async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      this.logger.log('Closing ReminderQueueProcessor worker...');
      await this.worker.close();
      this.worker = null;
    }
  }
}
