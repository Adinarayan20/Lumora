import { Injectable } from '@nestjs/common';
import { Result } from '@lumora/shared';
import { ObjectsService } from '../objects.service.js';
import { UpdateObjectDto } from '../dto/update-object.dto.js';

export interface UpdateObjectCommand {
  workspaceId: string;
  objectId: string;
  userId: string;
  dto: UpdateObjectDto;
}

@Injectable()
export class UpdateObjectUseCase {
  constructor(private readonly objectsService: ObjectsService) {}

  public async execute(
    command: UpdateObjectCommand,
  ): Promise<Result<unknown, Error>> {
    try {
      const updated = await this.objectsService.updateObject(
        command.workspaceId,
        command.objectId,
        command.userId,
        command.dto,
      );
      return Result.ok(updated);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
