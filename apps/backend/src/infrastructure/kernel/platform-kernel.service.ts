import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  BUILT_IN_CATALOG_DEFINITIONS,
  ObjectCatalogRegistry,
} from '@lumora/shared';
import type { CapabilityDescriptor } from '@lumora/shared';
import {
  ExecutionPolicy,
  FailurePolicy,
} from '@lumora/shared';
import type { RedisSchemaCache } from '../catalog/redis-schema.cache.js';
import { CapabilityRegistry } from '../../domain/capabilities/capability-registry.js';
import { UniversalCapabilityEngine } from '../../domain/capabilities/universal-capability-engine.js';

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
 * Built-in capability descriptors derived from BUILT_IN_CATALOG_DEFINITIONS.
 * These map BehaviorExtensionKey values to registered CapabilityDescriptors.
 */
const BUILT_IN_CAPABILITIES: readonly CapabilityDescriptor[] = Object.freeze([
  {
    key: 'lumora.capability.reminder',
    version: '1.0.0',
    name: 'Reminder',
    description: 'Schedule time-based reminders for any object.',
    priority: 10,
    executionOrder: 10,
    defaultEnabled: true,
    systemRequired: false,
    cannotDisable: false,
    isExperimental: false,
    executionPolicy: ExecutionPolicy.SEQUENTIAL,
    failurePolicy: FailurePolicy.FAIL_FAST,
    supportsOffline: false,
    supportsUndo: true,
    requiredTraits: [],
    dependencies: [],
  },
  {
    key: 'lumora.capability.timeline',
    version: '1.0.0',
    name: 'Timeline',
    description: 'Immutable audit history ledger for any object.',
    priority: 20,
    executionOrder: 20,
    defaultEnabled: true,
    systemRequired: true,
    cannotDisable: false,
    isExperimental: false,
    executionPolicy: ExecutionPolicy.SEQUENTIAL,
    failurePolicy: FailurePolicy.FAIL_FAST,
    supportsOffline: false,
    supportsUndo: false,
    requiredTraits: [],
    dependencies: [],
  },
  {
    key: 'lumora.capability.media',
    version: '1.0.0',
    name: 'Media Attachments',
    description: 'Attach files and media to any object.',
    priority: 30,
    executionOrder: 30,
    defaultEnabled: true,
    systemRequired: false,
    cannotDisable: false,
    isExperimental: false,
    executionPolicy: ExecutionPolicy.SEQUENTIAL,
    failurePolicy: FailurePolicy.FAIL_FAST,
    supportsOffline: false,
    supportsUndo: true,
    requiredTraits: [],
    dependencies: [],
  },
  {
    key: 'lumora.capability.search',
    version: '1.0.0',
    name: 'Search Indexing',
    description: 'Index object content into the workspace search projection.',
    priority: 40,
    executionOrder: 40,
    defaultEnabled: true,
    systemRequired: true,
    cannotDisable: false,
    isExperimental: false,
    executionPolicy: ExecutionPolicy.PARALLEL,
    failurePolicy: FailurePolicy.IGNORE,
    supportsOffline: false,
    supportsUndo: false,
    requiredTraits: [],
    dependencies: [],
  },
  {
    key: 'lumora.capability.favorite',
    version: '1.0.0',
    name: 'Favorites',
    description: 'Pin or favorite any object.',
    priority: 50,
    executionOrder: 50,
    defaultEnabled: true,
    systemRequired: false,
    cannotDisable: false,
    isExperimental: false,
    executionPolicy: ExecutionPolicy.SEQUENTIAL,
    failurePolicy: FailurePolicy.FAIL_FAST,
    supportsOffline: true,
    supportsUndo: true,
    requiredTraits: [],
    dependencies: [],
  },
]);

@Injectable()
export class LumoraPlatformKernel implements IPlatformKernel, OnModuleInit {
  private readonly logger = new Logger(LumoraPlatformKernel.name);
  private _isBooted = false;

  constructor(
    private readonly schemaCache: RedisSchemaCache,
    private readonly capabilityRegistry: CapabilityRegistry,
    private readonly capabilityEngine: UniversalCapabilityEngine,
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.bootstrap();
  }

  public async bootstrap(): Promise<KernelBootResult> {
    if (this._isBooted) {
      return { initialized: true, durationMs: 0, bootedAt: new Date() };
    }

    const startTime = Date.now();
    this.logger.log('[LumoraPlatformKernel] Starting platform kernel initialization...');

    // Step 1: Verify ObjectCatalogRegistry is loaded (static, always ready)
    const registeredTypes = ObjectCatalogRegistry.getAll();
    this.logger.log(
      `[LumoraPlatformKernel] Step 1/4: ObjectCatalogRegistry loaded — ${registeredTypes.length} built-in types: ${registeredTypes.map((t) => t.typeKey).join(', ')}`,
    );

    // Step 2: Register built-in capabilities into CapabilityRegistry
    let capRegistered = 0;
    for (const cap of BUILT_IN_CAPABILITIES) {
      if (!this.capabilityRegistry.has(cap.key)) {
        this.capabilityEngine.registerCapability(cap);
        capRegistered++;
      }
    }
    this.logger.log(
      `[LumoraPlatformKernel] Step 2/4: CapabilityRegistry — ${capRegistered} capabilities registered.`,
    );

    // Step 3: Verify Redis Schema Cache connectivity (non-blocking if Redis is unavailable)
    try {
      await this.schemaCache.getSchema('__kernel_probe__', '__probe__');
      this.logger.log('[LumoraPlatformKernel] Step 3/4: Redis Schema Cache — connected.');
    } catch {
      this.logger.warn(
        '[LumoraPlatformKernel] Step 3/4: Redis Schema Cache — unavailable (non-fatal, cache miss fallback active).',
      );
    }

    // Step 4: Log catalog type → capability mappings
    for (const def of BUILT_IN_CATALOG_DEFINITIONS) {
      this.logger.log(
        `[LumoraPlatformKernel] Step 4/4: Type '${def.typeKey}' supports extensions: [${def.supportedExtensions.join(', ')}]`,
      );
    }

    const durationMs = Date.now() - startTime;
    this._isBooted = true;

    this.logger.log(
      `[LumoraPlatformKernel] Platform Kernel booted successfully in ${durationMs}ms. ` +
      `Types: ${registeredTypes.length} | Capabilities: ${capRegistered}`,
    );

    return { initialized: true, durationMs, bootedAt: new Date() };
  }

  public isBooted(): boolean {
    return this._isBooted;
  }
}
