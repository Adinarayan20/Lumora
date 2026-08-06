import { Injectable } from '@nestjs/common';
import { Result } from '@lumora/shared';
import { ObjectsService } from '../objects.service.js';

export interface DeleteObjectCommand {
  workspaceId: string;
  objectId: string;
  userId: string;
}

@Injectable()
export class DeleteObjectUseCase {
  constructor(private readonly objectsService: ObjectsService) {}

  public async execute(
    command: DeleteObjectCommand,
  ): Promise<Result<unknown, Error>> {
    try {
      const deleted = await this.objectsService.softDeleteObject(
        command.workspaceId,
        command.objectId,
        command.userId,
      );
      return Result.ok(deleted);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
