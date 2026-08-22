import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT_TOKEN } from './redis-client.provider.js';
import { RedisClientProvider } from './redis-client.provider.js';
import { RedisTtlPolicies } from './ttl/redis-ttl.policies.js';
import { CacheStore } from './providers/cache-store.js';
import { RateLimiterStore } from './providers/rate-limiter-store.js';
import { RATE_LIMIT_STORE_TOKEN } from './interfaces/rate-limit-store.interface.js';

//
// Domain-level caching providers (object, workspace, user) were removed:
// ObjectCacheProvider, WorkspaceCacheProvider, UserCacheProvider were
// registered and exported but had zero consumption outside this module.
// See cleanup report §9D.
//
// Retained:
//   - RedisClientProvider  (raw ioredis client for rate-limiter + BullMQ)
//   - RateLimiterStore     (consumed by redis-rate-limiter.guard.ts)
//   - CacheStore           (consumed by RedisSchemaCache in KernelModule)
//   - RedisTtlPolicies     (TTL constants, shared config)
//

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    RedisClientProvider,
    RedisTtlPolicies,
    CacheStore,
    RateLimiterStore,
    {
      provide: REDIS_CLIENT_TOKEN,
      useFactory: (provider: RedisClientProvider): Redis =>
        provider.getClient(),
      inject: [RedisClientProvider],
    },
    {
      provide: RATE_LIMIT_STORE_TOKEN,
      useClass: RateLimiterStore,
    },
  ],
  exports: [
    RedisClientProvider,
    RedisTtlPolicies,
    CacheStore,
    RateLimiterStore,
    REDIS_CLIENT_TOKEN,
    RATE_LIMIT_STORE_TOKEN,
  ],
})
export class RedisModule {}
