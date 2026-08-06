import { describe, it, expect } from 'vitest';
import { IdGenerator, DomainValidationException } from '@lumora/shared';
import { FileAssetAggregate } from '../file-asset.aggregate.js';
import { FileProvider } from '../value-objects/file-provider.enum.js';

describe('FileAssetAggregate Invariants & Rules', () => {
  it('should successfully create a valid FileAssetAggregate and emit FileAssetUploadedEvent', () => {
    const userId = IdGenerator.generate();

    const asset = FileAssetAggregate.create({
      uploadedById: userId,
      provider: FileProvider.LOCAL,
      path: 'uploads/2026/test.pdf',
      filename: 'test.pdf',
      mimeType: 'application/pdf',
      size: 1024 * 50,
    });

    expect(asset.uploadedById.toString()).toBe(userId.toString());
    expect(asset.filename.getValue()).toBe('test.pdf');
    expect(asset.mimeType.getValue()).toBe('application/pdf');
    expect(asset.size.getBytes()).toBe(51200);
    expect(asset.pullDomainEvents()).toHaveLength(1);
  });

  it('should mark asset as deleted and emit FileAssetDeletedEvent', () => {
    const userId = IdGenerator.generate();

    const asset = FileAssetAggregate.create({
      uploadedById: userId,
      provider: FileProvider.LOCAL,
      path: 'uploads/2026/test.png',
      filename: 'test.png',
      mimeType: 'image/png',
      size: 2048,
    });
    asset.pullDomainEvents(); // Clear uploaded event

    asset.markAsDeleted();

    expect(asset.deletedAt).toBeDefined();
    expect(asset.pullDomainEvents()).toHaveLength(1);
  });

  it('should throw DomainValidationException on path traversal in storage key', () => {
    const userId = IdGenerator.generate();

    expect(() =>
      FileAssetAggregate.create({
        uploadedById: userId,
        provider: FileProvider.LOCAL,
        path: '../dangerous/etc/passwd',
        filename: 'passwd',
        mimeType: 'text/plain',
        size: 100,
      }),
    ).toThrow(DomainValidationException);
  });
});
