import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { MetricsRegistry } from '../metrics/metrics.registry.js';

export const REDIS_CLIENT_TOKEN = Symbol('REDIS_CLIENT');

@Injectable()
export class RedisClientProvider implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisClientProvider.name);
  private client: Redis | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly metricsRegistry?: MetricsRegistry,
  ) {}

  public async onModuleInit(): Promise<void> {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      throw new Error(
        'REDIS_URL environment variable is required in production environment.',
      );
    }

    try {
      this.client = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          if (times > 5) return null;
          return Math.min(times * 100, 3000);
        },
      });

      this.client.on('connect', () => {
        this.logger.log('Redis client connected successfully.');
        if (this.metricsRegistry) {
          this.metricsRegistry.redisConnectionStateGauge.set(1);
        }
      });

      this.client.on('ready', () => {
        if (this.metricsRegistry) {
          this.metricsRegistry.redisConnectionStateGauge.set(1);
        }
      });

      this.client.on('error', (err: Error) => {
        this.logger.error(`Redis client error: ${err.message}`, err.stack);
        if (this.metricsRegistry) {
          this.metricsRegistry.redisConnectionStateGauge.set(0);
        }
      });

      this.client.on('close', () => {
        if (this.metricsRegistry) {
          this.metricsRegistry.redisConnectionStateGauge.set(0);
        }
      });

      this.client.on('end', () => {
        if (this.metricsRegistry) {
          this.metricsRegistry.redisConnectionStateGauge.set(0);
        }
      });

      await this.client.connect();
      await this.client.ping();
      this.logger.log('Redis client ping check succeeded.');
    } catch (error) {
      this.logger.error(
        `Failed fast during Redis initialization: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  public getClient(): Redis {
    if (!this.client) {
      throw new Error(
        'RedisClientProvider has not been initialized. Ensure RedisModule is loaded.',
      );
    }
    return this.client;
  }

  public async onModuleDestroy(): Promise<void> {
    if (this.client) {
      this.logger.log('Disconnecting Redis client cleanly...');
      if (this.metricsRegistry) {
        this.metricsRegistry.redisConnectionStateGauge.set(0);
      }
      await this.client.quit();
      this.client = null;
    }
  }
}
