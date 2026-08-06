import { Inject, Injectable } from '@nestjs/common';
import { Result, UniqueEntityId, ObjectTypeKey, IdGenerator } from '@lumora/shared';
import { ObjectAggregate } from '../../../domain/objects/object.aggregate.js';
import { ObjectTitle } from '../../../domain/objects/value-objects/object-title.js';
import { ObjectKey } from '../../../domain/objects/value-objects/object-key.js';
import type { IObjectRepository } from '../../../domain/objects/repositories/object.repository.interface.js';
import { CreateObjectDto } from '../dto/create-object.dto.js';
import { ObjectResponseDto } from '../dto/object-response.dto.js';
import { ObjectResponseMapper } from '../mappers/object-response.mapper.js';

export const OBJECT_REPOSITORY_TOKEN = 'IObjectRepository';

export interface CreateObjectCommand {
  workspaceId: string;
  createdById: string;
  dto: CreateObjectDto;
}

@Injectable()
export class CreateObjectUseCase {
  constructor(
    @Inject(OBJECT_REPOSITORY_TOKEN)
    private readonly objectRepository: IObjectRepository,
  ) {}

  public async execute(
    command: CreateObjectCommand,
  ): Promise<Result<ObjectResponseDto, Error>> {
    try {
      const { workspaceId, createdById, dto } = command;

      let keyStr = dto.objectKey?.trim();
      if (!keyStr) {
        const randomSuffix = IdGenerator.generate().substring(0, 8);
        keyStr = `${dto.typeKey.toLowerCase()}-${randomSuffix}`;
      }

      const titleObj = ObjectTitle.create(dto.title);
      const keyObj = ObjectKey.create(keyStr);

      const aggregate = ObjectAggregate.create({
        workspaceId: new UniqueEntityId(workspaceId),
        createdById: new UniqueEntityId(createdById),
        spaceId: dto.spaceId ? new UniqueEntityId(dto.spaceId) : undefined,
        objectKey: keyObj,
        typeKey: dto.typeKey as ObjectTypeKey,
        title: titleObj,
        description: dto.description,
        icon: dto.icon,
        emoji: dto.emoji,
        cover: dto.cover,
        color: dto.color,
        pinnedAt: dto.pinnedAt ? new Date(dto.pinnedAt) : undefined,
        isFavorite: dto.isFavorite ?? false,
        attributes: dto.attributes,
      });

      await this.objectRepository.save(aggregate);

      const responseDto = ObjectResponseMapper.toResponseDto(aggregate);
      return Result.ok(responseDto);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
