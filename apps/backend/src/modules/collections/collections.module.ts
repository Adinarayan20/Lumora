import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { CollectionRepository } from './repositories/collection.repository';
import { ObjectRepository } from '../objects/repositories/object.repository';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';
import { AuthModule } from '../auth/auth.module';
import {
  CreateCollectionUseCase,
  GetWorkspaceCollectionsQuery,
  GetCollectionQuery,
  UpdateCollectionUseCase,
  DeleteCollectionUseCase,
  AddCollectionItemUseCase,
  RemoveCollectionItemUseCase,
} from './use-cases/collection-use-cases';

@Module({
  imports: [PrismaModule, RbacModule, AuthModule],
  controllers: [CollectionsController],
  providers: [
    CollectionsService,
    CollectionRepository,
    ObjectRepository,
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
