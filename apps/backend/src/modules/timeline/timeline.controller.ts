import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../rbac/guards/permissions.guard.js';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator.js';
import { Permissions } from '../rbac/constants/permissions.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { RecordTimelineActivityUseCase } from './use-cases/record-timeline-activity.use-case.js';
import { GetWorkspaceTimelineQuery } from './use-cases/get-workspace-timeline.query.js';
import { RecordTimelineActivityDto } from './dto/record-timeline-activity.dto.js';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('workspaces/:workspaceId/timeline')
export class TimelineController {
  constructor(
    private readonly recordActivityUseCase: RecordTimelineActivityUseCase,
    private readonly getWorkspaceTimelineQuery: GetWorkspaceTimelineQuery,
  ) {}

  /**
   * GET /workspaces/:workspaceId/timeline
   * Retrieves chronological timeline records for a workspace.
   * Optionally scoped to a single user with ?userId and bounded by ?limit.
   *
   * NOTE: In the full Outbox architecture, timeline records are populated
   * asynchronously by workers processing domain events. The GET endpoint
   * reads from the already-populated read-side projection.
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

  /**
   * POST /workspaces/:workspaceId/timeline
   * Records a timeline activity entry. Intended for internal use by
   * background workers consuming Outbox events. May also be called directly
   * during synchronous workflows that do not yet use the Outbox.
   */
  @Post()
  @RequirePermissions(Permissions.Object.Read)
    async recordActivity(
    @CurrentUser('id') _userId: string,
    @Body() dto: RecordTimelineActivityDto,
  ) {
    const result = await this.recordActivityUseCase.execute({ dto });

    if (result.isFailure) {
      throw new BadRequestException(result.getError().message);
    }

    return result.getValue();
  }
}


