import { Module, forwardRef } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceSlugService } from './services/workspace-slug.service';
import { WorkspaceMemberService } from './services/workspace-member.service';
import { WorkspaceInvitationService } from './services/workspace-invitation.service';
import { WorkspaceEventPublisherService } from './services/workspace-event-publisher.service';
import { WorkspaceRepository } from './repositories/workspace.repository';
import { WorkspaceMemberRepository } from './repositories/workspace-member.repository';
import { WorkspaceInvitationRepository } from './repositories/workspace-invitation.repository';
import { AuthModule } from '../auth/auth.module';
import { RbacModule } from '../rbac/rbac.module';
import {
  CreateWorkspaceUseCase,
  GetUserWorkspacesQuery,
  GetWorkspaceQuery,
  UpdateWorkspaceUseCase,
  DeleteWorkspaceUseCase,
  TransferOwnershipUseCase,
  GetMembersQuery,
  RemoveMemberUseCase,
  InviteMemberUseCase,
  GetInvitationsQuery,
  RevokeInvitationUseCase,
  AcceptInvitationUseCase,
} from './use-cases/workspace-use-cases';

@Module({
  imports: [forwardRef(() => AuthModule), RbacModule],
  controllers: [WorkspacesController],
  providers: [
    WorkspacesService,
    WorkspaceSlugService,
    WorkspaceMemberService,
    WorkspaceInvitationService,
    WorkspaceEventPublisherService,
    WorkspaceRepository,
    WorkspaceMemberRepository,
    WorkspaceInvitationRepository,
    // CQRS Use Cases
    CreateWorkspaceUseCase,
    GetUserWorkspacesQuery,
    GetWorkspaceQuery,
    UpdateWorkspaceUseCase,
    DeleteWorkspaceUseCase,
    TransferOwnershipUseCase,
    GetMembersQuery,
    RemoveMemberUseCase,
    InviteMemberUseCase,
    GetInvitationsQuery,
    RevokeInvitationUseCase,
    AcceptInvitationUseCase,
  ],
  exports: [
    WorkspacesService,
    WorkspaceMemberService,
    WorkspaceInvitationService,
    WorkspaceRepository,
    WorkspaceMemberRepository,
    WorkspaceInvitationRepository,
  ],
})
export class WorkspacesModule {}
