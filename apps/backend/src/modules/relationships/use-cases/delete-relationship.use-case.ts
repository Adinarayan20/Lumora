import { Inject, Injectable } from '@nestjs/common';
import {
  Result,
  UniqueEntityId,
  ApplicationException,
  EntityNotFoundException,
} from '@lumora/shared';
import type { IRelationshipRepository } from '../../../domain/relationships/repositories/relationship.repository.interface.js';
import { RELATIONSHIP_REPOSITORY_TOKEN } from '../relationships.tokens.js';

export interface DeleteRelationshipCommand {
  workspaceId: string;
  relationshipId: string;
}

@Injectable()
export class DeleteRelationshipUseCase {
  constructor(
    @Inject(RELATIONSHIP_REPOSITORY_TOKEN)
    private readonly relationshipRepository: IRelationshipRepository,
  ) {}

  public async execute(
    command: DeleteRelationshipCommand,
  ): Promise<Result<void, ApplicationException>> {
    try {
      const existing = await this.relationshipRepository.findById(
        new UniqueEntityId(command.relationshipId),
      );
      if (!existing || existing.workspaceId.toValue() !== command.workspaceId) {
        return Result.fail(
          new EntityNotFoundException('Relationship', command.relationshipId),
        );
      }
      await this.relationshipRepository.delete(
        new UniqueEntityId(command.relationshipId),
        new UniqueEntityId(command.workspaceId),
      );
      return Result.ok<void, ApplicationException>(undefined);
    } catch (error) {
      if (error instanceof ApplicationException) return Result.fail(error);
      throw error;
    }
  }
}
