import { FileAssetAggregate } from '../../../domain/media/file-asset.aggregate.js';
import { FileAssetResponseDto } from '../dto/file-asset-response.dto.js';

export class FileAssetResponseMapper {
  public static toResponseDto(aggregate: FileAssetAggregate): FileAssetResponseDto {
    return {
      id: aggregate.id.toString(),
      uploadedById: aggregate.uploadedById.toString(),
      provider: aggregate.provider,
      bucket: aggregate.bucket,
      path: aggregate.path.getValue(),
      filename: aggregate.filename.getValue(),
      mimeType: aggregate.mimeType.getValue(),
      sizeBytes: aggregate.size.getBytes(),
      checksum: aggregate.checksum ? aggregate.checksum.getValue() : undefined,
      createdAt: aggregate.createdAt.toISOString(),
      deletedAt: aggregate.deletedAt ? aggregate.deletedAt.toISOString() : undefined,
    };
  }
}
