import { Inject, Injectable } from '@nestjs/common';
import {
  Result,
  UniqueEntityId,
  ApplicationException,
  ConflictException,
} from '@lumora/shared';
import { RelationshipAggregate } from '../../../domain/relationships/relationship.aggregate.js';
import type { IRelationshipRepository } from '../../../domain/relationships/repositories/relationship.repository.interface.js';
import { RELATIONSHIP_REPOSITORY_TOKEN } from '../relationships.tokens.js';
import { CreateRelationshipDto } from '../dto/create-relationship.dto.js';
import { RelationshipResponseDto } from '../dto/relationship-response.dto.js';
import { ObjectsService } from '../../objects/objects.service.js';

export interface CreateRelationshipCommand {
  workspaceId: string;
  createdById: string;
  dto: CreateRelationshipDto;
}

@Injectable()
export class CreateRelationshipUseCase {
  constructor(
    @Inject(RELATIONSHIP_REPOSITORY_TOKEN)
    private readonly relationshipRepository: IRelationshipRepository,
    private readonly objectsService: ObjectsService,
  ) {}

  public async execute(
    command: CreateRelationshipCommand,
  ): Promise<Result<RelationshipResponseDto, ApplicationException>> {
    try {
      const { workspaceId, createdById, dto } = command;
      const wsId = new UniqueEntityId(workspaceId);

      // Verify both objects exist in the workspace
      const sourceExists = await this.objectsService.verifyObjectInWorkspace(
        workspaceId,
        dto.sourceObjectId,
      );
      if (!sourceExists) {
        return Result.fail(
          new ConflictException('Relationship', `Source object '${dto.sourceObjectId}' not found in workspace.`),
        );
      }

      const targetExists = await this.objectsService.verifyObjectInWorkspace(
        workspaceId,
        dto.targetObjectId,
      );
      if (!targetExists) {
        return Result.fail(
          new ConflictException('Relationship', `Target object '${dto.targetObjectId}' not found in workspace.`),
        );
      }

      // Prevent duplicate directed relationships
      const alreadyExists = await this.relationshipRepository.exists(
        wsId,
        new UniqueEntityId(dto.sourceObjectId),
        new UniqueEntityId(dto.targetObjectId),
        dto.type,
      );
      if (alreadyExists) {
        return Result.fail(
          new ConflictException(
            'Relationship',
            `Relationship of type '${dto.type}' between these objects already exists.`,
          ),
        );
      }

      const relationship = RelationshipAggregate.create({
        workspaceId: wsId,
        sourceObjectId: new UniqueEntityId(dto.sourceObjectId),
        targetObjectId: new UniqueEntityId(dto.targetObjectId),
        type: dto.type,
        metadata: dto.metadata,
        createdById: new UniqueEntityId(createdById),
      });

      await this.relationshipRepository.save(relationship);

      return Result.ok(this.toDto(relationship));
    } catch (error) {
      if (error instanceof ApplicationException) return Result.fail(error);
      throw error;
    }
  }

  private toDto(r: RelationshipAggregate): RelationshipResponseDto {
    return {
      id: r.id.toValue(),
      workspaceId: r.workspaceId.toValue(),
      sourceObjectId: r.sourceObjectId.toValue(),
      targetObjectId: r.targetObjectId.toValue(),
      type: r.type,
      metadata: r.metadata,
      createdById: r.createdById.toValue(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }
}
