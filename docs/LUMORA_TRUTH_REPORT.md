# LUMORA — AUTHORITATIVE TRUTH REPORT

**Version:** 1.0  
**Date:** 2026-08-09  
**Baseline SHA:** `8bfdc0f1a92e10693574c84eb6d0bb79ac1dd272`  
**Phase F Commit:** `ec1e402`  
**Source:** Actual repository code — verified by direct file inspection  
**Purpose:** Single source of truth. Replaces all prior pasted text files and duplicate Kiro reports.

---

## CRITICAL NOTICE — READ THIS FIRST

Three contradictions exist in prior documents. This report resolves all three.

**Contradiction 1 — Phase naming conflict.**
The UI Blueprint uses "Phase F" to mean UI component completion. The engineering report uses "Phase F" to mean foundation hardening. Both cannot be right. This report retires the letter-based phase system entirely. All future phases use descriptive names defined in Section 3.

**Contradiction 2 — "All critical items resolved" vs open HIGH issues.**
Kiro stated "READY FOR PRODUCT CONSTRUCTION — all critical blockers resolved" while the same report classified session token plaintext as HIGH severity. The truth: the five original discovery-audit blockers are resolved. Three HIGH-priority issues remain open and must be fixed before public launch. The product is ready to begin construction with those three items in parallel — but they are not resolved.

**Contradiction 3 — "Backend ready" does not mean "feature ready."**
Every readiness classification in this report uses five columns: Backend, Application, Mobile Data, UI, and E2E. A feature is only ready when all five are green.

---

## SECTION 1 — WHAT LUMORA IS

Lumora is a **Personal Life Operating System**. It is not a task manager, a habit tracker, a medicine app, a plant app, or a grocery app. It is the single environment where a person manages all of those things through one unified object model, one coherent visual language, and one consistent interaction pattern.

**Core product principles — verified across Blueprint and engineering source:**

**One object model for everything.** A Medicine, Task, Plant, Pet, and Bill are all Universal Objects. They share the same persistence, same repository, same lifecycle, and same capability infrastructure. Type is expressed through `typeKey` string + `attributes` JSONB — not through separate tables or separate code paths.

**One visual language for everything.** The product must feel like one coherent operating environment — not a collection of themed mini-apps. The Blueprint explicitly warns against "a wall of colorful cards." Any future visual redesign — glassmorphism, 3D depth, minimal flat, any language — must be achievable without touching the backend.

**Calm and fast.** Zero-delay entry, progressive disclosure, minimal density, calm visual hierarchy. This is not a gamification engine. Streaks and milestones exist to support reflection, not to manufacture engagement.

**Universal Quick Add.** Creating any object takes under 2 seconds. One entry point. One interaction. One backend endpoint: `POST /workspaces/:id/objects` for all types.

**Architecture that outlasts the product.** The backend was built for types that do not yet exist. The visual design was built to be replaceable. Neither domain nor database should change when the product team redesigns a card or adds an animation.

---

## SECTION 2 — REPOSITORY STATE — VERIFIED FACTS

These facts were confirmed by reading actual source files. They are not inferred.

| Fact | Verified |
|---|---|
| Starting HEAD: `8bfdc0f` | ✅ confirmed by `git log` |
| Phase F commit: `ec1e402` on `main` | ✅ confirmed |
| `apps/backend/.env` exists on disk with Neon credentials | ✅ confirmed |
| `.env` NOT tracked by git | ✅ confirmed by `git ls-files` |
| `.env` NOT in git history | ✅ confirmed by `git log --all --follow` |
| CI uses placeholder `DATABASE_URL` only | ✅ confirmed in `ci.yml` |
| Tier 3 `ObjectRepository` file deleted | ✅ `git diff --stat` shows `delete mode` |
| `CreateObjectFacadeUseCase` deleted | ✅ confirmed |
| `PrismaOutboxRepository` now targets `OutboxMessage` table | ✅ all methods use `prisma.outboxMessage.*` |
| `OutboxWorker.start()` now called via `OutboxModule.onModuleInit()` | ✅ confirmed |
| `SearchController` route changed from `/search` to `/workspaces/:id/search` | ✅ confirmed |
| `SearchIndex.workspaceId` column added in migration | ✅ confirmed in schema and SQL |
| `FileAsset.workspaceId` column added in migration | ✅ confirmed in schema and SQL |
| `TimelineController` now uses `PermissionsGuard` | ✅ confirmed |
| `AuthController` now has `RedisRateLimiterGuard` on 5 endpoints | ✅ confirmed |
| `AuthResponseDto` returns `UserPublicDto` not Prisma `User` | ✅ confirmed |
| TypeScript: 0 errors (verified via node tsc script) | ✅ `TSC_PASS` output confirmed |
| Tests: 85 passing, 0 failing, 10 skipped | ✅ confirmed by vitest output |
| `prisma validate`: schema valid | ✅ confirmed |
| `prisma generate`: Prisma Client 7.9.1 generated | ✅ confirmed |
| `session.accessToken` and `session.refreshToken` stored as PLAINTEXT | ✅ confirmed in `session.repository.ts` lines 9-10 |
| `CapabilityExecutor.registerHandler()` never called in production | ✅ confirmed by grep — zero results |
| `prisma.client` getter calls `$extends()` on every access — not memoized | ✅ confirmed in `prisma.service.ts` |
| `GET /workspaces/:id/objects` has no pagination limit | ✅ confirmed in `objects.service.ts` — no `take` |
| Mobile `store/`, `constants/`, `types/` directories are empty | ✅ confirmed by directory listing |
| No HTTP client in mobile app | ✅ confirmed — no axios, no fetch wrapper in `package.json` |

---

## SECTION 3 — AUTHORITATIVE PHASE NAMING SYSTEM

The letter-based naming system (Phase D, E, F, G...) caused confusion because the UI Blueprint and engineering reports used the same letters for different meanings. This report retires it. All future work uses descriptive names only.

```
PHASE D (complete)
Universal Object Runtime
    ↓
PHASE E (complete)
Persistence + Data Foundation
    ↓
FOUNDATION HARDENING (complete — commit ec1e402)
Repository migration, Outbox repair, Search isolation,
Attachment ownership, Timeline auth, Kernel activation,
DTO boundaries, Auth rate limiting
    ↓
FOUNDATION REPAIR — REMAINING (current — must complete before UI)
Session token hashing, Outbox event handlers,
Prisma client memoization, Object list pagination
    ↓
AUTH + MOBILE DATA FOUNDATION
API client, SecureStore, TanStack Query, Zustand auth, Login/Register screens
    ↓
UI FOUNDATION
ObjectCard, LoadingState, EmptyState, ErrorState, OfflineBanner
    ↓
MOTION FOUNDATION
HapticEngine abstraction, MotionEngine consumer verification
    ↓
HOME
    ↓
QUICK ADD
    ↓
UNIVERSAL CREATE / EDIT
    ↓
OBJECT DETAIL
    ↓
TIMELINE (auto-events must exist first)
    ↓
SEARCH (auto-indexing must exist first)
    ↓
SPACES / COLLECTIONS
    ↓
REMINDERS / NOTIFICATIONS
    ↓
ATTACHMENTS
    ↓
PERSONALIZATION
    ↓
NEW OBJECT TYPES (Medicine, Grocery, Plant, Pet, Vehicle, Bill, Subscription)
    ↓
RELATIONSHIPS
    ↓
ACCESSIBILITY AUDIT
    ↓
RESPONSIVE / WEB
    ↓
PROGRESS / GAMIFICATION
    ↓
OFFLINE / SYNC
    ↓
REAL DATA QA
    ↓
E2E TEST SUITE
    ↓
PRODUCTION
```

---

## SECTION 4 — ARCHITECTURE QUALITY — HONEST ASSESSMENT

### What is genuinely strong

**Universal Object Model.** The design decision to use one `Object` table with `typeKey` + `attributes` JSONB is correct, future-proof, and well-implemented. Adding Medicine, Grocery, Plant, Pet, Vehicle, Bill, or Subscription requires zero database work. This was verified by proving a Medicine object can be stored as a standard `Object` row with its fields in JSONB.

**CAS concurrency.** The atomic `UPDATE "Object" SET revision = $n+1 WHERE revision = $n AND workspaceId = $ws RETURNING *` pattern is race-safe. Verified in both `PrismaObjectRepository` (Tier 1) and `ObjectAggregateRepositoryAdapter` (Tier 2 — new). Real concurrent PostgreSQL tests prove exactly one writer wins and the other gets `ObjectConcurrencyException`.

**Workspace isolation.** `WorkspaceExecutionContext` is injected into every repository constructor and is immutable. It is structurally impossible to query the wrong workspace through a correctly wired repository. Every API endpoint that should check workspace membership now does.

**Three-tier repository architecture resolved.** ADR-016 described the migration from legacy Tier 3 to `ObjectAggregateRepositoryAdapter`. That migration is complete. All 9 consumers of Tier 3 were migrated and the file was deleted.

**Design token system.** `packages/theme` with `LightThemeColors`, `DarkThemeColors`, `AmoledThemeColors`, `HighContrastThemeColors` is production-quality. Zero colors are hardcoded in components. A complete palette swap requires changing one generated token file.

**Outbox pattern.** The infrastructure is now correct after Foundation Hardening. Events are staged atomically with the object write, the worker polls every 2 seconds, retry backoff is exponential, idempotency keys prevent duplicate staging, and stale locks are released time-bounded.

### What is genuinely incomplete

**Capability pipeline has no handlers.** `CapabilityRegistry` is populated at boot. `CapabilityExecutor` is wired. But `registerHandler()` is never called anywhere. The pipeline runs and marks events COMPLETED — but no domain side effects (timeline writes, search indexing, notification delivery) occur automatically.

**`LumoraObjectRuntime` exists but is never used in production.** It is a correct, fully implemented domain building block. No use case instantiates it.

**Mobile application is stub-only.** No API client. No auth screens. No product screens. No state management. The `store/`, `constants/`, and `types/` directories are empty.

**Session tokens are plaintext.** This is the most uncomfortable truth in the codebase. `Session.refreshToken` is stored and queried as a plain string. A database breach exposes every active session immediately.

### What is overstated in prior reports

The phrase "READY FOR PRODUCT CONSTRUCTION" is accurate with one important nuance: the backend is ready for product construction. The mobile application is not. Product construction requires both. The more accurate statement is: **the backend foundation is production-oriented and correct; the mobile product has not been started in any meaningful sense.**

---

## SECTION 5 — WHAT IS ACTUALLY WORKING RIGHT NOW

These items work end-to-end as of commit `ec1e402`. Verified by source inspection and test results.

| Feature | Evidence |
|---|---|
| `POST /workspaces/:id/objects` — create any object type | `CreateObjectUseCase` → `ObjectAggregateRepositoryAdapter.save()` → Prisma insert. Fixed in Foundation Hardening. |
| `GET /workspaces/:id/objects` — list workspace objects | `ObjectsService.getWorkspaceObjects()` → workspace-scoped Prisma query → `ObjectResponseDto[]` |
| `GET /workspaces/:id/objects/:key` — get by ID or objectKey | UUID regex detection → `findFirst` by id or objectKey |
| `PATCH /workspaces/:id/objects/:id` — update with revision check | `ObjectsService.updateObject()` → `updateMany WHERE status != DELETED` |
| `DELETE /workspaces/:id/objects/:id` — soft delete | `ObjectsService.softDeleteObject()` → `updateMany → status = DELETED` |
| `POST /auth/register` — user registration | Atomic transaction: user + workspace + session + audit log |
| `POST /auth/login` — login | bcrypt verify + session create + JWT issue |
| `POST /auth/refresh` — token rotation | Reuse detection + session revoke + new tokens |
| `POST /auth/logout` — logout | Session deleted |
| Rate limiting on all auth endpoints | `RedisRateLimiterGuard` applied with correct limits |
| Workspace CRUD | Full API functional |
| Spaces CRUD | Full API functional |
| Collections CRUD | Full API functional with workspace ownership check |
| Reminders CRUD | Full API functional with workspace ownership check |
| `GET /workspaces/:id/timeline` | Workspace-scoped, auth-guarded |
| `POST /workspaces/:id/timeline` | Workspace-membership-checked (PermissionsGuard) |
| `GET /workspaces/:workspaceId/search` | Workspace-scoped ILIKE search |
| `POST/GET/DELETE /workspaces/:id/media` | Workspace-ownership-enforced |
| `OutboxMessage` staging | Events staged atomically with object writes in `outbox_messages` table |
| `OutboxWorker` polling | Starts on `OutboxModule.onModuleInit()`, polls every 2s, FOR UPDATE SKIP LOCKED |
| Retry + backoff | `markAsFailed()` computes `2^n * 1000ms`, persists `lastError` and `nextAttemptAt` |
| Stale lock release | Time-bounded — resets PROCESSING rows older than 30s |
| `LumoraPlatformKernel` boot | Registers 5 capabilities, verifies 6 object types, pings Redis cache |
| `CapabilityRegistry` | 5 built-in capabilities registered: reminder, timeline, media, search, favorite |
| CAS concurrency | Atomic raw SQL — race-safe. Verified by PostgreSQL integration tests |
| Workspace isolation | `WorkspaceExecutionContext` enforced at all repository layers |
| `SearchIndex` workspace-scoped | All queries require `workspaceId` after Foundation Hardening |
| `FileAsset` workspace-scoped | Workspace ownership checked on GET/POST/DELETE after Foundation Hardening |
| `UserSettings` API | GET/PATCH `/settings/me` — theme, locale, timezone, preferences persisted |
| Design token system | 4 complete themes in `packages/theme`, `useTheme()` works |
| UI component library | Button, Card, Input, Icon, Typography, Stack, Modal, Select, Badge, Feedback all functional |
| `DynamicObjectDetail` | Schema-driven detail view with edit mode — functional in `packages/ui` |
| `FieldRegistry` | String, Number, Boolean, Enum adapters — functional |
| `BlockRegistry` | HeaderBlockAdapter, PropertiesBlockAdapter — functional |
| Prisma migrations | 3 forward-only migrations — deploy cleanly on fresh and existing DBs |
| TypeScript | 0 errors |
| Tests | 85 passing, 0 failing, 10 skipped (PostgreSQL integration — require `POSTGRES_INTEGRATION_TEST=true`) |

---

## SECTION 6 — WHAT IS BROKEN OR INCOMPLETE RIGHT NOW

These are verified gaps — not inferred, not assumed from documentation.

### P0 — Must fix before public launch

**SESSION TOKENS STORED AS PLAINTEXT**
- File: `apps/backend/src/modules/auth/repositories/session.repository.ts` lines 9-10, 63-64
- Truth: `Session.accessToken` and `Session.refreshToken` are stored verbatim. `findByRefreshToken()` queries `where: { refreshToken }` — the plain token is the lookup key.
- Impact: If the `sessions` PostgreSQL table is breached, every active user session is immediately usable by the attacker. No password needed. All personal data accessible.
- Fix: `SHA-256(token)` before storage. Compare `SHA-256(incoming)` on lookup. One file change.

**OUTBOX EVENTS PRODUCE NO SIDE EFFECTS**
- File: `apps/backend/src/infrastructure/events/outbox/nest-event-publisher.ts`
- Truth: `NestEventPublisher.publish()` calls `logger.log()` only. No handler is ever registered with `CapabilityExecutor.registerHandler()`.
- Impact: Object creation events are staged and dispatched correctly by the worker — but they arrive at a logger. Timeline is never auto-populated. SearchIndex is never auto-updated. Reminders never deliver notifications.
- Fix: Create `OutboxEventHandlerService` that registers TIMELINE, SEARCH, and REMINDER handlers.

**NO MOBILE API CLIENT**
- Directory: `apps/mobile/` — no axios, no TanStack Query, no Zustand, no SecureStore
- Truth: The mobile `package.json` contains no HTTP client library. The `store/` directory is empty. No product screen makes any API call.
- Impact: Zero product screens can function. The backend is ready. The mobile client cannot communicate with it.
- Fix: Install axios + TanStack Query + Zustand + expo-secure-store. Create `lib/api/client.ts`, `lib/store/auth.store.ts`.

### P1 — Must fix during first product sprint

**NO CURSOR PAGINATION ON OBJECT LIST**
- File: `apps/backend/src/modules/objects/objects.service.ts` — `getWorkspaceObjects()` has no `take` limit
- Impact: A workspace with 10,000 objects returns all 10,000 in one response. Memory spike. Potential OOM.

**`prisma.client` GETTER RECREATES EXTENDED CLIENT ON EVERY CALL**
- File: `apps/backend/src/infrastructure/prisma/prisma.service.ts`
- Truth: `get client() { return this.$extends(softDeleteExtension); }` — creates new Prisma Client instance on every database operation.
- Impact: Memory overhead on every DB call. Measurable at production load.
- Fix: Memoize — compute once on first access, cache result.

**COLLECTIONS / SPACES / REMINDERS / WORKSPACES RETURN PRISMA TYPES**
- Truth: `CollectionsService`, `SpacesService`, `RemindersService`, `WorkspacesService` return raw Prisma model types from methods and controllers.
- Impact: Prisma schema changes silently break API contracts. Internal fields exposed to mobile clients.

**NO `entityId` FILTER ON TIMELINE API**
- Truth: `GET /workspaces/:id/timeline` has no way to filter by object. Cannot show "history of one specific object."

**NO AUTH SCREENS IN MOBILE**
- Truth: No login screen, no register screen, no auth flow. Users cannot log in.

**`two.tsx` WRONG FILE NAME**
- Truth: `apps/mobile/app/(tabs)/two.tsx` is the Timeline tab — named from Expo default template, never renamed.

**NO `.env.example` FILE**
- Truth: `apps/backend/.env.example` does not exist. New team members have no reference for required environment variables.

---

## SECTION 7 — SECURITY AUDIT — TRUTH

### Resolved in Foundation Hardening

| Item | Status |
|---|---|
| JWT secret required at startup — no hardcoded fallback | ✅ RESOLVED |
| No hardcoded JWT secrets in source (verified by grep) | ✅ CONFIRMED CLEAN |
| bcrypt password hashing | ✅ CORRECT |
| Refresh token rotation on use | ✅ CORRECT |
| Refresh token reuse detection — session revoked | ✅ CORRECT |
| Rate limiting on login, register, refresh, oauth, change-password | ✅ RESOLVED in Foundation Hardening |
| Auth response no longer leaks Prisma `User` model | ✅ RESOLVED in Foundation Hardening |
| Search cross-workspace leakage | ✅ RESOLVED in Foundation Hardening |
| Timeline write without workspace membership | ✅ RESOLVED in Foundation Hardening |
| File assets without workspace scope | ✅ RESOLVED in Foundation Hardening |
| `.env` not in git history | ✅ CONFIRMED |

