import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module.js';
import { RbacModule } from '../rbac/rbac.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { ObjectsModule } from '../objects/objects.module.js';
import { PrismaRelationshipRepository } from '../../infrastructure/prisma/repositories/prisma-relationship.repository.js';
import { RELATIONSHIP_REPOSITORY_TOKEN } from './relationships.tokens.js';
import { RelationshipsController } from './relationships.controller.js';
import { CreateRelationshipUseCase } from './use-cases/create-relationship.use-case.js';
import { GetObjectRelationshipsQuery } from './use-cases/get-object-relationships.query.js';
import { DeleteRelationshipUseCase } from './use-cases/delete-relationship.use-case.js';

@Module({
  imports: [PrismaModule, RbacModule, AuthModule, ObjectsModule],
  controllers: [RelationshipsController],
  providers: [
    PrismaRelationshipRepository,
    {
      provide: RELATIONSHIP_REPOSITORY_TOKEN,
      useClass: PrismaRelationshipRepository,
    },
    CreateRelationshipUseCase,
    GetObjectRelationshipsQuery,
    DeleteRelationshipUseCase,
  ],
  exports: [RELATIONSHIP_REPOSITORY_TOKEN],
})
export class RelationshipsModule {}
