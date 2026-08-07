import { Injectable, Logger } from '@nestjs/common';
import type { RedisClientProvider } from '../redis/redis-client.provider.js';
import type { SchemaDefinition, ObjectDefinition } from '@lumora/shared';

@Injectable()
export class RedisSchemaCache {
  private readonly logger = new Logger(RedisSchemaCache.name);
  private readonly DEFAULT_TTL_SECONDS = 86400; // 24 Hours

  constructor(private readonly redisClient: RedisClientProvider) {}

  private getSchemaKey(workspaceId: string, typeKey: string): string {
    return `lumora:schema:${workspaceId}:${typeKey}`;
  }

  private getDefinitionKey(workspaceId: string, typeKey: string): string {
    return `lumora:def:${workspaceId}:${typeKey}`;
  }

  public async getSchema(
    workspaceId: string,
    typeKey: string,
  ): Promise<SchemaDefinition | null> {
    try {
      const client = this.redisClient.getClient();
      const raw = await client.get(this.getSchemaKey(workspaceId, typeKey));
      if (!raw) return null;
      return JSON.parse(raw) as SchemaDefinition;
    } catch (error) {
      this.logger.error(
        `Failed to fetch schema from Redis cache: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  public async setSchema(
    workspaceId: string,
    typeKey: string,
    schema: SchemaDefinition,
  ): Promise<void> {
    try {
      const client = this.redisClient.getClient();
      await client.setex(
        this.getSchemaKey(workspaceId, typeKey),
        this.DEFAULT_TTL_SECONDS,
        JSON.stringify(schema),
      );
    } catch (error) {
      this.logger.error(
        `Failed to write schema to Redis cache: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  public async getObjectDefinition(
    workspaceId: string,
    typeKey: string,
  ): Promise<ObjectDefinition | null> {
    try {
      const client = this.redisClient.getClient();
      const raw = await client.get(this.getDefinitionKey(workspaceId, typeKey));
      if (!raw) return null;
      return JSON.parse(raw) as ObjectDefinition;
    } catch (error) {
      this.logger.error(
        `Failed to fetch object definition from Redis cache: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  public async setObjectDefinition(
    workspaceId: string,
    typeKey: string,
    definition: ObjectDefinition,
  ): Promise<void> {
    try {
      const client = this.redisClient.getClient();
      await client.setex(
        this.getDefinitionKey(workspaceId, typeKey),
        this.DEFAULT_TTL_SECONDS,
        JSON.stringify(definition),
      );
    } catch (error) {
      this.logger.error(
        `Failed to write object definition to Redis cache: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
