import { Module } from '@nestjs/common';
import { SpacesController } from './spaces.controller';
import { SpacesService } from './spaces.service';
import { SpaceRepository } from './repositories/space.repository';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';
import { AuthModule } from '../auth/auth.module';
import {
  CreateSpaceUseCase,
  GetWorkspaceSpacesQuery,
  GetSpaceQuery,
  UpdateSpaceUseCase,
  DeleteSpaceUseCase,
} from './use-cases/space-use-cases';

@Module({
  imports: [PrismaModule, RbacModule, AuthModule],
  controllers: [SpacesController],
  providers: [
    SpacesService,
    SpaceRepository,
    CreateSpaceUseCase,
    GetWorkspaceSpacesQuery,
    GetSpaceQuery,
    UpdateSpaceUseCase,
    DeleteSpaceUseCase,
  ],
  exports: [SpacesService, SpaceRepository],
})
export class SpacesModule {}
