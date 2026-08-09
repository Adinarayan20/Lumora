import { Injectable } from '@nestjs/common';
import { Result, ApplicationException } from '@lumora/shared';
import { ObjectsService } from '../objects.service.js';
import { ObjectResponseDto } from '../dto/object-response.dto.js';

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
  ): Promise<Result<ObjectResponseDto, ApplicationException>> {
    return this.objectsService.softDeleteObject(
      command.workspaceId,
      command.objectId,
      command.userId,
    );
  }
}