### Still Open

| Item | Severity | Action Required |
|---|---|---|
| Session tokens stored plaintext | **HIGH** | Hash with SHA-256 before storage — fix before public launch |
| `.env` contains live Neon credentials | MEDIUM | Rotate password on Neon dashboard. Add `.env.example`. |
| `PermissionsGuard` fallback `params.id` could resolve wrong workspaceId | LOW | Remove fallback — use only `params.workspaceId` |
| No E2E auth flow test (login → token → protected endpoint → workspace isolation) | LOW | Build during Foundation Repair sprint |

### What "READY FOR PRODUCT CONSTRUCTION" Actually Means

It means: the five original critical blockers are resolved and the backend is structurally correct. It does NOT mean all security issues are closed. Session token hashing is a genuine open HIGH security item. The product can begin construction in parallel with fixing it, but the token hashing fix must land before any real user data enters the system.

---

## SECTION 8 — THE UNIVERSAL OBJECT ARCHITECTURE — TRUTH

### The Core Design

One `Object` table. Every object type — Note, Task, Medicine, Grocery, Plant, Pet, Vehicle, Bill, Document, Habit, Event, Subscription, or any custom future type — is a row in this table with:

```
id            — UUID primary key
workspaceId   — tenant boundary
typeKey       — discriminator string ('NOTE', 'MEDICINE', etc.)
title         — always required, human-readable
attributes    — JSONB — all type-specific fields live here
status        — ACTIVE | ARCHIVED | DELETED
revision      — CAS counter
objectKey     — stable business key (workspace-unique)
schemaVersion — tracks which schema version the attributes conform to
```

### Proof That New Types Need No Database Work

To add `MEDICINE`:
1. Add `MEDICINE: 'MEDICINE'` to `ObjectTypeKey` enum in `@lumora/shared` — **1 line**
2. Add metadata entry to `BUILT_IN_CATALOG_DEFINITIONS` in `@lumora/shared` — **1 entry**
3. Define `SchemaDefinition` with typed fields (dosage, frequency, prescribedBy, etc.) — **1 new file in @lumora/shared**

Result: zero migrations, zero new tables, zero new repositories, zero new controllers, zero new use cases. The medicine's dosage and frequency live in `attributes` JSONB. The same `Object` table row. The same `PrismaObjectRepository`. The same `ObjectAggregate`.

This applies identically to: Grocery, Plant, Pet, Vehicle, Bill, Subscription, and any future type.

### The Nuance Prior Reports Got Slightly Wrong

The prior reports stated: "A new object type can never require a database table." This is too absolute.

The **correct rule** is: **A new object type does not automatically require a new persistence model.** If a future type has child records that need their own lifecycle (e.g., Pet Vaccinations, Vehicle Maintenance Records), those child records can legitimately have their own tables. The Pet object itself still lives in the `Object` table. Only genuinely independent child aggregates get new tables — and only when the product explicitly needs that.

### Object Lifecycle

```
ACTIVE
  → updateDetails()  →  ACTIVE (revision + 1)
  → archive()        →  ARCHIVED
  → softDelete()     →  DELETED

ARCHIVED
  → restore()        →  ACTIVE
  → softDelete()     →  DELETED

DELETED
  → (terminal — no transitions out)
```

**Anti-resurrection is enforced at four independent layers:**
1. `ObjectAggregate` has no `resurrect()` method
2. `ObjectAggregateRepositoryAdapter.findById()` filters `status != DELETED`
3. `ObjectsService.updateObject()` uses `updateMany WHERE status != DELETED`
4. `PrismaObjectRepository.update()` adds `WHERE status = 'ACTIVE'`

### CAS — Atomic Concurrency

```sql
UPDATE "Object"
SET attributes = $attrs, revision = $storedRevision + 1, ...
WHERE id = $id
  AND workspaceId = $workspaceId
  AND revision = $storedRevision
RETURNING *
```

If zero rows returned: throws `ObjectConcurrencyException` or `ObjectLifecycleConflictException` based on current state. Never select-then-compare-then-update — that is a race condition and is not used anywhere in the codebase.

---

## SECTION 9 — THE OUTBOX — TRUTH

### What the Outbox Is Supposed To Do

Every time an object is created, updated, or deleted, domain events (ObjectCreatedEvent, ObjectUpdatedEvent, ObjectDeletedEvent) should be staged in the `outbox_messages` table **in the same database transaction** as the object write. A background worker then dispatches those events to consumers (search indexer, timeline recorder, notification dispatcher) after the transaction commits.

This guarantees: if the object write succeeds, the event will eventually be dispatched — even if the server crashes between commit and dispatch.

### What Was Broken Before Foundation Hardening

`PrismaOutboxRepository` targeted the `Event` table (legacy) instead of the `OutboxMessage` table. All retry, idempotency, workspace attribution, and lock ownership fields were silently discarded. The `OutboxWorker` was never started — no NestJS module called `.start()`.

### What Is Working Now (After Foundation Hardening)

```
Object mutation
    ↓
prisma.$transaction()
    ├── Object write (Object table)
    ├── [Timeline write — future, not yet atomic]
    └── OutboxMessage staging (outbox_messages table)
          idempotencyKey = eventId  ← deduplication
          workspaceId, aggregateId  ← correctly stored
          payloadSchemaVersion      ← correctly stored
          retryCount, maxRetries    ← correctly stored
          nextAttemptAt             ← backoff scheduling
         ↓ COMMIT
OutboxWorker (polls every 2 seconds)
    → releaseStaleLocks(30_000ms)  ← time-bounded
    → fetchPendingBatch(50)        ← FOR UPDATE SKIP LOCKED
    → dispatchMessage(event)
         → IDomainEventPublisher.publish()
              → NestEventPublisher.publish()
                   → logger.log()  ← ONLY LOGS — no real consumers
    → markAsCompleted()
```

### What Is Still Missing

`NestEventPublisher` only logs. No handler is registered with `CapabilityExecutor`. Therefore:

- Object created → OutboxMessage ✅ → Worker dispatches ✅ → **Logger only** ❌
- Timeline never auto-populates ❌
- SearchIndex never auto-updates ❌
- Reminders never notify ❌

**This is the most important remaining gap for the product experience.** Without this, the product UI can call APIs directly — but the platform's event-driven architecture produces no side effects.

### Fix Required

Create `OutboxEventHandlerService`:
```typescript
// Register at boot — in OutboxModule or KernelModule
capabilityExecutor.registerHandler('lumora.capability.timeline', async (event) => {
  await recordTimelineActivityUseCase.execute({ dto: { ...from event... } });
});
capabilityExecutor.registerHandler('lumora.capability.search', async (event) => {
  if (event.eventName === 'object.created' || 'object.updated') {
    await indexEntityUseCase.execute({ dto: { ...from event... } });
  }
  if (event.eventName === 'object.deleted') {
    await removeSearchIndexUseCase.execute({ ...from event... });
  }
});
```

---

## SECTION 10 — SEARCH — TRUTH

### Current State

| Item | Status |
|---|---|
| `SearchIndex.workspaceId` column | ✅ Added in Foundation Hardening migration |
| Workspace isolation in queries | ✅ All methods require `workspaceId` param after Foundation Hardening |
| Route moved to `/workspaces/:id/search` | ✅ Fixed |
| ILIKE text search | ✅ Works — `WHERE title ILIKE '%term%' OR content ILIKE '%term%'` |
| Manual indexing via `POST /workspaces/:id/search/index` | ✅ Works |
| Auto-indexing from object creation | ❌ Missing — Outbox handler not registered |
| Full-text search (tsvector / pg_trgm) | ❌ Not implemented — ILIKE only |
| Pagination on search results | ❌ Missing — default limit 20, no cursor |

### Truth About Search Readiness

Search is **architecturally correct** and **workspace-secure**. But it is only useful as a product feature once auto-indexing is wired. Without the Outbox search handler, the `SearchIndex` table is empty unless manually populated via the API. This means a user creating objects in the app will not find them via search until someone explicitly calls `POST /search/index` — which no product flow does automatically.

**Classification: Backend Foundation PARTIAL. Auto-population NOT READY. Product NOT READY.**

### The "Zero Migration" Claim for Search

Search is a derived projection. It has no owner of record. Objects are the source of truth. If `SearchIndex` is destroyed and rebuilt, no user data is lost — it is reconstructed from the Object table. This is correct architecture. The migration that deleted orphaned `SearchIndex` rows was therefore safe and correct.

### What ILIKE Means in Practice

ILIKE performs a full sequential scan on `title` and `content` columns. At small data sets (< 10,000 rows per workspace), this is acceptable. At production scale it degrades. `pg_trgm` trigram indexes or `tsvector` full-text indexes are the correct fix. This is intentionally deferred until measured load requires it.

---

## SECTION 11 — TIMELINE — TRUTH

### Current State

| Item | Status |
|---|---|
| `Timeline` table schema with `workspaceId`, `userId`, `action`, `metadata` | ✅ Correct |
| `GET /workspaces/:id/timeline` — workspace-scoped | ✅ Works |
| `POST /workspaces/:id/timeline` — workspace-membership-checked | ✅ Fixed in Foundation Hardening |
| `TimelineRecordResponseDto` | ✅ Exists |
| Immutable append-only persistence | ✅ Correct — `prisma.timeline.create()` only, no upsert |
| Auto-population from domain events | ❌ Missing — Outbox TIMELINE handler not registered |
| `entityId` filter (get timeline for one object) | ❌ Missing — no filter param on GET endpoint |
| Cursor pagination | ❌ Missing — only `limit` parameter |

### Honest Classification

```
Timeline Persistence:      READY
Timeline API:              PARTIAL (missing entityId filter, missing pagination)
Timeline Auto-Population:  NOT READY (Outbox handler missing)
Timeline Mobile UI:        NOT READY (stub screen only)
Timeline Product Feature:  NOT READY
```

### Why Auto-Population Is Critical for the Product

The Blueprint describes Timeline as a living record of what the user did and when. "I took my medicine." "I watered the plant." "I completed that task." These records should appear automatically when the user performs actions — not only when the app manually calls `POST /timeline`. Without the Outbox handler, the Timeline is a manually-written log, not an automatic life history.

Timeline auto-population must be wired **before** the Timeline screen is built in mobile. Otherwise the screen will appear empty to users who create objects normally.

---

## SECTION 12 — CAPABILITY SYSTEM — TRUTH

### What Exists

| Component | Status |
|---|---|
| `CapabilityRegistry` — in-memory map | ✅ Implemented + populated at boot |
| `CapabilityExecutor` — 6-phase pipeline | ✅ Implemented |
| `UniversalCapabilityEngine` — registration + circular dep detection | ✅ Implemented |
| `LumoraObjectRuntime` — schema-validated mutation entry point | ✅ Implemented, **NOT wired in production** |
| 5 built-in capabilities registered at boot | ✅ reminder, timeline, media, search, favorite |
| `CapabilityExecutor.registerHandler()` called in production | ❌ Never called |
| `LumoraObjectRuntime` instantiated in any use case | ❌ Never |
| `BehaviorExtensionKey` → `CapabilityKey` mapping | ❌ Not codified |

### The Six Executor Phases

Every mutation through `LumoraObjectRuntime` goes through:
```
beforeValidation → beforeExecution → beforeCommit
→ ACTION (actual domain mutation)
→ afterCommit → afterExecution
```

PARALLEL capabilities run via `Promise.allSettled`. SEQUENTIAL in `executionOrder` order. Retry logic with exponential backoff is wired. All of this works — with zero handlers registered, it runs silently and completes immediately.

### What This Means in Practice

The capability infrastructure is production-quality and ready to be used. What is missing is: (1) registering handlers that do real work, (2) wiring `LumoraObjectRuntime` into use cases so mutations go through the pipeline, and (3) codifying which capabilities apply to which object types via the `BehaviorExtensionKey` → `CapabilityKey` mapping.

These are the three remaining items to activate the capability system fully. They are Stage 4 work — planned before product screens are built.

---

## SECTION 13 — MOBILE APPLICATION — TRUTH

### What Exists

```
apps/mobile/
├── app/
│   ├── _layout.tsx              ← Root stack — LumoraThemeProvider + ViewportProvider ✅
│   ├── (tabs)/
│   │   ├── _layout.tsx          ← 2-tab navigator ✅
│   │   ├── index.tsx            ← Home TAB — stub (welcome text only) ❌
│   │   └── two.tsx              ← Timeline TAB — stub + wrong name ❌
│   ├── design-system.tsx        ← Dev playground for components ✅
│   └── +not-found.tsx           ← 404 screen ✅
├── components/ui/               ← EMPTY ❌
├── store/                       ← EMPTY ❌
├── constants/                   ← EMPTY ❌
└── types/                       ← EMPTY ❌
```

### What Does Not Exist

- No HTTP client (no axios, no fetch wrapper)
- No TanStack Query provider or any query hooks
- No Zustand store of any kind
- No SecureStore integration for token storage
- No login screen
- No register screen
- No Home screen with real data
- No Quick Add flow
- No Object Detail screen
- No Search screen
- No Timeline screen with real data
- No auth guard on navigation
- No error handling for any API response
- No loading states for any screen
- No empty states for any screen

### What Is Correctly Wired

- `LumoraThemeProvider` is wrapped at root level correctly
- `ViewportProvider` is wrapped at root level correctly
- `useTheme()` is called in `_layout.tsx` for React Navigation theme sync
- `packages/ui` and `packages/theme` are installed and available
- `DynamicObjectDetail` component exists and is functional — just has no data source
- All UI primitives (Button, Card, Input, Icon, Typography, Stack, Modal) work

### The Strategic Truth

The backend architecture is months ahead of the mobile application. The mobile app is at Day 0 of product construction. All the engineering work that was done is correct and will be useful — but none of it is visible to a user yet because the mobile layer does not exist.

**The single biggest risk to Lumora's product delivery is not architecture. It is that the mobile client has not been started.**

---

## SECTION 14 — UI ARCHITECTURE — TRUTH

### Design Token Architecture (`packages/theme`)

Four complete color palettes: Light, Dark, Amoled, High Contrast — all generated into typed token files. Semantic color groups: primary, secondary, surface, background, text, border, status, elevation, overlay, feedback.

Spacing: xs, sm, md, lg, xl, 2xl, 3xl — consistent scale.  
Radii: sm, md, lg, xl, full.  
Typography: Heading 1–4, Body large/medium/small, Caption, Label, Overline.

**Key rule enforced:** Zero hardcoded color values in any component. All visual values come from `useTheme()`. A complete palette redesign requires changing one token file.

### Component Library (`packages/ui`)

**Primitives (all functional):**
Button, IconButton, Icon (abstracted via `Icon.registry.ts`), Typography, Card, Input, Stack/HStack/VStack, Badge, Modal, Dialog, Overlay, Select, Feedback

**Composite (functional):**
- `FieldRegistry` — maps `FieldType` enum → React Native input components (String, Number, Boolean, Enum adapters)
- `BlockRegistry` — maps block type → display components (Header, Properties adapters)
- `DynamicObjectDetail` — full schema-driven object detail with edit mode, confirmation dialogs, action bar

### Icon Abstraction

`Icon.registry.ts` maps semantic names (`nav.home`, `action.add`, `object.task`, `object.medicine`) to library glyphs. Swapping the entire icon library (e.g., Feather → Phosphor) requires updating this registry file only — zero component changes.

### Motion System (`packages/theme/src/motion-engine`)

Named configs: press, fadeIn, cardLift, sheet, dialog, listItem, tabSwitch, skeleton. Physics-based spring configs (mass, damping, stiffness). `useReducedMotion()` wired to `AccessibilityInfo.isReduceMotionEnabled`.

**Gap:** No `HapticEngine` abstraction exists. Haptics must be called directly via `expo-haptics`. This means haptics cannot be centrally disabled and have no semantic naming.

### What the UI Is Missing for Product Construction

- `ObjectCard` component — needed for Home, Search, Collections
- `LoadingState` / `EmptyState` / `ErrorState` / `OfflineBanner` — needed for every screen
- `HapticEngine` abstraction — needed for consistent haptic feedback
- `QuickAddSheet` component — needed for Quick Add flow
- `ConflictDialog` — needed when 409 REVISION_CONFLICT returned

---

## SECTION 15 — THE UI / DATA INDEPENDENCE PRINCIPLE — PROOF

This is the most important architectural principle in the entire Lumora system. It states: **the UI must be able to change completely without requiring database migrations.**

### Complete Proof — Every Visual Change Is UI-Only

| Change | Database Migration Required | Why |
|---|---|---|
| Change entire color palette | **NO** | Token files in `packages/theme` only |
| Swap Feather icons for Phosphor | **NO** | `Icon.registry.ts` mapping only |
| Change font from Inter to Satoshi | **NO** | Typography token file only |
| Change button shape (square to pill) | **NO** | `packages/ui` Button component only |
| Add glassmorphism card style | **NO** | `packages/ui` Card variant only |
| Change spacing scale (8pt to 4pt grid) | **NO** | Spacing token file only |
| Change animation physics (spring stiffness) | **NO** | `MotionEngine` config only |
| Change Home from list to grid layout | **NO** | Screen component only |
| Change from bottom tabs to sidebar navigation | **NO** | Expo Router layout only |
| Completely redesign Object Detail layout | **NO** | `DynamicObjectDetail` component only |
| Add 3D card flip animation | **NO** | `MotionEngine` + component only |
| Replace flat illustrations with 3D renders | **NO** | Asset swap only |
| Add tablet master-detail split layout | **NO** | `useViewport()` in screen component only |
| Implement web layout with sidebar | **NO** | Expo Router web target only |
| Change Quick Add from sheet to full-screen modal | **NO** | Navigation config only |
| Add haptics on every interaction | **NO** | `HapticEngine` calls only |
| Remove all animations | **NO** | `MotionEngine` durations → 0 only |
| Add dark mode | **NO** | `ThemeProvider` + `UserSettings.theme` (existing column) |

### The Only Changes That Legitimately Require a Migration

These are domain data changes — not presentation changes:

| Change | Why Migration Needed |
|---|---|
| New `ObjectStatus` enum value | PostgreSQL enum requires `ALTER TYPE ... ADD VALUE` |
| New column on existing table | `ALTER TABLE ... ADD COLUMN` |
| Relationship domain entity | New `Relationship` table |
| Gamification milestone entity | New `Milestone` table |
| Per-workspace custom theme stored per workspace | New `WorkspaceSettings` field |
| Full-text search index (pg_trgm) | `CREATE INDEX USING GIN` |

