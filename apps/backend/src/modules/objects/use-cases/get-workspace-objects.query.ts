import { Injectable } from '@nestjs/common';
import { Result } from '@lumora/shared';
import { ObjectsService } from '../objects.service.js';
import { FilterObjectDto } from '../dto/filter-object.dto.js';

export interface GetWorkspaceObjectsQueryInput {
  workspaceId: string;
  filter: FilterObjectDto;
}

@Injectable()
export class GetWorkspaceObjectsQuery {
  constructor(private readonly objectsService: ObjectsService) {}

  public async execute(
    input: GetWorkspaceObjectsQueryInput,
  ): Promise<Result<unknown[], Error>> {
    try {
      const objects = await this.objectsService.getWorkspaceObjects(
        input.workspaceId,
        input.filter,
      );
      return Result.ok(objects);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
