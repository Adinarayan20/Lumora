import { Injectable } from '@nestjs/common';
import { Result, ApplicationException } from '@lumora/shared';
import { ObjectsService } from '../objects.service.js';
import { FilterObjectDto } from '../dto/filter-object.dto.js';
import type { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import type { PaginatedObjectsResult } from '../objects.service.js';

export interface GetWorkspaceObjectsQueryInput {
  workspaceId: string;
  filter: FilterObjectDto;
  pagination?: PaginationQueryDto;
}

@Injectable()
export class GetWorkspaceObjectsQuery {
  constructor(private readonly objectsService: ObjectsService) {}

  public async execute(
    input: GetWorkspaceObjectsQueryInput,
  ): Promise<Result<PaginatedObjectsResult, ApplicationException>> {
    return this.objectsService.getWorkspaceObjects(
      input.workspaceId,
      input.filter,
      input.pagination,
    );
  }
}
