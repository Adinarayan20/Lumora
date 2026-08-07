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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IndexEntityUseCase } from './use-cases/index-entity.use-case.js';
import { RemoveSearchIndexUseCase } from './use-cases/remove-search-index.use-case.js';
import { SearchObjectsQuery } from './use-cases/search-objects.query.js';
import { SearchQueryDto } from './dto/search-query.dto.js';
import { IndexEntityDto } from './dto/index-entity.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(
    private readonly indexEntityUseCase: IndexEntityUseCase,
    private readonly removeSearchIndexUseCase: RemoveSearchIndexUseCase,
    private readonly searchObjectsQuery: SearchObjectsQuery,
  ) {}

  /**
   * GET /search
   * Full-text search across indexed entities within Lumora.
   */
  @Get()
  async search(@Query() dto: SearchQueryDto) {
    const result = await this.searchObjectsQuery.execute({ dto });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  /**
   * POST /search/index
   * Indexes or re-indexes a single entity projection.
   * Typically called by internal workers consuming domain events from the Outbox.
   */
  @Post('index')
  async indexEntity(@Body() dto: IndexEntityDto) {
    const result = await this.indexEntityUseCase.execute({ dto });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  /**
   * DELETE /search/index/:entityCategory/:entityId
   * Removes an entity projection from the search index.
   * Typically called by internal workers when an entity is deleted.
   */
  @Delete('index/:entityCategory/:entityId')
  @HttpCode(HttpStatus.OK)
  async removeIndex(
    @Param('entityCategory') entityCategory: string,
    @Param('entityId') entityId: string,
  ) {
    const result = await this.removeSearchIndexUseCase.execute({
      entityCategory,
      entityId,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }
}
