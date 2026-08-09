# Lumora Platform Current Architecture (Authoritative State)

**Status**: Authoritative Source of Truth  
**Starting HEAD**: `ce9dc82c481018258fe3279196371af2b428389a`  
**Last Reconciled**: 2026-08-09  

---

## 1. Executive Summary & Core Platform Law

Lumora is an AI-ready **Personal Life Operating System** built around a **Universal Object Model** (*Everything is an Object*: Task, Note, Medicine, Grocery, Plant, Pet, Vehicle, Bill, Document, Habit, Event, Subscription, Custom Object, etc.).

> **CORE OVERRIDING MANDATE**: Lumora is a platform, not a collection of independent feature apps. Introducing a new object type MUST NOT require a new database table, new repository architecture, new database schema migration, new runtime, or new UI rendering architecture.

---

## 2. Master Subsystem Status Inventory

Every subsystem in Lumora is explicitly classified into one of eight standardized architectural status states:

| Subsystem / Feature | Architectural Status | Source Location / Context |
|---|:---:|---|
| **Universal Object Platform Model** | `IMPLEMENTED` | `@lumora/shared/core/object/types/universal-object.types.ts` |
| **ObjectAggregate Domain Entity** | `IMPLEMENTED` | `apps/backend/src/domain/objects/object.aggregate.ts` |
| **PrismaObjectRepository (Tier 1)** | `IMPLEMENTED` | `apps/backend/src/infrastructure/prisma/repositories/prisma-object.repository.ts` |
| **IObjectAggregateRepository (Tier 2)** | `PARTIALLY IMPLEMENTED` | `apps/backend/src/domain/objects/repositories/object-aggregate.repository.interface.ts` |
| **Legacy ObjectRepository (Tier 3)** | `LEGACY / ACTIVE` | `apps/backend/src/modules/objects/repositories/object.repository.ts` (ADR-016) |
| **Atomic CAS Concurrency Engine** | `IMPLEMENTED` | `PrismaObjectRepository` raw SQL `UPDATE ... RETURNING *` |
| **Tenant Isolation Engine** | `IMPLEMENTED` | `WorkspaceExecutionContext` enforced at every repository access path |
| **PrismaUnitOfWork & Transaction Context** | `IMPLEMENTED` | `apps/backend/src/infrastructure/prisma/prisma-unit-of-work.ts` |
| **Transactional Outbox Engine** | `IMPLEMENTED` | `OutboxMessage` entity + `PrismaOutboxRepository` + background worker |
| **LumoraObjectRuntime** | `IMPLEMENTED` | `apps/backend/src/domain/runtime/lumora-object-runtime.ts` |
| **SchemaRegistryAggregate** | `IMPLEMENTED` | `apps/backend/src/domain/catalog/schema-registry.aggregate.ts` |
| **ObjectDefinitionRegistryAggregate** | `IMPLEMENTED` | `apps/backend/src/domain/catalog/object-definition-registry.aggregate.ts` |
| **UniversalCapabilityEngine** | `IMPLEMENTED` | `apps/backend/src/domain/capabilities/universal-capability.engine.ts` |
| **LumoraPlatformKernel** | `PARTIALLY IMPLEMENTED` | `apps/backend/src/infrastructure/kernel/platform-kernel.service.ts` (boot logger shell) |
| **Template Engine (Template / InstalledTemplate)** | `IMPLEMENTED` | `apps/backend/src/domain/templates/` |
| **Timeline Engine** | `IMPLEMENTED` | `TimelineRecordEntity` + `PrismaTimelineRepository` |
| **Search Engine (Derived Projection)** | `IMPLEMENTED` | `SearchIndexEntity` + `PrismaSearchRepository` (PostgreSQL FTS/trigram) |
| **FileAsset & Storage Abstraction** | `IMPLEMENTED` | `FileAssetAggregate` + `LocalStorageProvider` / S3 interface |
| **Notification & Reminder Engine** | `IMPLEMENTED` | `NotificationAggregate` + `ReminderAggregate` |
| **UI Primitives & Theme Engine** | `IMPLEMENTED` | `packages/ui` (primitives) + `packages/theme` (motion, responsive, tokens) |
| **FieldRegistry (Form Input Controls)** | `APPROVED / NOT IMPLEMENTED` | Defined in ADR-014; targeted for Product Construction Milestone 1 |
| **BlockRegistry (Detail Component Blocks)** | `APPROVED / NOT IMPLEMENTED` | Defined in ADR-014; targeted for Product Construction Milestone 1 |
| **Universal Relationship Engine** | `APPROVED / NOT IMPLEMENTED` | Graph relationship links (`ParentOf`, `DependsOn`, `RelatedTo`); Product Construction |
| **Smart Collections Query Evaluator** | `APPROVED / NOT IMPLEMENTED` | Dynamic collection queries (`CollectionType.DYNAMIC`); Product Construction |
| **Kafka / RabbitMQ / Redis Cluster** | `DEFERRED` | Post-scale infrastructure items (see `TECH_DEBT.md` TD-001..TD-006) |
| **Direct UI-to-Prisma Imports** | `REJECTED` | Explicitly prohibited by Lumora Architecture Laws |
| **Per-Object PostgreSQL Tables** | `REJECTED` | Explicitly prohibited; all objects map to `UniversalObject` / `Object` model |
| **Legacy Per-Object Architecture** | `SUPERSEDED` | Pre-DDD hardcoded object handlers replaced by Platform Core (Phase D/E) |

