import { Injectable } from '@nestjs/common';

/**
 * MediaService — intentional stub.
 *
 * The Media module currently operates through use cases directly
 * (RegisterFileAssetUseCase, GetFileAssetQuery, DeleteFileAssetUseCase).
 * This service class exists as a registered provider for future
 * higher-level media orchestration (e.g. bulk upload, storage migration,
 * signed URL batch generation, media processing pipelines).
 *
 * Classification: DEFERRED — not legacy, not dead, intentionally empty.
 * Do NOT delete: it is a registered NestJS provider.
 */
@Injectable()
export class MediaService {}
