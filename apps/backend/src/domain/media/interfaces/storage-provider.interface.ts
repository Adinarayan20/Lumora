import { StorageKey } from '../value-objects/storage-key.js';
import { MimeType } from '../value-objects/mime-type.js';

export interface IStorageProvider {
  upload(
    path: StorageKey,
    content: Buffer,
    mimeType: MimeType,
  ): Promise<string>;
  delete(path: StorageKey): Promise<void>;
  getSignedUrl(path: StorageKey, expiresSeconds?: number): Promise<string>;
}
