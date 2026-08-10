# Lumora Architectural & Product Roadmap

> **STATUS**: Authoritative Strategic Roadmap  
> **LAST RECONCILED**: 2026-08-10 (HEAD `92fb2fe`)  

---

## Master Phase Execution Map

```
COMPLETED PHASES:
Phase A: Monorepo Foundation & Shared DDD Core Primitives
Phase B: Outbox Pattern, NestJS CQRS & Module Structure
Phase C: Domain Aggregates, Catalog & Unit of Work Boundaries
Phase D: Universal Object Runtime, Capability Engine & Schema Registry
Phase E: Persistence Foundation, Prisma Mappers & Atomic CAS Concurrency

CURRENT STAGE:
Phase A/B: Foundation Audit & Master Documentation Architecture Reconciliation Pass

NEXT STAGE (STAGE 1):
Phase C: Technical Code, Security & CI Remediation (P0 / P1)

UPCOMING STAGES:
Stage 2: Platform Activation & Engine Hardening Pass (Capabilities, Smart Collections, Rate Limiting)
Stage 3: Auth + Mobile Data Foundation (axios, TanStack Query, Zustand, SecureStore)
Stage 4: Product Experiences & UI Screen Construction (Home, Quick Add, Detail, Timeline, Search)
```

---

## 1. COMPLETED PHASES (Source-Verified)

- [x] Monorepo workspace structure (`packages/shared`, `packages/theme`, `packages/ui`, `apps/backend`, `apps/mobile`, `apps/admin`)
- [x] Transactional Outbox pattern infrastructure (`OutboxMessage`, `PrismaOutboxRepository`, `OutboxWorker`)
- [x] `PrismaUnitOfWork` interactive PostgreSQL transaction binding
- [x] `UniversalCapabilityEngine` & `LumoraObjectRuntime` core domain aggregates
- [x] `PrismaObjectRepository` Tier 1 CAS implementation (raw SQL `UPDATE ... RETURNING *`)
- [x] Three-tier repository disambiguation (Tier 3 deleted, ADR-016 complete)
- [x] Session token SHA-256 hashing in `SessionRepository`

---

## 2. STAGE 1: TECHNICAL CODE, SECURITY & CI REMEDIATION (P0 / P1)

Targeted remediation of identified backend, security, and CI gaps:
1. **Fix CORS**: Add `app.enableCors()` in `main.ts`.
2. **Harden PermissionsGuard**: Restrict `workspaceId` extraction strictly to `params.workspaceId` (remove `params.id` fallback).
3. **Protect Search GET**: Add `@UseGuards(PermissionsGuard)` to `SearchController` GET endpoint.
4. **Tier 2 CAS Alignment**: Refactor `ObjectsService.updateObject()` to invoke `ObjectAggregateRepositoryAdapter.save()` directly.
5. **Real PostgreSQL CI**: Add `postgres:16-alpine` container to `.github/workflows/ci.yml` and execute real PostgreSQL integration suite.

---

## 3. STAGE 2: PLATFORM ACTIVATION & ENGINE HARDENING PASS

Complete backend engine activation before product UI construction:
1. **Capability Handler Activation**: Register production handlers via `CapabilityExecutor.registerHandler()`.
2. **Smart Collections Evaluator**: Build `QueryEvaluator` engine for `CollectionType.DYNAMIC`.
3. **Relationship Cycle Guards**: Add graph cycle detection for object links.
4. **API Rate Limiting**: Apply rate limiting across CRUD and search endpoints.

---

## 4. STAGE 3: AUTH + MOBILE DATA FOUNDATION

Build mobile client data and auth foundation:
1. Install `axios`, `@tanstack/react-query`, `zustand`, `expo-secure-store` in `apps/mobile`.
2. Create `lib/api/client.ts` with JWT refresh interceptors.
3. Create `store/auth.store.ts` for session and active workspace state.
4. Build Login & Register screens.

---

## 5. STAGE 4: PRODUCT EXPERIENCES & UI SCREEN CONSTRUCTION

1. Build Home screen (Object list with filter/sort).
2. Build Quick Add universal object creation sheet.
3. Build Dynamic Object Detail screen with block renderers.
4. Build Timeline & Search screens.
