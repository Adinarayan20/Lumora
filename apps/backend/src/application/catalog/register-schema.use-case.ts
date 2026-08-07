import { Injectable, Inject } from '@nestjs/common';
import { UniqueEntityId, Result } from '@lumora/shared';
import type { FieldSchema } from '@lumora/shared';
import { SchemaRegistryAggregate } from '../../domain/catalog/schema-registry.aggregate.js';
import type { ISchemaRegistryRepository } from '../../domain/catalog/repositories/schema-registry.repository.interface.js';
import type { RedisSchemaCache } from '../../infrastructure/catalog/redis-schema.cache.js';

export interface RegisterSchemaCommand {
  workspaceId: string;
  typeKey: string;
  fields: FieldSchema[];
  migrationInitializers?: Record<string, unknown>;
}

@Injectable()
export class RegisterSchemaUseCase {
  constructor(
    @Inject('ISchemaRegistryRepository')
    private readonly schemaRepo: ISchemaRegistryRepository,
    private readonly schemaCache: RedisSchemaCache,
  ) {}

  public async execute(
    command: RegisterSchemaCommand,
  ): Promise<Result<SchemaRegistryAggregate>> {
    const workspaceId = new UniqueEntityId(command.workspaceId);

    const existing = await this.schemaRepo.findByTypeKey(
      workspaceId,
      command.typeKey,
    );

    let aggregate: SchemaRegistryAggregate;

    if (existing) {
      existing.updateFields(command.fields);
      aggregate = existing;
    } else {
      aggregate = SchemaRegistryAggregate.create({
        workspaceId,
        typeKey: command.typeKey,
        schemaVersion: 1,
        fields: command.fields,
        migrationInitializers: command.migrationInitializers,
      });
    }

    await this.schemaRepo.save(aggregate);
    await this.schemaCache.setSchema(
      command.workspaceId,
      command.typeKey,
      aggregate.toSchemaDefinition(),
    );

    return Result.ok<SchemaRegistryAggregate>(aggregate);
  }
}
