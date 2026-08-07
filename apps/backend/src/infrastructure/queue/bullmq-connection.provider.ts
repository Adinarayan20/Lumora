import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RedisOptions } from 'ioredis';

@Injectable()
export class BullMQConnectionProvider {
  private readonly logger = new Logger(BullMQConnectionProvider.name);

  constructor(private readonly configService: ConfigService) {}

  public getConnectionOptions(): RedisOptions {
    const redisUrl = this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );

    try {
      const urlObj = new URL(redisUrl);
      return {
        host: urlObj.hostname || 'localhost',
        port: parseInt(urlObj.port || '6379', 10),
        username: urlObj.username || undefined,
        password: urlObj.password || undefined,
        maxRetriesPerRequest: null, // Mandatory setting for BullMQ Workers
      };
    } catch (error) {
      this.logger.error(
        `Failed to parse REDIS_URL '${redisUrl}': ${(error as Error).message}`,
      );
      throw new Error(
        `Invalid REDIS_URL configuration for BullMQ: ${(error as Error).message}`,
      );
    }
  }
}
