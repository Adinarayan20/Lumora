import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../rbac/guards/permissions.guard.js';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator.js';
import { Permissions } from '../rbac/constants/permissions.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { CreateRelationshipUseCase } from './use-cases/create-relationship.use-case.js';
import { GetObjectRelationshipsQuery } from './use-cases/get-object-relationships.query.js';
import { DeleteRelationshipUseCase } from './use-cases/delete-relationship.use-case.js';
import { CreateRelationshipDto } from './dto/create-relationship.dto.js';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('workspaces/:workspaceId/relationships')
export class RelationshipsController {
  constructor(
    private readonly createRelationship: CreateRelationshipUseCase,
    private readonly getObjectRelationships: GetObjectRelationshipsQuery,
    private readonly deleteRelationship: DeleteRelationshipUseCase,
  ) {}

  @Post()
  @RequirePermissions(Permissions.Object.Create)
  async create(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRelationshipDto,
  ) {
    const result = await this.createRelationship.execute({
      workspaceId,
      createdById: userId,
      dto,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Get('objects/:objectId')
  @RequirePermissions(Permissions.Object.Read)
  async getForObject(
    @Param('workspaceId') workspaceId: string,
    @Param('objectId') objectId: string,
    @Query('type') type?: string,
  ) {
    const result = await this.getObjectRelationships.execute({
      workspaceId,
      objectId,
      type,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Delete(':id')
  @RequirePermissions(Permissions.Object.Delete)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('workspaceId') workspaceId: string,
    @Param('id') relationshipId: string,
  ) {
    const result = await this.deleteRelationship.execute({
      workspaceId,
      relationshipId,
    });
    if (result.isFailure) throw result.getError();
    return { success: true };
  }
}
