import type { UniqueEntityId, ObjectDefinition } from '@lumora/shared';
import type { ObjectDefinitionRegistryAggregate } from '../object-definition-registry.aggregate.js';

export interface IObjectDefinitionRegistry {
  getObjectDefinition(
    workspaceId: UniqueEntityId,
    typeKey: string,
  ): Promise<ObjectDefinition | null>;
  registerObjectDefinition(
    definition: ObjectDefinitionRegistryAggregate,
  ): Promise<ObjectDefinitionRegistryAggregate>;
}
