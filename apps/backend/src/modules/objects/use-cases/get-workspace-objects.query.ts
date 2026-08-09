import { Injectable } from '@nestjs/common';
import { Result, ApplicationException } from '@lumora/shared';
import { ObjectsService } from '../objects.service.js';
import { FilterObjectDto } from '../dto/filter-object.dto.js';
import { ObjectResponseDto } from '../dto/object-response.dto.js';

export interface GetWorkspaceObjectsQueryInput {
  workspaceId: string;
  filter: FilterObjectDto;
}

@Injectable()
export class GetWorkspaceObjectsQuery {
  constructor(private readonly objectsService: ObjectsService) {}

  public async execute(
    input: GetWorkspaceObjectsQueryInput,
  ): Promise<Result<ObjectResponseDto[], ApplicationException>> {
    return this.objectsService.getWorkspaceObjects(
      input.workspaceId,
      input.filter,
    );
  }
}
