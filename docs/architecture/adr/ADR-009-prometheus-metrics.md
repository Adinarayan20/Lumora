# ADR-009: Passive Prometheus Metrics Exporter (`GET /metrics`)

## Context & Problem Statement
Operating Lumora in production requires real-time quantitative insights into HTTP request throughput, latency distribution, failure rates, queue depths, and connection health across Redis and PostgreSQL.

Adding explicit metrics tracking calls directly inside domain entities, repositories, or application use cases violates Clean Architecture rules (`UI → Application → Domain → Infrastructure`).

## Decision Drivers
- **Infrastructure Isolation**: All metrics collection logic lives exclusively in `apps/backend/src/infrastructure/metrics/` using `prom-client`. Domain and application layers remain 100% agnostic of Prometheus.
- **Passive Collection Infrastructure**:
  - `MetricsInterceptor`: Passively intercepts HTTP requests to track `http_requests_total`, `http_request_duration_seconds`, `http_requests_active`, and `http_request_failures_total`.
  - `BaseQueueProcessor`: Passively records BullMQ job execution counts, job durations, and failure events via `QueueEvents`.
  - `RedisClientProvider`: Tracks Redis connection state (`1` = connected, `0` = disconnected).
- **Standard Exposition Endpoint**: Exposes `GET /metrics` returning standard Prometheus text format (`text/plain; version=0.0.4`).
- **Configurable**: Managed via `ConfigService` (`METRICS_ENABLED`, `METRICS_PREFIX`).

## Decision
1. Implement `MetricsRegistry` wrapping Prometheus `prom-client` counters, gauges, histograms, and default Node.js process metrics.
2. Implement `MetricsService` and `MetricsController` exposing `GET /metrics`.
3. Implement `MetricsInterceptor` recording HTTP traffic metrics.
4. Export `MetricsModule` as a global NestJS module.

## Status
Accepted

## Consequences

### Positive
- **Instant Observability**: Out-of-the-box compatibility with Prometheus scrapers, Grafana dashboards, and Datadog.
- **Zero Business Logic Pollution**: Domain models, use cases, and controllers contain zero metrics collection code.

### Negative / Trade-offs
- Scraper scrap overhead and memory consumption for Prometheus histograms.
