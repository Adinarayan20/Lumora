# ADR-005: Infrastructure Redis Module & Capability-Specific Interfaces

## Context & Problem Statement
As Lumora expands platform capabilities, caching, rate limiting, and asynchronous background job queuing require high-performance in-memory data store capabilities. Exposing a generic `ICacheService` or leaking third-party `ioredis` instances into application or domain layers violates Clean Architecture dependency rules (`UI → Application → Domain → Infrastructure`) and forces application components to construct Redis keys and manage serialization logic manually.

Furthermore, distributed rate limiting requires atomic increment and window expiration to prevent race conditions under high concurrency.

## Decision Drivers
- **Clean Architecture Purity**: Domain and application layers remain 100% framework and database agnostic. Neither layer imports `ioredis` or references raw Redis keys.
- **Capability-Specific Interfaces**: Application services consume focused capability Symbol tokens (`OBJECT_CACHE_TOKEN`, `WORKSPACE_CACHE_TOKEN`, `USER_CACHE_TOKEN`, `RATE_LIMIT_STORE_TOKEN`).
- **Fail-Fast Startup Enforcement**: Startup `ping()` health validation ensures invalid environment parameters fail fast on startup in production rather than silently continuing without Redis connectivity.
- **Atomic Distributed Rate Limiting**: Increments and TTL expirations are executed atomically using an inline Lua script.
- **Symbol Injection Tokens**: Symbol tokens prevent string key collision during NestJS dependency injection.
- **Log Obfuscation**: Logs never interpolate raw Redis keys (which may contain user/workspace IDs or tokens).
- **Reusable Base Domain Provider**: `BaseDomainCacheProvider<T>` consolidates domain cache implementation while preserving entity-specific key namespacing and TTL policies.
- **Configurable TTL Policies**: `RedisTtlPolicies` exposes configurable TTL parameters via `ConfigService` with sensible defaults.

## Decision
1. Implement `RedisClientProvider` and `RedisModule` in `apps/backend/src/infrastructure/redis/`.
2. Expose Symbol tokens: `OBJECT_CACHE_TOKEN`, `WORKSPACE_CACHE_TOKEN`, `USER_CACHE_TOKEN`, `RATE_LIMIT_STORE_TOKEN`, `REDIS_CLIENT_TOKEN`.
3. Require `REDIS_URL` in production environments and throw fast-fail initialization error if Redis `ping()` fails on startup.
4. Execute rate limiting using atomic Lua script evaluation in `RateLimiterStore`.
5. Inherit domain cache providers from `BaseDomainCacheProvider<T>`.

## Status
Accepted

## Consequences

### Positive
- **Decoupled Architecture**: Application use cases consume strongly typed Symbol capability interfaces without coupling to Redis.
- **Atomic Race-Condition Protection**: Atomic Lua scripts prevent race conditions in rate limiting under high concurrency.
- **Fail-Fast Production Reliability**: Deployment fails immediately if Redis is unreachable in production.
- **No Key Log Leaks**: Log messages obscure raw Redis keys.

### Negative / Trade-offs
- Slight infrastructure setup overhead for capability tokens and Lua script execution.
