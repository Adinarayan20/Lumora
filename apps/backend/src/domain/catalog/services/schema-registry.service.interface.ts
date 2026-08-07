import type { UniqueEntityId, SchemaDefinition } from '@lumora/shared';
import type { SchemaRegistryAggregate } from '../schema-registry.aggregate.js';

export interface ISchemaRegistry {
  getSchema(
    workspaceId: UniqueEntityId,
    typeKey: string,
  ): Promise<SchemaDefinition | null>;
  registerSchema(
    schema: SchemaRegistryAggregate,
  ): Promise<SchemaRegistryAggregate>;
}
