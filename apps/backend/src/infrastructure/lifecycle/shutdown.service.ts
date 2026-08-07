import {
  Injectable,
  BeforeApplicationShutdown,
  OnApplicationShutdown,
  Inject,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisClientProvider } from '../redis/redis-client.provider.js';
import { TracingProvider } from '../tracing/tracing.provider.js';
import { StructuredLoggerProvider } from '../tracing/structured-logger.provider.js';
import { OutboxWorker } from '../events/outbox/outbox-worker.js';
import {
  BACKGROUND_JOB_DISPATCHER_TOKEN,
  type IBackgroundJobDispatcher,
} from '../../application/jobs/interfaces/background-job-dispatcher.interface.js';
import {
  isDestroyable,
  type ShutdownStepResult,
} from './interfaces/shutdown-options.interface.js';

@Injectable()
export class GracefulShutdownService
  implements BeforeApplicationShutdown, OnApplicationShutdown
{
  private readonly timeoutMs: number;
  private isShutdownInProgress = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly redisClientProvider: RedisClientProvider,
    private readonly tracingProvider: TracingProvider,
    private readonly logger: StructuredLoggerProvider,
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
      GracefulShutdownService.name,
    );

    let isTimedOut = false;
    const timer = setTimeout(() => {
      isTimedOut = true;
      this.logger.error(
        `Graceful shutdown timeout exceeded [${this.timeoutMs}ms]. Teardown sequence timed out.`,
        undefined,
        GracefulShutdownService.name,
      );
    }, this.timeoutMs);
    timer.unref();

    const results: ShutdownStepResult[] = [];

    // Step 1: Draining HTTP & Background Outbox Polling
    results.push(
      await this.executeStep('OutboxWorker', () => {
        if (this.outboxWorker) {
          this.outboxWorker.stop();
        }
        return Promise.resolve();
      }),
    );

    // Step 2: Close BullMQ Queues and Workers cleanly using type-safe isDestroyable check
    results.push(
      await this.executeStep('BullMQJobDispatcher', async () => {
        if (isDestroyable(this.jobDispatcher)) {
          await this.jobDispatcher.onModuleDestroy();
        }
      }),
    );

    // Step 3: Close Redis connections
    results.push(
      await this.executeStep('RedisClientProvider', async () => {
        await this.redisClientProvider.onModuleDestroy();
      }),
    );

    // Step 4: Disconnect Prisma database connection pool
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

    const overallStatus = isTimedOut
      ? 'timeout'
      : results.every((r) => r.status === 'success')
        ? 'success'
        : 'failed';

    this.logger.log(
      JSON.stringify({
        event: 'GracefulShutdownReport',
        status: overallStatus,
        totalSteps: results.length,
        steps: results,
      }),
      GracefulShutdownService.name,
    );
  }

  public onApplicationShutdown(signal?: string): void {
    this.logger.log(
      `Application cleanup completed for signal [${signal || 'SIGTERM'}].`,
      GracefulShutdownService.name,
    );
  }

  private async executeStep(
    stepName: string,
    action: () => Promise<void>,
  ): Promise<ShutdownStepResult> {
    const startTime = Date.now();
    try {
      this.logger.log(
        `Executing shutdown step: [${stepName}]...`,
        GracefulShutdownService.name,
      );
      await action();
      const durationMs = Date.now() - startTime;
      const result: ShutdownStepResult = {
        stepName,
        status: 'success',
        durationMs,
      };
      this.logger.log(JSON.stringify(result), GracefulShutdownService.name);
      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const result: ShutdownStepResult = {
        stepName,
        status: 'failed',
        durationMs,
        error: errorMessage,
      };
      this.logger.error(
        JSON.stringify(result),
        undefined,
        GracefulShutdownService.name,
      );
      return result;
    }
  }
}
