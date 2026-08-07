import { Injectable } from '@nestjs/common';
import { Result, ApplicationException } from '@lumora/shared';
import { ObjectsService } from '../objects.service.js';
import { UpdateObjectDto } from '../dto/update-object.dto.js';
import { Object as LumoraObject } from '../../../generated/prisma/client.js';

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
  ): Promise<Result<LumoraObject, ApplicationException>> {
    return this.objectsService.updateObject(
      command.workspaceId,
      command.objectId,
      command.userId,
      command.dto,
    );
  }
}
