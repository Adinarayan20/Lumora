import { Module } from '@nestjs/common';
import { ObjectsController } from './objects.controller.js';
import { ObjectsService } from './objects.service.js';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { RbacModule } from '../rbac/rbac.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { AuditLogRepository } from '../auth/repositories/audit-log.repository.js';
import {
  OBJECT_AGGREGATE_REPOSITORY_FACTORY_TOKEN,
  type ObjectAggregateRepositoryFactory,
} from './objects.tokens.js';
import { ObjectAggregateRepositoryAdapter } from '../../infrastructure/prisma/repositories/object-aggregate.repository.adapter.js';
import { WorkspaceExecutionContext } from '../../infrastructure/prisma/context/workspace-execution-context.js';
import { CreateObjectUseCase } from './use-cases/create-object.use-case.js';
import { GetWorkspaceObjectsQuery } from './use-cases/get-workspace-objects.query.js';
import { GetObjectQuery } from './use-cases/get-object.query.js';
import { UpdateObjectUseCase } from './use-cases/update-object.use-case.js';
import { DeleteObjectUseCase } from './use-cases/delete-object.use-case.js';

/**
 * ObjectsModule — ADR-016 migration complete.
 *
 * OBJECT_AGGREGATE_REPOSITORY_FACTORY_TOKEN provides a workspace-scoped
 * IObjectAggregateRepository factory. Tier 3 ObjectRepository is retired.
 */
@Module({
  imports: [PrismaModule, RbacModule, AuthModule],
  controllers: [ObjectsController],
  providers: [
    ObjectsService,
    AuditLogRepository,

    // Adapter factory: creates workspace-scoped IObjectAggregateRepository per command
    {
      provide: OBJECT_AGGREGATE_REPOSITORY_FACTORY_TOKEN,
      useFactory: (prisma: PrismaService): ObjectAggregateRepositoryFactory => {
        return (workspaceId: string, userId: string) => {
          const context = new WorkspaceExecutionContext(workspaceId, userId);
          return new ObjectAggregateRepositoryAdapter(prisma, context);
        };
      },
      inject: [PrismaService],
    },

    CreateObjectUseCase,
    GetWorkspaceObjectsQuery,
    GetObjectQuery,
    UpdateObjectUseCase,
    DeleteObjectUseCase,
  ],
  exports: [
    ObjectsService,
    AuditLogRepository,
    OBJECT_AGGREGATE_REPOSITORY_FACTORY_TOKEN,
  ],
})
export class ObjectsModule {}
