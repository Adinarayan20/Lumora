# ADR-016: Three-Tier Object Repository Architecture — Migration Path

**Status**: Accepted
**Date**: 2026-08-09
**Phase**: Foundation Reconciliation Pass
**Supersedes**: N/A
**Related**: ADR-013, ADR-014

---

## Context & Problem Statement

During the Foundation + Architecture Reconciliation Pass (HEAD: `ce9dc82`), a source audit
revealed three separate object persistence constructs operating under the name or token
`IObjectRepository`. This creates architectural ambiguity, a known runtime defect, and
a risk that future engineers or AI agents will couple new features to the wrong tier.

---

## The Three Tiers (Source-Verified)

### Tier 1 — Platform Repository Port (AUTHORITATIVE)
```
packages/shared/src/core/object/repository/object-repository.interface.ts
```
- Interface name: `IObjectRepository`
- Operates on: `UniversalObject` (platform persistence DTO)
- Implemented by: `PrismaObjectRepository` (Phase E, CAS, workspace isolation)
- Used by: `@lumora/shared` ObjectRuntime, PrismaObjectMapper
- Status: **IMPLEMENTED — AUTHORITATIVE PLATFORM PORT**
- Methods: `getById`, `create`, `update`, `list`, `archive`, `restore`

### Tier 2 — Domain Aggregate Repository Port (APPROVED / PARTIALLY IMPLEMENTED)
```
apps/backend/src/domain/objects/repositories/object-aggregate.repository.interface.ts
```
- Interface name: `IObjectAggregateRepository` (renamed from `IObjectRepository` during this pass)
- Operates on: `ObjectAggregate` (domain entity with value objects and domain events)
- Implemented by: **Nothing** (no concrete class implements this interface)
- DI token: `OBJECT_REPOSITORY_TOKEN` — bound to Tier 3 (incorrect)
- Consumers: `CreateObjectUseCase` (imports this type, calls `.save(aggregate)`)
- Status: **PARTIALLY IMPLEMENTED — DI wiring is broken, concrete adapter is missing**
- Known defect: `OBJECT_REPOSITORY_TOKEN` resolves to Tier 3 which has no `.save()` method,
  causing `ObjectsController.POST /workspaces/:id/objects` to throw a runtime TypeError.

### Tier 3 — Legacy Raw Prisma Data Access Object (SUPERSEDED / LEGACY / ACTIVE)
```
apps/backend/src/modules/objects/repositories/object.repository.ts
```
- Class name: `ObjectRepository`
- Operates on: Prisma model types directly (`LumoraObject`, `ObjectWithRelations`)
- Implements: No domain interface
- DI token: `OBJECT_REPOSITORY_TOKEN` (useClass: ObjectRepository) — bound in `objects.module.ts`
- Consumers: `ObjectsService`, `objects.module.ts` DI, legacy use case facade wrappers
- Status: **SUPERSEDED / LEGACY / ACTIVE — DO NOT ADD NEW CONSUMERS**
- Violations:
  - Returns Prisma model types to application layer (architecture violation)
  - Bypasses ObjectAggregate domain semantics and capability system
  - `{ revision: { increment: 1 } }` is not atomic CAS — it is race-prone under concurrent writes
  - Implements no domain interface, invisible to architecture enforcement tools

---

## Decision

### Immediate Actions (This Pass)
1. Rename `IObjectRepository` (Tier 2) to `IObjectAggregateRepository` in source and exports.
2. Add backward-compatibility re-export in the old file to prevent compile breaks.
3. Update all known consumers (`CreateObjectUseCase`, its spec) to use the new name.
4. Add comprehensive `LEGACY / ACTIVE / SUPERSEDED` annotations to:
   - Tier 3 `ObjectRepository` class
   - `objects.module.ts` DI provider block
   - `ObjectsService` (inherits from Tier 3)
5. Document the known runtime defect in `CreateObjectUseCase` without masking it.
6. Prohibit new consumers from binding to Tier 3 via code comments and this ADR.

### Migration Target (Product Construction Phase)
Create `ObjectAggregateRepositoryAdapter` implementing `IObjectAggregateRepository` that:
- Accepts `ObjectAggregate` from the domain layer
- Maps `ObjectAggregate → UniversalObject` for persistence via `PrismaObjectRepository`
- Maps `UniversalObject → ObjectAggregate` for domain reads
- Provides `findByObjectKey()` and `existsByObjectKey()` as domain queries
- Provides cursor-paginated `findPaginated()` backed by the platform pagination infrastructure
- Replaces `OBJECT_REPOSITORY_TOKEN → useClass: ObjectRepository` with the new adapter

Once `ObjectAggregateRepositoryAdapter` is wired and tested:
- `ObjectsService` consumers are migrated to use `IObjectAggregateRepository`
- Tier 3 `ObjectRepository` class is deleted
- The old backward-compatibility re-export in `object.repository.interface.ts` is deleted

---

## Alternatives Considered

### Alternative A: Fix CreateObjectUseCase to call ObjectRepository.create() instead of .save()
**Rejected**: This increases coupling to the architecture being retired. It makes Tier 3
more entrenched, not less. The `.save()` call is correct design — the DI wiring is wrong.

### Alternative B: Immediately delete Tier 3 ObjectRepository
**Rejected**: ObjectsService and the GetWorkspaceObjects / GetObject / UpdateObject / DeleteObject
paths all consume Tier 3 through ObjectsService. Deleting it would break all object endpoints.
These consumers must be migrated before deletion is safe.

### Alternative C: Make PrismaObjectRepository implement IObjectAggregateRepository
**Rejected**: PrismaObjectRepository operates on `UniversalObject` (the platform DTO).
IObjectAggregateRepository operates on `ObjectAggregate` (the domain entity with value objects).
These are semantically different types. Conflating them would violate the data model boundary.
A thin adapter is the correct pattern.

---

## Consequences

### Positive
- Eliminates naming collision between two interfaces named `IObjectRepository`
- Documents the known runtime defect explicitly in source code
- Prevents new features from coupling to Tier 3
- Provides a clear, safe migration path for Product Construction phase
- Preserves all existing consumers without breaking changes

### Negative / Trade-offs
- The runtime defect in `CreateObjectUseCase` / `POST /workspaces/:id/objects` persists
  until the adapter is implemented
- Temporary dual-file pattern (`object.repository.interface.ts` + `object-aggregate.repository.interface.ts`)
  must be cleaned up during migration

---

## Migration Conditions

The migration to `ObjectAggregateRepositoryAdapter` may be executed when:
1. Product Construction phase begins for the Universal Object creation flow
2. A concrete end-to-end test exists verifying the adapter against real PostgreSQL
3. All Tier 3 consumers (`ObjectsService` and its query use-case wrappers) are migrated
4. The old backward-compatibility re-export is removed
5. This ADR is updated to status `Implemented`

---

## No-New-Consumer Rule

Effective immediately from this ADR:

> **No new use case, service, controller, or NestJS module may add a dependency on
> `ObjectRepository` (Tier 3) or bind to `OBJECT_REPOSITORY_TOKEN` as a legacy consumer.**

New code that needs object persistence must use one of:
- `PrismaObjectRepository` via `IObjectRepository` from `@lumora/shared` (platform layer)
- `IObjectAggregateRepository` via `OBJECT_REPOSITORY_TOKEN` (once the adapter is wired)
