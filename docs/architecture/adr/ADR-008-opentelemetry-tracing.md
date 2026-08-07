# ADR-008: OpenTelemetry Distributed Tracing & Passive Logger Correlation

## Context & Problem Statement
As Lumora operates as a distributed multi-tenant platform across microservices, asynchronous message workers, and multi-proxy ingress nodes, diagnosing performance bottlenecks and tracing cross-service request lifecycles requires standard distributed tracing and structured correlation logging.

Directly coupling domain or application services to OpenTelemetry SDKs, Span instances, or tracing contexts violates Clean Architecture rules (`UI → Application → Domain → Infrastructure`) and litters business code with manual ID forwarding.

## Decision Drivers
- **Official OpenTelemetry NodeSDK Engine**: All tracing functionality is powered by official `@opentelemetry/sdk-node`, `@opentelemetry/sdk-trace-node`, `@opentelemetry/resources`, and `@opentelemetry/exporter-trace-otlp-http` packages encapsulated entirely in `apps/backend/src/infrastructure/tracing/`. Business logic remains 100% agnostic of OpenTelemetry.
- **Application Context Abstraction**: `TraceContextService` manages Node.js `AsyncLocalStorage` for lightweight request context retrieval while interoperating natively with active OpenTelemetry span contexts (`trace.setSpanContext(...)`).
- **W3C Trace Context Standard**: HTTP request propagation supports standard W3C `traceparent` headers (`00-{traceId}-{spanId}-{flags}`) and `x-request-id`.
- **Span Management & Error Instrumentation**: `TracingInterceptor` acts as the primary NestJS bridge, starting OpenTelemetry `Span` instances, setting HTTP attributes (`http.method`, `http.url`, `http.status_code`), recording exceptions (`span.recordException(error)`), setting span status codes (`OK` / `ERROR`), and closing spans cleanly.
- **Passive Correlation Logging**: `StructuredLoggerProvider` queries active OpenTelemetry span context (`trace.getActiveSpan()?.spanContext()`) to passively format log lines into structured JSON with `timestamp`, `traceId`, `spanId`, `requestId`, `level`, `message`.
- **Configurable & Fail-Safe**: Managed via `ConfigService` (`OTEL_ENABLED`, `OTEL_SERVICE_NAME`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_PROTOCOL`). Tracing fails gracefully when disabled or when OTLP endpoints are unreachable.

## Decision
1. Implement `TracingProvider` initializing `NodeSDK`, `Resource`, `OTLPTraceExporter`, and `HttpInstrumentation`.
2. Implement `TraceContextService` using Node.js `AsyncLocalStorage` for context propagation.
3. Implement `CorrelationIdMiddleware` binding incoming W3C `traceparent` and `x-request-id` into OpenTelemetry active context.
4. Implement `TracingInterceptor` managing OpenTelemetry span lifecycle, status codes, and exception recording.
5. Implement `StructuredLoggerProvider` formatting structured JSON logs with active OpenTelemetry span IDs.

## Status
Accepted

## Consequences

### Positive
- **Production OpenTelemetry Compliance**: Full interoperability with OTLP collectors, Datadog, Jaeger, Grafana Tempo, and Prometheus.
- **Zero Business Logic Leakage**: Domain aggregates, value objects, use cases, and repositories contain zero tracing imports.
- **Robust Exception Recording**: Unhandled HTTP exceptions automatically record stacktraces and mark spans as failed.

### Negative / Trade-offs
- OTLP export adds minor asynchronous network payload processing.
