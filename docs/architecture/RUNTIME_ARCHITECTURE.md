# Lumora Runtime Architecture & Capability Engine

> **STATUS**: Authoritative Runtime & Event Engine Specification  
> **LAST RECONCILED**: 2026-08-10  

---

## 1. Application Bootstrapping Sequence

`LumoraPlatformKernel` orchestrates application startup in `apps/backend/src/infrastructure/kernel/platform-kernel.service.ts`:

1. `ObjectCatalogRegistry.getAll()` — validates static catalog definitions in `@lumora/shared`.
2. Registers 5 built-in capabilities in `CapabilityRegistry` (`timeline`, `reminder`, `media`, `search`, `favorite`).
3. Probes Redis cache connection non-blockingly (logs warning if offline; app boots cleanly regardless).
4. Sets `_isBooted = true`.

---

## 2. Universal Capability Engine (`UniversalCapabilityEngine`)

- **Role**: Entry point for capability registration, dependency DAG resolution, and semver comparison.
- **Cycle Detection**: Performs Depth-First Search (DFS) graph traversal to detect circular dependencies (`A → B → C → A`).
- **Semantic Versioning**: Supports exact and semver range comparison (`=`, `<`, `<=`, `>`, `>=`, `^`, `~`, `*`).

---

## 3. Capability Executor (`CapabilityExecutor`)

- **Lifecycle Phases**: `beforeValidation` → `beforeExecution` → `beforeCommit` → Core Action → `afterCommit` → `afterExecution`.
- **Execution Policies**: `SEQUENTIAL` vs `PARALLEL` (`Promise.allSettled`).
- **Failure Policies**: `FAIL_FAST`, `CONTINUE`, `RETRY` (exponential backoff 100ms..2000ms with jitter), `IGNORE`.
- **Current Operational Status**: Handlers are registered at boot, but `CapabilityExecutor.registerHandler()` is not yet called by production handlers (TD-029). Event routing is currently handled directly by `OutboxEventHandlerService`.

---

## 4. Transactional Outbox Worker (`OutboxWorker`)

- **Polling Loop**: Background worker polls `OutboxMessage` table every 2000ms.
- **Locking**: Uses PostgreSQL `FOR UPDATE SKIP LOCKED` to process non-overlapping batches across nodes.
- **Stale Lock Cleanup**: Releases stale locks held longer than 30,000ms.
- **Dispatch**: Deserializes events and invokes `OutboxEventHandlerService.publish()`.
- **Event Consumers**: Routes domain events asynchronously to **Timeline** activity records and **Search** projections.
- **Exponential Backoff**: Failed message retries use $2^{\text{retryCount}} \times 1000\text{ ms}$ backoff.
