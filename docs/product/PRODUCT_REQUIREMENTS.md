# Lumora Product Requirements Inventory

> **STATUS**: Product Capabilities Inventory  
> **LAST RECONCILED**: 2026-08-10 (HEAD `92fb2fe`)  

---

## 1. Subsystem Taxonomy & Status Definitions

To eliminate ambiguity across layers, capabilities are classified into precise status categories:
- `PERSISTENCE_READY`: PostgreSQL schema, composite indexes, and data models are complete.
- `API_READY`: HTTP REST endpoints and DTO mappers exist.
- `FOUNDATION_READY`: Domain aggregate, repository ports, and unit of work boundaries exist.
- `PARTIAL`: Logic exists but key security guards or handlers are open.
- `NOT_STARTED`: 0% code written for this layer.
- `DEFERRED`: Deliberately postponed to post-scale phases.
- `BLOCKED`: Dependent layer missing (e.g. Mobile UI missing prevents shipping).

---

## 2. Granular Capability Status Matrix

| Capability | Priority | Persistence Status | API Status | Security / Infra | Mobile UI | Product Status |
|---|---|---|---|---|---|---|
| **User Registration & Auth** | P0 | `PERSISTENCE_READY` | `API_READY` | SHA-256 Hashed | `NOT_STARTED` | **BLOCKED (Mobile)** |
| **Workspace Isolation** | P0 | `PERSISTENCE_READY` | `API_READY` | WorkspaceContext | `NOT_STARTED` | **BLOCKED (Mobile)** |
| **Universal Object Creation** | P0 | `PERSISTENCE_READY` | `API_READY` | Atomic Outbox | `NOT_STARTED` | **BLOCKED (Mobile)** |
| **Universal Object Update** | P0 | `PERSISTENCE_READY` | `PARTIAL` | TOCTOU Fix Req | `NOT_STARTED` | **BLOCKED (Mobile)** |
| **Global Search** | P1 | `PERSISTENCE_READY` | `PARTIAL` | Guard Missing | `NOT_STARTED` | **BLOCKED (Mobile)** |
| **Timeline Activity Feed** | P1 | `PERSISTENCE_READY` | `API_READY` | Async Outbox | `NOT_STARTED` | **BLOCKED (Mobile)** |
| **Graph Relationships** | P1 | `PERSISTENCE_READY` | `API_READY` | Cycles Open | `NOT_STARTED` | **BLOCKED (Mobile)** |
| **Static Collections** | P1 | `PERSISTENCE_READY` | `API_READY` | Standard | `NOT_STARTED` | **BLOCKED (Mobile)** |
| **Reminders & Recurrence** | P1 | `PERSISTENCE_READY` | `API_READY` | RRule Engine | `NOT_STARTED` | **BLOCKED (Mobile)** |
| **Smart Collections Engine** | P2 | `PERSISTENCE_READY` | `NOT_STARTED` | Evaluator 0% | `NOT_STARTED` | **BLOCKED** |
| **Push Notification Delivery**| P2 | `PERSISTENCE_READY` | `NOT_STARTED` | Inactive FCM | `NOT_STARTED` | **BLOCKED** |
| **Cloud Storage (S3/R2)** | P2 | `NOT_STARTED` | `NOT_STARTED` | Local Dev Only | `NOT_STARTED` | **BLOCKED** |
| **Gamification (Streaks)** | P3 | `NOT_STARTED` | `NOT_STARTED` | Planned Outbox | `NOT_STARTED` | **PLANNED** |
| **Offline Sync Engine** | P4 | `DEFERRED` | `DEFERRED` | Deferred | `DEFERRED` | **DEFERRED** |
