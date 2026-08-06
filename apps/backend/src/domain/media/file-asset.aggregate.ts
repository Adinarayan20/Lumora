import { AggregateRoot, UniqueEntityId, Guard } from '@lumora/shared';
import { FileProvider } from './value-objects/file-provider.enum.js';
import { FileName } from './value-objects/file-name.js';
import { FileSize } from './value-objects/file-size.js';
import { MimeType } from './value-objects/mime-type.js';
import { StorageKey } from './value-objects/storage-key.js';
import { FileChecksum } from './value-objects/file-checksum.js';
import { FileValidationPolicy } from './policies/file-validation.policy.js';
import {
  FileAssetUploadedEvent,
  FileAssetDeletedEvent,
} from './events/media.events.js';

export interface FileAssetAggregateProps {
  id?: UniqueEntityId;
  uploadedById: UniqueEntityId;
  provider: FileProvider;
  bucket?: string;
  path: StorageKey;
  filename: FileName;
  mimeType: MimeType;
  size: FileSize;
  checksum?: FileChecksum;
  createdAt?: Date;
  deletedAt?: Date;
}

/**
 * Domain Aggregate Root representing an uploaded media asset and storage lifecycle.
 */
export class FileAssetAggregate extends AggregateRoot<UniqueEntityId> {
  public readonly uploadedById: UniqueEntityId;
  public readonly provider: FileProvider;
  public readonly bucket?: string | undefined;
  public path: StorageKey;
  public filename: FileName;
  public readonly mimeType: MimeType;
  public readonly size: FileSize;
  public checksum?: FileChecksum | undefined;
  public readonly createdAt: Date;
  public deletedAt?: Date | undefined;

  private constructor(props: FileAssetAggregateProps) {
    super(props.id);
    this.uploadedById = props.uploadedById;
    this.provider = props.provider;
    this.bucket = props.bucket;
    this.path = props.path;
    this.filename = props.filename;
    this.mimeType = props.mimeType;
    this.size = props.size;
    this.checksum = props.checksum;
    this.createdAt = props.createdAt ?? new Date();
    this.deletedAt = props.deletedAt;
  }

  public static create(
    props: Omit<
      FileAssetAggregateProps,
      'path' | 'filename' | 'mimeType' | 'size' | 'checksum'
    > & {
      path: StorageKey | string;
      filename: FileName | string;
      mimeType: MimeType | string;
      size: FileSize | number;
      checksum?: FileChecksum | string;
    },
  ): FileAssetAggregate {
    const userGuard = Guard.againstNullOrUndefined(
      props.uploadedById,
      'uploadedById',
    );
    if (userGuard.isFailure) throw userGuard.getError();

    const pathObj =
      typeof props.path === 'string'
        ? StorageKey.create(props.path)
        : props.path;
    const filenameObj =
      typeof props.filename === 'string'
        ? FileName.create(props.filename)
        : props.filename;
    const mimeTypeObj =
      typeof props.mimeType === 'string'
        ? MimeType.create(props.mimeType)
        : props.mimeType;
    const sizeObj =
      typeof props.size === 'number' ? FileSize.create(props.size) : props.size;
    const checksumObj =
      typeof props.checksum === 'string'
        ? FileChecksum.create(props.checksum)
        : props.checksum;

    FileValidationPolicy.validateMimeType(mimeTypeObj);
    FileValidationPolicy.validateFileSize(sizeObj);

    const aggregate = new FileAssetAggregate({
      ...props,
      path: pathObj,
      filename: filenameObj,
      mimeType: mimeTypeObj,
      size: sizeObj,
      checksum: checksumObj,
    });

    aggregate.addDomainEvent(
      new FileAssetUploadedEvent(
        aggregate.id,
        aggregate.uploadedById,
        aggregate.filename.getValue(),
        aggregate.mimeType.getValue(),
        aggregate.size.getBytes(),
      ),
    );

    return aggregate;
  }

  public static reconstitute(
    props: FileAssetAggregateProps,
  ): FileAssetAggregate {
    return new FileAssetAggregate(props);
  }

  public updatePath(newPath: StorageKey): void {
    this.path = newPath;
  }

  public recordChecksum(checksum: FileChecksum): void {
    this.checksum = checksum;
  }

  public markAsDeleted(deletedAt: Date = new Date()): void {
    this.deletedAt = deletedAt;
    this.addDomainEvent(
      new FileAssetDeletedEvent(
        this.id,
        this.uploadedById,
        this.path.getValue(),
      ),
    );
  }
}
