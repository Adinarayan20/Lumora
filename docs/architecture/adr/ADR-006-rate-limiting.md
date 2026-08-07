# ADR-006: Distributed Rate Limiting Architecture & Response Headers

## Context & Problem Statement
To protect the Lumora platform against Denial of Service (DoS), brute-force credential stuffing, and resource exhaustion, distributed rate limiting must be enforced consistently across backend API routes. The rate limiter must run atomically in distributed environments without race conditions and produce RFC-standard HTTP response headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`).

## Decision Drivers
- **Distributed Concurrency Safety**: Rate limiting state is stored in Redis via `IRateLimitStore` using atomic Lua scripts to eliminate race conditions under high concurrent request volume.
- **Client Transparency**: Clients receive exact quota information in response headers on every request.
- **Clean Architecture Purity**: Controllers apply `@RateLimit({ limit, ttlSeconds })` or global guards. Rate limit violations throw `RateLimitExceededException` mapped to HTTP `429 Too Many Requests` in `ApplicationExceptionFilter`.
- **Identity Resolution**: Identifiers prioritize authenticated user IDs (`user:{userId}`) over client IP addresses (`ip:{clientIp}`).

## Decision
1. Implement `RedisRateLimiterGuard` consuming `IRateLimitStore`.
2. Implement `@RateLimit()` metadata decorator for controller/route-level rate limit overrides.
3. Map `ErrorCode.RATE_LIMIT_EXCEEDED` to `HttpStatus.TOO_MANY_REQUESTS` (429) in `ApplicationExceptionFilter`.

## Status
Accepted

## Consequences

### Positive
- **API Resilience**: Protects endpoints against traffic spikes and brute-force attempts.
- **Standardized Client Contract**: Clients get structured 429 response payloads and standard `Retry-After` headers.

### Negative / Trade-offs
- Requires Redis connectivity (resilient fallback returns allow status on Redis outage).
