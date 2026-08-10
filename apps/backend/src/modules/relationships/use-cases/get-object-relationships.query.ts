import { Inject, Injectable } from '@nestjs/common';
import { Result, UniqueEntityId, ApplicationException } from '@lumora/shared';
import type { IRelationshipRepository } from '../../../domain/relationships/repositories/relationship.repository.interface.js';
import { RELATIONSHIP_REPOSITORY_TOKEN } from '../relationships.tokens.js';
import { RelationshipResponseDto } from '../dto/relationship-response.dto.js';
import { RelationshipAggregate } from '../../../domain/relationships/relationship.aggregate.js';

export interface GetObjectRelationshipsInput {
  workspaceId: string;
  objectId: string;
  type?: string;
}

@Injectable()
export class GetObjectRelationshipsQuery {
  constructor(
    @Inject(RELATIONSHIP_REPOSITORY_TOKEN)
    private readonly relationshipRepository: IRelationshipRepository,
  ) {}

  public async execute(
    input: GetObjectRelationshipsInput,
  ): Promise<Result<RelationshipResponseDto[], ApplicationException>> {
    try {
      const relationships = await this.relationshipRepository.findByObject(
        new UniqueEntityId(input.workspaceId),
        new UniqueEntityId(input.objectId),
        input.type,
      );
      return Result.ok(relationships.map((r) => this.toDto(r)));
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