### The Nuance

Prior reports stated "new object type = zero database change" without qualification. The correct rule is: **A new object type does not automatically require a new persistence model.** If the type's data fits in `attributes` JSONB (which it does for all 13 planned types), no migration is needed. If a future type needs genuine child records with their own lifecycle, those child records may eventually warrant their own table — but only when explicitly required by the product.

---

## SECTION 16 — PRODUCT READINESS MATRIX — FULL TRUTH

This matrix uses five columns. A feature is ready only when all five are green.

| Feature | Backend | Application | Mobile Data | UI | E2E | Status |
|---|---|---|---|---|---|---|
| Auth (register/login/logout) | ✅ | ✅ | ❌ | ❌ | ❌ | **Foundation Only** |
| Home | ✅ | ✅ | ❌ | ❌ | ❌ | **Not Started** |
| Quick Add | ✅ | ✅ | ❌ | ❌ | ❌ | **Not Started** |
| Universal Create | ✅ | ✅ | ❌ | ⚠️ primitives | ❌ | **Not Started** |
| Object Detail | ✅ | ✅ | ❌ | ⚠️ component | ❌ | **Not Started** |
| Timeline | ⚠️ | ⚠️ | ❌ | ❌ | ❌ | **Partial Backend** |
| Search | ⚠️ | ⚠️ | ❌ | ❌ | ❌ | **Partial Backend** |
| Spaces | ✅ | ✅ | ❌ | ❌ | ❌ | **Foundation Only** |
| Collections | ✅ | ⚠️ | ❌ | ❌ | ❌ | **Foundation Only** |
| Relationships | ❌ | ❌ | ❌ | ❌ | ❌ | **Future** |
| Reminders | ✅ | ✅ | ❌ | ❌ | ❌ | **Foundation Only** |
| Attachments | ✅ | ✅ | ❌ | ❌ | ❌ | **Foundation Only** |
| Personalization (theme) | ✅ | ✅ | ❌ | ⚠️ wired | ❌ | **Partial** |
| Gamification | ❌ | ❌ | ❌ | ❌ | ❌ | **Future** |
| Offline/Sync | ❌ | ❌ | ❌ | ❌ | ❌ | **Deferred** |
| New object types | ⚠️ catalog | ⚠️ catalog | ❌ | ❌ | ❌ | **Not Registered** |

**Key:**
- ⚠️ Timeline/Search backend = API exists but auto-population not wired
- ⚠️ Collections application = smart query evaluator missing
- ⚠️ Object Detail UI = `DynamicObjectDetail` exists but has no data source
- ⚠️ Personalization UI = `ThemeProvider` wired but stored preference not fetched
- ⚠️ New object types catalog = requires `ObjectTypeKey` + `BUILT_IN_CATALOG_DEFINITIONS` entries, no DB needed

---

## SECTION 17 — ARCHITECTURE CONTRACTS — INVIOLABLE LAWS

These ten contracts must never be violated. Any change to them requires explicit senior architectural review with written justification before a single line of code is changed.

**Contract 1 — `IObjectRepository` method signatures are frozen.**
Location: `packages/shared/src/core/object/repository/object-repository.interface.ts`
Never add `transactionContext`, `workspaceId`, or `userId` as method parameters. Workspace isolation is enforced by `WorkspaceExecutionContext` at construction, not at call time.

**Contract 2 — `UniversalObject` shape is frozen.**
Location: `packages/shared/src/core/object/types/universal-object.types.ts`
Never add `workspaceId`, `createdById`, `objectKey`, or `title` to this type. It is the platform persistence DTO — intentionally minimal and workspace-agnostic. Enriched domain concerns live in `ObjectAggregate`.

**Contract 3 — CAS must remain atomic.**
Location: `PrismaObjectRepository.update()`, `ObjectAggregateRepositoryAdapter.updateAggregate()`
The `UPDATE ... WHERE revision = $n RETURNING *` pattern must never be replaced with SELECT-then-UPDATE. That is a race condition.

**Contract 4 — `WorkspaceExecutionContext` must be injected at construction.**
Never pass workspace ID as a method parameter to repositories. It must be set once at construction and be immutable for the lifetime of the request.

**Contract 5 — Anti-resurrection is permanent.**
`DELETED` status is terminal. No code path may transition a `DELETED` object back to `ACTIVE` or `ARCHIVED` through ordinary API calls.

**Contract 6 — Outbox must be in the same transaction as the object write.**
Object mutation + Outbox staging must share one `$transaction`. External dispatch only happens after commit.

**Contract 7 — SearchIndex is a derived projection only.**
SearchIndex is never the source of truth. Object persistence must never fail because SearchIndex is unavailable. Search can be rebuilt from the Object table at any time.

**Contract 8 — Storage providers are abstracted.**
No domain or application code may import S3, Cloudinary, R2, GCS, or any specific storage provider directly. All storage access goes through `IStorageProvider`.

**Contract 9 — All visual values come from design tokens.**
No component in `packages/ui` may hardcode a color hex, a pixel spacing value, or a border radius. All values come from `useTheme()`.

**Contract 10 — `packages/ui` has zero backend dependency.**
No file in `packages/ui` or `packages/theme` may import from `apps/backend`, `generated/prisma`, or any backend module.

---

## SECTION 18 — WHAT CAN SAFELY EVOLVE WITHOUT REVIEW

Every item in this list can be changed by any engineer at any time without architectural review, domain review, or database migration.

**Complete visual identity:** Color palette, font, icon library, icon weights, button shape, card style, border radius, shadow system, gradient system, glassmorphism effects, illustrations, 3D visuals, lottie animations.

**Complete motion system:** Spring physics, easing curves, animation durations, stagger delays, transition styles. Setting all durations to 0 for a "minimal" design mode. Adding new animation configs to `MotionEngine`.

**Haptics:** Adding haptic feedback to any interaction, changing haptic intensity, removing haptics globally.

**Screen layouts:** Home layout (list, grid, masonry, widgets), Quick Add (sheet, full-screen, floating), Object Detail (top-down, side-by-side, tabbed), Timeline (list, calendar, track, graph), Search (instant, grouped, filtered). Any layout for any screen.

**Navigation structure:** Tab count, tab order, drawer vs tab navigation, stack navigation patterns, deep link routes, modal patterns, shared element transitions.

**Responsive behavior:** Phone, tablet, and desktop layout variations. Adding new breakpoints. Master-detail splits on tablet. Sidebar navigation on web.

**Component library:** Every component in `packages/ui` can be redesigned, rewritten, or replaced. New components can be added. Existing components can be deprecated.

**All of the above:** Zero backend changes. Zero domain changes. Zero database migrations.

---

## SECTION 19 — WHAT REQUIRES ARCHITECTURAL REVIEW BEFORE CHANGES

These changes require a written architectural design and senior review before any code is written.

- `IObjectRepository` method signature change
- `UniversalObject` type shape change
- New `ObjectStatus` lifecycle state
- `CapabilityDescriptor` interface change
- `CapabilityExecutor` pipeline phase change
- Authorization model change
- Workspace isolation mechanism change
- Outbox pattern change (e.g. replacing PostgreSQL outbox with Kafka)
- CAS mechanism change
- Relationship domain model design
- Sync/offline architecture introduction
- Adding a fourth repository tier
- Search engine replacement (Meilisearch, Elasticsearch)
- Multi-tenancy model change (sub-workspaces, organization hierarchy)
- Database sharding or multi-region architecture

---

## SECTION 20 — WHAT REQUIRES DATABASE MIGRATION

Changes that genuinely require a Prisma migration because they introduce real domain data:

| Change | Migration Type |
|---|---|
| New `ObjectStatus` enum value | `ALTER TYPE "ObjectStatus" ADD VALUE` |
| New column on existing table | `ALTER TABLE ... ADD COLUMN` |
| New relationship entity | `CREATE TABLE "Relationship"` |
| Gamification milestone entity | `CREATE TABLE "Milestone"` |
| Per-workspace custom theme stored in DB | `ALTER TABLE "WorkspaceSettings" ADD COLUMN` |
| Full-text search index (pg_trgm) | `CREATE EXTENSION; CREATE INDEX USING GIN` |
| Attachment-to-object formal FK | `ALTER TABLE "FileAsset" ADD COLUMN "objectId"` |
| Smart collection query rules persisted | `ALTER TABLE "Collection" ADD COLUMN "queryRules" JSONB` |
| Session token hashing (accessToken hash) | Column type remains TEXT — but semantics change |
| Push notification device tokens | New column on `Device` table or new table |

**Do NOT require migration despite being significant features:**
Adding Medicine/Grocery/Plant/Pet/Vehicle/Bill/Subscription types, adding new field types to FieldRegistry, registering new capabilities, any visual redesign, any navigation change, any animation change, any screen layout change.

---

## SECTION 21 — WHAT MUST REMAIN UI-ONLY

These 35 specific upcoming product construction tasks must stay completely within the UI layer. Any developer or agent implementing these must not touch the backend, domain, or database.

| Task | Why UI-Only |
|---|---|
| Build Home screen | `GET /workspaces/:id/objects` already exists |
| Build Quick Add sheet | `POST /workspaces/:id/objects` already exists |
| Build Object Detail screen | `DynamicObjectDetail` + GET/PATCH API already exist |
| Build Search screen | `GET /workspaces/:id/search` already workspace-scoped |
| Build Timeline screen | `GET /workspaces/:id/timeline` already exists |
| Add `ObjectCard` component | Pure UI |
| Add `EmptyState`, `LoadingState`, `ErrorState` | Pure UI |
| Add `QuickAddSheet` component | Calls existing API |
| Add `HapticEngine` abstraction | `packages/theme` extension only |
| Change button shape/style | `packages/ui` component |
| Change card design | `packages/ui` component |
| Swap icon library | `Icon.registry.ts` only |
| Change font | Typography token file only |
| Add dark mode toggle | Fetches/writes existing `UserSettings.theme` |
| Add onboarding screens | New Expo Router files only |
| Add 5th tab to navigation | Expo Router layout only |
| Change tab order | `(tabs)/_layout.tsx` only |
| Add floating action button | Screen component only |
| Add swipe-to-delete | Gesture handler + existing DELETE API |
| Add long-press context menu | Gesture handler + UI component |
| Add pull-to-refresh | `RefreshControl` + existing query refetch |
| Add tablet master-detail layout | `useViewport()` in screen component |
| Add web layout with sidebar | Expo Router web target |
| Change animation physics | `MotionEngine` config |
| Add page transition animations | `MotionEngine` + screen component |
| Implement offline banner | React Native NetInfo hook + UI |
| Add lottie animations | Asset + component |
| Replace all illustrations with 3D renders | Asset swap |
| Add haptics on every interaction | `HapticEngine` calls |
| Change Home from list to grid | Screen component layout |
| Wire stored theme preference | Fetch `GET /settings/me` — no backend schema change |
| Rename `two.tsx` to `timeline.tsx` | File rename only |
| Add auth guard to tab navigation | Expo Router `Redirect` component |
| Add `ConflictDialog` for 409 responses | UI component + TanStack Query error handler |

---

## SECTION 22 — OPEN ISSUES — PRIORITY-ORDERED TRUTH

### P0 — Must resolve before any real user data enters the system

| ID | Issue | File | Fix |
|---|---|---|---|
| P0-001 | Session tokens stored plaintext | `session.repository.ts` | SHA-256 hash before storage and comparison |
| P0-002 | No mobile API client | `apps/mobile/` (missing) | Install axios + TanStack Query + Zustand + SecureStore |
| P0-003 | Outbox event handlers not registered | `nest-event-publisher.ts` | Create `OutboxEventHandlerService`, register TIMELINE + SEARCH handlers |
| P0-004 | No auth screens in mobile | `apps/mobile/app/(auth)/` (missing) | Build login + register screens |

### P1 — Resolve during first product sprint

| ID | Issue | File | Fix |
|---|---|---|---|
| P1-001 | No cursor pagination on object list | `objects.service.ts` | Add `first`/`after` params, wire cursor logic |
| P1-002 | `prisma.client` getter recreates client every call | `prisma.service.ts` | Memoize `$extends(softDeleteExtension)` — one-line fix |
| P1-003 | Collections/Spaces/Reminders/Workspaces return Prisma types | Multiple service files | Create stable response DTOs |
| P1-004 | No `entityId` filter on timeline API | `timeline.controller.ts` | Add `entityId` query param |
| P1-005 | No `.env.example` | `apps/backend/` | Create with all required keys + placeholder values |
| P1-006 | `PermissionsGuard` `params.id` fallback | `permissions.guard.ts` | Remove fallback — use `params.workspaceId` only |
| P1-007 | `two.tsx` wrong filename | `apps/mobile/app/(tabs)/` | Rename to `timeline.tsx` |

### P2 — Normal product construction items

| ID | Issue | Action |
|---|---|---|
| P2-001 | `BehaviorExtensionKey` → `CapabilityKey` mapping not codified | Codify in catalog |
| P2-002 | `LumoraObjectRuntime` not wired in any production use case | Wire in object mutation path |
| P2-003 | `CatalogService`, `SearchService`, `TimelineService`, `MediaService` have empty bodies | Implement or remove |
| P2-004 | `infrastructure/auth/` empty directory | Delete |
| P2-005 | `CURRENT_ARCHITECTURE.md` describes Phase D state | Rewrite to reflect Foundation Hardening |
| P2-006 | ADR-016 not marked IMPLEMENTED | Update status + add commit reference |
| P2-007 | `TECH_DEBT.md` has resolved items still marked open | Update — mark TD-001 through TD-009 resolved |
| P2-008 | No E2E tests (register → login → token → protected endpoint) | Build auth flow E2E test |
| P2-009 | `EventPersistenceModel` interface dead code | Remove from `prisma-outbox.repository.ts` |

---

## SECTION 23 — TECHNICAL DEBT REGISTER — CURRENT TRUTH

All prior pasted TD lists are superseded by this register.

| ID | Description | Priority | Status |
|---|---|---|---|
| TD-001 | Object creation broken (Tier 3 DI defect) | was CRITICAL | ✅ RESOLVED — Foundation Hardening |
| TD-002 | Outbox uses Event table | was CRITICAL | ✅ RESOLVED — Foundation Hardening |
| TD-003 | ILIKE search — no tsvector/trigram | LOW | OPEN — intentionally deferred |
| TD-004 | Tier 3 ObjectRepository consumers | was HIGH | ✅ RESOLVED — Foundation Hardening |
| TD-005 | SearchIndex has no workspaceId | was HIGH | ✅ RESOLVED — Foundation Hardening |
| TD-006 | Rate limiting not on auth endpoints | was HIGH | ✅ RESOLVED — Foundation Hardening |
| TD-007 | Auth DTO exposes Prisma User | was MEDIUM | ✅ RESOLVED — Foundation Hardening |
| TD-008 | PlatformKernel is a logging shell | was HIGH | ✅ RESOLVED — Foundation Hardening |
| TD-009 | OutboxWorker never started | was CRITICAL | ✅ RESOLVED — Foundation Hardening |
| TD-010 | Session tokens stored plaintext | HIGH | **OPEN** |
| TD-011 | `prisma.client` getter recreates extended client | MEDIUM-PERF | **OPEN** |
| TD-012 | No cursor pagination on object list controller | HIGH | **OPEN** |
| TD-013 | Collections/Spaces/Reminders return Prisma types | MEDIUM | **OPEN** |
| TD-014 | Outbox event handlers not registered | HIGH | **OPEN** |
| TD-015 | `LumoraObjectRuntime` not wired in production | MEDIUM | **OPEN** |
| TD-016 | `BehaviorExtensionKey` → `CapabilityKey` mapping | MEDIUM | **OPEN** |
| TD-017 | No mobile API client | CRITICAL-PRODUCT | **OPEN** |
| TD-018 | Timeline workspaceId/userId columns | was MEDIUM | ✅ RESOLVED — Phase E |
| TD-019 | No `.env.example` | LOW | **OPEN** |
| TD-020 | PlatformKernel not booting registries | was HIGH | ✅ RESOLVED — Foundation Hardening |
| TD-021 | `EventPersistenceModel` dead code | LOW | **OPEN** |
| TD-022 | Empty service bodies (CatalogService etc.) | LOW | **OPEN** |
| TD-023 | `infrastructure/auth/` empty directory | LOW | **OPEN** |
| TD-024 | No E2E auth flow test | MEDIUM | **OPEN** |
| TD-025 | No timeline `entityId` filter | MEDIUM | **OPEN** |
| TD-026 | `CURRENT_ARCHITECTURE.md` stale | MEDIUM | **OPEN** |
| TD-027 | ADR-016 not marked IMPLEMENTED | LOW | **OPEN** |

---

## SECTION 24 — CORRECT PHASE SEQUENCE GOING FORWARD

Using the descriptive naming system from Section 3:

### Foundation Repair — Remaining (current sprint, parallel with UI Foundation)

```
P0-001: Hash session tokens
P0-003: Register Outbox event handlers (TIMELINE + SEARCH)
P1-001: Add cursor pagination to object list
P1-002: Memoize prisma.client getter
P1-005: Create .env.example
P1-006: Remove PermissionsGuard params.id fallback
P2-005: Update CURRENT_ARCHITECTURE.md
P2-006: Mark ADR-016 IMPLEMENTED
P2-007: Update TECH_DEBT.md
```

### Auth + Mobile Data Foundation (start immediately, blocks all product screens)

```
Install: axios, @tanstack/react-query, zustand, expo-secure-store
Create: apps/mobile/lib/api/client.ts
Create: apps/mobile/lib/api/queryClient.ts
Create: apps/mobile/lib/store/auth.store.ts
Create: apps/mobile/lib/store/preferences.store.ts
Update: apps/mobile/app/_layout.tsx — wrap with QueryClientProvider
Create: apps/mobile/app/(auth)/_layout.tsx
Create: apps/mobile/app/(auth)/login.tsx
Create: apps/mobile/app/(auth)/register.tsx
```

### UI Foundation (after Auth + Mobile Data Foundation)

```
Create: packages/ui/src/components/object/ObjectCard.tsx
Create: packages/ui/src/components/feedback/LoadingState.tsx
Create: packages/ui/src/components/feedback/EmptyState.tsx
Create: packages/ui/src/components/feedback/ErrorState.tsx
Create: packages/ui/src/components/feedback/OfflineBanner.tsx
Create: packages/theme/src/haptic-engine/haptic-engine.ts
Rename: apps/mobile/app/(tabs)/two.tsx → timeline.tsx
```

