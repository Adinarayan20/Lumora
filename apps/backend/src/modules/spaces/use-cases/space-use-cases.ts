/**
 * Application-layer façade use cases for the Spaces bounded context.
 *
 * All use cases delegate to SpacesService, which owns legacy business logic
 * (slug generation, parent validation, cycle detection, child count check,
 * audit logs) until Phase 3 DDD migration.
 */
import { Injectable } from '@nestjs/common';
import { Result } from '@lumora/shared';
import { SpacesService } from '../spaces.service.js';
import { CreateSpaceDto } from '../dto/create-space.dto.js';
import { UpdateSpaceDto } from '../dto/update-space.dto.js';
import { FilterSpaceDto } from '../dto/filter-space.dto.js';

// ─── Commands ────────────────────────────────────────────────────────────────

export interface CreateSpaceCommand {
  workspaceId: string;
  createdById: string;
  dto: CreateSpaceDto;
}

@Injectable()
export class CreateSpaceUseCase {
  constructor(private readonly service: SpacesService) {}
  async execute(cmd: CreateSpaceCommand): Promise<Result<unknown, Error>> {
    try {
      return Result.ok(
        await this.service.createSpace(
          cmd.workspaceId,
          cmd.createdById,
          cmd.dto,
        ),
      );
    } catch (e) {
      return Result.fail(e instanceof Error ? e : new Error(String(e)));
    }
  }
}

export interface UpdateSpaceCommand {
  workspaceId: string;
  spaceId: string;
  userId: string;
  dto: UpdateSpaceDto;
}

@Injectable()
export class UpdateSpaceUseCase {
  constructor(private readonly service: SpacesService) {}
  async execute(cmd: UpdateSpaceCommand): Promise<Result<unknown, Error>> {
    try {
      return Result.ok(
        await this.service.updateSpace(
          cmd.workspaceId,
          cmd.spaceId,
          cmd.userId,
          cmd.dto,
        ),
      );
    } catch (e) {
      return Result.fail(e instanceof Error ? e : new Error(String(e)));
    }
  }
}

export interface DeleteSpaceCommand {
  workspaceId: string;
  spaceId: string;
  userId: string;
}

@Injectable()
export class DeleteSpaceUseCase {
  constructor(private readonly service: SpacesService) {}
  async execute(cmd: DeleteSpaceCommand): Promise<Result<unknown, Error>> {
    try {
      return Result.ok(
        await this.service.softDeleteSpace(
          cmd.workspaceId,
          cmd.spaceId,
          cmd.userId,
        ),
      );
    } catch (e) {
      return Result.fail(e instanceof Error ? e : new Error(String(e)));
    }
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export interface GetWorkspaceSpacesQueryInput {
  workspaceId: string;
  filter: FilterSpaceDto;
}

@Injectable()
export class GetWorkspaceSpacesQuery {
  constructor(private readonly service: SpacesService) {}
  async execute(
    input: GetWorkspaceSpacesQueryInput,
  ): Promise<Result<unknown[], Error>> {
    try {
      return Result.ok(
        await this.service.getWorkspaceSpaces(input.workspaceId, input.filter),
      );
    } catch (e) {
      return Result.fail(e instanceof Error ? e : new Error(String(e)));
    }
  }
}

export interface GetSpaceQueryInput {
  workspaceId: string;
  idOrSlug: string;
}

@Injectable()
export class GetSpaceQuery {
  constructor(private readonly service: SpacesService) {}
  async execute(input: GetSpaceQueryInput): Promise<Result<unknown, Error>> {
    try {
      return Result.ok(
        await this.service.getSpaceByIdOrSlug(
          input.workspaceId,
          input.idOrSlug,
        ),
      );
    } catch (e) {
      return Result.fail(e instanceof Error ? e : new Error(String(e)));
    }
  }
}
