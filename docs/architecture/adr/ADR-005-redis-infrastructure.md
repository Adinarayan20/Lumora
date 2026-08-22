# ADR-005: Infrastructure Redis Module & Capability-Specific Interfaces

## Amendment Notice
**Amended, not superseded** — see Lumora Cleanup Finalization + Migration
Truth Gate report. `OBJECT_CACHE_TOKEN`, `WORKSPACE_CACHE_TOKEN`,
`USER_CACHE_TOKEN`, and `BaseDomainCacheProvider<T>` described below were
deleted from the codebase after being confirmed to have zero real consumers
(nothing in the application ever read from these domain caches). The
rate-limiting decision (`RateLimiterStore`, `RATE_LIMIT_STORE_TOKEN`, atomic
Lua-script increments) and `REDIS_CLIENT_TOKEN`/`RedisTtlPolicies` remain
accurate and current — those were not removed. `RedisModule` also now
provides `CacheStore`, a generic cache provider consumed by
`RedisSchemaCache` in `KernelModule` for catalog/schema lookups — this was
not part of this ADR's original design and is noted here for accuracy, not
retroactively claimed as something this ADR decided.

The sections below are left as originally written except where struck
through, to preserve the historical record of what was actually decided and
why part of it was later removed.

## Context & Problem Statement
As Lumora expands platform capabilities, caching, rate limiting, and asynchronous background job queuing require high-performance in-memory data store capabilities. Exposing a generic `ICacheService` or leaking third-party `ioredis` instances into application or domain layers violates Clean Architecture dependency rules (`UI → Application → Domain → Infrastructure`) and forces application components to construct Redis keys and manage serialization logic manually.

Furthermore, distributed rate limiting requires atomic increment and window expiration to prevent race conditions under high concurrency.

## Decision Drivers
- **Clean Architecture Purity**: Domain and application layers remain 100% framework and database agnostic. Neither layer imports `ioredis` or references raw Redis keys.
- ~~**Capability-Specific Interfaces**: Application services consume focused capability Symbol tokens (`OBJECT_CACHE_TOKEN`, `WORKSPACE_CACHE_TOKEN`, `USER_CACHE_TOKEN`, `RATE_LIMIT_STORE_TOKEN`).~~ **Amended**: only `RATE_LIMIT_STORE_TOKEN` (and `REDIS_CLIENT_TOKEN`) remain — the three domain cache tokens were deleted, zero consumers.
- **Fail-Fast Startup Enforcement**: Startup `ping()` health validation ensures invalid environment parameters fail fast on startup in production rather than silently continuing without Redis connectivity.
- **Atomic Distributed Rate Limiting**: Increments and TTL expirations are executed atomically using an inline Lua script.
- **Symbol Injection Tokens**: Symbol tokens prevent string key collision during NestJS dependency injection.
- **Log Obfuscation**: Logs never interpolate raw Redis keys (which may contain user/workspace IDs or tokens).
- ~~**Reusable Base Domain Provider**: `BaseDomainCacheProvider<T>` consolidates domain cache implementation while preserving entity-specific key namespacing and TTL policies.~~ **Amended**: deleted along with the three domain cache providers that extended it.
- **Configurable TTL Policies**: `RedisTtlPolicies` exposes configurable TTL parameters via `ConfigService` with sensible defaults.

## Decision
1. Implement `RedisClientProvider` and `RedisModule` in `apps/backend/src/infrastructure/redis/`.
2. ~~Expose Symbol tokens: `OBJECT_CACHE_TOKEN`, `WORKSPACE_CACHE_TOKEN`, `USER_CACHE_TOKEN`, `RATE_LIMIT_STORE_TOKEN`, `REDIS_CLIENT_TOKEN`.~~ **Amended**: `RedisModule` currently exposes `RATE_LIMIT_STORE_TOKEN` and `REDIS_CLIENT_TOKEN` only, plus `CacheStore` (not a Symbol token — see Amendment Notice).
3. Require `REDIS_URL` in production environments and throw fast-fail initialization error if Redis `ping()` fails on startup.
4. Execute rate limiting using atomic Lua script evaluation in `RateLimiterStore`.
5. ~~Inherit domain cache providers from `BaseDomainCacheProvider<T>`.~~ **Amended**: this class and everything that inherited from it were deleted.

## Status
Accepted, as amended above.

## Consequences

### Positive
- ~~**Decoupled Architecture**: Application use cases consume strongly typed Symbol capability interfaces without coupling to Redis.~~ Still true for rate limiting specifically; the broader "capability interfaces" framing no longer applies now that the domain caches are gone.
- **Atomic Race-Condition Protection**: Atomic Lua scripts prevent race conditions in rate limiting under high concurrency.
- **Fail-Fast Production Reliability**: Deployment fails immediately if Redis is unreachable in production.
- **No Key Log Leaks**: Log messages obscure raw Redis keys.

### Negative / Trade-offs
- ~~Slight infrastructure setup overhead for capability tokens and Lua script execution.~~ Applies to the rate-limiting Lua script only now.