### Then: Home → Quick Add → Object Detail → Search → Timeline → Reminders → Spaces/Collections → New Types → Accessibility → Responsive → E2E → Production

---

## SECTION 25 — THE NEXT 20 TASKS — ORDERED BY DEPENDENCY

These are the next 20 specific tasks in strict dependency order. Each depends on all previous ones completing.

| # | Task | Blocks |
|---|---|---|
| 1 | Hash session tokens in `SessionRepository` + `SessionService` | Public launch |
| 2 | Create `apps/backend/.env.example` | Onboarding |
| 3 | Register Outbox event handlers (TIMELINE + SEARCH) | Timeline screen, Search screen |
| 4 | Add `entityId` filter to timeline API | Object Detail timeline view |
| 5 | Add cursor pagination to `GET /workspaces/:id/objects` | Home screen at scale |
| 6 | Memoize `prisma.client` getter | Production performance |
| 7 | Install `axios`, `@tanstack/react-query`, `zustand`, `expo-secure-store` in mobile | All product screens |
| 8 | Create `apps/mobile/lib/api/client.ts` (axios + auth interceptor) | All API calls |
| 9 | Create `apps/mobile/lib/store/auth.store.ts` (Zustand: session + workspaceId) | All screens that need auth context |
| 10 | Update `apps/mobile/app/_layout.tsx` — `QueryClientProvider` + auth hydration | All screens |
| 11 | Create `apps/mobile/app/(auth)/login.tsx` | Users can log in |
| 12 | Create `apps/mobile/app/(auth)/register.tsx` | Users can register |
| 13 | Create `packages/ui/src/components/object/ObjectCard.tsx` | Home screen, Search screen |
| 14 | Create `LoadingState`, `EmptyState`, `ErrorState`, `OfflineBanner` in `packages/ui` | Every product screen |
| 15 | Create `apps/mobile/hooks/useWorkspaceObjects.ts` (TanStack Query) | Home screen |
| 16 | Build Home screen — real data, real ObjectCards, pinned + recent sections | First visible product |
| 17 | Create `apps/mobile/hooks/useCreateObject.ts` (useMutation) | Quick Add |
| 18 | Build `QuickAddSheet` component + wire to Home | First creation flow |
| 19 | Create `apps/mobile/hooks/useObject.ts` + `useUpdateObject.ts` | Object Detail |
| 20 | Build Object Detail screen — `DynamicObjectDetail` wired to API + `ConflictDialog` | First edit flow |

---

## SECTION 26 — DOCUMENTATION STRUCTURE — WHAT SHOULD EXIST

The current documentation is fragmented across multiple files, some duplicate, some contradictory. The correct structure:

```
docs/
├── LUMORA_TRUTH_REPORT.md          ← THIS FILE — single source of truth
├── CURRENT_ARCHITECTURE.md         ← NEEDS UPDATE to reflect Foundation Hardening
├── DEVELOPMENT_BOUNDARIES.md       ← ACCURATE — no changes needed
├── IMPLEMENTATION_GUIDELINES.md    ← ACCURATE — no changes needed
├── TECH_DEBT.md                    ← NEEDS UPDATE — mark resolved items
├── PRODUCT_ROADMAP.md              ← NEEDS UPDATE — align with Section 3 naming
└── architecture/
    ├── adr/
    │   ├── ADR-016-*.md            ← NEEDS UPDATE — mark IMPLEMENTED
    │   └── [other ADRs — accurate]
    └── reports/
        └── foundation-hardening-report.md   ← Phase F engineering report (archival)
```

**Files to DISCARD or ARCHIVE (do not use as instructions):**
- `Pasted text.txt`, `Pasted text (2).txt`, `Pasted text (3).txt` — all contain duplicate and partially contradictory Phase F material
- Any prior Kiro session report that uses letter-based phase naming
- Any document that calls Foundation Hardening "Phase F UI" or confuses the two phase systems

**Rule for AI agents:** When given this `LUMORA_TRUTH_REPORT.md`, treat it as the authoritative ground truth. Do not ask about Phase D, Phase E, Phase F, or Phase G by letter name — use descriptive phase names from Section 3 only.

---

## SECTION 27 — THINGS THAT WILL NOT BE DONE

These are explicitly off the table. Any AI agent or engineer proposing any of the following should be stopped immediately.

**Will NOT redesign the Universal Object architecture.** It is correct. Adding a new object type requires 3 files in `@lumora/shared`, not a new table, not a new repository, not a new controller.

**Will NOT create separate repositories per object type.** There is no `MedicineRepository`, `PlantRepository`, `GroceryRepository`. There is one `IObjectRepository` and one `ObjectAggregateRepositoryAdapter`. This is final.

**Will NOT introduce Kafka, RabbitMQ, or any message broker.** The PostgreSQL outbox pattern is sufficient. Introducing a message broker at this scale adds operational complexity with zero benefit.

**Will NOT introduce Elasticsearch, OpenSearch, or Meilisearch.** PostgreSQL ILIKE is sufficient for early product. `pg_trgm` is the next step when measured load requires it.

**Will NOT introduce Redis Cluster, Kubernetes, or distributed infrastructure.** Single-node is correct at current scale.

**Will NOT build separate mobile apps per object type.** One app. One visual language. One interaction model. This is the entire point of Lumora as a Personal Life OS.

**Will NOT build offline sync before the online product ships.** The architecture is compatible with offline when needed. It is not needed before launch.

**Will NOT implement gamification with XP, leaderboards, or variable reward schedules.** Progress and streaks should support reflection, not manufacture engagement.

**Will NOT redesign Phase D or Phase E.** The Universal Object architecture, CAS semantics, `WorkspaceExecutionContext`, and migration history are preserved exactly as built.

**Will NOT produce more architecture-only work until the P0 issues are resolved and the mobile data foundation exists.** The backend architecture is complete enough. The risk is now in the product layer, not the platform layer.

---

## SECTION 28 — FINAL HONEST VERDICT

### What Is True

The Lumora backend platform is architecturally strong, correctly designed, and production-oriented. The Universal Object model is correct. CAS concurrency is race-safe. Workspace isolation is enforced at every layer. The Outbox pattern is now wired and correct. The design token system is production-quality. The UI component library has the right foundations.

Five critical blockers from the original discovery audit are resolved. This is real. The backend can handle object creation, reads, updates, deletes, search, timeline, reminders, media, and authentication — all with proper workspace isolation, rate limiting, and error handling.

### What Is Also True

Session tokens are stored in plaintext. This is a real security gap that must be fixed before any real user data enters the system.

The mobile application has not been started in any meaningful sense. The `store/` directory is empty. There is no HTTP client. There is no auth flow. There are no product screens. The backend being ready does not mean the product is ready.

The Outbox event handlers are not registered. Object creation events are correctly staged and dispatched — but they arrive at a logger. Timeline and Search auto-population do not work.

### What Comes Next

Stop expanding backend architecture. The backend is ready. Every remaining backend item is a small, targeted fix — not a redesign.

Start mobile product construction immediately. The single most valuable thing that can be done right now is installing the API client and building the auth screens. Everything else flows from there.

Fix P0-001 (session token hashing) in parallel. It is a 0.5-day fix. It must not be skipped.

Wire the Outbox handlers before building Timeline and Search screens. Those screens will be empty without them.

### The Strategic Position

```
Architecture maturity:     ████████████░░  ~85% — very strong
Product construction:      ██░░░░░░░░░░░░  ~15% — barely started
Security:                  █████████░░░░░  ~70% — session tokens open
Test coverage:             ████████░░░░░░  ~60% — missing E2E + auth flow
Documentation:             ██████░░░░░░░░  ~45% — partially stale, needs update
```

**The architecture is now at the point where UI becomes the main risk.** Earlier, the question was "Can Lumora actually work?" That question is answered: yes. Now the question is "Can Lumora make all this architecture feel simple to a human?" That is where the next serious work must concentrate.

---

## APPENDIX A — REPOSITORY STRUCTURE (VERIFIED)

```
apps/backend/src/
├── domain/
│   ├── objects/           ← ObjectAggregate, IObjectAggregateRepository, value objects
│   ├── capabilities/      ← CapabilityRegistry, CapabilityExecutor, UniversalCapabilityEngine
│   ├── runtime/           ← LumoraObjectRuntime (implemented, not wired in production)
│   ├── catalog/           ← SchemaRegistryAggregate, ObjectDefinitionRegistryAggregate
│   ├── search/            ← SearchIndexEntity (workspaceId required after Foundation Hardening)
│   ├── media/             ← FileAssetAggregate (workspaceId added after Foundation Hardening)
│   ├── timeline/          ← TimelineRecordEntity (immutable)
│   └── common/            ← UnitOfWork, IOutboxRepository, OutboxMessage
├── infrastructure/
│   ├── prisma/
│   │   ├── prisma.service.ts                         ← NEEDS memoization fix
│   │   ├── prisma-unit-of-work.ts                    ← Correct
│   │   └── repositories/
│   │       ├── prisma-object.repository.ts           ← Tier 1 — UNCHANGED — IObjectRepository
│   │       ├── object-aggregate.repository.adapter.ts ← NEW — Tier 2 — IObjectAggregateRepository
│   │       ├── prisma-search.repository.ts           ← FIXED — workspace-scoped
│   │       ├── prisma-file-asset.repository.ts       ← FIXED — workspaceId in maps
│   │       └── prisma-timeline.repository.ts         ← Append-only
│   ├── events/outbox/
│   │   ├── prisma-outbox.repository.ts               ← REWRITTEN — targets OutboxMessage
│   │   ├── outbox.module.ts                          ← NEW — starts worker on init
│   │   └── nest-event-publisher.ts                   ← NEW — logs only — handlers needed
│   └── kernel/
│       ├── platform-kernel.service.ts                ← REWRITTEN — registers 5 capabilities
│       └── kernel.module.ts                          ← NEW
├── modules/
│   ├── objects/            ← FIXED — factory pattern, ObjectResponseDto, no Tier 3
│   ├── auth/               ← FIXED — rate limiting, UserPublicDto
│   ├── collections/        ← FIXED — verifyObjectInWorkspace, no Tier 3
│   ├── reminders/          ← FIXED — verifyObjectInWorkspace, no Tier 3
│   ├── search/             ← FIXED — workspace-scoped route + queries
│   ├── media/              ← FIXED — workspace-scoped route + use cases
│   ├── timeline/           ← FIXED — PermissionsGuard added
│   ├── spaces/             ← Functional, Prisma types still leaking through service
│   ├── common/             ← NEW — prisma-select.constants.ts
│   └── [others — functional, not modified in Foundation Hardening]
└── prisma/
    ├── schema.prisma       ← UPDATED — SearchIndex.workspaceId, FileAsset.workspaceId
    └── migrations/
        ├── 20260805110125_foundation_v1/
        ├── 20260808_phase_e_persistence_foundation/
        └── 20260809_phase_f_search_attachment_workspace_isolation/  ← NEW

apps/mobile/
├── app/
│   ├── _layout.tsx         ← ThemeProvider + ViewportProvider ✅
│   ├── (tabs)/
│   │   ├── index.tsx       ← Home STUB ❌
│   │   └── two.tsx         ← Timeline STUB, wrong name ❌
│   └── design-system.tsx   ← Dev playground
├── components/ui/          ← EMPTY ❌
├── store/                  ← EMPTY ❌
├── constants/              ← EMPTY ❌
└── types/                  ← EMPTY ❌

packages/
├── shared/                 ← IObjectRepository, UniversalObject, ObjectCatalogRegistry, CapabilityDescriptor, errors
├── theme/                  ← LightThemeColors, DarkThemeColors, AmoledThemeColors, HighContrastThemeColors, MotionEngine, ThemeProvider, ViewportProvider
└── ui/                     ← Button, Card, Input, Icon, Typography, Stack, Modal, DynamicObjectDetail, FieldRegistry, BlockRegistry
```

---

## APPENDIX B — CHANGE-IMPACT MATRIX

| Change | UI | App | Domain | DB | Migration | Arch Review |
|---|---|---|---|---|---|---|
| Color redesign | ✅ | — | — | — | — | — |
| Font change | ✅ | — | — | — | — | — |
| Icon library swap | ✅ | — | — | — | — | — |
| Button redesign | ✅ | — | — | — | — | — |
| Card redesign | ✅ | — | — | — | — | — |
| Animation change | ✅ | — | — | — | — | — |
| Home layout | ✅ | — | — | — | — | — |
| Navigation change | ✅ | — | — | — | — | — |
| Object Detail layout | ✅ | — | — | — | — | — |
| New object type (Medicine) | ✅ | ✅ | ✅ | — | — | — |
| New field on existing type | ✅ | ✅ | ✅ | — | — | — |
| New capability | — | ✅ | ✅ | ⚠️ | ⚠️ | ✅ |
| New relationship | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| New lifecycle state | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| New persisted preference | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| DB index add | — | — | — | ✅ | ✅ | — |
| Repository interface change | — | — | ✅ | — | — | ✅ |
| Search engine replacement | — | ✅ | — | — | — | ✅ |
| Storage provider replacement | — | ✅ | — | — | — | — |
| Auth model change | — | ✅ | ✅ | ✅ | ✅ | ✅ |

---

*End of LUMORA_TRUTH_REPORT.md — Version 1.0 — 2026-08-09*  
*This document supersedes all prior Kiro session outputs, all pasted text files, and all duplicate reports.*  
*Update this document when verified facts change. Never update it based on Kiro summaries alone — only verified source code.*


---

# LUMORA — SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

**Version:** 1.0  
**Date:** 2026-08-09  
**Appended to:** LUMORA_TRUTH_REPORT.md — nothing above this line was changed.  
**Purpose:** Complete functional, non-functional, flow, API, data model, object type, capability, navigation, state, error, environment, accessibility, and performance specification.

---

## SRS SECTION 1 — DOCUMENT SCOPE

This SRS defines every requirement for the Lumora platform. Any conflict between this SRS and any other document is resolved in favour of the actual repository source code. This SRS describes intended behaviour. The source code describes current behaviour. Gaps between the two are open issues tracked in the Technical Debt Register above.

**This SRS covers:**
- Functional requirements (what the system SHALL do)
- Non-functional requirements (performance, security, availability)
- Complete user flows (every journey from tap to database and back)
- Complete API contract (every endpoint, request, response, error)
- Data model specification (every table, column, constraint)
- All 13 planned object type field schemas
- Capability specifications
- Mobile navigation specification
- State management specification
- Error handling and mobile handling specification
- Environment variable specification
- Accessibility requirements
- Performance requirements

---

## SRS SECTION 2 — SYSTEM OVERVIEW

### 2.1 Product Identity

Lumora is a Personal Life Operating System. One environment. Every domain of life — health, finance, home, work, personal growth. One unified object model. One coherent visual language. One consistent interaction pattern.

