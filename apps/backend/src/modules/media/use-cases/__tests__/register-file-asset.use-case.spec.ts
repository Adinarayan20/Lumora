import { describe, it, expect, vi } from 'vitest';
import { IdGenerator } from '@lumora/shared';
import { RegisterFileAssetUseCase } from '../register-file-asset.use-case.js';
import type { IFileAssetRepository } from '../../../../domain/media/repositories/file-asset.repository.interface.js';

describe('RegisterFileAssetUseCase', () => {
  it('should register file asset and return FileAssetResponseDto', async () => {
    const userId = IdGenerator.generate();
    const workspaceId = IdGenerator.generate();
    const mockRepo: IFileAssetRepository = {
      findById: vi.fn(),
      exists: vi.fn().mockResolvedValue(false),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
      findByUploadedUserId: vi.fn(),
      calculateUserTotalStorageBytes: vi.fn().mockResolvedValue(0),
    };

    const useCase = new RegisterFileAssetUseCase(mockRepo);
    const result = await useCase.execute({
      workspaceId,
      uploadedById: userId,
      dto: {
        path: 'documents/2026/report.pdf',
        filename: 'report.pdf',
        mimeType: 'application/pdf',
        size: 1024 * 10,
      },
    });

    expect(result.isSuccess).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('should fail when storage quota exceeded', async () => {
    const userId = IdGenerator.generate();
    const workspaceId = IdGenerator.generate();
    const mockRepo: IFileAssetRepository = {
      findById: vi.fn(),
      exists: vi.fn().mockResolvedValue(false),
      save: vi.fn(),
      delete: vi.fn(),
      findByUploadedUserId: vi.fn(),
      calculateUserTotalStorageBytes: vi
        .fn()
        .mockResolvedValue(1024 * 1024 * 1024 * 100),
    };

    const useCase = new RegisterFileAssetUseCase(mockRepo);
    const result = await useCase.execute({
      workspaceId,
      uploadedById: userId,
      dto: {
        path: 'documents/large.pdf',
        filename: 'large.pdf',
        mimeType: 'application/pdf',
        size: 1024 * 1024 * 200,
      },
    });

    expect(result.isSuccess).toBe(false);
  });
});