---

## 3. Data & Model Architecture

### 3.1 Dual Object Representation: Platform Port vs Domain Aggregate

Lumora intentionally separates object representations across layer boundaries:

```
                  LUMORA ARCHITECTURE
                           |
            +--------------+--------------+
            |                             |
    PLATFORM LAYER                  DOMAIN LAYER
    (@lumora/shared)             (apps/backend/src/domain)
            |                             |
     UniversalObject               ObjectAggregate
 (Flat persistence DTO)         (Rich aggregate root with
  Attributes JSON record)        ValueObjects & Domain Events)
            |                             |
    IObjectRepository           IObjectAggregateRepository
     (Platform Port)                (Domain Port)
            |                             |
  PrismaObjectRepository         ObjectAggregateRepositoryAdapter
     (Tier 1, CAS SQL)               (Product Construction)
            |                             |
            +--------------+--------------+
                           |
                       PostgreSQL
                     (Object model)
```

1. **`UniversalObject` (`@lumora/shared`)**: The platform-level persistence DTO used for high-performance CAS updates, cache serialization, dynamic UI rendering, and platform runtime operations.
2. **`ObjectAggregate` (`apps/backend/src/domain`)**: The domain-driven aggregate root enforcing business invariants, encapsulated value objects (`ObjectKey`, `ObjectTitle`, `ObjectStatus`), and domain event emission (`ObjectCreatedEvent`, `ObjectUpdatedEvent`, `ObjectDeletedEvent`).

---

## 4. The Three-Tier Repository Architecture & Migration Path

Audit of `IObjectRepository` usages revealed a three-tier architecture (documented in **ADR-016**):

```
Tier 1: IObjectRepository (@lumora/shared)
        → Implemented by PrismaObjectRepository
        → AUTHORITATIVE PLATFORM PORT (Phase E CAS, workspace isolation)

Tier 2: IObjectAggregateRepository (apps/backend/src/domain/objects/repositories)
        → Renamed from IObjectRepository during Foundation Reconciliation
        → Domain port operating on ObjectAggregate
        → APPROVED / PARTIALLY IMPLEMENTED (Adapter pending)

Tier 3: ObjectRepository (apps/backend/src/modules/objects/repositories)
        → Raw Prisma data access class (pre-DDD legacy)
        → Returns Prisma model types directly
        → SUPERSEDED / LEGACY / ACTIVE
        → MUST NOT RECEIVE NEW CONSUMERS
```

