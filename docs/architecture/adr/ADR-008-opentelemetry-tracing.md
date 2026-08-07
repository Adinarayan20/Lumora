# ADR-008: OpenTelemetry Distributed Tracing & Passive Logger Correlation

## Context & Problem Statement
As Lumora operates as a distributed multi-tenant platform across microservices, asynchronous message workers, and multi-proxy ingress nodes, diagnosing performance bottlenecks and tracing cross-service request lifecycles requires distributed tracing and structured correlation logging.

Directly coupling domain or application services to OpenTelemetry SDKs, Span instances, or tracing contexts violates Clean Architecture rules (`UI → Application → Domain → Infrastructure`) and litters business code with manual ID forwarding.

## Decision Drivers
- **Infrastructure Isolation**: All OpenTelemetry tracing components exist exclusively in `apps/backend/src/infrastructure/tracing/`. Business logic remains 100% agnostic of tracing code.
- **W3C Trace Context Standard**: HTTP request propagation supports standard W3C `traceparent` headers (`00-{traceId}-{spanId}-{flags}`) and `x-request-id`.
- **Passive Correlation Logging**: `StructuredLoggerProvider` implements NestJS `LoggerService` to passively format logs into structured JSON with `timestamp`, `traceId`, `spanId`, `requestId`, `level`, `message` via `AsyncLocalStorage`. Services never manually attach correlation IDs.
- **Configurable & Fail-Safe**: Managed via `ConfigService` (`OTEL_SERVICE_NAME`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_ENABLED`). Tracing fails gracefully when disabled or when OTLP endpoints are unreachable.

## Decision
1. Implement `TraceContextService` using Node.js `AsyncLocalStorage` for W3C trace context propagation.
2. Implement `CorrelationIdMiddleware` parsing/decorating `traceparent` and `x-request-id` headers.
3. Implement `TracingInterceptor` measuring execution duration and setting trace attributes.
4. Implement `StructuredLoggerProvider` formatting structured JSON logs with passive trace correlation fields.
5. Export `TracingModule` as a global NestJS infrastructure module.

## Status
Accepted

## Consequences

### Positive
- **Distributed Observability**: Every log line and HTTP request carries a trace ID and span ID.
- **Zero Business Logic Pollution**: Domain aggregates, value objects, use cases, and repositories contain zero tracing code.
- **W3C Standards Compliance**: Compatible with OpenTelemetry collectors, Datadog, Jaeger, Grafana Tempo, and AWS X-Ray.

### Negative / Trade-offs
- Slight microsecond overhead for `AsyncLocalStorage` context propagation during request lifecycle.
