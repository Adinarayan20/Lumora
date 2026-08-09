import { describe, it, expect, vi } from 'vitest';
import { IdGenerator, UniqueEntityId } from '@lumora/shared';
import { DeleteFileAssetUseCase } from '../delete-file-asset.use-case.js';
import { FileAssetAggregate } from '../../../../domain/media/file-asset.aggregate.js';
import { FileProvider } from '../../../../domain/media/value-objects/file-provider.enum.js';
import type { IFileAssetRepository } from '../../../../domain/media/repositories/file-asset.repository.interface.js';
import type { IStorageProvider } from '../../../../domain/media/interfaces/storage-provider.interface.js';

describe('DeleteFileAssetUseCase', () => {
  const makeAggregate = (userId: string, assetId: string, workspaceId?: string) =>
    FileAssetAggregate.create({
      id: new UniqueEntityId(assetId),
      uploadedById: new UniqueEntityId(userId),
      workspaceId: workspaceId ? new UniqueEntityId(workspaceId) : undefined,
      provider: FileProvider.LOCAL,
      path: 'uploads/2026/doc.pdf',
      filename: 'doc.pdf',
      mimeType: 'application/pdf',
      size: 5000,
    });

  it('should mark asset as deleted and remove from storage provider', async () => {
    const workspaceId = IdGenerator.generate();
    const userId = IdGenerator.generate();
    const assetId = IdGenerator.generate();
    const aggregate = makeAggregate(userId, assetId, workspaceId);

    const mockRepo: IFileAssetRepository = {
      findById: vi.fn().mockResolvedValue(aggregate),
      exists: vi.fn().mockResolvedValue(true),
      save: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
      findByUploadedUserId: vi.fn(),
      calculateUserTotalStorageBytes: vi.fn(),
    };
    const mockStorage: IStorageProvider = {
      upload: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
      getSignedUrl: vi.fn(),
    };

    const useCase = new DeleteFileAssetUseCase(mockRepo, mockStorage);
    const result = await useCase.execute({
      workspaceId,
      fileAssetId: assetId,
      requestedById: userId,
    });

    expect(result.isSuccess).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockStorage.delete).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepo.delete).toHaveBeenCalled();
  });

  it('should fail if unauthorized user attempts deletion', async () => {
    const workspaceId = IdGenerator.generate();
    const userId = IdGenerator.generate();
    const otherUserId = IdGenerator.generate();
    const assetId = IdGenerator.generate();
    const aggregate = makeAggregate(userId, assetId, workspaceId);

    const mockRepo: IFileAssetRepository = {
      findById: vi.fn().mockResolvedValue(aggregate),
      exists: vi.fn().mockResolvedValue(true),
      save: vi.fn(),
      delete: vi.fn(),
      findByUploadedUserId: vi.fn(),
      calculateUserTotalStorageBytes: vi.fn(),
    };
    const mockStorage: IStorageProvider = {
      upload: vi.fn(),
      delete: vi.fn(),
      getSignedUrl: vi.fn(),
    };

    const useCase = new DeleteFileAssetUseCase(mockRepo, mockStorage);
    const result = await useCase.execute({
      workspaceId,
      fileAssetId: assetId,
      requestedById: otherUserId,
    });

    expect(result.isSuccess).toBe(false);
    expect(result.getError().message).toContain('Only the uploader');
  });
});