### 4.1 Known Defect & Resolution
`CreateObjectUseCase` imports `IObjectAggregateRepository` and calls `.save(aggregate)`. However, NestJS DI (`objects.module.ts`) binds `OBJECT_REPOSITORY_TOKEN` to Tier 3 `ObjectRepository` (which lacks `.save()`), creating a known runtime TypeError on `POST /workspaces/:id/objects`.

**Resolution Strategy (ADR-016)**:
- Do NOT add a `.create()` fallback or patch Tier 3.
- In Product Construction Milestone 1, build `ObjectAggregateRepositoryAdapter` implementing `IObjectAggregateRepository` delegating to `PrismaObjectRepository` (Tier 1).
- Rebind `OBJECT_REPOSITORY_TOKEN` to `ObjectAggregateRepositoryAdapter`.
- Retire and delete Tier 3 `ObjectRepository`.

---

## 5. Persistence, CAS Concurrency & Tenant Isolation

### 5.1 Atomic Compare-And-Swap (CAS) Mutation
All mutations in `PrismaObjectRepository` enforce atomic Compare-And-Swap using PostgreSQL parameterized raw SQL `UPDATE ... WHERE revision = expectedVersion RETURNING *`:

```sql
UPDATE "Object"
SET "title" = $1, "attributes" = $2::jsonb, "revision" = "revision" + 1, "updatedAt" = $3
WHERE "id" = $4 AND "workspaceId" = $5 AND "revision" = $6 AND "status" != 'DELETED'
RETURNING *;
```

**CAS Invariants**:
1. `expectedVersion` MUST match `storedRevision`.
2. The database atomically increments `revision = expectedVersion + 1`.
3. If 0 rows are returned, `PrismaObjectRepository` evaluates whether the object is missing (`ObjectNotFoundException`), archived (`ObjectLifecycleConflictException`), or stale (`ObjectConcurrencyException`).
4. Read-after-write window is zero: the returning statement returns exact mutated database state.

### 5.2 Strict Multi-Tenancy & Tenant Isolation
Tenant scope is immutable within `WorkspaceExecutionContext(workspaceId, userId)`.
Every repository operation implicitly appends `WHERE "workspaceId" = context.workspaceId`. It is physically impossible for Workspace A to read, mutate, archive, or list objects belonging to Workspace B.

### 5.3 Anti-Resurrection Rule
Standard attribute mutations can ONLY execute when `status == 'ACTIVE'`.
Mutations against `ARCHIVED` or `DELETED` objects throw `ObjectLifecycleConflictException`.
Status transitions can ONLY occur through explicit `archive()` and `restore()` lifecycle operations.

---

## 6. Unit of Work, Outbox & History Architecture

```
                       APPLICATION USE CASE
                                 |
                          PrismaUnitOfWork
                                 |
             +-------------------+-------------------+
             |                   |                   |
             v                   v                   v
     Object Repository   Timeline Repository  Outbox Repository
   (UniversalObject CAS)  (Audit/History)    (OutboxMessage)
             |                   |                   |
             +-------------------+-------------------+
                                 |
                      PostgreSQL TRANSACTION
                             (COMMIT)
                                 |
                           Outbox Worker
                      (Async event publishing)
```

1. **Atomicity**: Object state update, timeline audit record, and outbox domain event commit within a single PostgreSQL interactive transaction via `PrismaUnitOfWork`.
2. **Outbox Worker**: External publishing (Notifications, Search index updates) occurs **after** transaction commit via background polling of `OutboxMessage`.
3. **Rollback Guarantee**: Failure in timeline or outbox insertion triggers automatic full database rollback of object state.

---

## 7. Security & Authentication Architecture

