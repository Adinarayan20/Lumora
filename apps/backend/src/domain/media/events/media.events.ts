import {
  UniqueEntityId,
  InstantString,
  MediaEventName,
  DomainEvent,
} from '@lumora/shared';

export class FileAssetUploadedEvent implements DomainEvent<MediaEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = MediaEventName.UPLOADED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly uploadedById: string;
    readonly filename: string;
    readonly mimeType: string;
    readonly sizeBytes: number;
  };

  constructor(
    fileAssetId: UniqueEntityId,
    uploadedById: UniqueEntityId,
    filename: string,
    mimeType: string,
    sizeBytes: number,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = fileAssetId;
    this.workspaceId = uploadedById; // Uses uploader identity for event correlation
    this.occurredAt = new Date().toISOString() as InstantString;
    this.payload = Object.freeze({
      uploadedById: uploadedById.toString(),
      filename,
      mimeType,
      sizeBytes,
    });
  }
}

export class FileAssetDeletedEvent implements DomainEvent<MediaEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = MediaEventName.DELETED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly uploadedById: string;
    readonly path: string;
  };

  constructor(
    fileAssetId: UniqueEntityId,
    uploadedById: UniqueEntityId,
    path: string,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = fileAssetId;
    this.workspaceId = uploadedById;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.payload = Object.freeze({
      uploadedById: uploadedById.toString(),
      path,
    });
  }
}
