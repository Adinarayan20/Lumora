export class FileAssetResponseDto {
  id!: string;
  uploadedById!: string;
  provider!: string;
  bucket?: string | undefined;
  path!: string;
  filename!: string;
  mimeType!: string;
  sizeBytes!: number;
  checksum?: string | undefined;
  createdAt!: string;
  deletedAt?: string | undefined;
}
