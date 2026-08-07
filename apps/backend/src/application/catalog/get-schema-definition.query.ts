import { Injectable, Inject } from '@nestjs/common';
import { UniqueEntityId } from '@lumora/shared';
import type { SchemaDefinition } from '@lumora/shared';
import type { ISchemaRegistryRepository } from '../../domain/catalog/repositories/schema-registry.repository.interface.js';
import type { RedisSchemaCache } from '../../infrastructure/catalog/redis-schema.cache.js';

export interface GetSchemaDefinitionQuery {
  workspaceId: string;
  typeKey: string;
}

@Injectable()
export class GetSchemaDefinitionQueryHandler {
  constructor(
    @Inject('ISchemaRegistryRepository')
    private readonly schemaRepo: ISchemaRegistryRepository,
    private readonly schemaCache: RedisSchemaCache,
  ) {}

  public async execute(
    query: GetSchemaDefinitionQuery,
  ): Promise<SchemaDefinition | null> {
    // 1. Cache-first lookup (sub-2ms)
    const cached = await this.schemaCache.getSchema(
      query.workspaceId,
      query.typeKey,
    );
    if (cached) return cached;

    // 2. Database lookup
    const workspaceId = new UniqueEntityId(query.workspaceId);
    const entity = await this.schemaRepo.findByTypeKey(
      workspaceId,
      query.typeKey,
    );
    if (!entity) return null;

    const schema = entity.toSchemaDefinition();
    // 3. Hydrate cache asynchronously
    await this.schemaCache.setSchema(query.workspaceId, query.typeKey, schema);

    return schema;
  }
}
