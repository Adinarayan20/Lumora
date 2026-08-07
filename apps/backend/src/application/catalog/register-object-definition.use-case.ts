import { Injectable, Inject } from '@nestjs/common';
import { UniqueEntityId, Result } from '@lumora/shared';
import type { SystemTrait } from '@lumora/shared';
import { ObjectDefinitionRegistryAggregate } from '../../domain/catalog/object-definition-registry.aggregate.js';
import type { IObjectDefinitionRegistryRepository } from '../../domain/catalog/repositories/object-definition-registry.repository.interface.js';
import type { RedisSchemaCache } from '../../infrastructure/catalog/redis-schema.cache.js';

export interface RegisterObjectDefinitionCommand {
  workspaceId: string;
  typeKey: string;
  name: string;
  pluralName: string;
  description?: string;
  icon: string;
  color?: string;
  allowedCapabilities: string[];
  traits: SystemTrait[];
}

@Injectable()
export class RegisterObjectDefinitionUseCase {
  constructor(
    @Inject('IObjectDefinitionRegistryRepository')
    private readonly definitionRepo: IObjectDefinitionRegistryRepository,
    private readonly schemaCache: RedisSchemaCache,
  ) {}

  public async execute(
    command: RegisterObjectDefinitionCommand,
  ): Promise<Result<ObjectDefinitionRegistryAggregate>> {
    const workspaceId = new UniqueEntityId(command.workspaceId);

    const aggregate = ObjectDefinitionRegistryAggregate.create({
      workspaceId,
      typeKey: command.typeKey,
      name: command.name,
      pluralName: command.pluralName,
      description: command.description,
      icon: command.icon,
      color: command.color,
      allowedCapabilities: command.allowedCapabilities,
      traits: command.traits,
      schemaVersion: 1,
    });

    await this.definitionRepo.save(aggregate);
    await this.schemaCache.setObjectDefinition(
      command.workspaceId,
      command.typeKey,
      aggregate.toObjectDefinition(),
    );

    return Result.ok<ObjectDefinitionRegistryAggregate>(aggregate);
  }
}
