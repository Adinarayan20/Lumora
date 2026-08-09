import { Inject, Injectable } from '@nestjs/common';
import {
  Result,
  UniqueEntityId,
  ObjectTypeKey,
  IdGenerator,
} from '@lumora/shared';
import { ObjectAggregate } from '../../../domain/objects/object.aggregate.js';
import { ObjectTitle } from '../../../domain/objects/value-objects/object-title.js';
import { ObjectKey } from '../../../domain/objects/value-objects/object-key.js';
import { CreateObjectDto } from '../dto/create-object.dto.js';
import { ObjectResponseDto } from '../dto/object-response.dto.js';
import { ObjectResponseMapper } from '../mappers/object-response.mapper.js';
import {
  OBJECT_AGGREGATE_REPOSITORY_FACTORY_TOKEN,
  type ObjectAggregateRepositoryFactory,
} from '../objects.tokens.js';

export interface CreateObjectCommand {
  workspaceId: string;
  createdById: string;
  dto: CreateObjectDto;
}

/**
 * Creates a new Universal Object via the domain aggregate path.
 *
 * Uses the OBJECT_AGGREGATE_REPOSITORY_FACTORY_TOKEN to obtain a workspace-scoped
 * IObjectAggregateRepository for each command invocation, ensuring correct
 * WorkspaceExecutionContext without REQUEST-scoped DI complexity.
 *
 * ADR-016: This use case now correctly routes through ObjectAggregateRepositoryAdapter → Tier 1.
 */
@Injectable()
export class CreateObjectUseCase {
  constructor(
    @Inject(OBJECT_AGGREGATE_REPOSITORY_FACTORY_TOKEN)
    private readonly repositoryFactory: ObjectAggregateRepositoryFactory,
  ) {}

  public async execute(
    command: CreateObjectCommand,
  ): Promise<Result<ObjectResponseDto, Error>> {
    try {
      const { workspaceId, createdById, dto } = command;

      const objectRepository = this.repositoryFactory(workspaceId, createdById);

      let keyStr = dto.objectKey?.trim();
      if (!keyStr) {
        const randomSuffix = IdGenerator.generate().substring(0, 8);
        keyStr = `${dto.typeKey.toLowerCase()}-${randomSuffix}`;
      }

      // Guarantee unique objectKey within workspace
      const keyObj = ObjectKey.create(keyStr);
      const keyExists = await objectRepository.existsByObjectKey(
        new UniqueEntityId(workspaceId),
        keyObj,
      );
      if (keyExists) {
        keyStr = `${dto.typeKey.toLowerCase()}-${IdGenerator.generate().substring(0, 8)}`;
      }

      const titleObj = ObjectTitle.create(dto.title);
      const finalKeyObj = ObjectKey.create(keyStr);

      const aggregate = ObjectAggregate.create({
        workspaceId: new UniqueEntityId(workspaceId),
        createdById: new UniqueEntityId(createdById),
        spaceId: dto.spaceId ? new UniqueEntityId(dto.spaceId) : undefined,
        objectKey: finalKeyObj,
        typeKey: dto.typeKey as ObjectTypeKey,
        title: titleObj,
        description: dto.description,
        icon: dto.icon,
        emoji: dto.emoji,
        cover: dto.cover,
        color: dto.color,
        pinnedAt: dto.pinnedAt ? new Date(dto.pinnedAt) : undefined,
        isFavorite: dto.isFavorite ?? false,
        attributes: dto.attributes ?? {},
      });

      await objectRepository.save(aggregate);

      const responseDto = ObjectResponseMapper.toResponseDto(aggregate);
      return Result.ok(responseDto);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
