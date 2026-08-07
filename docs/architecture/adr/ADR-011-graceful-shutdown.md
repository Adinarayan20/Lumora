# ADR-011: Production Graceful Shutdown & Lifecycle Management Architecture

## Context & Problem Statement
During container deployments, auto-scaling events, or node drains, orchestration platforms send `SIGTERM` signals giving application instances a grace window (e.g., 30 seconds) to stop taking new traffic and complete in-flight tasks before issuing a forced `SIGKILL`.

Without a deterministic shutdown order, database pools or Redis clients may be disconnected while background BullMQ workers or HTTP handlers are still executing queries, leading to corrupted data, unhandled promise rejections, or hanging process sockets.

## Decision Drivers
- **Clean Architecture Isolation**: All lifecycle and shutdown orchestration logic lives inside `apps/backend/src/infrastructure/lifecycle/`. Domain models, application use-cases, and controllers remain 100% agnostic of lifecycle hooks.
- **Deterministic Shutdown Order**:
  1. **Stop Incoming HTTP Traffic**: Close HTTP server listeners.
  2. **In-flight HTTP Completion**: Allow current HTTP requests to complete.
  3. **BullMQ Workers & QueueEvents**: Close workers (`worker.close()`) so no new jobs are pulled, allow active jobs to finish, and close `QueueEvents` listeners.
  4. **Outbox Polling Worker**: Stop background polling loops (`clearTimeout`).
  5. **Redis Connections**: Close Redis client connections cleanly (`client.quit()`).
  6. **PostgreSQL Database Pool**: Disconnect Prisma connection pool (`$disconnect()`).
  7. **OpenTelemetry SDK**: Flush remaining telemetry spans and shutdown OpenTelemetry SDK (`sdk.shutdown()`).
- **Configurable Shutdown Timeout**: Managed via `SHUTDOWN_TIMEOUT_MS` (default: 10,000ms / 10s). Enforces a unref'd timer fallback to terminate process if shutdown hangs.

## Decision
1. Implement `GracefulShutdownService` implementing `BeforeApplicationShutdown` and `OnApplicationShutdown`.
2. Enable `app.enableShutdownHooks(['SIGTERM', 'SIGINT'])` in `main.ts`.
3. Export `ShutdownModule` as a global NestJS module.

## Status
Accepted

## Consequences

### Positive
- Zero data corruption or abrupt connection tears during container restarts or deployments.
- OpenTelemetry spans and metrics are fully flushed before process termination.
