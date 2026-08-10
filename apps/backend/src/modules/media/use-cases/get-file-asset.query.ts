import { Inject, Injectable } from '@nestjs/common';
import {
  Result,
  UniqueEntityId,
  EntityNotFoundException,
  ApplicationException,
} from '@lumora/shared';
import type { IFileAssetRepository } from '../../../domain/media/repositories/file-asset.repository.interface.js';
import type { IStorageProvider } from '../../../domain/media/interfaces/storage-provider.interface.js';
import {
  MEDIA_REPOSITORY_TOKEN,
  STORAGE_PROVIDER_TOKEN,
} from '../media.tokens.js';
import { FileAssetResponseDto } from '../dto/file-asset-response.dto.js';
import { FileAssetResponseMapper } from '../mappers/file-asset-response.mapper.js';

export interface GetFileAssetQueryInput {
  workspaceId: string;
  fileAssetId: string;
  requestedById: string;
}

export interface GetFileAssetQueryOutput {
  asset: FileAssetResponseDto;
  downloadUrl: string;
}

@Injectable()
export class GetFileAssetQuery {
  constructor(
    @Inject(MEDIA_REPOSITORY_TOKEN)
    private readonly fileAssetRepository: IFileAssetRepository,
    @Inject(STORAGE_PROVIDER_TOKEN)
    private readonly storageProvider: IStorageProvider,
  ) {}

  public async execute(
    input: GetFileAssetQueryInput,
  ): Promise<Result<GetFileAssetQueryOutput, ApplicationException>> {
    try {
      const { workspaceId, fileAssetId, requestedById: _requestedById } = input;
      const aggregate = await this.fileAssetRepository.findById(
        new UniqueEntityId(fileAssetId),
      );
      if (!aggregate) {
        return Result.fail(
          new EntityNotFoundException('FileAsset', fileAssetId),
        );
      }
      // Workspace ownership check
      if (
        aggregate.workspaceId &&
        aggregate.workspaceId.toValue() !== workspaceId
      ) {
        return Result.fail(
          new EntityNotFoundException('FileAsset', fileAssetId),
        );
      }
      const downloadUrl = await this.storageProvider.getSignedUrl(
        aggregate.path,
      );
      return Result.ok({
        asset: FileAssetResponseMapper.toResponseDto(aggregate),
        downloadUrl,
      });
    } catch (error) {
      if (error instanceof ApplicationException) return Result.fail(error);
      throw error;
    }
  }
}
