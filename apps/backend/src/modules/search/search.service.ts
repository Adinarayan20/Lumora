import { Injectable } from '@nestjs/common';

/**
 * SearchService — intentional stub.
 *
 * The Search module currently operates through use cases directly
 * (SearchObjectsQuery, IndexEntityUseCase, RemoveSearchIndexUseCase).
 * This service class exists as a registered provider for future
 * higher-level search orchestration (e.g. multi-index federated search,
 * search analytics, reindex-all operations).
 *
 * Classification: DEFERRED — not legacy, not dead, intentionally empty.
 * Do NOT delete: it is a registered NestJS provider.
 */
@Injectable()
export class SearchService {}
