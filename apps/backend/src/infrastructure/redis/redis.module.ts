import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  RedisClientProvider,
  REDIS_CLIENT_TOKEN,
} from './redis-client.provider.js';
import { RedisTtlPolicies } from './ttl/redis-ttl.policies.js';
import { CacheStore } from './providers/cache-store.js';
import { RateLimiterStore } from './providers/rate-limiter-store.js';
import { ObjectCacheProvider } from './providers/object-cache.provider.js';
import { WorkspaceCacheProvider } from './providers/workspace-cache.provider.js';
import { UserCacheProvider } from './providers/user-cache.provider.js';
import { OBJECT_CACHE_TOKEN } from './interfaces/object-cache.interface.js';
import { WORKSPACE_CACHE_TOKEN } from './interfaces/workspace-cache.interface.js';
import { USER_CACHE_TOKEN } from './interfaces/user-cache.interface.js';
import { RATE_LIMIT_STORE_TOKEN } from './interfaces/rate-limit-store.interface.js';

export interface RedisModuleOptions {
  url?: string;
  maxRetriesPerRequest?: number;
}

export interface RedisModuleAsyncOptions {
  imports?: any[];
  useFactory?: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
  inject?: any[];
}

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    RedisClientProvider,
    RedisTtlPolicies,
    CacheStore,
    RateLimiterStore,
    ObjectCacheProvider,
    WorkspaceCacheProvider,
    UserCacheProvider,
    {
      provide: REDIS_CLIENT_TOKEN,
      useFactory: (provider: RedisClientProvider) => provider.getClient(),
      inject: [RedisClientProvider],
    },
    {
      provide: OBJECT_CACHE_TOKEN,
      useClass: ObjectCacheProvider,
    },
    {
      provide: WORKSPACE_CACHE_TOKEN,
      useClass: WorkspaceCacheProvider,
    },
    {
      provide: USER_CACHE_TOKEN,
      useClass: UserCacheProvider,
    },
    {
      provide: RATE_LIMIT_STORE_TOKEN,
      useClass: RateLimiterStore,
    },
  ],
  exports: [
    RedisClientProvider,
    REDIS_CLIENT_TOKEN,
    RedisTtlPolicies,
    CacheStore,
    RateLimiterStore,
    OBJECT_CACHE_TOKEN,
    WORKSPACE_CACHE_TOKEN,
    USER_CACHE_TOKEN,
    RATE_LIMIT_STORE_TOKEN,
  ],
})
export class RedisModule {
  public static forRootAsync(options?: RedisModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [RedisClientProvider, RedisTtlPolicies];
    if (options?.useFactory) {
      providers.push({
        provide: 'REDIS_MODULE_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      });
    }

    return {
      module: RedisModule,
      imports: options?.imports || [ConfigModule],
      providers,
      exports: [RedisClientProvider, RedisTtlPolicies],
    };
  }
}
