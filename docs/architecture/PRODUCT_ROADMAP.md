# Lumora Architectural & Product Roadmap

## Master Phase Map

```
COMPLETED:
Phase A: Monorepo Foundation & Shared DDD Core Primitives
Phase B: Outbox Pattern, NestJS CQRS & Module Structure
Phase C: Domain Aggregates, Catalog & Unit of Work Boundaries
Phase D: Universal Object Runtime, Capability Engine & Schema Registry
Phase E: Persistence Foundation, Prisma Mappers & Atomic CAS Concurrency

CURRENT STAGE:
Foundation + Documentation Truth + Architecture Reconciliation Pass

NEXT STAGE:
Product Construction (UI Screens, Flow Wiring, Object Experiences)
```

---

## 1. COMPLETED PHASES (Source-Verified)

### Phase A–C: Infrastructure & DDD Foundation
- [x] Monorepo workspace structure (`packages/shared`, `packages/theme`, `packages/ui`, `apps/backend`, `apps/mobile`, `apps/admin`)
- [x] Shared domain primitives (`ValueObject`, `Result`, `UniqueEntityId`, `Guard`, `AggregateRoot`, `ApplicationException`)
- [x] Transactional Outbox pattern infrastructure (`OutboxMessage`, `PrismaOutboxRepository`, `OutboxWorker`)
- [x] Keyset pagination primitives (`CursorEncoder`, `PaginationParams`, `PaginatedResult`)
- [x] NestJS application architecture, filters, guards, and CQRS module layout
- [x] `PrismaUnitOfWork` with `ITransactionContext` interactive PostgreSQL transaction binding

### Phase D: Universal Object Runtime & Capability Engine
- [x] `LumoraObjectRuntime` aggregate root (`domain/runtime/lumora-object-runtime.ts`)
- [x] `SchemaRegistryAggregate` with strict attribute type validation and schema versioning (`schemaVersion`)
- [x] `ObjectDefinitionRegistryAggregate` with trait definitions and allowed capability references
- [x] `UniversalCapabilityEngine` with DAG dependency resolution, loop detection, and topological execution
- [x] Capability lifecycle hooks (`Register` → `Initialize` → `Attach` → `Execute` → `Suspend` → `Resume` → `Detach`)
- [x] Universal Capabilities: Timeline, Reminders, Notifications, Attachments, Search, Favorites, Archive

### Phase E: Persistence Foundation & Concurrency Hardening
- [x] `PrismaObjectRepository` implementing `@lumora/shared` `IObjectRepository` port
- [x] Atomic Compare-And-Swap (CAS) mutations via PostgreSQL raw query `UPDATE ... WHERE revision = expectedVersion RETURNING *`
- [x] Strict tenant isolation enforced at repository level via `WorkspaceExecutionContext`
- [x] Bidirectional mapping between Prisma models and platform DTOs (`PrismaObjectMapper`)
- [x] Outbox event emission on object state mutations

---

## 2. CURRENT STAGE: Foundation & Documentation Reconciliation

- [x] **Source Discovery & Truth Audit**: Verified actual code state vs historical documentation claims.
- [x] **Security Hardening**: Removed insecure fallback string `'lumora_jwt_secret'` from auth services.
- [x] **Three-Tier Repository Disambiguation**:
  - Identified Tier 1 (Shared `IObjectRepository` — platform port), Tier 2 (Domain `IObjectAggregateRepository` — domain port), Tier 3 (`ObjectRepository` — legacy raw Prisma).
  - Renamed domain Tier 2 interface to `IObjectAggregateRepository` (`object-aggregate.repository.interface.ts`).
  - Authored **ADR-016** establishing the migration path from Tier 3 to Tier 1 via `ObjectAggregateRepositoryAdapter`.
- [x] **Test Infrastructure Correction**:
  - Renamed mocked test to `prisma-object.concurrency.mock.spec.ts`.
  - Authored real PostgreSQL integration spec `prisma-object.postgres.concurrency.integration.spec.ts` (guarded by `POSTGRES_INTEGRATION_TEST=true`).
