# Lumora Technical Debt & Deferred Backlog Registry

> **STATUS**: Authoritative Technical Debt Registry
> **LAST RECONCILED**: 2026-08-10 (HEAD `92fb2fe`)

---

## 1. Active Technical Debt Registry (TD-001 to TD-038)

### Active Open / Deferred Debt

```markdown
### TD-026: Non-Atomic Update Path in ObjectsService
- **ID**: `TD-026`
- **Title**: `ObjectsService.updateObject()` uses non-atomic TOCTOU revision check
- **Description**: `updateObject` executes `findFirst` to read revision, then calls `updateMany`. This leaves a race window where concurrent updates can overwrite revision changes without detection.
- **Evidence**: `apps/backend/src/modules/objects/objects.service.ts` (Lines 178-240)
- **Affected Layer**: Application Service / Objects Module
- **Severity**: `MEDIUM`
- **Priority**: `P1`
- **Status**: `OPEN`
- **Blocking**: `NO` (for dev), `YES` (for concurrent production scale)
- **Owner**: Backend Team
- **Recommended Action**: Refactor `UpdateObjectUseCase` to invoke `ObjectAggregateRepositoryAdapter.save()` (Tier 2 CAS) directly.

### TD-029: CapabilityExecutor Pipeline Bypassed
- **ID**: `TD-029`
- **Title**: `CapabilityExecutor.registerHandler()` is never called in production
- **Description**: Capability descriptors are registered at boot, but execution handlers are never registered. Side effects currently execute via `OutboxEventHandlerService` directly.
- **Evidence**: `apps/backend/src/domain/capabilities/universal-capability-engine.ts`
- **Affected Layer**: Domain / Capability Engine
- **Severity**: `HIGH`
- **Priority**: `P2`
- **Status**: `OPEN`
- **Blocking**: `NO`
- **Recommended Action**: Register production handlers for capability lifecycle execution.

### TD-031: Missing PermissionsGuard on Search Endpoint
- **ID**: `TD-031`
- **Title**: `SearchController` GET endpoint missing `@UseGuards(PermissionsGuard)`
- **Description**: `GET /workspaces/:workspaceId/search` is decorated with `JwtAuthGuard` but lacks `PermissionsGuard`, allowing workspace probing via response status codes.
- **Evidence**: `apps/backend/src/modules/search/search.controller.ts` (Line 28)
- **Affected Layer**: API Controller / Security
- **Severity**: `LOW`
- **Priority**: `P0`
- **Status**: `OPEN`
- **Blocking**: `YES` (before production launch)
- **Recommended Action**: Add `@UseGuards(PermissionsGuard)` and `@RequirePermissions(Permissions.Search.Read)`.

### TD-032: Missing CORS Configuration
- **ID**: `TD-032`
- **Title**: CORS is not configured in NestJS `main.ts`
- **Description**: `main.ts` lacks `app.enableCors()`, blocking web client cross-origin requests.
- **Evidence**: `apps/backend/src/main.ts`
- **Affected Layer**: Infrastructure / Transport
- **Severity**: `MEDIUM`
- **Priority**: `P0`
- **Status**: `OPEN`
- **Blocking**: `YES` (for web clients)
- **Recommended Action**: Add `app.enableCors({ origin: true, credentials: true })`.

### TD-033: Zero Real Database Tests Running in CI
- **ID**: `TD-033`
- **Title**: CI workflow lacks PostgreSQL service container
- **Description**: All 85 passing tests run against `vi.fn()` mocks. `POSTGRES_INTEGRATION_TEST=true` is never set in `.github/workflows/ci.yml`.
- **Evidence**: `.github/workflows/ci.yml`
- **Affected Layer**: CI/CD / Testing
- **Severity**: `HIGH`
- **Priority**: `P1`
- **Status**: `OPEN`
- **Blocking**: `YES` (for persistence confidence)
- **Recommended Action**: Add `postgres:16-alpine` service container to `ci.yml` and enable real PostgreSQL suite execution.
```

---

## 2. Resolved Technical Debt Summary (TD-014, TD-016, TD-017, TD-018, TD-021, TD-022, TD-023, TD-025, TD-027)

- `TD-014` (Timeline Schema v2): **RESOLVED**
- `TD-016` (Exception Filter): **RESOLVED**
- `TD-017` (Auth CQRS Monadic Result): **RESOLVED**
- `TD-018` (Repository Rehydration): **RESOLVED**
- `TD-021` (FieldRegistry): **RESOLVED** (`packages/ui`)
- `TD-022` (BlockRegistry): **RESOLVED** (`packages/ui`)
- `TD-023` (Universal Relationship Engine): **RESOLVED** (`Relationship` table + API)
- `TD-025` (Tier 3 Repository Removal): **RESOLVED** (Tier 3 file deleted, ADR-016 complete)
- `TD-027` (Session Token Hashing): **RESOLVED** (SHA-256 hashing in `SessionRepository`)
