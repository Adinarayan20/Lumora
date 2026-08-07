# ADR-006: Distributed Rate Limiting Architecture & Response Headers

## Context & Problem Statement
To protect the Lumora platform against Denial of Service (DoS), brute-force credential stuffing, and resource exhaustion, distributed rate limiting must be enforced consistently across backend API routes. The rate limiter must run atomically in distributed environments without race conditions and produce RFC-standard HTTP response headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`).

## Decision Drivers
- **Distributed Concurrency Safety**: Rate limiting state is stored in Redis via `IRateLimitStore` using atomic Lua scripts to eliminate race conditions under high concurrent request volume.
- **Client Transparency**: Clients receive exact quota information in response headers on every request.
- **Clean Architecture Purity**: Controllers apply `@RateLimit({ limit, ttlSeconds })` or global guards. Rate limit violations throw `RateLimitExceededException` mapped to HTTP `429 Too Many Requests` in `ApplicationExceptionFilter`.
- **Identity & Network Resolution**: Client IP resolution is delegated to `NetworkIdentityResolver` supporting Cloudflare (`CF-Connecting-IP`), Nginx (`X-Real-IP`), AWS ALB (`X-Forwarded-For`), and direct sockets. Authenticated user IDs (`user:{userId}`) take precedence over IP identifiers.
- **Configuration-Driven Quotas**: Default rate limiting parameters are externalized through `ConfigService` / `RedisTtlPolicies` (`DEFAULT_RATE_LIMIT_QUOTA`, `DEFAULT_RATE_LIMIT_TTL_SECONDS`).

## Decision
1. Implement `RedisRateLimiterGuard` consuming `IRateLimitStore`, `NetworkIdentityResolver`, and `RedisTtlPolicies`.
2. Implement `@RateLimit()` metadata decorator for controller/route-level rate limit overrides.
3. Map `ErrorCode.RATE_LIMIT_EXCEEDED` to `HttpStatus.TOO_MANY_REQUESTS` (429) in `ApplicationExceptionFilter`.

## Status
Accepted

## Consequences

### Positive
- **API Resilience**: Protects endpoints against traffic spikes and brute-force attempts.
- **Multi-Proxy Support**: Resolves accurate client IPs across Cloudflare, Nginx, and AWS ALBs.
- **Configurable Fallbacks**: Tuning rate limits requires no code changes.

### Negative / Trade-offs
- Requires Redis connectivity (resilient fallback returns allow status on Redis outage).