- [x] **Empty Placeholder Cleanup**: Removed 16 empty Markdown placeholder files across `docs/`.
- [x] **Authoritative Documentation Suite**: Authored `CURRENT_ARCHITECTURE.md`, `DEVELOPMENT_BOUNDARIES.md`, `PRODUCT_ROADMAP.md`, and `docs/README.md`.

---

## 3. NEXT STAGE: Product Construction (Upcoming)

When Product Construction begins, features will be built on top of the established Universal Object platform without adding per-object-type database persistence models:

### Milestone 1: Reusable Platform Adapters & Form Infrastructure
- Wire `ObjectAggregateRepositoryAdapter` to replace Tier 3 legacy `ObjectRepository`.
- Implement `FieldRegistry` (dynamic form input renderers) and `BlockRegistry` (detail block view renderers).
- Implement dynamic form engine for universal object creation/editing based on `SchemaRegistry` metadata.

### Milestone 2: Object Creation & Detail Product Experiences
- Implement Universal Object Creation flow (Quick Add & Full Form).
- Implement Dynamic Object Detail View with block rendering (Header, Properties, Timeline, Attachments, Reminders).
- Wire Universal Object List & Grid views with filtering, searching, and sorting.

### Milestone 3: Product Experience Modules (Metadata-Driven)
Each experience consumes Universal Object platform persistence and standard capabilities:
- **Tasks & Reminders Experience**: Due dates, completion status, recurring rules.
- **Notes & Documents Experience**: Rich text attributes, file attachments.
- **Medicine & Health Experience**: Schedule attributes, reminder notifications.
- **Groceries & Inventory Experience**: Quantity, category, checklist items.
- **Plants & Garden Experience**: Watering schedule reminders, timeline log.
- **Pets & Household Experience**: Medical history timeline, vet appointment reminders.
- **Vehicles & Asset Experience**: Mileage log, service reminders.

---

## 4. APPROVED / NOT IMPLEMENTED ARCHITECTURE

These architectures are officially accepted via ADRs/Design Docs but have not yet been built into code:
- **FieldRegistry**: Form input control registry for dynamic forms.
- **BlockRegistry**: Detail block component registry for dynamic object detail views.
- **Universal Relationship Engine**: Explicit graph relationship links (`ParentOf`, `DependsOn`, `RelatedTo`) between objects.
- **Smart Collections Engine**: Dynamic collection query evaluator (`CollectionType.DYNAMIC`).

---

## 5. DEFERRED INFRASTRUCTURE (Post-Scale Triggers Only)

These systems are deliberately deferred until production scale benchmarks mandate them:
- **Kafka / RabbitMQ Event Bus**: Deferred while in-process PostgreSQL Outbox worker handles event distribution (see `TD-001`).
- **Elasticsearch / OpenSearch**: Deferred while PostgreSQL FTS and trigram indexes satisfy query SLAs (see `TD-003`).
- **Redis Cluster & Distributed Cache**: Deferred while single-node Redis satisfies cache SLAs (see `TD-006`).
- **Kubernetes HPA & Multi-Region Active-Active**: Deferred until cloud deployment scaling rules mandate container orchestration (see `TD-008`, `TD-012`).

---

## 6. REJECTED ARCHITECTURES

The following patterns are explicitly prohibited by Lumora Architectural Laws:
- ❌ **Per-Object-Type Database Tables**: Creating a new PostgreSQL table (`Medicines`, `Groceries`, `Plants`) for new object types.
- ❌ **Direct UI-to-Prisma Imports**: Importing `@prisma/client` or Prisma model types into React Native / Web UI components.
- ❌ **Bypassing Application Layer**: Invoking database queries directly from HTTP controllers or UI components.
- ❌ **Implicit/Magic Reflection**: Altering domain object state through implicit side-effects or un-typed reflection.
