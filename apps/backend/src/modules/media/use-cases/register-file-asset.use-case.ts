import { Inject, Injectable } from '@nestjs/common';
import { Result, UniqueEntityId, ApplicationException } from '@lumora/shared';
import { FileAssetAggregate } from '../../../domain/media/file-asset.aggregate.js';
import { FileProvider } from '../../../domain/media/value-objects/file-provider.enum.js';
import { StorageQuotaPolicy } from '../../../domain/media/policies/storage-quota.policy.js';
import type { IFileAssetRepository } from '../../../domain/media/repositories/file-asset.repository.interface.js';
import { MEDIA_REPOSITORY_TOKEN } from '../media.tokens.js';
import { RegisterFileAssetDto } from '../dto/register-file-asset.dto.js';
import { FileAssetResponseDto } from '../dto/file-asset-response.dto.js';
import { FileAssetResponseMapper } from '../mappers/file-asset-response.mapper.js';

export interface RegisterFileAssetCommand {
  uploadedById: string;
  dto: RegisterFileAssetDto;
}

@Injectable()
export class RegisterFileAssetUseCase {
  constructor(
    @Inject(MEDIA_REPOSITORY_TOKEN)
    private readonly fileAssetRepository: IFileAssetRepository,
  ) {}

  public async execute(
    command: RegisterFileAssetCommand,
  ): Promise<Result<FileAssetResponseDto, ApplicationException>> {
    try {
      const { uploadedById, dto } = command;
      const userEntityId = new UniqueEntityId(uploadedById);

      const currentUsedBytes =
        await this.fileAssetRepository.calculateUserTotalStorageBytes(
          userEntityId,
        );

      StorageQuotaPolicy.validateStorageQuota(currentUsedBytes, dto.size);

      const aggregate = FileAssetAggregate.create({
        uploadedById: userEntityId,
        provider: dto.provider ?? FileProvider.LOCAL,
        bucket: dto.bucket,
        path: dto.path,
        filename: dto.filename,
        mimeType: dto.mimeType,
        size: dto.size,
        checksum: dto.checksum,
      });

      await this.fileAssetRepository.save(aggregate);

      const responseDto = FileAssetResponseMapper.toResponseDto(aggregate);
      return Result.ok(responseDto);
    } catch (error) {
      if (error instanceof ApplicationException) {
        return Result.fail(error);
      }
      throw error;
    }
  }
}
