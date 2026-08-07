import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

export const REDIS_CLIENT_TOKEN = Symbol('REDIS_CLIENT');

@Injectable()
export class RedisClientProvider implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisClientProvider.name);
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {}

  public async onModuleInit(): Promise<void> {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (!redisUrl && process.env.NODE_ENV === 'production') {
      throw new Error(
        'REDIS_URL environment variable is required in production environment.',
      );
    }

    const targetUrl = redisUrl || 'redis://localhost:6379';
    this.logger.log('Initializing Redis infrastructure client connection...');

    this.client = new Redis(targetUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
      retryStrategy(times: number) {
        if (times > 3) {
          return null; // Stop retrying after 3 attempts to enforce fail-fast startup
        }
        return Math.min(times * 100, 1000);
      },
    });

    this.client.on('error', (err: Error) => {
      this.logger.error(
        `Redis client connection error: ${err.message}`,
        err.stack,
      );
    });

    this.client.on('connect', () => {
      this.logger.log('Redis client connected successfully.');
    });

    try {
      await this.client.ping();
      this.logger.log('Redis ping health check verified successfully.');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Redis startup health check failed: ${msg}`);
      throw new Error(
        `Redis infrastructure initialization failed fast: unable to ping Redis server. Error: ${msg}`,
      );
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
      this.logger.log('Closing Redis client connection cleanly...');
      await this.client.quit();
      this.client = null;
    }
  }
}
