import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '@lumora/shared';
import {
  Prisma,
  FileAsset as PrismaFileAsset,
} from '../../../generated/prisma/client.js';
import { PrismaService } from '../prisma.service.js';
import { PrismaExceptionMapper } from '../mappers/prisma-exception.mapper.js';
import type { IFileAssetRepository } from '../../../domain/media/repositories/file-asset.repository.interface.js';
import { FileAssetAggregate } from '../../../domain/media/file-asset.aggregate.js';
import { FileProvider } from '../../../domain/media/value-objects/file-provider.enum.js';
import { FileName } from '../../../domain/media/value-objects/file-name.js';
import { FileSize } from '../../../domain/media/value-objects/file-size.js';
import { MimeType } from '../../../domain/media/value-objects/mime-type.js';
import { StorageKey } from '../../../domain/media/value-objects/storage-key.js';
import { FileChecksum } from '../../../domain/media/value-objects/file-checksum.js';

@Injectable()
export class PrismaFileAssetRepository implements IFileAssetRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findById(
    id: UniqueEntityId,
  ): Promise<FileAssetAggregate | null> {
    try {
      const record = await this.prisma.fileAsset.findUnique({
        where: { id: id.toString() },
      });

      if (!record) return null;

      return this.toDomain(record);
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async exists(id: UniqueEntityId): Promise<boolean> {
    try {
      const count = await this.prisma.fileAsset.count({
        where: { id: id.toString() },
      });
      return count > 0;
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async save(aggregate: FileAssetAggregate): Promise<void> {
    try {
      const data = this.toPersistence(aggregate);

      await this.prisma.fileAsset.upsert({
        where: { id: aggregate.id.toString() },
        create: data as Prisma.FileAssetUncheckedCreateInput,
        update: data,
      });
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async delete(id: UniqueEntityId): Promise<void> {
    try {
      await this.prisma.fileAsset.delete({
        where: { id: id.toString() },
      });
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async findByUploadedUserId(
    uploadedById: UniqueEntityId,
  ): Promise<FileAssetAggregate[]> {
    try {
      const records = await this.prisma.fileAsset.findMany({
        where: { uploadedById: uploadedById.toString() },
        orderBy: { createdAt: 'desc' },
      });

      return records.map((r) => this.toDomain(r));
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async calculateUserTotalStorageBytes(
    uploadedById: UniqueEntityId,
  ): Promise<number> {
    try {
      const aggregateResult = await this.prisma.fileAsset.aggregate({
        where: { uploadedById: uploadedById.toString() },
        _sum: { size: true },
      });

      return aggregateResult._sum.size ?? 0;
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  /**
   * Explicit mapping converting database persistence model to Domain Aggregate.
   * Note: The current FileAsset schema model persists id, uploadedById, provider, bucket, path, filename, mimeType, size, checksum, createdAt.
   * Soft-delete state (deletedAt) is managed in-memory on the aggregate root and will be rehydrated from soft-delete column in schema migration v2.
   */
  public toDomain(model: PrismaFileAsset): FileAssetAggregate {
    return FileAssetAggregate.reconstitute({
      id: new UniqueEntityId(model.id),
      uploadedById: new UniqueEntityId(model.uploadedById),
      workspaceId: model.workspaceId
        ? new UniqueEntityId(model.workspaceId)
        : undefined,
      provider: model.provider as FileProvider,
      bucket: model.bucket ?? undefined,
      path: StorageKey.create(model.path),
      filename: FileName.create(model.filename),
      mimeType: MimeType.create(model.mimeType),
      size: FileSize.create(model.size),
      checksum: model.checksum
        ? FileChecksum.create(model.checksum)
        : undefined,
      createdAt: model.createdAt,
      deletedAt: undefined,
    });
  }

  public toPersistence(aggregate: FileAssetAggregate): Record<string, unknown> {
    return {
      id: aggregate.id.toString(),
      uploadedById: aggregate.uploadedById.toString(),
      workspaceId: aggregate.workspaceId?.toValue() ?? null,
      provider: aggregate.provider,
      bucket: aggregate.bucket ?? null,
      path: aggregate.path.getValue(),
      filename: aggregate.filename.getValue(),
      mimeType: aggregate.mimeType.getValue(),
      size: aggregate.size.getBytes(),
      checksum: aggregate.checksum ? aggregate.checksum.getValue() : null,
      createdAt: aggregate.createdAt,
    };
  }
}
