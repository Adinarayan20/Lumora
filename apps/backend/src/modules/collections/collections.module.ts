import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller.js';
import { CollectionsService } from './collections.service.js';
import { CollectionRepository } from './repositories/collection.repository.js';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module.js';
import { RbacModule } from '../rbac/rbac.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { ObjectsModule } from '../objects/objects.module.js';
import {
  CreateCollectionUseCase,
  GetWorkspaceCollectionsQuery,
  GetCollectionQuery,
  UpdateCollectionUseCase,
  DeleteCollectionUseCase,
  AddCollectionItemUseCase,
  RemoveCollectionItemUseCase,
} from './use-cases/collection-use-cases.js';

@Module({
  imports: [PrismaModule, RbacModule, AuthModule, ObjectsModule],
  controllers: [CollectionsController],
  providers: [
    CollectionsService,
    CollectionRepository,
    CreateCollectionUseCase,
    GetWorkspaceCollectionsQuery,
    GetCollectionQuery,
    UpdateCollectionUseCase,
    DeleteCollectionUseCase,
    AddCollectionItemUseCase,
    RemoveCollectionItemUseCase,
  ],
  exports: [CollectionsService, CollectionRepository],
})
export class CollectionsModule {}