### 2.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      MOBILE APPLICATION                         │
│               Expo React Native (iOS + Android + Web)           │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────────┐ │
│  │packages/theme│  │  packages/ui   │  │    apps/mobile       │ │
│  │Design tokens │  │Button,Card,    │  │ Screens, Navigation  │ │
│  │MotionEngine  │  │Icon,Input,     │  │ TanStack Query hooks │ │
│  │ThemeProvider │  │DynamicDetail,  │  │ Zustand auth store   │ │
│  │ViewportProv. │  │FieldRegistry,  │  │ SecureStore tokens   │ │
│  │              │  │BlockRegistry   │  │                      │ │
│  └──────────────┘  └────────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTPS REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND API                              │
│                  NestJS — Node.js — TypeScript                  │
│  ┌─────────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │modules/ (NestJS)│  │domain/ (Pure) │  │infrastructure/   │  │
│  │Controllers      │  │ObjectAggregate│  │PrismaService     │  │
│  │Use Cases        │  │Capabilities   │  │OutboxModule      │  │
│  │DTOs             │  │Runtime        │  │KernelModule      │  │
│  │DI wiring        │  │Catalog        │  │RedisModule       │  │
│  └─────────────────┘  └───────────────┘  └──────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │               packages/shared                              │ │
│  │  IObjectRepository, UniversalObject, ObjectCatalogRegistry │ │
│  │  CapabilityDescriptor, ErrorCode, PaginationParams, etc.   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│   PostgreSQL (Neon)     │     │           Redis             │
│ Object, User, Workspace │     │ Rate limiting store         │
│ Session, Space, Coll.   │     │ Schema/Definition cache     │
│ Reminder, Timeline      │     │ Object cache                │
│ SearchIndex, FileAsset  │     │ User/Workspace cache        │
│ OutboxMessage, AuditLog │     └─────────────────────────────┘
└─────────────────────────┘
```

### 2.3 Non-Negotiable Architectural Laws

**LAW-001:** UI SHALL change without database migrations for purely presentational changes.  
**LAW-002:** All object types use the same persistence — one Object table, one repository, one aggregate.  
**LAW-003:** Workspace isolation is enforced at infrastructure layer. User in Workspace A SHALL NEVER access data in Workspace B.  
**LAW-004:** CAS is atomic: UPDATE...WHERE revision=$n RETURNING *. SELECT-then-UPDATE is forbidden.  
**LAW-005:** OutboxMessage is committed in the same transaction as the object mutation it records.

---

## SRS SECTION 3 — FUNCTIONAL REQUIREMENTS

### 3.1 Authentication

**FR-AUTH-001:** System SHALL allow registration with email, username, password.  
**FR-AUTH-002:** System SHALL reject duplicate email → 409 EMAIL_ALREADY_REGISTERED.  
**FR-AUTH-003:** System SHALL reject duplicate username → 409 USERNAME_TAKEN.  
**FR-AUTH-004:** Passwords SHALL be hashed with bcrypt (min cost 12) before storage.  
**FR-AUTH-005:** Registration SHALL atomically create User + personal Workspace + WorkspaceMember + Session.  
**FR-AUTH-006:** Login SHALL issue JWT accessToken + refreshToken.  
**FR-AUTH-007:** RefreshTokens SHALL be stored as SHA-256 hashes — never plaintext. *(OPEN — not yet implemented)*  
**FR-AUTH-008:** Refresh token reuse SHALL revoke the session → 401 INVALID_REFRESH_TOKEN.  
**FR-AUTH-009:** Logout SHALL delete the session record.  
**FR-AUTH-010:** Password change SHALL require current password verification.  
**FR-AUTH-011:** OAuth (Google, Apple) SHALL be supported.  
**FR-AUTH-012:** Login: 20 attempts / 15 minutes per identifier.  
**FR-AUTH-013:** Register: 10 attempts / hour per IP.  
**FR-AUTH-014:** Refresh: 30 attempts / 15 minutes per identifier.  
**FR-AUTH-015:** OAuth: 10 attempts / 15 minutes per identifier.  
**FR-AUTH-016:** Change password: 5 attempts / hour per identifier.  
**FR-AUTH-017:** Auth responses SHALL return UserPublicDto — never Prisma User with passwordHash.

UserPublicDto fields: id, email, username, displayName, avatarUrl?, timezone, locale, emailVerified, onboardingDone, status, createdAt, updatedAt.

### 3.2 Workspace Management

**FR-WS-001:** Every user SHALL have a personal workspace created at registration.  
**FR-WS-002:** Users SHALL be able to create additional workspaces.  
**FR-WS-003:** Workspace owners SHALL be able to invite members by email.  
**FR-WS-004:** RBAC SHALL be enforced within each workspace (OWNER, ADMIN, MEMBER roles).  
**FR-WS-005:** Personal workspace deletion SHALL be forbidden → 422 PERSONAL_WORKSPACE_DELETION_FORBIDDEN.  
**FR-WS-006:** All workspace operations SHALL verify the requesting user is an ACTIVE workspace member.

### 3.3 Universal Object — Core

**FR-OBJ-001:** System SHALL allow creating a Universal Object of any registered typeKey.  
**FR-OBJ-002:** typeKey SHALL be validated against ObjectCatalogRegistry at creation time → 422 if invalid.  
**FR-OBJ-003:** Object title SHALL be 1–512 characters → 422 DOMAIN_VALIDATION_ERROR if violated.  
**FR-OBJ-004:** System SHALL generate a unique objectKey per workspace if not provided by caller.  
**FR-OBJ-005:** objectKey SHALL be unique per workspace at the database level (UNIQUE constraint).  
**FR-OBJ-006:** All object API responses SHALL return ObjectResponseDto — never raw Prisma Object model.  
**FR-OBJ-007:** System SHALL allow reading objects by UUID id or by objectKey.  
**FR-OBJ-008:** System SHALL allow listing workspace objects with filters: typeKey, spaceId, status, isFavorite, search string.  
**FR-OBJ-009:** Object listing SHALL support cursor-based pagination (first + after). *(OPEN — not yet in controller)*  
**FR-OBJ-010:** Object update SHALL enforce optimistic concurrency — caller provides revision, server returns 409 REVISION_CONFLICT if mismatch.  
**FR-OBJ-011:** System SHALL allow soft-deleting objects (status → DELETED, deletedAt set).  
**FR-OBJ-012:** Any mutation on a DELETED object SHALL be rejected.  
**FR-OBJ-013:** System SHALL allow archiving (ACTIVE → ARCHIVED).  
**FR-OBJ-014:** System SHALL allow restoring (ARCHIVED → ACTIVE).  
**FR-OBJ-015:** Type-specific fields SHALL be stored in attributes JSONB — not in separate tables.  
**FR-OBJ-016:** Attribute serialization SHALL reject BigInt, NaN, Infinity, functions → 422.  
**FR-OBJ-017:** Attribute serialization SHALL preserve 0, false, empty string, null.  
**FR-OBJ-018:** Object mutations SHALL emit domain events staged in OutboxMessage in the same transaction.

ObjectResponseDto fields: id, workspaceId, spaceId?, createdById, updatedById?, objectKey, typeKey, title, description?, icon?, emoji?, cover?, color?, pinnedAt?, isFavorite, status, attributes, revision, archivedAt?, createdAt, updatedAt.

### 3.4 Object Type Specifications — All 13 Types

Every type below uses the Universal Object architecture. Zero new tables required.

**NOTE**
```
Capabilities: MEDIA
attributes:
  content:  text       (optional)
  format:   enum       plain | markdown   default: plain
```

**TASK**
```
Capabilities: REMINDER, TIMELINE, MEDIA
attributes:
  dueDate:     date      (optional)
  priority:    enum      low | medium | high | urgent   default: medium
  isCompleted: boolean   default: false
  tags:        string[]  (optional)
  assigneeId:  string    (optional)
```

**REMINDER**
```
Capabilities: REMINDER
attributes:
  remindAt:        datetime  (required)
  timezone:        string    (required)
  recurrenceRule:  string    RFC 5545 RRULE (optional)
  notes:           text      (optional)
```

**EVENT**
```
Capabilities: REMINDER, TIMELINE, MEDIA
attributes:
  startDate:   datetime  (required)
  endDate:     datetime  (optional)
  location:    string    (optional)
  isAllDay:    boolean   default: false
  attendees:   string[]  (optional)
  notes:       text      (optional)
```

**DOCUMENT**
```
Capabilities: MEDIA
attributes:
  content:  text    (optional)
  format:   enum    plain | markdown | html   default: markdown
  version:  number  default: 1
```

**HABIT**
```
Capabilities: REMINDER, TIMELINE
attributes:
  frequency:    enum    daily | weekly | custom   (required)
  targetCount:  number  default: 1
  streakCount:  number  default: 0
  lastCompleted: date   (optional)
```

**MEDICINE**
```
Capabilities: REMINDER, TIMELINE
attributes:
  dosage:        string  (required) e.g. "500mg"
  frequency:     enum    once_daily | twice_daily | three_times_daily | as_needed | custom
  prescribedBy:  string  (optional)
  startDate:     date    (optional)
  endDate:       date    (optional)
  notes:         text    (optional)
```

**GROCERY**
```
Capabilities: none (lightweight by design)
attributes:
  quantity:    number  (optional)
  unit:        string  (optional) e.g. "kg", "litres", "pieces"
  category:    string  (optional) e.g. "produce", "dairy"
  storeName:   string  (optional)
  isPurchased: boolean default: false
```

**PLANT**
```
Capabilities: REMINDER, TIMELINE
attributes:
  species:           string  (optional)
  wateringFrequency: string  (optional) e.g. "every 3 days"
  lastWatered:       date    (optional)
  location:          string  (optional) e.g. "windowsill", "balcony"
  sunNeeds:          enum    full | partial | shade   (optional)
```

**PET**
```
Capabilities: REMINDER, TIMELINE, MEDIA
attributes:
  species:   string  (required) e.g. "dog", "cat"
  breed:     string  (optional)
  birthDate: date    (optional)
  vetName:   string  (optional)
  notes:     text    (optional)
```

**VEHICLE**
```
Capabilities: REMINDER, TIMELINE
attributes:
  make:          string  (required)
  model:         string  (required)
  year:          number  (optional)
  licensePlate:  string  (optional)
  lastService:   date    (optional)
  mileage:       number  (optional)
```

**BILL**
```
Capabilities: REMINDER, TIMELINE
attributes:
  amount:    number  (required)
  currency:  string  default: USD
  dueDate:   date    (required)
  payee:     string  (required)
  category:  string  (optional) e.g. "utilities", "rent"
  isPaid:    boolean default: false
```

**SUBSCRIPTION**
```
Capabilities: REMINDER, TIMELINE
attributes:
  service:         string  (required) e.g. "Netflix"
  amount:          number  (required)
  currency:        string  default: USD
  billingCycle:    enum    monthly | annual | weekly
  nextBillingDate: date    (required)
  cancelUrl:       string  (optional)
```

### 3.5 Quick Add

**FR-QA-001:** System SHALL allow creating any object with only typeKey + title — all other fields optional.  
**FR-QA-002:** Quick Add SHALL use POST /workspaces/:id/objects — no separate endpoint.  
**FR-QA-003:** Quick Add SHALL complete end-to-end in under 2 seconds on standard mobile connection.  
**FR-QA-004:** Mobile QuickAddSheet SHALL present 6 initial types as selectable tiles with icon + label.  
**FR-QA-005:** After creation, the object SHALL appear in Home list within 2 seconds.

### 3.6 Search

**FR-SEARCH-001:** System SHALL provide workspace-scoped text search.  
**FR-SEARCH-002:** Search SHALL NEVER return results from a workspace the user does not belong to.  
**FR-SEARCH-003:** SearchIndex SHALL be a derived projection — rebuildable from Object table at any time.  
**FR-SEARCH-004:** SearchIndex SHALL auto-populate via Outbox on object create/update/delete. *(OPEN)*  
**FR-SEARCH-005:** Search SHALL support category filter (OBJECT, SPACE, etc.).  
**FR-SEARCH-006:** SearchResultDto SHALL include: id, workspaceId, entityCategory, entityId, title, content, createdAt, updatedAt.

### 3.7 Timeline

**FR-TL-001:** Timeline SHALL be immutable append-only — no updates, no deletes on timeline records.  
**FR-TL-002:** Timeline writes SHALL require active workspace membership.  
**FR-TL-003:** Timeline SHALL auto-populate via Outbox on object mutations. *(OPEN)*  
**FR-TL-004:** Timeline SHALL support filter by workspaceId and userId.  
**FR-TL-005:** Timeline SHALL support filter by entityId. *(OPEN — not yet implemented)*  
**FR-TL-006:** TimelineRecordResponseDto: id, workspaceId, userId, entityCategory, entityId, action, metadata, startedAt.  
**FR-TL-007:** Timeline SHALL support cursor-based pagination. *(OPEN)*

### 3.8 Reminders

**FR-REM-001:** Reminders SHALL be linked to a Universal Object in the same workspace.  
**FR-REM-002:** remindAt SHALL be a valid ISO 8601 datetime.  
**FR-REM-003:** recurrenceRule SHALL be a valid RFC 5545 RRULE string if provided.  
**FR-REM-004:** Status transitions: ACTIVE → SNOOZED | COMPLETED | CANCELLED. COMPLETED and CANCELLED are terminal.

### 3.9 Spaces

**FR-SPACE-001:** Spaces SHALL support hierarchical parent/child structure (parentId).  
**FR-SPACE-002:** Space slug SHALL be unique per workspace.  
**FR-SPACE-003:** A space with active children or objects SHALL NOT be deleted.  
**FR-SPACE-004:** Status: ACTIVE → ARCHIVED → DELETED.

### 3.10 Collections

**FR-COL-001:** Static collections: manually curated object lists with display order.  
**FR-COL-002:** Dynamic collections: query-rule-based auto-populated lists. *(smart evaluator OPEN)*  
**FR-COL-003:** Adding an object to a collection SHALL verify the object belongs to the same workspace.

### 3.11 Attachments / Media

**FR-MEDIA-001:** File assets SHALL be workspace-scoped.  
**FR-MEDIA-002:** Workspace ownership SHALL be checked on GET, DELETE.  
**FR-MEDIA-003:** MIME type and file size SHALL be validated on upload.  
**FR-MEDIA-004:** Per-user storage quotas SHALL be enforced.  
**FR-MEDIA-005:** GET SHALL return a signed download URL. *(LocalStorageProvider implementation OPEN)*  
**FR-MEDIA-006:** Only the uploader SHALL delete their file asset.  
**FR-MEDIA-007:** Storage provider SHALL be abstracted via IStorageProvider — no direct S3/GCS imports in domain.

### 3.12 Personalization

**FR-PERS-001:** User theme preference SHALL be persisted in UserSettings.theme.  
**FR-PERS-002:** locale and timezone SHALL be persisted in UserSettings.  
**FR-PERS-003:** Notification preferences SHALL be persisted in UserSettings.notificationPreferences JSONB.  
**FR-PERS-004:** Purely visual preferences (card style, animation intensity) SHALL stay in presentation layer — NOT in database.

### 3.13 Outbox / Event Pipeline

**FR-OUTBOX-001:** Every object mutation SHALL stage an OutboxMessage in the same $transaction.  
**FR-OUTBOX-002:** OutboxWorker SHALL poll outbox_messages every 2 seconds.  
**FR-OUTBOX-003:** OutboxWorker SHALL use FOR UPDATE SKIP LOCKED for multi-worker safety.  
**FR-OUTBOX-004:** Failed messages SHALL retry with exponential backoff: 2^n * 1000ms.  
**FR-OUTBOX-005:** After maxRetries (default 5) the message SHALL be marked FAILED.  
**FR-OUTBOX-006:** Stale PROCESSING locks SHALL be released after 30 seconds.  
**FR-OUTBOX-007:** idempotencyKey SHALL prevent duplicate staging of the same domain event.  
**FR-OUTBOX-008:** ObjectCreatedEvent consumer SHALL create Timeline record + SearchIndex entry. *(OPEN)*  
**FR-OUTBOX-009:** ObjectUpdatedEvent consumer SHALL update Timeline + SearchIndex. *(OPEN)*  
**FR-OUTBOX-010:** ObjectDeletedEvent consumer SHALL create Timeline record + remove SearchIndex entry. *(OPEN)*

### 3.14 Capability System

**FR-CAP-001:** 5 built-in capabilities SHALL be registered at application boot: reminder, timeline, media, search, favorite.  
**FR-CAP-002:** CapabilityExecutor SHALL support 6-phase pipeline: beforeValidation, beforeExecution, beforeCommit, action, afterCommit, afterExecution.  
**FR-CAP-003:** PARALLEL capabilities SHALL execute via Promise.allSettled.  
**FR-CAP-004:** SEQUENTIAL capabilities SHALL execute in executionOrder sort order.  
**FR-CAP-005:** Handlers SHALL be registered via CapabilityExecutor.registerHandler(capabilityId, handler). *(OPEN — never called)*  
**FR-CAP-006:** LumoraObjectRuntime SHALL be the entry point for capability-driven object mutations. *(OPEN — not wired)*

---

## SRS SECTION 4 — NON-FUNCTIONAL REQUIREMENTS

### 4.1 Performance

**NFR-PERF-001:** GET /workspaces/:id/objects SHALL return within 200ms for workspaces up to 10,000 objects using cursor pagination.  
**NFR-PERF-002:** POST /workspaces/:id/objects SHALL return within 300ms.  
**NFR-PERF-003:** GET /workspaces/:id/search SHALL return within 500ms for up to 50,000 indexed documents.  
**NFR-PERF-004:** OutboxWorker batch cycle SHALL complete within 1 second for 50 messages.  
**NFR-PERF-005:** prisma.client getter SHALL be memoized — extended client created once per app lifetime. *(OPEN)*  
**NFR-PERF-006:** All list queries SHALL have a maximum page size of 100.  
**NFR-PERF-007:** No API endpoint SHALL return unbounded result sets.

### 4.2 Security

**NFR-SEC-001:** Passwords: bcrypt, minimum cost factor 12.  
**NFR-SEC-002:** Session refresh tokens: SHA-256 hash before storage — never plaintext. *(OPEN)*  
**NFR-SEC-003:** JWT_SECRET and JWT_REFRESH_SECRET: required env vars — app refuses to start if absent.  
**NFR-SEC-004:** All auth endpoints: rate-limited (see FR-AUTH-012 through FR-AUTH-016).  
**NFR-SEC-005:** No API endpoint SHALL expose Prisma model types, stack traces, or SQL details.  
**NFR-SEC-006:** All SQL: Prisma parameterised queries or Prisma.sql tagged templates — no string interpolation.  
**NFR-SEC-007:** Workspace isolation: enforced at DB query level via WorkspaceExecutionContext.  
**NFR-SEC-008:** .env: never committed to git.  
**NFR-SEC-009:** JSONB attributes: BigInt, NaN, Infinity, functions → 422 rejection.

### 4.3 Availability

**NFR-AVAIL-001:** Backend API: target 99.9% monthly uptime.  
**NFR-AVAIL-002:** Database connection failures: graceful structured error responses.  
**NFR-AVAIL-003:** Redis unavailability: graceful — cache miss fallback, app still serves requests.  
**NFR-AVAIL-004:** Graceful shutdown: in-flight requests complete, OutboxWorker stops cleanly, DB connections closed.

### 4.4 Scalability

**NFR-SCALE-001:** Universal Object architecture: unlimited object types without schema migrations.  
**NFR-SCALE-002:** OutboxWorker: supports multiple instances via FOR UPDATE SKIP LOCKED.  
**NFR-SCALE-003:** All workspace-scoped queries SHALL hit a database index.  
**NFR-SCALE-004:** No distributed infrastructure required before 100,000 active objects.

### 4.5 Maintainability

**NFR-MAINT-001:** packages/ui and packages/theme: zero imports from apps/backend or generated/prisma.  
**NFR-MAINT-002:** All API responses: stable DTOs — never raw Prisma models.  
**NFR-MAINT-003:** All visual values: useTheme() — never hardcoded hex/px values in components.  
**NFR-MAINT-004:** New object type: 3 files in packages/shared — no backend or migration work.  
**NFR-MAINT-005:** TypeScript: 0 errors before any commit.  
**NFR-MAINT-006:** All domain logic: domain layer only — never in controllers or repositories.

### 4.6 Accessibility

**NFR-A11Y-001:** Minimum touch target: 44×44pt on all interactive elements.  
**NFR-A11Y-002:** All IconButton components: accessibilityLabel required.  
**NFR-A11Y-003:** All Typography components: allowFontScaling={true}.  
**NFR-A11Y-004:** useReducedMotion() SHALL be checked before any animation — instant transition when true.  
**NFR-A11Y-005:** Color contrast: minimum WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text).  
**NFR-A11Y-006:** Focus order: logical top-to-bottom, left-to-right in all forms and detail screens.  
**NFR-A11Y-007:** Screen reader: all interactive elements have accessibilityRole and accessibilityLabel.

---

## SRS SECTION 5 — COMPLETE SYSTEM FLOWS

### 5.1 Registration Flow

```
User opens app (unauthenticated)
    ↓
auth.store.isAuthenticated = false → router redirects to /(auth)/register
    ↓
User enters: username, email, password
    ↓
Tap "Create account"
    ↓
POST /auth/register { username, email, password, deviceInfo }
    ↓
[Rate limit: 10/hr per IP]
[Validate DTO: whitelist, forbidNonWhitelisted]
    ↓
Check email unique → 409 EMAIL_ALREADY_REGISTERED if taken
Check username unique → 409 USERNAME_TAKEN if taken
    ↓
prisma.$transaction():
    ├── Create User (bcrypt hash password)
    ├── Create Workspace (personal)
    ├── Create WorkspaceMember (role: OWNER)
    ├── Create Session (SHA-256 hash refreshToken)
    ├── Create Device
    └── Create AuditLog (REGISTER)
    ↓
Return: AuthResponseDto { user: UserPublicDto, accessToken, refreshToken, sessionId, deviceId }
    ↓
