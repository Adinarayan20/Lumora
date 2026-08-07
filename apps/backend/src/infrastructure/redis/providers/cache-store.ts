import { Injectable, Logger } from '@nestjs/common';
import { RedisClientProvider } from '../redis-client.provider.js';
import { JsonSerializer } from '../serializers/json.serializer.js';

@Injectable()
export class CacheStore {
  private readonly logger = new Logger(CacheStore.name);

  constructor(private readonly redisClientProvider: RedisClientProvider) {}

  public async get<T>(key: string): Promise<T | null> {
    try {
      const client = this.redisClientProvider.getClient();
      const raw = await client.get(key);
      if (!raw) return null;
      return JsonSerializer.deserialize<T>(raw);
    } catch (error) {
      this.logger.error(
        `Failed to read key '${key}' from Redis cache: ${(error as Error).message}`,
      );
      return null;
    }
  }

  public async set<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<void> {
    try {
      const client = this.redisClientProvider.getClient();
      const payload = JsonSerializer.serialize(value);
      if (ttlSeconds && ttlSeconds > 0) {
        await client.setex(key, ttlSeconds, payload);
      } else {
        await client.set(key, payload);
      }
    } catch (error) {
      this.logger.error(
        `Failed to set key '${key}' in Redis cache: ${(error as Error).message}`,
      );
    }
  }

  public async delete(key: string): Promise<void> {
    try {
      const client = this.redisClientProvider.getClient();
      await client.del(key);
    } catch (error) {
      this.logger.error(
        `Failed to delete key '${key}' from Redis cache: ${(error as Error).message}`,
      );
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const client = this.redisClientProvider.getClient();
      const count = await client.exists(key);
      return count > 0;
    } catch (error) {
      this.logger.error(
        `Failed to check existence of key '${key}' in Redis: ${(error as Error).message}`,
      );
      return false;
    }
  }
}
