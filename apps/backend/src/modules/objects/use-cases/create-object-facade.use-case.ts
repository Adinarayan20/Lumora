/**
 * Application-layer façade for object creation.
 *
 * Delegates to ObjectsService, which owns the legacy repository and business
 * logic (key generation, audit logging) until Phase 3 DDD migration replaces
 * it with CreateObjectUseCase (DDD aggregate-backed implementation).
 */
import { Injectable } from '@nestjs/common';
import { Result } from '@lumora/shared';
import { ObjectsService } from '../objects.service.js';
import { CreateObjectDto } from '../dto/create-object.dto.js';

export interface CreateObjectCommand {
  workspaceId: string;
  createdById: string;
  dto: CreateObjectDto;
}

@Injectable()
export class CreateObjectFacadeUseCase {
  constructor(private readonly objectsService: ObjectsService) {}

  public async execute(
    command: CreateObjectCommand,
  ): Promise<Result<unknown, Error>> {
    try {
      const object = await this.objectsService.createObject(
        command.workspaceId,
        command.createdById,
        command.dto,
      );
      return Result.ok(object);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
