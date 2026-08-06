import { Injectable } from '@nestjs/common';
import type { IStorageProvider } from '../../domain/media/interfaces/storage-provider.interface.js';
import { StorageKey } from '../../domain/media/value-objects/storage-key.js';
import { MimeType } from '../../domain/media/value-objects/mime-type.js';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly storageMap = new Map<string, Buffer>();

  public upload(
    path: StorageKey,
    content: Buffer,
    _mimeType: MimeType,
  ): Promise<string> {
    void _mimeType;
    this.storageMap.set(path.getValue(), content);
    return Promise.resolve(`/storage/local/${path.getValue()}`);
  }

  public delete(path: StorageKey): Promise<void> {
    this.storageMap.delete(path.getValue());
    return Promise.resolve();
  }

  public getSignedUrl(
    path: StorageKey,
    _expiresSeconds = 3600,
  ): Promise<string> {
    void _expiresSeconds;
    return Promise.resolve(
      `http://localhost:3000/api/v1/media/download?key=${encodeURIComponent(path.getValue())}`,
    );
  }
}
