import type { UniqueEntityId } from '@lumora/shared';
import type { ObjectDefinitionRegistryAggregate } from '../object-definition-registry.aggregate.js';

export interface IObjectDefinitionRegistryRepository {
  save(definition: ObjectDefinitionRegistryAggregate): Promise<void>;
  findByTypeKey(
    workspaceId: UniqueEntityId,
    typeKey: string,
  ): Promise<ObjectDefinitionRegistryAggregate | null>;
  findAllByWorkspace(
    workspaceId: UniqueEntityId,
  ): Promise<ObjectDefinitionRegistryAggregate[]>;
}
