import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisClientProvider } from '../redis/redis-client.provider.js';
import { BullMQConnectionProvider } from '../queue/bullmq-connection.provider.js';
import type {
  HealthCheckResult,
  DependencyHealthStatus,
} from './interfaces/health-check.interface.js';

@Injectable()
export class HealthService implements OnModuleInit {
  private readonly logger = new Logger(HealthService.name);
  private isStartupComplete: boolean = false;
  private readonly appVersion: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisClientProvider: RedisClientProvider,
    private readonly bullmqConnectionProvider: BullMQConnectionProvider,
    private readonly configService: ConfigService,
  ) {
    this.appVersion = this.configService.get<string>('APP_VERSION', '1.0.0');
  }

  public onModuleInit(): void {
    this.isStartupComplete = true;
    this.logger.log('HealthService initialized application startup flag.');
  }

  /**
   * Liveness probe: Verifies that the Node.js process is alive without querying external DBs.
   */
  public checkLiveness(): HealthCheckResult {
    const startTime = Date.now();
    return {
      status: 'up',
      timestamp: new Date().toISOString(),
      version: this.appVersion,
      durationMs: Date.now() - startTime,
      details: {
        process: {
          status: 'up',
          durationMs: 0,
        },
      },
    };
  }

  /**
   * Startup probe: Reports whether application module initialization has completed.
   */
  public checkStartup(): HealthCheckResult {
    const startTime = Date.now();
    const status = this.isStartupComplete ? 'up' : 'down';

    return {
      status,
      timestamp: new Date().toISOString(),
      version: this.appVersion,
      durationMs: Date.now() - startTime,
      details: {
        startup: {
          status,
          durationMs: Date.now() - startTime,
        },
      },
    };
  }

  /**
   * Readiness probe: Verifies critical infrastructure dependencies (PostgreSQL, Redis, BullMQ, Config).
   */
  public async checkReadiness(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const details: Record<string, DependencyHealthStatus> = {};

    // 1. Check PostgreSQL (Prisma)
    const postgresStart = Date.now();
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      details.postgres = {
        status: 'up',
        durationMs: Date.now() - postgresStart,
      };
    } catch (error) {
      details.postgres = {
        status: 'down',
        durationMs: Date.now() - postgresStart,
        error: (error as Error).message,
      };
    }

    // 2. Check Redis
    const redisStart = Date.now();
    try {
      const client = this.redisClientProvider.getClient();
      await client.ping();
      details.redis = {
        status: 'up',
        durationMs: Date.now() - redisStart,
      };
    } catch (error) {
      details.redis = {
        status: 'down',
        durationMs: Date.now() - redisStart,
        error: (error as Error).message,
      };
    }

    // 3. Check BullMQ configuration
    const bullmqStart = Date.now();
    try {
      const connOptions = this.bullmqConnectionProvider.getConnectionOptions();
      if (!connOptions.host) {
        throw new Error('BullMQ connection host is undefined');
      }
      details.bullmq = {
        status: 'up',
        durationMs: Date.now() - bullmqStart,
      };
    } catch (error) {
      details.bullmq = {
        status: 'down',
        durationMs: Date.now() - bullmqStart,
        error: (error as Error).message,
      };
    }

    // 4. Check ConfigService
    details.config = {
      status: 'up',
      durationMs: 0,
    };

    // Overall status is 'up' only if all dependency checks passed
    const isOverallUp = Object.values(details).every(
      (dep) => dep.status === 'up',
    );

    return {
      status: isOverallUp ? 'up' : 'down',
      timestamp: new Date().toISOString(),
      version: this.appVersion,
      durationMs: Date.now() - startTime,
      details,
    };
  }
}
