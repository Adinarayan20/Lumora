# ADR-010: Production Health Probes Architecture (Liveness, Readiness, Startup)

## Context & Problem Statement
Operating Lumora on orchestration engines (Kubernetes, AWS ECS, Docker Swarm) requires health probes to determine when to route user traffic, restart hanging process instances, or delay deployment rollouts during initialization.

Directly coupling health checks to application use-cases or domain layers violates Clean Architecture rules (`UI → Application → Domain → Infrastructure`).

## Decision Drivers
- **Infrastructure Isolation**: All health check logic lives strictly inside `apps/backend/src/infrastructure/health/`. Domain and application layers remain 100% agnostic of health probes.
- **Probe Differentiation**:
  - **Liveness Probe (`GET /health/live`)**: Lightweight process-level check (`200 OK`) verifying the Node.js event loop is responding. Never checks external database or Redis network calls to prevent cascade restarts during transient network blips.
  - **Startup Probe (`GET /health/startup`)**: Verifies initial NestJS module boot completion. Returns `503 Service Unavailable` during boot and `200 OK` once `onModuleInit` succeeds.
  - **Readiness Probe (`GET /health/ready`)**: Verifies critical infrastructure dependencies (PostgreSQL connectivity via `PrismaService`, Redis ping via `RedisClientProvider`, BullMQ parameters via `BullMQConnectionProvider`, and `ConfigService`). Returns `200 OK` when all pass, or `503 Service Unavailable` if any critical dependency is down.
- **Structured JSON Standard**: Standardized response format including `status` (`up` | `down`), `timestamp`, `version`, `durationMs`, and per-dependency status breakdowns.
- **Client Reuse**: Reuses existing `PrismaService`, `RedisClientProvider`, and `BullMQConnectionProvider` without instantiating duplicate client connections.

## Decision
1. Implement `HealthService` orchestrating `checkLiveness()`, `checkStartup()`, and `checkReadiness()`.
2. Implement `HealthController` exposing `GET /health/live`, `GET /health/startup`, `GET /health/ready`.
3. Export `HealthModule` as a global NestJS module.

## Status
Accepted

## Consequences

### Positive
- **Orchestrator Readiness Integration**: Prevents routing user traffic to unready pods during deployments or database outages.
- **Zero Business Logic Pollution**: Domain entities, use cases, and controllers contain zero health check code.

### Negative / Trade-offs
- Frequent readiness checks incur lightweight DB queries (`SELECT 1`) and Redis `PING` calls.
