import type { UniqueEntityId } from '@lumora/shared';
import type { SchemaRegistryAggregate } from '../schema-registry.aggregate.js';

export interface ISchemaRegistryRepository {
  save(schema: SchemaRegistryAggregate): Promise<void>;
  findByTypeKey(
    workspaceId: UniqueEntityId,
    typeKey: string,
  ): Promise<SchemaRegistryAggregate | null>;
  findAllByWorkspace(
    workspaceId: UniqueEntityId,
  ): Promise<SchemaRegistryAggregate[]>;
}
