import { Injectable } from '@nestjs/common';

/**
 * CatalogService — intentional stub.
 *
 * The Catalog module currently exposes object type metadata via
 * the in-memory ObjectCatalogRegistry and SchemaRegistryAggregate.
 * This service class exists for future higher-level catalog operations
 * (e.g. exposing built-in catalog definitions to the API, allowing
 * workspace-level schema customisation queries, catalog validation).
 *
 * Classification: DEFERRED — not legacy, not dead, intentionally empty.
 * Do NOT delete: it is a registered NestJS provider.
 */
@Injectable()
export class CatalogService {}
