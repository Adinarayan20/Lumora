# LUMORA — SOURCE-VERIFIED AUDIT REPORT (PART 1 OF 2)
## Architecture, Persistence, Security & Subsystems
### HEAD: `92fb2fe` — `main` — 2026-08-10

> **AUDIT TYPE**: Read-Only Discovery Pass  
> **Auditor Role**: Senior Staff/Principal Software Architect + Security, Backend, Frontend/Mobile, Database, and Documentation Architect  
> **Evidence Standard**: Primary = Source Code + Schema + Migrations + Tests. Secondary = Documentation.

---

## PART 0 — GIT BASELINE

| Field | Value |
|---|---|
| **Current HEAD** | `92fb2fe` |
| **HEAD commit message** | `fix: resolve ci lint and type safety issues` |
| **Current branch** | `main` |
| **Remote** | `origin → https://github.com/Adinarayan20/Lumora.git` |
| **Working tree** | **CLEAN** — nothing to commit |
| **Branch tracking** | `main` is up-to-date with `origin/main` |

---

## PART 1 — REPOSITORY INVENTORY

```
lumora/
├── apps/
│   ├── backend/     NestJS 11 API server (TypeScript, CommonJS)
│   ├── mobile/      Expo 54 / React Native 0.81 mobile app
│   └── admin/       Next.js 15 admin panel (minimal scaffold)
├── packages/
│   ├── shared/      Cross-platform domain primitives (@lumora/shared)
│   ├── theme/       Design system, tokens, motion, responsive engine (@lumora/theme)
│   └── ui/          React Native UI component library (@lumora/ui)
├── docs/
│   ├── architecture/ Architecture docs + 16 ADRs
│   ├── operations/   DEPLOYMENT_GUIDE, RUNBOOK
│   └── LUMORA_TRUTH_REPORT.md  Prior audit (SHA 8bfdc0f — STALE)
├── .github/workflows/  Single CI workflow (ci.yml)
├── package.json        pnpm workspace root (pnpm 11.18.0 + Turborepo 2.10.8)
└── lumora_icon_platform_constitution.md  (ROOT — ORPHAN — move to docs/design/)
```

---

## PART 2 — STATUS LEGEND

| Status | Meaning |
|---|---|
| `IMPLEMENTED` | Exists, wired, tested, executes in production paths |
| `PARTIALLY_IMPLEMENTED` | Exists but missing a key behavior or consumer |
| `WIRED_BUT_INCOMPLETE` | Module wired into DI, but handler/logic absent |
| `REGISTERED_ONLY` | Registered at boot, pipeline never activated |
| `APPROVED_NOT_IMPLEMENTED` | In ADR/roadmap; code not written |
| `DEFERRED` | Explicitly deferred; tracked in TECH_DEBT.md |
| `NOT_STARTED` | Not mentioned in any planning document, no code |

---

## PART 3 — UNIVERSAL OBJECT ARCHITECTURE

### 3.1 Data Model

**FACT**: One `Object` table in PostgreSQL. Every object type shares this table.

```
Object row:
  id              UUID PK
  workspaceId     UUID FK → Workspace  [TENANT BOUNDARY]
  spaceId         UUID FK? → Space
  createdById     UUID FK → User
  updatedById     UUID FK? → User
  objectKey       String (workspace-unique)
  typeKey         String ('NOTE', 'TASK', 'REMINDER', 'EVENT', or any custom key)
  title           String
  description     String?
  icon/emoji/cover/color  String?
  pinnedAt        DateTime?
  isFavorite      Boolean
  status          ACTIVE | ARCHIVED | DELETED
  schemaVersion   Int (default 1)
  systemData      Json?
  attributes      Json?   <- all type-specific fields live here
  revision        Int     <- CAS counter
  archivedAt/deletedAt  DateTime?
  createdAt/updatedAt   DateTime
```

> **FACT**: `typeKey` is a `String` column (not a constrained Prisma enum) — arbitrary future type keys can be stored without migrations.

**Status**: `IMPLEMENTED` — universal schema is correct and future-proof.

### 3.2 Repository Architecture (Three-Tier — Post ADR-016)

| Tier | Interface | Implementation | Consumer | Status |
|---|---|---|---|---|
| **Tier 1** | `IObjectRepository` (`@lumora/shared`) | `PrismaObjectRepository` | `ObjectsService` (update/delete/list paths) | `IMPLEMENTED` |
| **Tier 2** | `IObjectAggregateRepository` (domain) | `ObjectAggregateRepositoryAdapter` | `CreateObjectUseCase`, `UpdateObjectUseCase`, `DeleteObjectUseCase`, query handlers | `IMPLEMENTED` |
| **Tier 3** | Legacy raw `ObjectRepository` | **DELETED** | None | `DELETED` |

### 3.3 Object Create Flow (VERIFIED ATOMIC)

```
POST /workspaces/:workspaceId/objects
  → CreateObjectUseCase.execute()
      → ObjectAggregateRepositoryFactory(workspaceId, userId)
          → new WorkspaceExecutionContext(workspaceId, userId)
          → new ObjectAggregateRepositoryAdapter(prisma, context)
      → ObjectAggregate.create(props)    [emits ObjectCreatedEvent]
      → aggregate.pullDomainEvents()     [detaches events from aggregate]
      → unitOfWork.execute(tx => {
            objectRepository.save(aggregate)           [Object INSERT]
            outboxPublisher.stageEvents(events, tx)    [OutboxMessage UPSERT]
        })                                             [ATOMIC TRANSACTION]
      → ObjectResponseMapper.toResponseDto(aggregate)
```

**Status**: `IMPLEMENTED` — atomic object + outbox insert confirmed.

### 3.4 Divergent Update Path (TOCTOU Gap)

`ObjectsController` delegates `updateObject` to `ObjectsService.updateObject()`, which performs `findFirst` followed by `updateMany`. Revision checking occurs at the application level rather than inside the SQL `WHERE` clause. Replaced by Tier 2 atomic CAS path in P1 remediation.

### 3.5 LumoraObjectRuntime

- **File**: `apps/backend/src/domain/runtime/lumora-object-runtime.ts` — fully implemented domain class
- **Consumer**: **NONE** in production use cases
- **Status**: `WIRED_BUT_INCOMPLETE` — architecturally correct, operationally inactive

---

## PART 4 — PERSISTENCE, CAS & MULTITENANCY

All mutations in `PrismaObjectRepository` enforce atomic Compare-And-Swap using PostgreSQL parameterized raw SQL `UPDATE ... WHERE revision = expectedVersion RETURNING *`.
Tenant scope is immutable within `WorkspaceExecutionContext(workspaceId, userId)`. Every repository operation implicitly appends `WHERE "workspaceId" = context.workspaceId`.

---

## PART 5 — TRANSACTIONAL OUTBOX PATTERN

- **Stage**: Events staged in `OutboxMessage` table within `PrismaUnitOfWork.$transaction()`.
- **Worker**: `OutboxWorker` polls pending messages using `FOR UPDATE SKIP LOCKED` and routes to `OutboxEventHandlerService`.
- **Projections**: `OutboxEventHandlerService` projects `CREATED`, `UPDATED`, `DELETED`, `ARCHIVED`, `RESTORED` domain events to Timeline and Search.
