import { Inject, Injectable } from '@nestjs/common';
import {
  Result,
  UniqueEntityId,
  EntityNotFoundException,
  ForbiddenException,
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

export interface DeleteFileAssetCommand {
  workspaceId: string;
  fileAssetId: string;
  requestedById: string;
}

@Injectable()
export class DeleteFileAssetUseCase {
  constructor(
    @Inject(MEDIA_REPOSITORY_TOKEN)
    private readonly fileAssetRepository: IFileAssetRepository,
    @Inject(STORAGE_PROVIDER_TOKEN)
    private readonly storageProvider: IStorageProvider,
  ) {}

  public async execute(
    command: DeleteFileAssetCommand,
  ): Promise<Result<FileAssetResponseDto, ApplicationException>> {
    try {
      const { workspaceId, fileAssetId, requestedById } = command;

      const aggregate = await this.fileAssetRepository.findById(
        new UniqueEntityId(fileAssetId),
      );
      if (!aggregate)
        return Result.fail(
          new EntityNotFoundException('FileAsset', fileAssetId),
        );

      // Workspace ownership check
      if (
        aggregate.workspaceId &&
        aggregate.workspaceId.toValue() !== workspaceId
      ) {
        return Result.fail(
          new EntityNotFoundException('FileAsset', fileAssetId),
        );
      }

      // Uploader check
      if (aggregate.uploadedById.toString() !== requestedById) {
        return Result.fail(
          new ForbiddenException(
            'file.delete',
            `Only the uploader may delete file '${fileAssetId}'.`,
          ),
        );
      }

      aggregate.markAsDeleted();
      await this.storageProvider.delete(aggregate.path);
      await this.fileAssetRepository.delete(aggregate.id);

      return Result.ok(FileAssetResponseMapper.toResponseDto(aggregate));
    } catch (error) {
      if (error instanceof ApplicationException) return Result.fail(error);
      throw error;
    }
  }
}
