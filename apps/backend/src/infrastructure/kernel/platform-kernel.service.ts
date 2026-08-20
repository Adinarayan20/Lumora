import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  BUILT_IN_CATALOG_DEFINITIONS,
  ObjectCatalogRegistry,
} from '@lumora/shared';
import type { RedisSchemaCache } from '../catalog/redis-schema.cache.js';

export interface KernelBootResult {
  initialized: boolean;
  durationMs: number;
  bootedAt: Date;
}

export interface IPlatformKernel {
  bootstrap(): Promise<KernelBootResult>;
  isBooted(): boolean;
}

/**
 * LumoraPlatformKernel — lightweight boot-time verification service.
 *
 * Responsibilities:
 *   1. Confirm that ObjectCatalogRegistry is loaded and contains expected types.
 *   2. Probe Redis Schema Cache connectivity (non-fatal: cache-miss fallback active).
 *
 * What this service deliberately does NOT do:
 *   - It does not register capabilities into a runtime registry (the capability
 *     engine has been removed: see cleanup report §10).
 *   - It does not maintain a list of built-in capability descriptors.
 *   - It does not require any capability infrastructure to boot.
 */
@Injectable()
export class LumoraPlatformKernel implements IPlatformKernel, OnModuleInit {
  private readonly logger = new Logger(LumoraPlatformKernel.name);
  private _isBooted = false;

  constructor(
    private readonly schemaCache: RedisSchemaCache,
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.bootstrap();
  }

  public async bootstrap(): Promise<KernelBootResult> {
    if (this._isBooted) {
      return { initialized: true, durationMs: 0, bootedAt: new Date() };
    }

    const startTime = Date.now();

    // Step 1: Verify ObjectCatalogRegistry is loaded (static, always ready)
    const registeredTypes = ObjectCatalogRegistry.getAll();
    this.logger.log(
      `[Kernel] ObjectCatalogRegistry: ${registeredTypes.length} built-in types — ${registeredTypes.map((t) => t.typeKey).join(', ')}`,
    );

    if (registeredTypes.length === 0) {
      this.logger.warn('[Kernel] WARNING: ObjectCatalogRegistry returned zero types. Check @lumora/shared build.');
    }

    // Step 2: Log type → extension mappings at DEBUG level
    for (const def of BUILT_IN_CATALOG_DEFINITIONS) {
      this.logger.debug(
        `[Kernel] Type '${def.typeKey}' — extensions: [${def.supportedExtensions.join(', ')}]`,
      );
    }

    // Step 3: Probe Redis Schema Cache (non-blocking)
    try {
      await this.schemaCache.getSchema('__kernel_probe__', '__probe__');
      this.logger.log('[Kernel] Redis Schema Cache — connected.');
    } catch {
      this.logger.warn('[Kernel] Redis Schema Cache — unavailable (non-fatal, cache-miss fallback active).');
    }

    const durationMs = Date.now() - startTime;
    this._isBooted = true;
    this.logger.log(`[Kernel] Boot complete in ${durationMs}ms.`);

    return { initialized: true, durationMs, bootedAt: new Date() };
  }

  public isBooted(): boolean {
    return this._isBooted;
  }
}
