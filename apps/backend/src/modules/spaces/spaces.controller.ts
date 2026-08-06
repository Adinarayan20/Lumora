import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { Permissions } from '../rbac/constants/permissions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateSpaceUseCase,
  GetWorkspaceSpacesQuery,
  GetSpaceQuery,
  UpdateSpaceUseCase,
  DeleteSpaceUseCase,
} from './use-cases/space-use-cases.js';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { FilterSpaceDto } from './dto/filter-space.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('workspaces/:workspaceId/spaces')
export class SpacesController {
  constructor(
    private readonly createSpaceUseCase: CreateSpaceUseCase,
    private readonly getWorkspaceSpacesQuery: GetWorkspaceSpacesQuery,
    private readonly getSpaceQuery: GetSpaceQuery,
    private readonly updateSpaceUseCase: UpdateSpaceUseCase,
    private readonly deleteSpaceUseCase: DeleteSpaceUseCase,
  ) {}

  @Post()
  @RequirePermissions(Permissions.Space.Create)
  async createSpace(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSpaceDto,
  ) {
    const result = await this.createSpaceUseCase.execute({
      workspaceId,
      createdById: userId,
      dto,
    });
    if (result.isFailure) {
      const msg = result.getError().message;
      if (msg.includes('not found')) throw new NotFoundException(msg);
      throw new BadRequestException(msg);
    }
    return result.getValue();
  }

  @Get()
  @RequirePermissions(Permissions.Space.Read)
  async getWorkspaceSpaces(
    @Param('workspaceId') workspaceId: string,
    @Query() filter: FilterSpaceDto,
  ) {
    const result = await this.getWorkspaceSpacesQuery.execute({
      workspaceId,
      filter,
    });
    if (result.isFailure) {
      throw new InternalServerErrorException(result.getError().message);
    }
    return result.getValue();
  }

  @Get(':idOrSlug')
  @RequirePermissions(Permissions.Space.Read)
  async getSpaceByIdOrSlug(
    @Param('workspaceId') workspaceId: string,
    @Param('idOrSlug') idOrSlug: string,
  ) {
    const result = await this.getSpaceQuery.execute({ workspaceId, idOrSlug });
    if (result.isFailure) {
      const msg = result.getError().message;
      if (msg.includes('not found')) throw new NotFoundException(msg);
      throw new InternalServerErrorException(msg);
    }
    return result.getValue();
  }

  @Patch(':id')
  @RequirePermissions(Permissions.Space.Update)
  async updateSpace(
    @Param('workspaceId') workspaceId: string,
    @Param('id') spaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSpaceDto,
  ) {
    const result = await this.updateSpaceUseCase.execute({
      workspaceId,
      spaceId,
      userId,
      dto,
    });
    if (result.isFailure) {
      const msg = result.getError().message;
      if (msg.includes('not found')) throw new NotFoundException(msg);
      if (msg.includes('mismatch')) throw new ConflictException(msg);
      if (msg.includes('Circular') || msg.includes('own parent')) {
        throw new BadRequestException(msg);
      }
      throw new BadRequestException(msg);
    }
    return result.getValue();
  }

  @Delete(':id')
  @RequirePermissions(Permissions.Space.Delete)
  async softDeleteSpace(
    @Param('workspaceId') workspaceId: string,
    @Param('id') spaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.deleteSpaceUseCase.execute({
      workspaceId,
      spaceId,
      userId,
    });
    if (result.isFailure) {
      const msg = result.getError().message;
      if (msg.includes('not found')) throw new NotFoundException(msg);
      if (msg.includes('Cannot delete')) throw new BadRequestException(msg);
      throw new InternalServerErrorException(msg);
    }
    return result.getValue();
  }
}
