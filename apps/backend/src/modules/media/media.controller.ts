import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { RegisterFileAssetUseCase } from './use-cases/register-file-asset.use-case.js';
import { DeleteFileAssetUseCase } from './use-cases/delete-file-asset.use-case.js';
import { GetFileAssetQuery } from './use-cases/get-file-asset.query.js';
import { RegisterFileAssetDto } from './dto/register-file-asset.dto.js';

/**
 * MediaController — workspace-scoped (Phase F).
 * Route: /workspaces/:workspaceId/media
 * workspaceId is mandatory to enforce ownership boundaries.
 */
@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/media')
export class MediaController {
  constructor(
    private readonly registerFileAssetUseCase: RegisterFileAssetUseCase,
    private readonly deleteFileAssetUseCase: DeleteFileAssetUseCase,
    private readonly getFileAssetQuery: GetFileAssetQuery,
  ) {}

  @Post()
  async registerFileAsset(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterFileAssetDto,
  ) {
    const result = await this.registerFileAssetUseCase.execute({
      workspaceId,
      uploadedById: userId,
      dto,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Get(':id')
  async getFileAsset(
    @Param('workspaceId') workspaceId: string,
    @Param('id') fileAssetId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.getFileAssetQuery.execute({
      workspaceId,
      fileAssetId,
      requestedById: userId,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Delete(':id')
  async deleteFileAsset(
    @Param('workspaceId') workspaceId: string,
    @Param('id') fileAssetId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.deleteFileAssetUseCase.execute({
      workspaceId,
      fileAssetId,
      requestedById: userId,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }
}
