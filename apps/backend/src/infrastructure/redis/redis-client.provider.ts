import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

export const REDIS_CLIENT_TOKEN = 'REDIS_CLIENT';

@Injectable()
export class RedisClientProvider implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisClientProvider.name);
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {}

  public async onModuleInit(): Promise<void> {
    const redisUrl = this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );

    this.logger.log(`Initializing Redis client connection to ${redisUrl}...`);

    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
      retryStrategy(times: number) {
        if (times > 3) {
          return null; // Stop retrying after 3 attempts during fail-fast startup check
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
      this.logger.log('Redis ping check verified successfully.');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Redis startup ping warning (non-fatal dev fallback): ${msg}`,
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
