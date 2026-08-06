import { Module } from '@nestjs/common';
import { ObjectsController } from './objects.controller';
import { ObjectsService } from './objects.service';
import { ObjectRepository } from './repositories/object.repository';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';
import { AuthModule } from '../auth/auth.module';
import { CreateObjectFacadeUseCase } from './use-cases/create-object-facade.use-case';
import { GetWorkspaceObjectsQuery } from './use-cases/get-workspace-objects.query';
import { GetObjectQuery } from './use-cases/get-object.query';
import { UpdateObjectUseCase } from './use-cases/update-object.use-case';
import { DeleteObjectUseCase } from './use-cases/delete-object.use-case';

@Module({
  imports: [PrismaModule, RbacModule, AuthModule],
  controllers: [ObjectsController],
  providers: [
    ObjectsService,
    ObjectRepository,
    CreateObjectFacadeUseCase,
    GetWorkspaceObjectsQuery,
    GetObjectQuery,
    UpdateObjectUseCase,
    DeleteObjectUseCase,
  ],
  exports: [ObjectsService, ObjectRepository],
})
export class ObjectsModule {}
