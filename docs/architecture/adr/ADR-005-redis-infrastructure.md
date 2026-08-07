# ADR-005: Infrastructure Redis Module & Capability-Specific Interfaces

## Context & Problem Statement
As Lumora expands platform capabilities, caching, rate limiting, and asynchronous background job queuing require high-performance in-memory data store capabilities. Exposing a generic `ICacheService` or directly leaking third-party `ioredis` instances into application or domain layers violates Clean Architecture dependency rules (`UI → Application → Domain → Infrastructure`) and forces application components to construct Redis keys and manage serialization logic manually.

## Decision Drivers
- **Clean Architecture Purity**: Domain and application layers must remain 100% framework and database agnostic. Neither layer may import `ioredis` or reference raw Redis keys.
- **Capability-Specific Interfaces**: Application services require focused interfaces matching domain capabilities (`IObjectCache`, `IWorkspaceCache`, `IUserCache`, `IRateLimitStore`) rather than a single bloated generic cache interface.
- **Centralized Key Strategy & TTL Policies**: Key namespacing (`lumora:workspace:{id}`, `lumora:object:{id}`, `lumora:user:{id}`, `lumora:rate-limit:{identifier}`) and TTL values are managed strictly within infrastructure helpers (`RedisKeyStrategy`, `RedisTtlPolicies`).
- **Centralized Serialization**: All JSON payload serialization and deserialization are handled inside `JsonSerializer` and `CacheStore` to eliminate scattered `JSON.stringify` / `JSON.parse` operations.

## Decision
1. Implement `RedisClientProvider` and `RedisModule` in `apps/backend/src/infrastructure/redis/`.
2. Expose domain capability interfaces: `IObjectCache`, `IWorkspaceCache`, `IUserCache`, and `IRateLimitStore`.
3. Encapsulate all Redis key generation inside `RedisKeyStrategy`.
4. Centralize TTL policies inside `RedisTtlPolicies`.

## Status
Accepted

## Consequences

### Positive
- **Decoupled Architecture**: Domain and application use cases consume strongly typed capability interfaces without coupling to Redis or `ioredis`.
- **Maintainability & Safety**: Centralized key namespacing prevents collision bugs; centralized serialization eliminates JSON parsing runtime exceptions.
- **Fail-Fast Startup**: Startup ping validation ensures invalid environment parameters fail gracefully during deployment initialization.

### Negative / Trade-offs
- Slight addition of infrastructure mapping boilerplate per domain entity (e.g. `ObjectCacheProvider`, `WorkspaceCacheProvider`).