Mobile: SecureStore.setItemAsync('accessToken', accessToken)
Mobile: SecureStore.setItemAsync('refreshToken', refreshToken)
Mobile: auth.store.setSession({ userId, workspaceId, accessToken, refreshToken })
Mobile: router.replace('/(app)/(tabs)')
```

### 5.2 Login Flow

```
User enters email + password
    ↓
POST /auth/login { email, password, deviceInfo }
    ↓
[Rate limit: 20/15min per identifier]
    ↓
Find User by email → 401 INVALID_CREDENTIALS if not found
bcrypt.compare(password, passwordHash) → 401 INVALID_CREDENTIALS if wrong
    ↓
prisma.$transaction():
    ├── Create Session (new tokens, SHA-256 hash refreshToken)
    ├── Upsert Device
    └── Create AuditLog (LOGIN)
    ↓
Return: AuthResponseDto
    ↓
Mobile: store tokens, set auth store, navigate to Home
```

### 5.3 Token Refresh Flow

```
Any API call returns 401
    ↓
Axios response interceptor catches 401
    ↓
Read refreshToken from SecureStore
    ↓
POST /auth/refresh { refreshToken }
    ↓
[Rate limit: 30/15min]
SHA-256 hash incoming token
Find Session WHERE refreshTokenHash = hash
    → not found: 401 INVALID_REFRESH_TOKEN
    → session.isActive = false: 401 SESSION_EXPIRED
    ↓
Generate new accessToken + refreshToken
Update Session (new SHA-256 hash)
    ↓
Return { accessToken, refreshToken }
    ↓
Mobile: update SecureStore + auth.store
Mobile: retry original failed request with new accessToken
```

### 5.4 Quick Add Flow

```
User taps "+" / FAB on Home
    ↓
QuickAddSheet opens (MotionEngine.sheet spring animation)
    ↓
Step 1: TypeSelector
    6 tiles: NOTE, TASK, REMINDER, EVENT, DOCUMENT, HABIT
    Icons + labels from BUILT_IN_CATALOG_DEFINITIONS
    User taps tile → selected state
    ↓
Step 2: Title input (auto-focused)
    Optional: description
    Optional: space selector
    ↓
User taps "Add"
    ↓
useMutation → POST /workspaces/:workspaceId/objects
    body: { typeKey, title, description?, spaceId?, attributes: {} }
    header: Authorization: Bearer accessToken
    ↓
[Backend flow — CreateObjectUseCase]:
ObjectsController.createObject(workspaceId, userId, dto)
    ↓
CreateObjectUseCase.execute({ workspaceId, createdById: userId, dto })
    ↓
factory(workspaceId, userId) → ObjectAggregateRepositoryAdapter
    ↓
ObjectAggregate.create({
    workspaceId, createdById, objectKey (auto-generated),
    typeKey, title, attributes: {}
})
    → validates typeKey in ObjectCatalogRegistry
    → validates title 1-512 chars
    → emits ObjectCreatedEvent
    ↓
adapter.save(aggregate) → prisma.object.create()
    ↓
[Future: prisma.$transaction + OutboxPublisher.stageEvents()]
    ↓
Return ObjectResponseDto
    ↓
Mobile: queryClient.invalidateQueries(['objects', workspaceId])
Mobile: HapticEngine.confirm()
Mobile: QuickAddSheet animates closed
Mobile: Home list shows new object within 2 seconds
```

### 5.5 Object Detail — View and Edit

```
User taps ObjectCard → router.push('/objects/[objectKey]')
    ↓
Object Detail screen mounts
    ↓
useObject(objectKey) → GET /workspaces/:id/objects/:key
    Loading → DynamicObjectDetail skeleton
    Error → ErrorState + retry button
    Success → DynamicObjectDetail(attributes, definition, isEditMode=false)
    ↓
DynamicObjectDetail renders blocks:
    HeaderBlockAdapter: title, type icon, meta
    PropertiesBlockAdapter: FieldRegistry renders each field
        FieldType.STRING  → Input
        FieldType.NUMBER  → NumberInput
        FieldType.BOOLEAN → Switch
        FieldType.ENUM    → Select
        FieldType.DATE    → DatePicker
    ↓
User taps "Edit"
    ↓
DynamicObjectDetail switches to edit mode
User modifies fields
    ↓
User taps "Save"
    ↓
useUpdateObject.mutate({ id, attributes, revision: object.revision })
    ↓
PATCH /workspaces/:id/objects/:id
    body: { attributes, revision }
    ↓
[Backend: ObjectsService.updateObject()]
Read existing object → get current revision
If dto.revision !== existing.revision → 409 REVISION_CONFLICT
updateMany WHERE id AND workspaceId AND status != DELETED
Return updated ObjectResponseDto
    ↓
409 REVISION_CONFLICT:
    Mobile: show ConflictDialog
    "This object was updated from another device."
    [Reload] → refetch and discard local edits
    [Keep editing] → dismiss dialog, user retries with new revision
    ↓
200 Success:
    Mobile: invalidate ['object', objectKey] + ['objects', workspaceId]
    Mobile: DynamicObjectDetail returns to view mode
    Mobile: HapticEngine.confirm()
```

### 5.6 Search Flow

```
User taps Search tab
    ↓
SearchScreen with empty state (no query yet)
    ↓
User types in search input
    ↓
[300ms debounce]
    ↓
useSearch(query, workspaceId) → GET /workspaces/:id/search?query=term
    ↓
[Backend]:
SearchController.search(workspaceId, { query, category? })
SearchObjectsQuery.execute({ workspaceId, dto })
searchRepository.search(workspaceId, SearchTerm, category?, limit=20)
    SELECT * FROM SearchIndex
    WHERE workspaceId = $ws
      AND (title ILIKE '%term%' OR content ILIKE '%term%')
    ORDER BY updatedAt DESC
    LIMIT 20
    ↓
Return SearchResultDto[]
    ↓
Mobile: SearchResultCard list
User taps result → navigate to /objects/[entityId]
User clears input → return to empty state
```

### 5.7 Timeline Flow (after Outbox handlers wired)

```
User creates or edits an object (any flow above)
    ↓
ObjectAggregate emits ObjectCreatedEvent / ObjectUpdatedEvent
    ↓
OutboxMessage staged in same transaction
    ↓
OutboxWorker processes batch
    ↓
TIMELINE HANDLER:
RecordTimelineActivityUseCase.execute({
    workspaceId: event.workspaceId,
    userId: event.payload.actorId,
    entityCategory: 'OBJECT',
    entityId: event.aggregateId,
    action: event.eventName,
    metadata: { typeKey, title }
})
→ prisma.timeline.create() (append-only)
    ↓
User navigates to Timeline tab
    ↓
useWorkspaceTimeline(workspaceId) → GET /workspaces/:id/timeline?limit=50
    ↓
TimelineScreen shows activity records:
    "Created Note: Morning reflection — 2 mins ago"
    "Updated Task: Fix login bug — 1 hour ago"
    "Archived Medicine: Aspirin — yesterday"
```

### 5.8 Auth Guard Flow

```
App starts
    ↓
_layout.tsx mounts
    ↓
auth.store hydrates from SecureStore
    ↓
auth.store.isAuthenticated?
    NO → router.replace('/(auth)/login')
    YES → router.replace('/(app)/(tabs)')
    ↓
Any screen makes API call → accessToken in Authorization header
    ↓
accessToken expired (401) → axios interceptor → refresh → retry
refreshToken expired (401 SESSION_EXPIRED) → clear SecureStore + auth.store → router.replace('/(auth)/login')
```

### 5.9 Workspace Isolation — Enforcement Chain

```
Mobile: read workspaceId from auth.store
    ↓
API call: /workspaces/:workspaceId/objects
    ↓
JwtAuthGuard: verifies JWT, extracts userId
PermissionsGuard: verifies userId is ACTIVE member of workspaceId
    → 403 INSUFFICIENT_PERMISSIONS if not a member
    ↓
Controller: passes workspaceId to use case
Use case: passes to factory(workspaceId, userId)
    ↓
ObjectAggregateRepositoryAdapter:
    WorkspaceExecutionContext = { workspaceId, userId }
    All queries: WHERE workspaceId = context.workspaceId
    ↓
Database: UNIQUE constraint + index on workspaceId ensure
no cross-tenant data can be returned
```

---

## SRS SECTION 6 — COMPLETE API CONTRACT

### 6.1 Base URL and Headers

```
Base URL: https://api.lumora.app/v1  (or local: http://localhost:3000)
Auth header: Authorization: Bearer <accessToken>
Content-Type: application/json
Accept: application/json
```

### 6.2 Authentication Endpoints

```
POST /auth/register
  Body: { username: string, email: string, password: string, deviceInfo?: DeviceInfo }
  200: AuthResponseDto
  409: EMAIL_ALREADY_REGISTERED | USERNAME_TAKEN
  422: DOMAIN_VALIDATION_ERROR (weak password, invalid email format)
  429: RATE_LIMIT_EXCEEDED

POST /auth/login
  Body: { email: string, password: string, deviceInfo?: DeviceInfo }
  200: AuthResponseDto
  401: INVALID_CREDENTIALS
  429: RATE_LIMIT_EXCEEDED

POST /auth/refresh
  Body: { refreshToken: string }
  200: { accessToken: string, refreshToken: string }
  401: INVALID_REFRESH_TOKEN | SESSION_EXPIRED
  429: RATE_LIMIT_EXCEEDED

POST /auth/logout  [JWT required]
  Body: { sessionId: string }
  200: { success: true }

POST /auth/change-password  [JWT required]
  Body: { currentPassword: string, newPassword: string }
  200: { success: true }
  401: INVALID_CREDENTIALS
  429: RATE_LIMIT_EXCEEDED

POST /auth/oauth/:provider
  Body: { token: string, provider: 'GOOGLE' | 'APPLE', deviceInfo?: DeviceInfo }
  200: AuthResponseDto
  401: OAUTH_ACCOUNT_RESOLUTION_FAILED
  429: RATE_LIMIT_EXCEEDED
```

### 6.3 Object Endpoints

```
POST /workspaces/:workspaceId/objects  [JWT + RBAC: object.create]
  Body: CreateObjectDto {
    typeKey: string        (required — must be in ObjectCatalogRegistry)
    title: string          (required, 1-512 chars)
    description?: string
    objectKey?: string     (auto-generated if omitted)
    spaceId?: string
    icon?: string
    emoji?: string
    cover?: string
    color?: string         (semantic token e.g. "theme.blue")
    pinnedAt?: string      (ISO 8601)
    isFavorite?: boolean   default: false
    attributes?: Record<string, unknown>
    systemData?: Record<string, unknown>
  }
  201: ObjectResponseDto
  400: DOMAIN_VALIDATION_ERROR (invalid typeKey, title too short/long)
  403: INSUFFICIENT_PERMISSIONS
  409: RESOURCE_CONFLICT (duplicate objectKey in workspace)
  422: validation errors

GET /workspaces/:workspaceId/objects  [JWT + RBAC: object.read]
  Query: {
    typeKey?: string
    spaceId?: string
    status?: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
    isFavorite?: boolean
    search?: string
    first?: number          (cursor pagination — OPEN)
    after?: string          (cursor — OPEN)
  }
  200: ObjectResponseDto[]  (TODO: wrap in { items, pageInfo } when pagination added)
  403: INSUFFICIENT_PERMISSIONS

GET /workspaces/:workspaceId/objects/:idOrKey  [JWT + RBAC: object.read]
  Params: idOrKey = UUID id or objectKey string
  200: ObjectResponseDto
  403: INSUFFICIENT_PERMISSIONS
  404: ENTITY_NOT_FOUND

PATCH /workspaces/:workspaceId/objects/:id  [JWT + RBAC: object.update]
  Body: UpdateObjectDto {
    title?: string          (min 1 char)
    description?: string
    spaceId?: string
    icon?: string
    emoji?: string
    cover?: string
    color?: string
    pinnedAt?: string | null
    isFavorite?: boolean
    status?: 'ACTIVE' | 'ARCHIVED'
    attributes?: Record<string, unknown>
    systemData?: Record<string, unknown>
    revision?: number       (for optimistic concurrency)
  }
  200: ObjectResponseDto
  403: INSUFFICIENT_PERMISSIONS
  404: ENTITY_NOT_FOUND
  409: REVISION_CONFLICT (if revision provided and mismatched)

DELETE /workspaces/:workspaceId/objects/:id  [JWT + RBAC: object.delete]
  200: ObjectResponseDto (with status = 'DELETED')
  403: INSUFFICIENT_PERMISSIONS
  404: ENTITY_NOT_FOUND
```

### 6.4 Search Endpoints

```
GET /workspaces/:workspaceId/search  [JWT]
  Query: { query: string (required), category?: string }
  200: SearchResultDto[]

POST /workspaces/:workspaceId/search/index  [JWT]
  Body: IndexEntityDto { workspaceId, entityCategory, entityId, title, content }
  200: SearchResultDto

DELETE /workspaces/:workspaceId/search/index/:entityCategory/:entityId  [JWT]
  200: { success: true }
```

### 6.5 Timeline Endpoints

```
GET /workspaces/:workspaceId/timeline  [JWT + RBAC]
  Query: { userId?: string, entityId?: string (OPEN), limit?: number, after?: string (OPEN) }
  200: TimelineRecordResponseDto[]

POST /workspaces/:workspaceId/timeline  [JWT + RBAC]
  Body: RecordTimelineActivityDto { workspaceId, userId, entityCategory, entityId, action, metadata? }
  201: TimelineRecordResponseDto
```

### 6.6 Media Endpoints

```
POST /workspaces/:workspaceId/media  [JWT]
  Body: RegisterFileAssetDto { path, filename, mimeType, size, provider?, bucket?, checksum? }
  201: FileAssetResponseDto

GET /workspaces/:workspaceId/media/:id  [JWT]
  200: { asset: FileAssetResponseDto, downloadUrl: string }
  404: ENTITY_NOT_FOUND

DELETE /workspaces/:workspaceId/media/:id  [JWT]
  200: FileAssetResponseDto
  403: INSUFFICIENT_PERMISSIONS (not the uploader)
  404: ENTITY_NOT_FOUND
```

### 6.7 Settings Endpoints

```
GET /settings/me  [JWT]
  200: UserSettingsDto { theme, locale, timezone, notificationPreferences, accessibility }

PATCH /settings/me  [JWT]
  Body: UpdateUserSettingsDto (partial)
  200: UserSettingsDto
