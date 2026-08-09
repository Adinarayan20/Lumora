import { Injectable } from '@nestjs/common';
import { Result, ApplicationException } from '@lumora/shared';
import { ObjectsService } from '../objects.service.js';
import { ObjectResponseDto } from '../dto/object-response.dto.js';

export interface GetObjectQueryInput {
  workspaceId: string;
  idOrKey: string;
}

@Injectable()
export class GetObjectQuery {
  constructor(private readonly objectsService: ObjectsService) {}

  public async execute(
    input: GetObjectQueryInput,
  ): Promise<Result<ObjectResponseDto, ApplicationException>> {
    return this.objectsService.getObjectByIdOrKey(
      input.workspaceId,
      input.idOrKey,
    );
  }
}
