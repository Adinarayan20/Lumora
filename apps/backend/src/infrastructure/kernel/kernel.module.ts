import { Global, Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module.js';
import { RedisSchemaCache } from '../catalog/redis-schema.cache.js';
import { LumoraPlatformKernel } from './platform-kernel.service.js';
import { CapabilityRegistry } from '../../domain/capabilities/capability-registry.js';
import { CapabilityExecutor } from '../../domain/capabilities/capability-executor.js';
import { UniversalCapabilityEngine } from '../../domain/capabilities/universal-capability-engine.js';

/**
 * KernelModule — Global module that activates the Lumora Platform Kernel on startup.
 *
 * Provides:
 *   - CapabilityRegistry       (in-memory, populated at boot)
 *   - CapabilityExecutor       (runs capability hook pipeline)
 *   - UniversalCapabilityEngine (validates + registers capabilities)
 *   - RedisSchemaCache         (sub-2ms schema/definition cache)
 *   - LumoraPlatformKernel     (boot orchestrator, OnModuleInit)
 *
 * Phase F activation:
 *   The kernel's bootstrap() now wires the CapabilityRegistry with built-in
 *   capability definitions derived from BUILT_IN_CATALOG_DEFINITIONS.
 *   SchemaRegistry and ObjectDefinitionRegistry remain in-memory per ADR-013;
 *   no separate DB tables are required for the initial catalog.
 */
@Global()
@Module({
  imports: [RedisModule],
  providers: [
    RedisSchemaCache,
    CapabilityRegistry,
    CapabilityExecutor,
    UniversalCapabilityEngine,
    LumoraPlatformKernel,
  ],
  exports: [
    RedisSchemaCache,
    CapabilityRegistry,
    CapabilityExecutor,
    UniversalCapabilityEngine,
    LumoraPlatformKernel,
  ],
})
export class KernelModule {}
