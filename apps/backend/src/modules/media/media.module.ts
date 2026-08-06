import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module.js';
import { PrismaFileAssetRepository } from '../../infrastructure/prisma/repositories/prisma-file-asset.repository.js';
import { LocalStorageProvider } from '../../infrastructure/storage/local-storage.provider.js';
import { MediaService } from './media.service.js';
import { MediaController } from './media.controller.js';
import {
  MEDIA_REPOSITORY_TOKEN,
  STORAGE_PROVIDER_TOKEN,
} from './media.tokens.js';
import { RegisterFileAssetUseCase } from './use-cases/register-file-asset.use-case.js';
import { DeleteFileAssetUseCase } from './use-cases/delete-file-asset.use-case.js';
import { GetFileAssetQuery } from './use-cases/get-file-asset.query.js';

@Module({
  imports: [PrismaModule],
  providers: [
    MediaService,
    {
      provide: MEDIA_REPOSITORY_TOKEN,
      useClass: PrismaFileAssetRepository,
    },
    {
      provide: STORAGE_PROVIDER_TOKEN,
      useClass: LocalStorageProvider,
    },
    RegisterFileAssetUseCase,
    DeleteFileAssetUseCase,
    GetFileAssetQuery,
  ],
  controllers: [MediaController],
  exports: [
    RegisterFileAssetUseCase,
    DeleteFileAssetUseCase,
    GetFileAssetQuery,
    MEDIA_REPOSITORY_TOKEN,
    STORAGE_PROVIDER_TOKEN,
  ],
})
export class MediaModule {}
