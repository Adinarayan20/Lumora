import { Injectable, Inject } from '@nestjs/common';
import { UniqueEntityId } from '@lumora/shared';
import type { ObjectDefinition } from '@lumora/shared';
import type { IObjectDefinitionRegistryRepository } from '../../domain/catalog/repositories/object-definition-registry.repository.interface.js';
import type { RedisSchemaCache } from '../../infrastructure/catalog/redis-schema.cache.js';

export interface GetObjectDefinitionQuery {
  workspaceId: string;
  typeKey: string;
}

@Injectable()
export class GetObjectDefinitionQueryHandler {
  constructor(
    @Inject('IObjectDefinitionRegistryRepository')
    private readonly definitionRepo: IObjectDefinitionRegistryRepository,
    private readonly schemaCache: RedisSchemaCache,
  ) {}

  public async execute(
    query: GetObjectDefinitionQuery,
  ): Promise<ObjectDefinition | null> {
    // 1. Cache-first lookup (sub-2ms)
    const cached = await this.schemaCache.getObjectDefinition(
      query.workspaceId,
      query.typeKey,
    );
    if (cached) return cached;

    // 2. Database lookup
    const workspaceId = new UniqueEntityId(query.workspaceId);
    const entity = await this.definitionRepo.findByTypeKey(
      workspaceId,
      query.typeKey,
    );
    if (!entity) return null;

    const definition = entity.toObjectDefinition();
    // 3. Hydrate cache asynchronously
    await this.schemaCache.setObjectDefinition(
      query.workspaceId,
      query.typeKey,
      definition,
    );

    return definition;
  }
}
