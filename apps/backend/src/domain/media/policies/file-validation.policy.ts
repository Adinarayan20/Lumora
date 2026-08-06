import { DomainValidationException } from '@lumora/shared';
import { MimeType } from '../value-objects/mime-type.js';
import { FileSize } from '../value-objects/file-size.js';

export class FileValidationPolicy {
  public static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'application/pdf',
    'application/json',
    'text/plain',
    'text/markdown',
    'audio/mpeg',
    'audio/wav',
    'video/mp4',
  ];

  /**
   * Validates whether a file MIME type is permitted by system security policy.
   */
  public static validateMimeType(mimeType: MimeType): void {
    if (!this.ALLOWED_MIME_TYPES.includes(mimeType.getValue())) {
      throw new DomainValidationException(
        `Disallowed file type '${mimeType.getValue()}'.`,
        { mimeType: [`MIME type ${mimeType.getValue()} is not permitted for upload.`] },
      );
    }
  }

  /**
   * Validates maximum file size limit.
   */
  public static validateFileSize(size: FileSize): void {
    if (size.getBytes() > FileSize.MAX_FILE_SIZE_BYTES) {
      throw new DomainValidationException(
        `File size ${size.getBytes()} bytes exceeds system limit of ${FileSize.MAX_FILE_SIZE_BYTES} bytes.`,
        { size: ['File exceeds 100 MB upload limit.'] },
      );
    }
  }
}
