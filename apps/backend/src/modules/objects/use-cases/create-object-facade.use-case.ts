import { Injectable } from '@nestjs/common';
import { Result, ApplicationException } from '@lumora/shared';
import { ObjectsService } from '../objects.service.js';
import { CreateObjectDto } from '../dto/create-object.dto.js';
import { Object as LumoraObject } from '../../../generated/prisma/client.js';

export interface CreateObjectCommand {
  workspaceId: string;
  createdById: string;
  dto: CreateObjectDto;
}

/**
 * @deprecated — Replaced by CreateObjectUseCase (aggregate-backed). Scheduled for removal in Phase 4.
 */
@Injectable()
export class CreateObjectFacadeUseCase {
  constructor(private readonly objectsService: ObjectsService) {}

  public async execute(
    command: CreateObjectCommand,
  ): Promise<Result<LumoraObject, ApplicationException>> {
    return this.objectsService.createObject(
      command.workspaceId,
      command.createdById,
      command.dto,
    );
  }
}
