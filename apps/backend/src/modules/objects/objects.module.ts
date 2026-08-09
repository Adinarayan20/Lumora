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
    /**
     * Architecture status: LEGACY / ACTIVE — MIGRATION REQUIRED
     *
     * OBJECT_REPOSITORY_TOKEN currently resolves to the Tier 3 legacy ObjectRepository,
     * which directly accesses Prisma without implementing any domain interface.
     *
     * This binding is incorrect. It should resolve to an implementation of
     * IObjectAggregateRepository that delegates to PrismaObjectRepository (Tier 1).
     *
     * KNOWN DEFECT: CreateObjectUseCase.execute() calls .save(aggregate) which does not
     * exist on the Tier 3 ObjectRepository. The endpoint will throw a runtime TypeError.
     *
     * Migration target: Replace useClass with an ObjectAggregateRepositoryAdapter
     * implementing IObjectAggregateRepository. See ADR-016.
     *
     * DO NOT add new consumers that depend on this token resolving to Tier 3.
     */
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
