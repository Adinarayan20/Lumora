import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../rbac/guards/permissions.guard.js';
import { GetWorkspaceTimelineQuery } from './use-cases/get-workspace-timeline.query.js';

//
// POST /workspaces/:workspaceId/timeline was removed.
//
// Reason: Timeline is a Tier-3 read projection driven exclusively by the
// transactional Outbox. No client — internal or external — writes to it
// directly. The prior endpoint was gated by Permissions.Object.Read
// (a READ permission guarding a WRITE operation), which was both an
// architecture violation (02 Invariant 5, 03 §7) and a security defect:
// any authenticated user with read access could inject arbitrary audit
// entries with no connection to real domain events.
//
// Timeline entries are written only by OutboxEventHandlerService →
// RecordTimelineActivityUseCase, never by HTTP request.
//

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('workspaces/:workspaceId/timeline')
export class TimelineController {
  constructor(
    private readonly getWorkspaceTimelineQuery: GetWorkspaceTimelineQuery,
  ) {}

  /**
   * GET /workspaces/:workspaceId/timeline
   *
   * Read-only. Returns timeline records for a workspace, populated by
   * the Outbox worker processing ObjectCreated/Updated/Deleted domain events.
   *
   * Query params:
   *   ?userId   — filter to a specific actor
   *   ?objectId — filter to a specific object
   *   ?limit    — maximum entries to return (positive integer)
   */
  @Get()
  async getWorkspaceTimeline(
    @Param('workspaceId') workspaceId: string,
    @Query('userId') userId?: string,
    @Query('objectId') objectId?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;

    if (parsedLimit !== undefined && (isNaN(parsedLimit) || parsedLimit < 1)) {
      throw new BadRequestException('limit must be a positive integer');
    }

    const result = await this.getWorkspaceTimelineQuery.execute({
      workspaceId,
      userId,
      objectId,
      limit: parsedLimit,
    });

    if (result.isFailure) {
      throw new InternalServerErrorException(result.getError().message);
    }
    return result.getValue();
  }
}