- **JWT Configuration**: Standard JWT authentication using bearer tokens.
- **Fail-Fast Security Invariant**: `JwtStrategy` and `TokenService` throw `InternalServerErrorException` at boot/invocation if `JWT_SECRET` or `JWT_REFRESH_SECRET` is missing. **Hardcoded fallback strings (e.g. `'lumora_jwt_secret'`) are strictly prohibited and removed.**
- **Git Security**: `.env` and `.env.*` files are gitignored and verified untracked.

---

## 8. UI Architecture & The UI Independence Law

### 8.1 UI Independence Law
The UI layer (React Native mobile app, React web client, Admin portal) is strictly decoupled from domain persistence and database schemas:

```
UI Component (React / React Native)
     ↓
Presentation View Model / Design Tokens
     ↓
Application Use Case / Query
     ↓
Domain Aggregate / Platform Runtime
     ↓
Repository Port (IObjectRepository)
     ↓
Prisma Infrastructure Adapter
     ↓
PostgreSQL Database
```

> **UI INDEPENDENCE LAW**: A visual redesign (changing colors, fonts, buttons, card borders, animations, themes, icons, home screen layouts, tab bars, or dynamic density) MUST NEVER require a database migration, Prisma schema edit, repository change, or domain object schema modification.

### 8.2 UI/Data Change Impact Matrix

| Operation / Change | Affected Layer | DB Migration Required? | Architecture Review Required? |
|---|---|:---:|:---:|
| **Change Button Radius / Shadow** | UI Primitive (`packages/ui`) | **NO** | No |
| **Swap Icon Library / Icon Size** | Icon Registry (`packages/ui`) | **NO** | No |
| **Update Color Tokens / Dark Mode** | Theme System (`packages/theme`) | **NO** | No |
| **Change Motion Physics / Spring Scale** | Motion Engine (`packages/theme`) | **NO** | No |
| **Redesign Home Screen Layout** | Mobile/Web Screen Component | **NO** | No |
| **Redesign Object Card View** | Mobile/Web Card Component | **NO** | No |
| **Add Attribute to Object Schema** | Schema Registry (`SchemaRegistry`) | **NO** (JSON attribute) | Recommended |
| **Attach Existing Capability to Type** | Object Definition Registry | **NO** | Recommended |
| **Add New Universal Capability** | Domain Engine + Infrastructure | **MAYBE** (if storage required) | **YES** |
| **New Object Type (e.g., Medicine)** | JSON Catalog Metadata | **NO** (reuses UniversalObject) | No |
| **New Lifecycle State** | Domain Aggregate + Repository | **YES** (Prisma Enum) | **YES** |
| **Add Database Index for Query SLA** | Prisma Schema (`schema.prisma`) | **YES** (`prisma migrate`) | Recommended |

---

## 9. Migration Decision Rules

When planning modifications, apply these decision rules:

1. **Visual / Layout Changes**: Pure UI/Theme edits. Zero backend or DB impact.
2. **New Object Type**: Create JSON metadata definition in `ObjectDefinitionRegistry`. **Zero DB schema migrations.**
3. **New Object Attribute**: Add field definition to `SchemaRegistry`. Stored inside `attributes` JSONB column. **Zero DB schema migrations.**
4. **New Core Entity / Relation**: Adding a top-level entity outside Universal Object requires architectural review, ADR justification, and a Prisma database migration.

---

## 10. Verification & Quality Gates

- **Unit & Mock Tests**: 104 mock test suites verifying domain aggregates, use cases, mappers, and unit logic (`pnpm run test`).
- **PostgreSQL Concurrency Integration Test**: Authored `prisma-object.postgres.concurrency.integration.spec.ts` guarded by `POSTGRES_INTEGRATION_TEST=true` to test real CAS race conditions against live PostgreSQL instances.
- **Type Checking**: Clean monorepo compilation (`pnpm run typecheck`).