```

### 6.8 Spaces Endpoints

```
GET /workspaces/:workspaceId/spaces  [JWT + RBAC]
POST /workspaces/:workspaceId/spaces  [JWT + RBAC]
GET /workspaces/:workspaceId/spaces/:id  [JWT + RBAC]
PATCH /workspaces/:workspaceId/spaces/:id  [JWT + RBAC]
DELETE /workspaces/:workspaceId/spaces/:id  [JWT + RBAC]
```

### 6.9 Collections Endpoints

```
GET /workspaces/:workspaceId/collections  [JWT + RBAC]
POST /workspaces/:workspaceId/collections  [JWT + RBAC]
GET /workspaces/:workspaceId/collections/:id  [JWT + RBAC]
PATCH /workspaces/:workspaceId/collections/:id  [JWT + RBAC]
DELETE /workspaces/:workspaceId/collections/:id  [JWT + RBAC]
POST /workspaces/:workspaceId/collections/:id/items  [JWT + RBAC]
DELETE /workspaces/:workspaceId/collections/:id/items/:objectId  [JWT + RBAC]
```

### 6.10 Reminders Endpoints

```
GET /workspaces/:workspaceId/reminders  [JWT + RBAC]
POST /workspaces/:workspaceId/reminders  [JWT + RBAC]
GET /workspaces/:workspaceId/reminders/:id  [JWT + RBAC]
PATCH /workspaces/:workspaceId/reminders/:id  [JWT + RBAC]
DELETE /workspaces/:workspaceId/reminders/:id  [JWT + RBAC]
GET /workspaces/:workspaceId/objects/:objectId/reminders  [JWT + RBAC]
```

### 6.11 Standard Error Response Shape

```json
{
  "statusCode": 404,
  "errorCode": "ENTITY_NOT_FOUND",
  "message": "Object 'note-abc123' not found.",
  "timestamp": "2026-08-09T23:00:00.000Z",
  "details": {}
}
```

### 6.12 Error Code → HTTP Status Mapping

| ErrorCode | HTTP | When |
|---|---|---|
| ENTITY_NOT_FOUND | 404 | Object/space/reminder not found |
| DOMAIN_VALIDATION_ERROR | 422 | Invalid field value, invalid typeKey |
| RESOURCE_CONFLICT | 409 | Duplicate objectKey, duplicate email |
| REVISION_CONFLICT | 409 | CAS optimistic lock mismatch |
| INSUFFICIENT_PERMISSIONS | 403 | Not a workspace member, wrong role |
| UNAUTHENTICATED | 401 | Missing or expired JWT |
| INVALID_CREDENTIALS | 401 | Wrong password |
| SESSION_EXPIRED | 401 | Refresh token expired |
| INVALID_REFRESH_TOKEN | 401 | Token reuse detected |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| PERSONAL_WORKSPACE_DELETION_FORBIDDEN | 422 | Cannot delete personal workspace |
| SYSTEM_ERROR | 500 | Unexpected infrastructure error |
| OBJECT_CONCURRENCY_EXCEPTION | 409 | CAS race — revision changed since last read |
| OBJECT_LIFECYCLE_CONFLICT | 422 | Mutation on DELETED or ARCHIVED object not allowed |

---

## SRS SECTION 7 — DATA MODEL SPECIFICATION

### 7.1 User

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, default uuid() | |
| email | TEXT | UNIQUE, NOT NULL | |
| username | TEXT | UNIQUE, NOT NULL | |
| displayName | TEXT | NOT NULL | |
| passwordHash | TEXT | NOT NULL | bcrypt hash — never returned in API |
| avatarUrl | TEXT | nullable | |
| timezone | TEXT | NOT NULL, default 'UTC' | IANA timezone |
| locale | TEXT | NOT NULL, default 'en-US' | |
| emailVerified | BOOL | NOT NULL, default false | |
| onboardingDone | BOOL | NOT NULL, default false | |
| status | UserStatus | NOT NULL, default ACTIVE | ACTIVE | SUSPENDED | DELETED |
| createdAt | TIMESTAMPTZ | default now() | |
| updatedAt | TIMESTAMPTZ | auto-update | |

### 7.2 Workspace

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| name | TEXT | NOT NULL | |
| slug | TEXT | UNIQUE, NOT NULL | URL-safe identifier |
| ownerId | UUID | FK → User | |
| type | WorkspaceType | NOT NULL | PERSONAL | TEAM |
| visibility | WorkspaceVisibility | NOT NULL | PRIVATE | PUBLIC |
| settings | JSONB | default {} | workspace-level config |
| createdAt | TIMESTAMPTZ | | |
| updatedAt | TIMESTAMPTZ | | |

### 7.3 Object (Universal Object — Core Table)

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, default uuid() | |
| workspaceId | UUID | FK → Workspace, NOT NULL | Tenant boundary |
| spaceId | UUID | FK → Space, nullable | |
| createdById | UUID | FK → User, NOT NULL | |
| updatedById | UUID | FK → User, nullable | |
| objectKey | TEXT | NOT NULL | Stable business key |
| typeKey | TEXT | NOT NULL | 'NOTE', 'TASK', 'MEDICINE', etc. |
| title | TEXT | NOT NULL | 1–512 chars |
| description | TEXT | nullable | |
| icon | TEXT | nullable | Semantic icon name |
| emoji | TEXT | nullable | Single emoji |
| cover | TEXT | nullable | Cover image URL |
| color | TEXT | nullable | Semantic color token |
| pinnedAt | TIMESTAMPTZ | nullable | |
| isFavorite | BOOL | NOT NULL, default false | |
| status | ObjectStatus | NOT NULL, default ACTIVE | ACTIVE | ARCHIVED | DELETED |
| schemaVersion | INT | NOT NULL, default 1 | |
| systemData | JSONB | default {} | Platform metadata |
| attributes | JSONB | default {} | Type-specific fields |
| revision | INT | NOT NULL, default 1 | CAS counter |
| archivedAt | TIMESTAMPTZ | nullable | |
| deletedAt | TIMESTAMPTZ | nullable | |
| createdAt | TIMESTAMPTZ | default now() | |
| updatedAt | TIMESTAMPTZ | auto-update | |

**Indexes:**
```
UNIQUE (workspaceId, objectKey)
INDEX  (workspaceId, status)
INDEX  (workspaceId, typeKey, status)
INDEX  (workspaceId, updatedAt DESC, id)
INDEX  (workspaceId, isFavorite)
INDEX  (workspaceId, pinnedAt)
INDEX  (spaceId)
INDEX  (createdById)
```

### 7.4 OutboxMessage

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| workspaceId | UUID | NOT NULL | Source workspace |
| aggregateId | UUID | NOT NULL | Source aggregate |
| eventType | TEXT | NOT NULL | Event name |
| payload | JSONB | NOT NULL | Event data |
| payloadSchemaVersion | INT | NOT NULL, default 1 | |
| status | OutboxStatus | NOT NULL, default PENDING | PENDING | PROCESSING | COMPLETED | FAILED |
| retryCount | INT | NOT NULL, default 0 | |
| maxRetries | INT | NOT NULL, default 5 | |
| nextAttemptAt | TIMESTAMPTZ | default now() | Backoff scheduling |
| idempotencyKey | TEXT | UNIQUE | eventId — prevents duplicates |
| lastError | TEXT | nullable | Capped at 2000 chars |
| createdAt | TIMESTAMPTZ | default now() | |
| processedAt | TIMESTAMPTZ | nullable | |

**Indexes:**
```
UNIQUE (idempotencyKey)
INDEX  (status, nextAttemptAt)
INDEX  (workspaceId, aggregateId)
```

### 7.5 SearchIndex

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| workspaceId | UUID | nullable | Added in Foundation Hardening migration |
| entity | TEXT | NOT NULL | Category: 'OBJECT', 'SPACE', etc. |
| entityId | TEXT | NOT NULL | |
| title | TEXT | NOT NULL | |
| content | TEXT | NOT NULL | |
| createdAt | TIMESTAMPTZ | default now() | |
| updatedAt | TIMESTAMPTZ | auto-update | |

**Indexes:**
```
INDEX (workspaceId, entity)
INDEX (entity)
INDEX (entityId)
```

### 7.6 Timeline

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| objectId | UUID | FK → Object, nullable | |
| workspaceId | UUID | NOT NULL | |
| userId | UUID | NOT NULL | Actor |
| action | TEXT | NOT NULL | e.g. 'object.created' |
| metadata | JSONB | default {} | |
| startedAt | TIMESTAMPTZ | NOT NULL | |
| endedAt | TIMESTAMPTZ | nullable | |
| timezone | TEXT | nullable | |

### 7.7 Session

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| userId | UUID | FK → User | |
| deviceId | UUID | FK → Device | |
| accessToken | TEXT | NOT NULL | SHOULD BE SHA-256 hash (OPEN) |
| refreshToken | TEXT | NOT NULL | SHOULD BE SHA-256 hash (OPEN) |
| isActive | BOOL | NOT NULL, default true | |
| expiresAt | TIMESTAMPTZ | NOT NULL | |
| createdAt | TIMESTAMPTZ | | |

### 7.8 FileAsset

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| uploadedById | UUID | FK → User | |
| workspaceId | UUID | nullable | Added in Foundation Hardening migration |
| provider | FileProvider | NOT NULL | LOCAL | S3 | CLOUDINARY | R2 | GCS |
| bucket | TEXT | nullable | |
| path | TEXT | NOT NULL | Storage path |
| filename | TEXT | NOT NULL | |
| mimeType | TEXT | NOT NULL | |
| size | INT | NOT NULL | Bytes |
| checksum | TEXT | nullable | |
| createdAt | TIMESTAMPTZ | | |

---

## SRS SECTION 8 — MOBILE NAVIGATION SPECIFICATION

### 8.1 Complete Route Tree

```
/                               ← Root (auth gate)
├── (auth)/
│   ├── _layout.tsx             ← Stack — redirect to (app) if authenticated
│   ├── login                   ← Login screen
│   ├── register                ← Register screen
│   └── onboarding              ← Onboarding flow (future)
│
└── (app)/
    ├── _layout.tsx             ← Stack with auth guard
    ├── (tabs)/
    │   ├── _layout.tsx         ← Tab navigator
    │   ├── index               ← Home tab
    │   ├── search              ← Search tab
    │   ├── timeline            ← Timeline tab (rename from two.tsx)
    │   └── settings            ← Settings tab
    ├── objects/
    │   └── [objectKey]         ← Object Detail (pushed from Home, Search, Collections)
    ├── spaces/
    │   └── [spaceId]           ← Space Detail
    ├── collections/
    │   └── [collectionId]      ← Collection Detail
    ├── quick-add               ← Quick Add modal sheet
    └── profile                 ← User profile
```

### 8.2 Navigation Rules

**Rule 1:** Unauthenticated users are always redirected to /(auth)/login. The auth check happens in the root `_layout.tsx` by reading `auth.store.isAuthenticated`.

**Rule 2:** Navigation changes are UI-only — zero backend changes required for any restructuring.

**Rule 3:** ObjectKey is the navigation identifier — not UUID. `router.push('/objects/note-abc123')` uses the stable objectKey so links remain valid if the internal UUID changes.

**Rule 4:** Quick Add is a modal sheet pushed over the current tab — it does not navigate away from Home. On success it dismisses and Home refetches.

**Rule 5:** Deep links follow the route structure: `lumora://objects/note-abc123`, `lumora://search?query=medicine`.

---

## SRS SECTION 9 — STATE MANAGEMENT SPECIFICATION

### 9.1 Architecture

```
API (REST)
    ↓
TanStack Query (server state — objects, timeline, search, spaces)
    ↓
React Components (screens, DynamicObjectDetail, ObjectCard)

Zustand (client state — auth, preferences)
    ↓
SecureStore (token persistence) + AsyncStorage (preferences)
    ↓
React Components (read workspaceId, theme mode)
```

### 9.2 TanStack Query Keys

| Query | Key | Stale Time |
|---|---|---|
| Object list | `['objects', workspaceId, filterHash]` | 2 min |
| Single object | `['object', workspaceId, objectKey]` | 2 min |
| Timeline | `['timeline', workspaceId, userId?]` | 1 min |
| Search results | `['search', workspaceId, query, category?]` | 30 sec |
| Spaces list | `['spaces', workspaceId]` | 5 min |
| Collections list | `['collections', workspaceId]` | 5 min |
| User settings | `['settings', 'me']` | 10 min |
| Reminders | `['reminders', workspaceId, objectId?]` | 2 min |

### 9.3 Mutation Invalidation Rules

| Mutation | Invalidate |
|---|---|
| Create object | `['objects', workspaceId, *]` |
| Update object | `['object', workspaceId, objectKey]` + `['objects', workspaceId, *]` |
| Delete object | `['object', workspaceId, objectKey]` + `['objects', workspaceId, *]` |
| Create reminder | `['reminders', workspaceId, *]` |
| Index entity | `['search', workspaceId, *]` |
| Update settings | `['settings', 'me']` |

### 9.4 Zustand Auth Store

```typescript
interface AuthStore {
  userId: string | null
  workspaceId: string | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean

  setSession(session: SessionData): void  // writes to SecureStore
  clearSession(): void                    // clears SecureStore
  refreshSession(): Promise<void>         // calls /auth/refresh
  hydrateFromStorage(): Promise<void>     // reads SecureStore on app start
}
```

### 9.5 Zustand Preferences Store

```typescript
interface PreferencesStore {
  themeMode: 'light' | 'dark' | 'amoled' | 'highContrast' | 'system'
  setThemeMode(mode: string): void  // writes to AsyncStorage + UserSettings API
}
```

### 9.6 State Rules

**Rule 1:** Domain data (objects, timeline, search) SHALL live in TanStack Query — never duplicated in Zustand.  
**Rule 2:** Auth session SHALL live in Zustand + SecureStore — never in TanStack Query cache.  
**Rule 3:** UI state (sheet open, edit mode) SHALL live in React local `useState` — never in Zustand.  
**Rule 4:** On 409 REVISION_CONFLICT: invalidate the object query and show ConflictDialog — do not auto-resolve.  
**Rule 5:** On 401 (expired token): axios interceptor handles refresh transparently — the screen does not see it.

---

## SRS SECTION 10 — ERROR HANDLING SPECIFICATION

### 10.1 Backend Error Response Contract

Every error from the backend follows this exact shape:

```json
{
  "statusCode": 409,
  "errorCode": "REVISION_CONFLICT",
  "message": "Object 'note-abc123' has been modified. Expected revision 3, found revision 4.",
  "timestamp": "2026-08-09T23:00:00.000Z",
  "details": {
    "expectedRevision": 3,
    "currentRevision": 4
  }
}
```

No stack traces. No SQL details. No Prisma error codes. No internal field names.

### 10.2 Mobile Error Handling Per Error Code

| ErrorCode | HTTP | Mobile Handling |
|---|---|---|
| ENTITY_NOT_FOUND | 404 | Show ErrorState: "Not found. It may have been deleted." + Back button |
| DOMAIN_VALIDATION_ERROR | 422 | Show inline field-level errors on the form |
| RESOURCE_CONFLICT | 409 | Show inline error: "This key already exists. Try a different one." |
| REVISION_CONFLICT | 409 | Show ConflictDialog: "Updated elsewhere — Reload or Keep editing?" |
| INSUFFICIENT_PERMISSIONS | 403 | Show: "You don't have permission to do this." |
| UNAUTHENTICATED | 401 | Interceptor: attempt refresh → if fails: clear session → navigate to login |
| INVALID_CREDENTIALS | 401 | Show on login screen: "Wrong email or password." |
| SESSION_EXPIRED | 401 | Clear session → navigate to login with message: "Your session expired. Please log in again." |
| INVALID_REFRESH_TOKEN | 401 | Clear session → navigate to login |
| RATE_LIMIT_EXCEEDED | 429 | Show: "Too many attempts. Try again in X minutes." (read Retry-After header) |
| SYSTEM_ERROR | 500 | Show ErrorState: "Something went wrong. Please try again." + retry button |
| OBJECT_CONCURRENCY_EXCEPTION | 409 | Same as REVISION_CONFLICT |
| OBJECT_LIFECYCLE_CONFLICT | 422 | Show: "This object cannot be modified in its current state." |

### 10.3 Network Error Handling

| Scenario | Mobile Handling |
|---|---|
| No network | Show OfflineBanner at top of every screen. Disable mutation buttons. Show cached data if available. |
| Request timeout (>10s) | Show ErrorState with retry button |
| Server unreachable | Show: "Cannot reach Lumora servers. Check your connection." |
| CORS error (dev only) | Log to console — should not occur in production |

### 10.4 Loading State Rules

Every data-fetching screen MUST handle these states explicitly:

```
isLoading && !data  → show LoadingState (skeleton)
isError             → show ErrorState with onRetry={refetch}
!data || data.length === 0 → show EmptyState with CTA
data.length > 0     → show content
isFetching && data  → show subtle refresh indicator (not full skeleton)
```

### 10.5 Optimistic Updates

Quick Add and favorite toggle SHALL use optimistic updates:

```typescript
// Quick Add — optimistic
onMutate: async (newObject) => {
  await queryClient.cancelQueries(['objects', workspaceId])
  const previous = queryClient.getQueryData(['objects', workspaceId])
  queryClient.setQueryData(['objects', workspaceId], (old) => [newObject, ...old])
  return { previous }
},
onError: (err, newObject, context) => {
  queryClient.setQueryData(['objects', workspaceId], context.previous)
  // show error toast
},
onSettled: () => {
  queryClient.invalidateQueries(['objects', workspaceId])
}
```

---

## SRS SECTION 11 — ENVIRONMENT VARIABLE SPECIFICATION

All required environment variables for `apps/backend`. Application SHALL refuse to start if any required variable is absent.

### 11.1 Database

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | YES | none | PostgreSQL connection string. Use Neon pooler endpoint for production. Format: `postgresql://user:pass@host:5432/db?sslmode=require` |

### 11.2 Authentication

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_SECRET` | YES | none | Secret for signing access tokens. Minimum 32 chars. Rotate on breach. |
| `JWT_REFRESH_SECRET` | YES | none | Secret for signing refresh tokens. Different from JWT_SECRET. |
| `JWT_EXPIRY` | NO | `15m` | Access token expiry (e.g. `15m`, `1h`) |
| `JWT_REFRESH_EXPIRY` | NO | `7d` | Refresh token expiry |

### 11.3 Redis

| Variable | Required | Default | Description |
|---|---|---|---|
| `REDIS_URL` | YES | none | Redis connection URL. Format: `redis://localhost:6379` or `rediss://user:pass@host:6380` for TLS |

### 11.4 Application

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | NO | `3000` | HTTP server port |
| `NODE_ENV` | NO | `development` | `development` \| `production` \| `test` |
| `SHUTDOWN_TIMEOUT_MS` | NO | `10000` | Graceful shutdown timeout in milliseconds |

### 11.5 OAuth (optional — only if OAuth login is enabled)

| Variable | Required | Default | Description |
|---|---|---|---|
| `GOOGLE_CLIENT_ID` | NO | none | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | NO | none | Google OAuth client secret |
| `APPLE_CLIENT_ID` | NO | none | Apple OAuth client ID |
| `APPLE_TEAM_ID` | NO | none | Apple developer team ID |
| `APPLE_KEY_ID` | NO | none | Apple private key ID |
| `APPLE_PRIVATE_KEY` | NO | none | Apple private key (PEM format) |

### 11.6 Storage (optional — only if cloud storage is used)

| Variable | Required | Default | Description |
|---|---|---|---|
| `STORAGE_PROVIDER` | NO | `LOCAL` | `LOCAL` \| `S3` \| `R2` \| `CLOUDINARY` \| `GCS` |
| `AWS_ACCESS_KEY_ID` | NO | none | S3/R2 access key |
| `AWS_SECRET_ACCESS_KEY` | NO | none | S3/R2 secret key |
| `AWS_REGION` | NO | none | S3 region |
| `AWS_S3_BUCKET` | NO | none | S3 bucket name |
| `R2_ACCOUNT_ID` | NO | none | Cloudflare R2 account ID |

### 11.7 Observability (optional)

| Variable | Required | Default | Description |
|---|---|---|---|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | NO | none | OpenTelemetry collector endpoint |
| `OTEL_SERVICE_NAME` | NO | `lumora-backend` | Service name for traces |
| `LOG_LEVEL` | NO | `info` | `debug` \| `info` \| `warn` \| `error` |

### 11.8 `.env.example` (to be created at `apps/backend/.env.example`)

```
# Database — required
DATABASE_URL=postgresql://user:password@localhost:5432/lumora

# Authentication — required
JWT_SECRET=your-jwt-secret-minimum-32-chars-here
JWT_REFRESH_SECRET=your-refresh-secret-different-from-jwt-secret
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Redis — required
REDIS_URL=redis://localhost:6379

# Application
PORT=3000
NODE_ENV=development
SHUTDOWN_TIMEOUT_MS=10000

# OAuth (optional)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=

# Storage (optional — defaults to LOCAL)
# STORAGE_PROVIDER=LOCAL
```

---

## SRS SECTION 12 — CAPABILITY SPECIFICATIONS

### 12.1 lumora.capability.reminder

**Purpose:** Schedule time-based reminders for any Universal Object.  
**Execution Policy:** SEQUENTIAL  
**Failure Policy:** FAIL_FAST  
**System Required:** No  
**Supports Undo:** Yes  
**Applies To:** TASK, REMINDER, EVENT, MEDICINE, HABIT, PLANT, PET, VEHICLE, BILL, SUBSCRIPTION

**Behaviour when activated:**
- User creates a reminder linked to the object via `POST /workspaces/:id/reminders`
- Reminder stores: objectId, remindAt, timezone, recurrenceRule?
- At scheduled time: OutboxWorker dispatches ReminderDueEvent
- Consumer: delivers push notification to user's devices

**Lifecycle:**
```
ACTIVE → SNOOZED (user snoozes — remindAt updated to future time)
ACTIVE → COMPLETED (user marks done)
ACTIVE → CANCELLED (user cancels)
COMPLETED / CANCELLED → terminal (no transitions out)
```

**API surface:**
```
POST /workspaces/:id/reminders      — create
GET  /workspaces/:id/reminders      — list workspace reminders
GET  /workspaces/:id/objects/:key/reminders — reminders for one object
PATCH /workspaces/:id/reminders/:id — update (snooze, edit time)
DELETE /workspaces/:id/reminders/:id — cancel
```

### 12.2 lumora.capability.timeline

