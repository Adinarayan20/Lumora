# Lumora Platform Current Architecture (Authoritative State)

> **STATUS**: Authoritative Source of Truth
> **HEAD**: `92fb2fe` on `main`
> **LAST RECONCILED**: 2026-08-10

---

## 1. Executive Summary & Universal Object Model

Lumora is an AI-ready **Personal Life Operating System** built around a **Universal Object Model** (*Everything is an Object*: Task, Note, Reminder, Event, Habit, Document, Collection, etc.).

> **CORE OVERRIDING MANDATE**: Lumora is a platform, not a collection of independent feature apps. Introducing a new object type MUST NOT require a new database table, new repository architecture, new database schema migration, or new runtime.

---

## 2. Reconciled Subsystem Status Inventory (HEAD `92fb2fe`)

| Subsystem / Feature | Architectural Status | Evidence / Source Location |
|---|:---:|---|
| **Universal Object Platform Model** | `IMPLEMENTED (FULL)` | `@lumora/shared` + `Object` table |
| **ObjectAggregate Domain Entity** | `IMPLEMENTED (FULL)` | `apps/backend/src/domain/objects/object.aggregate.ts` |
| **PrismaObjectRepository (Tier 1)** | `IMPLEMENTED (FULL)` | `apps/backend/src/infrastructure/prisma/repositories/prisma-object.repository.ts` |
| **ObjectAggregateRepositoryAdapter (Tier 2)** | `IMPLEMENTED (FULL)` | `apps/backend/src/infrastructure/prisma/repositories/object-aggregate.repository.adapter.ts` |
| **Legacy ObjectRepository (Tier 3)** | `DELETED` | Retired per ADR-016 (file deleted) |
| **Atomic CAS Concurrency Engine** | `IMPLEMENTED (FULL)` | Raw SQL `UPDATE ... WHERE revision = $storedRevision RETURNING *` |
| **Tenant Isolation Engine** | `IMPLEMENTED (FULL)` | `WorkspaceExecutionContext` enforced globally |
| **PrismaUnitOfWork & Transaction Context** | `IMPLEMENTED (FULL)` | `apps/backend/src/infrastructure/prisma/prisma-unit-of-work.ts` |
| **Transactional Outbox Engine** | `IMPLEMENTED (FULL)` | `OutboxMessage` + `OutboxWorker` + `OutboxEventHandlerService` |
| **LumoraObjectRuntime** | `WIRED_BUT_INCOMPLETE` | Fully implemented domain class; inactive in production paths |
| **UniversalCapabilityEngine** | `REGISTERED_ONLY` | Capabilities registered at boot; handlers not registered in prod |
| **LumoraPlatformKernel** | `PARTIALLY_IMPLEMENTED` | Boot orchestrator logs steps; schema cache loading incomplete |
| **Timeline Engine** | `BACKEND READY (MOBILE MISSING)` | `Timeline` table + async Outbox worker population |
| **Search Engine (Derived Projection)** | `BACKEND READY (MOBILE MISSING)` | `SearchIndex` projection + async Outbox population (`ILIKE`) |
| **FileAsset & Local Storage** | `IMPLEMENTED (DEV ONLY)` | Local storage provider (in-memory; S3/R2 interface open) |
| **Notification & Reminder Engine** | `BACKEND READY (MOBILE MISSING)` | RRule engine + `Reminder` table + `Device.pushToken` |
| **UI Primitives & Theme Engine** | `IMPLEMENTED (FULL)` | `packages/ui` + `packages/theme` (4 complete themes) |
| **Universal Relationship Engine** | `BACKEND READY (MOBILE MISSING)` | `Relationship` table + graph link API |
| **Smart Collections Evaluator** | `NOT IMPLEMENTED (APPROVED)` | Schema supports `DYNAMIC`; query evaluator 0% |
| **Mobile Application** | `NOT IMPLEMENTED (APPROVED)` | UI playground present; 0 API client, 0 auth, 0 product screens |
| **Offline Data Synchronization** | `DEFERRED` | Post-scale milestone |
| **Gamification (Streaks & Badges)** | `PLANNED` | Passive Outbox event subscriber planned |

---

## 3. Specialized Architecture Documentation Index

For deeper technical specifications, refer directly to the authoritative specialized documents:

- **Data & Persistence**: [DATA_ARCHITECTURE.md](DATA_ARCHITECTURE.md)
- **API & REST Transport**: [API_ARCHITECTURE.md](API_ARCHITECTURE.md)
- **Runtime & Capability Engine**: [RUNTIME_ARCHITECTURE.md](RUNTIME_ARCHITECTURE.md)
- **Security & RBAC**: [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md)
- **Change-Impact Matrix**: [CHANGE_IMPACT_MATRIX.md](CHANGE_IMPACT_MATRIX.md)
- **Technical Debt Registry**: [TECH_DEBT.md](TECH_DEBT.md)
- **Performance Baseline**: [PERFORMANCE_BASELINE.md](PERFORMANCE_BASELINE.md)
