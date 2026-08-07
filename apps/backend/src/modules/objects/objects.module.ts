import { Module } from '@nestjs/common';
import { ObjectsController } from './objects.controller.js';
import { ObjectsService } from './objects.service.js';
import { ObjectRepository } from './repositories/object.repository.js';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module.js';
import { RbacModule } from '../rbac/rbac.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { OBJECT_REPOSITORY_TOKEN } from './objects.tokens.js';
import { CreateObjectUseCase } from './use-cases/create-object.use-case.js';
import { GetWorkspaceObjectsQuery } from './use-cases/get-workspace-objects.query.js';
import { GetObjectQuery } from './use-cases/get-object.query.js';
import { UpdateObjectUseCase } from './use-cases/update-object.use-case.js';
import { DeleteObjectUseCase } from './use-cases/delete-object.use-case.js';

@Module({
  imports: [PrismaModule, RbacModule, AuthModule],
  controllers: [ObjectsController],
  providers: [
    ObjectsService,
    ObjectRepository,
    {
      provide: OBJECT_REPOSITORY_TOKEN,
      useClass: ObjectRepository,
    },
    CreateObjectUseCase,
    GetWorkspaceObjectsQuery,
    GetObjectQuery,
    UpdateObjectUseCase,
    DeleteObjectUseCase,
  ],
  exports: [ObjectsService, ObjectRepository, OBJECT_REPOSITORY_TOKEN],
})
export class ObjectsModule {}
