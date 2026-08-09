import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { IndexEntityUseCase } from './use-cases/index-entity.use-case.js';
import { RemoveSearchIndexUseCase } from './use-cases/remove-search-index.use-case.js';
import { SearchObjectsQuery } from './use-cases/search-objects.query.js';
import { SearchQueryDto } from './dto/search-query.dto.js';
import { IndexEntityDto } from './dto/index-entity.dto.js';

/**
 * SearchController — workspace-scoped search API.
 *
 * GET /workspaces/:workspaceId/search — workspace-isolated search (Phase F fix).
 * Previously the route was /search with no workspace scope — a security gap.
 *
 * Internal indexing endpoints (POST/DELETE) remain for Outbox worker use.
 */
@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/search')
export class SearchController {
  constructor(
    private readonly indexEntityUseCase: IndexEntityUseCase,
    private readonly removeSearchIndexUseCase: RemoveSearchIndexUseCase,
    private readonly searchObjectsQuery: SearchObjectsQuery,
  ) {}

  /**
   * GET /workspaces/:workspaceId/search?query=...
   * Workspace-scoped full-text search.
   */
  @Get()
  async search(
    @Param('workspaceId') workspaceId: string,
    @Query() dto: SearchQueryDto,
  ) {
    const result = await this.searchObjectsQuery.execute({ workspaceId, dto });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  /**
   * POST /workspaces/:workspaceId/search/index
   * Indexes or re-indexes an entity projection. Called by Outbox workers.
   */
  @Post('index')
  async indexEntity(@Body() dto: IndexEntityDto) {
    const result = await this.indexEntityUseCase.execute({ dto });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  /**
   * DELETE /workspaces/:workspaceId/search/index/:entityCategory/:entityId
   */
  @Delete('index/:entityCategory/:entityId')
  @HttpCode(HttpStatus.OK)
  async removeIndex(
    @Param('workspaceId') workspaceId: string,
    @Param('entityCategory') entityCategory: string,
    @Param('entityId') entityId: string,
  ) {
    const result = await this.removeSearchIndexUseCase.execute({
      workspaceId,
      entityCategory,
      entityId,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }
}
