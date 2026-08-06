import type { UniqueEntityId } from '@lumora/shared';
import type { IBaseRepository } from '../../common/repositories/base.repository.interface.js';
import type { FileAssetAggregate } from '../file-asset.aggregate.js';

export interface IFileAssetRepository extends IBaseRepository<FileAssetAggregate, UniqueEntityId> {
  findByUploadedUserId(uploadedById: UniqueEntityId): Promise<FileAssetAggregate[]>;
  calculateUserTotalStorageBytes(uploadedById: UniqueEntityId): Promise<number>;
}
