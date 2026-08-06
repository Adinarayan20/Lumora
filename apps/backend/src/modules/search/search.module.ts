import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module.js';
import { PrismaSearchRepository } from '../../infrastructure/prisma/repositories/prisma-search.repository.js';
import { SearchService } from './search.service.js';
import { SearchController } from './search.controller.js';
import { SEARCH_REPOSITORY_TOKEN } from './search.tokens.js';
import { IndexEntityUseCase } from './use-cases/index-entity.use-case.js';
import { RemoveSearchIndexUseCase } from './use-cases/remove-search-index.use-case.js';
import { SearchObjectsQuery } from './use-cases/search-objects.query.js';

@Module({
  imports: [PrismaModule],
  providers: [
    SearchService,
    {
      provide: SEARCH_REPOSITORY_TOKEN,
      useClass: PrismaSearchRepository,
    },
    IndexEntityUseCase,
    RemoveSearchIndexUseCase,
    SearchObjectsQuery,
  ],
  controllers: [SearchController],
  exports: [
    IndexEntityUseCase,
    RemoveSearchIndexUseCase,
    SearchObjectsQuery,
    SEARCH_REPOSITORY_TOKEN,
  ],
})
export class SearchModule {}