**Purpose:** Maintain an immutable audit history ledger for any Universal Object.  
**Execution Policy:** SEQUENTIAL  
**Failure Policy:** FAIL_FAST  
**System Required:** Yes (cannot be disabled — every object mutation is recorded)  
**Supports Undo:** No (timeline entries are permanent)  
**Applies To:** All object types

**Behaviour when activated:**
- On every ObjectCreatedEvent → create TimelineRecord { action: 'object.created', entityId, workspaceId, userId, metadata: { typeKey, title } }
- On every ObjectUpdatedEvent → create TimelineRecord { action: 'object.updated', metadata: { changedFields } }
- On every ObjectDeletedEvent → create TimelineRecord { action: 'object.deleted' }

**Timeline record is NOT editable and NOT deletable after creation.**

**Status:** Handler not yet registered. *(OPEN — FR-OUTBOX-008)*

### 12.3 lumora.capability.media

**Purpose:** Attach files and media assets to any Universal Object.  
**Execution Policy:** SEQUENTIAL  
**Failure Policy:** FAIL_FAST  
**System Required:** No  
**Supports Undo:** Yes (file deletion undoes attachment)  
**Applies To:** NOTE, TASK, EVENT, DOCUMENT, PET, VEHICLE (and any type that supports media)

**Behaviour when activated:**
- User uploads file via `POST /workspaces/:id/media`
- File metadata stored in FileAsset with workspaceId + uploadedById
- File physically stored in IStorageProvider (currently LOCAL, future: S3/R2/GCS)
- Association between FileAsset and Object is currently informal (via attributes JSON)
- Future: formal FK `FileAsset.objectId` → Object for structured attachment list

### 12.4 lumora.capability.search

**Purpose:** Index object content into the workspace search projection for discovery.  
**Execution Policy:** PARALLEL  
**Failure Policy:** IGNORE (search index failure must never block object persistence)  
**System Required:** Yes (all objects should be searchable)  
**Supports Undo:** No (index entry is rebuilt automatically)  
**Applies To:** All object types

**Behaviour when activated:**
- On ObjectCreatedEvent: IndexEntityUseCase creates SearchIndex entry { workspaceId, entity: 'OBJECT', entityId, title, content: description/attributes summary }
- On ObjectUpdatedEvent: update existing SearchIndex entry
- On ObjectDeletedEvent: RemoveSearchIndexUseCase deletes SearchIndex entry

**Status:** Handler not yet registered. *(OPEN — FR-OUTBOX-008)*

### 12.5 lumora.capability.favorite

**Purpose:** Allow users to pin or favorite any Universal Object.  
**Execution Policy:** SEQUENTIAL  
**Failure Policy:** FAIL_FAST  
**System Required:** No  
**Supports Undo:** Yes (un-favorite is the inverse)  
**Applies To:** All object types

**Behaviour when activated:**
- PATCH /workspaces/:id/objects/:id { isFavorite: true } — sets isFavorite = true
- PATCH /workspaces/:id/objects/:id { isFavorite: false } — removes from favorites
- PATCH /workspaces/:id/objects/:id { pinnedAt: ISO_STRING } — pins to top of list
- PATCH /workspaces/:id/objects/:id { pinnedAt: null } — unpins

**This capability is the simplest to surface in product UI — it requires only a PATCH call on the existing object endpoint.**

---

## SRS SECTION 13 — COMPLETE DATABASE MIGRATION HISTORY

### Migration 1: `20260805110125_foundation_v1`
Establishes full schema foundation: User, Workspace, WorkspaceMember, WorkspaceInvitation, Role, Permission, RolePermission, Device, Session, OAuthAccount, Space, Collection, CollectionItem, Reminder, ReminderExecution, Notification, Timeline, SearchIndex, FileAsset, AuditLog, Event, Template, InstalledTemplate, Object, all enums, all base indexes.

### Migration 2: `20260808_phase_e_persistence_foundation`
CAS hardening: adds raw SQL UPDATE...RETURNING * pattern support. Adds OutboxMessage table with all retry/idempotency columns (id, workspaceId, aggregateId, eventType, payload, payloadSchemaVersion, status, retryCount, maxRetries, nextAttemptAt, idempotencyKey, lastError, createdAt, processedAt). Adds object-specific composite indexes for workspace-scoped queries.

### Migration 3: `20260809_phase_f_search_attachment_workspace_isolation`
Adds `workspaceId UUID nullable` to SearchIndex table. Adds `workspaceId UUID nullable` to FileAsset table. Adds composite index `(workspaceId, entity)` on SearchIndex. Adds index `(workspaceId)` on FileAsset. Deletes all SearchIndex rows where workspaceId IS NULL (orphaned derived projections — safe to delete, will be rebuilt).

### Future Migrations (planned but not yet created)

| Migration | When | Content |
|---|---|---|
| Session token hashing | Before public launch | No schema change — only application semantics change. refreshToken column remains TEXT but stores SHA-256 hash. |
| Timeline entityId index | When Object Detail timeline view is built | Already has `objectId` index — may need composite `(workspaceId, objectId)` |
| Cursor pagination index | When pagination added to controller | `(workspaceId, updatedAt DESC, id)` already exists |
| Full-text search | When ILIKE performance becomes bottleneck | `CREATE EXTENSION pg_trgm; CREATE INDEX USING GIN` on SearchIndex.title + content |
| FileAsset objectId FK | When formal attachment linking is built | `ALTER TABLE "FileAsset" ADD COLUMN "objectId" UUID REFERENCES "Object"(id)` |
| Relationship table | When Relationships feature is designed | New `CREATE TABLE "Relationship"` |
| Milestone table | When Gamification is designed | New `CREATE TABLE "Milestone"` |
| Smart collection query | When dynamic collections are built | `ALTER TABLE "Collection" ADD COLUMN "queryRules" JSONB` |

---

## SRS SECTION 14 — DESIGN SYSTEM SPECIFICATION

### 14.1 Token Architecture

All visual values are derived from design tokens. Zero hardcoded values in any component.

**Color token hierarchy:**
```
Raw palette (e.g. blue.500 = #3B82F6)
    ↓
Semantic token (e.g. primary.default = blue.500 in light, blue.400 in dark)
    ↓
Component token (e.g. button.primary.background = primary.default)
    ↓
Component (Button reads button.primary.background via useTheme())
```

**Theme modes:** light | dark | amoled | highContrast | system  
**Current palettes:** All four themes have complete generated token files in `packages/theme/src/generated/`

### 14.2 Spacing Scale

| Token | Value | Use |
|---|---|---|
| xs | 4px | Tight spacing, icon padding |
| sm | 8px | Compact padding |
| md | 16px | Standard padding |
| lg | 24px | Section spacing |
| xl | 32px | Large section spacing |
| 2xl | 48px | Screen-level padding |
| 3xl | 64px | Hero spacing |

### 14.3 Typography Scale

| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| Heading 1 | 32px | 700 | 40px | Screen titles |
| Heading 2 | 24px | 700 | 32px | Section titles |
| Heading 3 | 20px | 600 | 28px | Card titles |
| Heading 4 | 17px | 600 | 24px | Sub-section titles |
| Body Large | 17px | 400 | 26px | Primary body text |
| Body Medium | 15px | 400 | 22px | Standard body |
| Body Small | 13px | 400 | 20px | Secondary body |
| Caption | 12px | 400 | 18px | Labels, meta |
| Overline | 11px | 600 | 16px | Category labels, uppercase |
| Label | 13px | 500 | 18px | Form labels |

### 14.4 Radii

| Token | Value | Use |
|---|---|---|
| sm | 4px | Badges, chips |
| md | 8px | Inputs, small cards |
| lg | 12px | Standard cards |
| xl | 16px | Sheets, modals |
| full | 9999px | Pills, avatar |

### 14.5 Motion Configs (MotionEngine)

| Config | Type | Use |
|---|---|---|
| press | Spring (mass:1, damping:20, stiffness:300) | Button press feedback — scale 0.96 |
| fadeIn | Timing (200ms, ease-out) | Component appear |
| cardLift | Spring (mass:1, damping:15, stiffness:200) | Card hover/press elevation |
| sheet | Spring (mass:1.2, damping:22, stiffness:250) | Bottom sheet open/close |
| dialog | Spring (mass:1, damping:18, stiffness:280) | Modal enter/exit |
| listItem | Timing (150ms, ease-out, staggered 30ms per item) | List item appear |
| tabSwitch | Spring (mass:1, damping:25, stiffness:320) | Tab navigation |
| skeleton | Loop timing (1200ms, ease-in-out) | Loading skeleton pulse |

**Reduced motion rule:** Every animated component MUST check `useReducedMotion()`. When true, use instant transitions (duration: 0) instead of spring/timing animations.

### 14.6 Icon Registry (Semantic Names)

Icons are accessed by semantic name — never by library-specific name directly.

| Category | Examples |
|---|---|
| Navigation | nav.home, nav.search, nav.timeline, nav.settings |
| Actions | action.add, action.edit, action.delete, action.archive, action.share |
| Object types | object.note, object.task, object.medicine, object.grocery, object.plant, object.pet, object.vehicle, object.bill, object.habit, object.event, object.document, object.subscription |
| Status | status.active, status.archived, status.deleted, status.completed |
| Feedback | feedback.success, feedback.error, feedback.warning, feedback.info |
| Misc | misc.favorite, misc.pin, misc.attachment, misc.reminder, misc.timeline |

Swapping the entire icon library requires updating `Icon.registry.ts` mappings only. Zero component changes.

---

## SRS SECTION 15 — USER STORIES WITH ACCEPTANCE CRITERIA

### 15.1 Authentication

**US-001: Register**  
As a new user, I want to create a Lumora account so that I can start managing my life.  
AC: Given valid email + username + password → account created, personal workspace created, I am logged in.  
AC: Given duplicate email → clear error "Email already registered."  
AC: Given duplicate username → clear error "Username taken."  
AC: Given > 10 registration attempts per hour → 429 with retry-after time shown.

**US-002: Login**  
As a returning user, I want to log in so that I can access my objects.  
AC: Given correct credentials → logged in, navigated to Home.  
AC: Given wrong credentials → "Wrong email or password." No indication of which is wrong.  
AC: Given > 20 attempts in 15 min → "Too many attempts. Try in X minutes."

**US-003: Stay logged in**  
As a user, I want my session to persist so I don't have to log in every time I open the app.  
AC: Close and reopen app → still logged in (tokens in SecureStore).  
AC: Access token expires → invisible token refresh, no login screen shown.  
AC: Refresh token expires → navigate to login with "Session expired" message.

### 15.2 Universal Object

**US-004: Quick Add Note**  
As a user, I want to capture a thought in under 2 seconds so that I never lose an idea.  
AC: Tap "+" → QuickAddSheet opens in < 200ms.  
AC: Select NOTE → enter title → tap Add → object created → appears on Home within 2 seconds.  
AC: If title is empty → "Title is required" inline error, submission blocked.

**US-005: Quick Add Task**  
As a user, I want to create a task quickly so that I can track what needs doing.  
AC: Select TASK → enter title → Add → TASK appears on Home.  
AC: TASK has correct typeKey and empty attributes.

**US-006: View Object Detail**  
As a user, I want to see all details of an object so that I can read and understand it fully.  
AC: Tap ObjectCard → Object Detail screen opens.  
AC: All fields from attributes rendered by FieldRegistry in view mode.  
AC: Header shows: type icon, title, typeKey label, creation date.

**US-007: Edit Object**  
As a user, I want to edit an object's fields so that I can keep it up to date.  
AC: Tap Edit → form fields become editable inputs.  
AC: Change a field → tap Save → change persisted, view mode returns.  
AC: Edit from another device simultaneously → 409 REVISION_CONFLICT → ConflictDialog shown.  
AC: Tap "Reload" in ConflictDialog → latest version loaded, local edits discarded.

**US-008: Archive Object**  
As a user, I want to archive objects I'm done with so that they don't clutter my active list.  
AC: Object Detail → Archive action → confirm → status = ARCHIVED → object disappears from active list.  
AC: Archived object visible in list when filter status=ARCHIVED.  
AC: Archived object can be restored (ARCHIVED → ACTIVE).

**US-009: Delete Object**  
As a user, I want to delete objects I no longer need so that my workspace stays clean.  
AC: Delete action → confirm → status = DELETED → object hidden from all lists.  
AC: DELETED objects cannot be restored through UI.

### 15.3 Search

**US-010: Search for an object**  
As a user, I want to find any object by searching for keywords so that I can locate things quickly.  
AC: Type query → results appear within 500ms.  
AC: Results only from MY workspace — never from other workspaces.  
AC: No results → EmptyState: "No results for 'X'."

### 15.4 Timeline

**US-011: View my activity**  
As a user, I want to see a history of what I've done so that I can review my actions.  
AC: Timeline shows records ordered by most recent first.  
AC: Each record shows: action type, object title/type, relative timestamp.  
AC: Timeline records appear automatically when I create, edit, or delete objects. *(requires Outbox handler)*

### 15.5 Personalization

**US-012: Change theme**  
As a user, I want to choose between light, dark, and AMOLED themes so that the app looks the way I want.  
AC: Settings → Theme → select Dark → app switches to dark theme immediately.  
AC: Preference persisted → reopen app → dark theme applied automatically.  
AC: Theme change requires zero backend schema changes.

### 15.6 Medicine (Future — requires MEDICINE type registration)

**US-013: Add a medicine**  
As a user managing my health, I want to track my medicines so that I never miss a dose.  
AC: Quick Add → select MEDICINE → enter name (title) + dosage + frequency → Add → MEDICINE object created.  
AC: MEDICINE object appears in object list with medicine icon.  
AC: Set reminder → reminder created linked to this object.  
AC: At reminder time → push notification "Take Aspirin 500mg now."

### 15.7 Grocery (Future)

**US-014: Add a grocery item**  
As a user, I want to add items to a grocery list so that I don't forget what to buy.  
AC: Quick Add → GROCERY → enter item name → Add → GROCERY object created.  
AC: GROCERY object has isPurchased: false by default.  
AC: Tap "Mark purchased" → isPurchased: true → item visually struck through.  
AC: Grocery list stays lightweight — no inventory management, no quantities required.

---

## SRS SECTION 16 — PRODUCT EXPERIENCE PRINCIPLES

These principles are extracted from the UI Blueprint and govern all product decisions.

### 16.1 One Coherent Operating Environment

Lumora must feel like one product — not a collection of themed mini-apps. A Medicine screen and a Task screen use the same visual language, the same card structure, and the same interaction patterns. The typeKey changes the fields. The experience does not change.

**Test:** If a new engineer sees the Grocery screen and the Plant screen side by side, they should immediately recognise them as the same product — not as two different apps stitched together.

### 16.2 Calm Over Stimulating

Visual density is controlled. Animations are purposeful, not decorative. The product does not shout for attention. Motion draws the eye to what matters — not to what is prettiest.

**Anti-pattern:** A Home screen where every card has a different color, a different border, a different icon style, and a different animation. That is a wall of noise.

**Correct pattern:** Cards that are visually calm, use the same surface treatment, and differentiate by icon + typeKey label alone.

### 16.3 Zero-Delay Entry

Creating any object should take under 2 seconds. The Quick Add sheet should open instantly. The title input should be auto-focused. The Add button should respond immediately. Optimistic updates prevent visible lag.

### 16.4 Progressive Disclosure

Show the minimum necessary information first. Expand on demand. Object cards show: icon, title, type, relative time. Object detail shows: full fields. Advanced settings are buried under "Show more." Never show everything at once.

### 16.5 The Product Never Requires Separate Apps Per Type

A user managing medicines, plants, pets, vehicles, bills, and subscriptions in Lumora should feel like they are using one product that understands all of those domains — not six different apps installed side by side.

This is the entire point of the Universal Object architecture from a product perspective.

---

## SRS SECTION 17 — WHAT IS INTENTIONALLY NOT IN SCOPE

The following features are explicitly deferred. They are not in scope for the initial product launch. Including them now would add complexity without adding value.

| Feature | Reason for Deferral |
|---|---|
| Offline / sync engine | Build the online product first — architecture is compatible |
| Gamification (XP, leaderboards) | Requires domain design — deferred post-launch |
| Relationships between objects | Requires domain design — complex graph queries |
| Full-text search (tsvector) | ILIKE is sufficient for early scale |
| Multi-workspace UI (switching) | Single workspace is fine for launch |
| Collaboration (shared editing) | Complex — CRDTs or operational transforms needed |
| Push notifications infrastructure | APNS/FCM setup needed — deferred to Reminders phase |
| Web layout / desktop layout | Mobile first — web comes after |
| Enterprise compliance (GDPR export, SOC2) | Post-launch requirement |
| Distributed infrastructure (Kafka, K8s) | Not needed before 100k objects |
| AI assistant or AI-driven object creation | Post-launch — requires usage data first |
| Custom object types (user-defined schemas) | Requires SchemaRegistry persistence — future phase |
| Household / family sharing | Workspace membership covers this — specific sharing UI deferred |
| 3D visual language | Deferred to a later design pass |
| Analytics dashboard | Post-launch |

---

## SRS SECTION 18 — SUMMARY REQUIREMENTS COUNTS

| Category | Total | Implemented | Open |
|---|---|---|---|
| Auth requirements | 17 | 16 | 1 (session token hashing) |
| Workspace requirements | 6 | 6 | 0 |
| Universal Object core | 18 | 16 | 2 (pagination, Outbox events) |
| Object type specifications | 13 types | 6 registered | 7 to register |
| Quick Add requirements | 5 | 4 | 1 (auto-appear on Home) |
| Search requirements | 6 | 5 | 1 (auto-indexing) |
| Timeline requirements | 7 | 4 | 3 (entityId filter, pagination, auto-populate) |
| Reminder requirements | 5 | 5 | 0 |
| Space requirements | 4 | 4 | 0 |
| Collection requirements | 3 | 2 | 1 (smart query evaluator) |
| Media requirements | 7 | 6 | 1 (signed URL implementation) |
| Personalization requirements | 4 | 4 | 0 |
| Outbox requirements | 10 | 7 | 3 (event handlers) |
| Capability requirements | 6 | 3 | 3 (handlers, runtime wiring) |
| **TOTAL** | **111** | **88** | **23** |

---

*End of SRS — Version 1.0 — 2026-08-09*  
*This SRS is appended to LUMORA_TRUTH_REPORT.md and forms part of the same authoritative document.*  
*Update requirements using numbered FR/NFR identifiers. Mark open items with (OPEN) and a ticket reference once tracked.*
