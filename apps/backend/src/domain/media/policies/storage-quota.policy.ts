import { DomainValidationException } from '@lumora/shared';

export class StorageQuotaPolicy {
  public static readonly DEFAULT_USER_QUOTA_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB

  /**
   * Validates whether adding a file exceeds user storage quota limit.
   */
  public static validateStorageQuota(
    currentUsedBytes: number,
    newFileBytes: number,
    quotaBytes: number = this.DEFAULT_USER_QUOTA_BYTES,
  ): void {
    if (currentUsedBytes + newFileBytes > quotaBytes) {
      throw new DomainValidationException(
        `Storage quota limit of ${quotaBytes} bytes exceeded. Current: ${currentUsedBytes} bytes, Requesting: ${newFileBytes} bytes.`,
        { storageQuota: ['User storage quota limit exceeded.'] },
      );
    }
  }
}
