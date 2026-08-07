# Lumora Architecture Documentation — Capability Engine & LumoraObjectRuntime

## Overview

The **Universal Capability Engine** and **LumoraObjectRuntime** form the foundational execution framework of the Lumora Personal Life Operating System. Together, they enforce Universal Object Inheritance, enabling every object in Lumora (Notes, Tasks, Reminders, Events, Habits, Documents, Collections) to inherit capabilities such as Timeline Audit, Reminders, Search Indexing, and Relationships without code duplication or hardcoded business rules.

---

## Strategic Architectural Components

### 1. Capability Registry (`CapabilityRegistry`)
- **Role**: In-memory thread-safe registry storing versioned `CapabilityDescriptor` instances.
- **Responsibilities**:
  - Validates capability descriptors on registration.
  - Exposes query methods (`get`, `has`, `list`, `byTrait`).
  - Implements immutability via defensive copy returns.

### 2. Capability Executor (`CapabilityExecutor`)
- **Role**: Lifecycle hook orchestrator executing pipeline phases (`beforeValidation`, `beforeExecution`, `beforeCommit`, core action, `afterCommit`, `afterExecution`).
- **Responsibilities**:
  - Implements **ExecutionPolicy**:
    - `SEQUENTIAL`: Serial hook dispatch.
    - `PARALLEL`: Concurrent dispatch using `Promise.allSettled` with deterministic failure aggregation.
  - Implements **FailurePolicy**:
    - `FAIL_FAST`: Throws immediately on hook error.
    - `CONTINUE`: Logs warning and proceeds.
    - `RETRY`: Configurable exponential backoff retry loop (100ms initial delay, 2000ms max, 2x multiplier, random jitter). Excludes non-retryable `DomainValidationException`.
    - `IGNORE`: Suppresses failure silently.
  - Emits Prometheus metrics for dispatches, retries, durations, and failures.

### 3. Universal Capability Engine (`UniversalCapabilityEngine`)
- **Role**: Single entry point for capability registration, dependency graph resolution, and version range matching.
- **Responsibilities**:
  - Performs **DFS Graph Cycle Detection** to prevent circular capability dependencies (`A -> B -> C -> A`).
  - Performs **Semantic Version Comparison** (`=`, `<`, `<=`, `>`, `>=`, `^`, `~`, `x`, `*`).
  - Validates trait prerequisites (`requiredTraits`) and capability prerequisites (`dependencies`).

### 4. LumoraObjectRuntime (`LumoraObjectRuntime`)
- **Role**: Universal object aggregate wrapper managing attribute mutations and state transitions.
- **Responsibilities**:
  - Manages **RuntimeState** lifecycle: `ACTIVE`, `LOCKED`, `ARCHIVED`, `SOFT_DELETED`, `RESTORED`.
  - Performs strict schema validation via `SchemaMigrationEngine.validateAttributeValue()` prior to mutation.
  - Executes pipelines via `CapabilityExecutor` and emits domain events (`CAPABILITY_EXECUTED`).

---

## Execution Pipeline & Sequence Diagram

```mermaid
sequenceDocument
actor Client
participant Runtime as LumoraObjectRuntime
participant Engine as UniversalCapabilityEngine
participant Executor as CapabilityExecutor
participant Hook as CapabilityHookHandler
participant Aggregate as ObjectAggregate

Client->>Runtime: updateAttribute(key, value, context)
Runtime->>Runtime: Validate state == ACTIVE
Runtime->>SchemaMigrationEngine: validateAttributeValue(fieldSchema, value)
Runtime->>Executor: executePipeline(runtime, context, updateAction)
Executor->>Hook: dispatchPhase('beforeValidation')
Executor->>Hook: dispatchPhase('beforeExecution')
Executor->>Hook: dispatchPhase('beforeCommit')
Executor->>Aggregate: updateDetails(...)
Executor->>Hook: dispatchPhase('afterCommit')
Executor->>Hook: dispatchPhase('afterExecution')
Executor->>Runtime: recordDomainEvent(CapabilityExecutedEvent)
Executor-->>Runtime: Result.ok()
Runtime-->>Client: Result.ok()
```

---

## Failure & Retry Policies

| Policy | Behavior | Jitter & Backoff | Metrics Recorded |
| :--- | :--- | :--- | :--- |
| `FAIL_FAST` | Fails immediately on first error | N/A | `capability_failures_total` |
| `CONTINUE` | Logs warning and continues pipeline | N/A | `capability_failures_total` |
| `RETRY` | Retries up to 3 times | 100ms initial, 2x multiplier, max 2000ms, random jitter | `capability_retries_total`, `capability_retry_successes_total` |
| `IGNORE` | Silently ignores failure | N/A | `capability_failures_total` |
