import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RegisterFileAssetUseCase } from './use-cases/register-file-asset.use-case.js';
import { DeleteFileAssetUseCase } from './use-cases/delete-file-asset.use-case.js';
import { GetFileAssetQuery } from './use-cases/get-file-asset.query.js';
import { RegisterFileAssetDto } from './dto/register-file-asset.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(
    private readonly registerFileAssetUseCase: RegisterFileAssetUseCase,
    private readonly deleteFileAssetUseCase: DeleteFileAssetUseCase,
    private readonly getFileAssetQuery: GetFileAssetQuery,
  ) {}

  /**
   * POST /media
   * Registers a new file asset record and validates storage quota.
   */
  @Post()
  async registerFileAsset(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterFileAssetDto,
  ) {
    const result = await this.registerFileAssetUseCase.execute({
      uploadedById: userId,
      dto,
    });

    if (result.isFailure) {
      const msg = result.getError().message;
      if (msg.includes('quota') || msg.includes('Quota')) {
        throw new BadRequestException(msg);
      }
      throw new InternalServerErrorException(msg);
    }

    return result.getValue();
  }

  /**
   * GET /media/:id
   * Retrieves file asset metadata and a signed download URL.
   */
  @Get(':id')
  async getFileAsset(@Param('id') fileAssetId: string) {
    const result = await this.getFileAssetQuery.execute({ fileAssetId });

    if (result.isFailure) {
      const msg = result.getError().message;
      if (msg.includes('not found') || msg.includes('Not found')) {
        throw new NotFoundException(msg);
      }
      throw new InternalServerErrorException(msg);
    }

    return result.getValue();
  }

  /**
   * DELETE /media/:id
   * Soft-deletes a file asset and removes the object from storage.
   * Only the uploader may delete their own assets.
   */
  @Delete(':id')
  async deleteFileAsset(
    @Param('id') fileAssetId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.deleteFileAssetUseCase.execute({
      fileAssetId,
      requestedById: userId,
    });

    if (result.isFailure) {
      const msg = result.getError().message;
      if (msg.includes('not found') || msg.includes('Not found')) {
        throw new NotFoundException(msg);
      }
      if (msg.includes('cannot delete') || msg.includes('Forbidden')) {
        throw new ForbiddenException(msg);
      }
      throw new InternalServerErrorException(msg);
    }

    return result.getValue();
  }
}
