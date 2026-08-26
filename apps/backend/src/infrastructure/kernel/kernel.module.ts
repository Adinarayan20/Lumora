import { Global, Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module.js';
import { RedisSchemaCache } from '../catalog/redis-schema.cache.js';
import { LumoraPlatformKernel } from './platform-kernel.service.js';

/**
 * KernelModule — boot-time catalog verification and Redis connectivity probe.
 *
 * Provides:
 *   - LumoraPlatformKernel  (OnModuleInit: verifies catalog + Redis at startup)
 *   - RedisSchemaCache      (sub-2ms schema/definition cache)
 *
 * Intentionally minimal. The capability engine, capability registry, and
 * capability executor have been removed per the architecture decision that
 * rejected a generic plugin runtime (01 §10, 02 §10). Capabilities are
 * features implemented as ordinary application modules, not a registry/pipeline.
 */
@Global()
@Module({
  imports: [RedisModule],
  providers: [RedisSchemaCache, LumoraPlatformKernel],
  exports: [RedisSchemaCache, LumoraPlatformKernel],
})
export class KernelModule {}
