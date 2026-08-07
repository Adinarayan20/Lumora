import { Injectable } from '@nestjs/common';
import { Result, ApplicationException } from '@lumora/shared';
import { ObjectsService } from '../objects.service.js';
import { Object as LumoraObject } from '../../../generated/prisma/client.js';

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
  ): Promise<Result<LumoraObject, ApplicationException>> {
    return this.objectsService.softDeleteObject(
      command.workspaceId,
      command.objectId,
      command.userId,
    );
  }
}
