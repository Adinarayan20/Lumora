import { Module } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { RoleRepository } from './repositories/role.repository';
import { WorkspaceMemberRepository } from './repositories/workspace-member.repository';
import { PermissionsGuard } from './guards/permissions.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    RbacService,
    RoleRepository,
    WorkspaceMemberRepository,
    PermissionsGuard,
  ],
  exports: [
    RbacService,
    RoleRepository,
    WorkspaceMemberRepository,
    PermissionsGuard,
  ],
})
export class RbacModule {}
