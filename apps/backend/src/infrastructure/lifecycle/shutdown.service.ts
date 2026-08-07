import {
  Injectable,
  Logger,
  BeforeApplicationShutdown,
  OnApplicationShutdown,
  Inject,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisClientProvider } from '../redis/redis-client.provider.js';
import { TracingProvider } from '../tracing/tracing.provider.js';
import { OutboxWorker } from '../events/outbox/outbox-worker.js';
import {
  BACKGROUND_JOB_DISPATCHER_TOKEN,
  type IBackgroundJobDispatcher,
} from '../../application/jobs/interfaces/background-job-dispatcher.interface.js';
import type { ShutdownStepResult } from './interfaces/shutdown-options.interface.js';

@Injectable()
export class GracefulShutdownService
  implements BeforeApplicationShutdown, OnApplicationShutdown
{
  private readonly logger = new Logger(GracefulShutdownService.name);
  private readonly timeoutMs: number;
  private isShutdownInProgress = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly redisClientProvider: RedisClientProvider,
    private readonly tracingProvider: TracingProvider,
    @Optional() private readonly outboxWorker?: OutboxWorker,
    @Optional()
    @Inject(BACKGROUND_JOB_DISPATCHER_TOKEN)
    private readonly jobDispatcher?: IBackgroundJobDispatcher,
  ) {
    this.timeoutMs = this.configService.get<number>(
      'SHUTDOWN_TIMEOUT_MS',
      10000,
    );
  }

  public async beforeApplicationShutdown(signal?: string): Promise<void> {
    if (this.isShutdownInProgress) {
      return;
    }
    this.isShutdownInProgress = true;

    this.logger.log(
      `Shutdown initiated via signal [${signal || 'SIGTERM'}]. Enforcing max timeout: ${this.timeoutMs}ms`,
    );

    // Enforce timeout fallback to prevent hanging shutdowns
    const timer = setTimeout(() => {
      this.logger.error(
        `Graceful shutdown timeout exceeded [${this.timeoutMs}ms]. Forcing process termination.`,
      );
      process.exit(1);
    }, this.timeoutMs);
    timer.unref();

    const results: ShutdownStepResult[] = [];

    // Step 1: Stop HTTP traffic & Background Schedulers / Outbox Polling
    results.push(
      await this.executeStep('OutboxWorker', () => {
        if (this.outboxWorker) {
          this.outboxWorker.stop();
        }
        return Promise.resolve();
      }),
    );

    // Step 2: Close BullMQ Queues and Workers
    results.push(
      await this.executeStep('BullMQJobDispatcher', async () => {
        const dispatcher = this.jobDispatcher as unknown as Record<
          string,
          unknown
        >;
        if (dispatcher && typeof dispatcher.onModuleDestroy === 'function') {
          await (dispatcher.onModuleDestroy as () => Promise<void>)();
        }
      }),
    );

    // Step 3: Close Redis connections
    results.push(
      await this.executeStep('RedisClientProvider', async () => {
        await this.redisClientProvider.onModuleDestroy();
      }),
    );

    // Step 4: Disconnect Prisma database pool
    results.push(
      await this.executeStep('PrismaService', async () => {
        await this.prismaService.onModuleDestroy();
      }),
    );

    // Step 5: Flush & shutdown OpenTelemetry Tracing SDK
    results.push(
      await this.executeStep('OpenTelemetrySDK', async () => {
        await this.tracingProvider.onModuleDestroy();
      }),
    );

    clearTimeout(timer);

    this.logger.log(
      `Graceful shutdown completed successfully. ${results.filter((r) => r.status === 'success').length}/${results.length} steps succeeded.`,
    );
  }

  public onApplicationShutdown(signal?: string): void {
    this.logger.log(
      `Application cleanup completed for signal [${signal || 'SIGTERM'}].`,
    );
  }

  private async executeStep(
    stepName: string,
    action: () => Promise<void>,
  ): Promise<ShutdownStepResult> {
    const startTime = Date.now();
    try {
      this.logger.log(`Executing shutdown step: [${stepName}]...`);
      await action();
      const durationMs = Date.now() - startTime;
      this.logger.log(
        `Shutdown step [${stepName}] completed cleanly in ${durationMs}ms.`,
      );
      return { stepName, status: 'success', durationMs };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Shutdown step [${stepName}] failed after ${durationMs}ms: ${errorMessage}`,
      );
      return { stepName, status: 'failed', durationMs, error: errorMessage };
    }
  }
}
