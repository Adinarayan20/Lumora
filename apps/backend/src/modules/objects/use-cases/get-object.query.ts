import { Injectable } from '@nestjs/common';
import { Result } from '@lumora/shared';
import { ObjectsService } from '../objects.service.js';

export interface GetObjectQueryInput {
  workspaceId: string;
  idOrKey: string;
}

@Injectable()
export class GetObjectQuery {
  constructor(private readonly objectsService: ObjectsService) {}

  public async execute(
    input: GetObjectQueryInput,
  ): Promise<Result<unknown, Error>> {
    try {
      const object = await this.objectsService.getObjectByIdOrKey(
        input.workspaceId,
        input.idOrKey,
      );
      return Result.ok(object);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
