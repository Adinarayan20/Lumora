# Lumora Monorepo Development Boundaries & Team Ownership Laws

**Status**: Authoritative Operational Boundary Policy  
**Effective Date**: 2026-08-09  

---

## 1. Core Ownership Principles

1. **Clear Layer Isolation**: The codebase is strictly partitioned across UI, Application, Domain, Infrastructure, and Database layers.
2. **No Cross-Layer Leakage**: UI components never import Prisma or execute raw SQL. Database migrations never occur for visual edits.
3. **AI Agent Constraints**: Automated coding assistants must follow strict stop-rules to prevent architectural regression.

---

## 2. Team Boundaries & Ownership Rules

### 2.1 FRONTEND TEAM (Mobile, Web, Admin, UI Package, Theme Package)

#### CAN CHANGE:
- Mobile & Web UI screens, navigation flows, tab bars, headers, cards, dynamic layouts.
- Component primitives in `packages/ui` (Buttons, Cards, Modals, Badges, Icons, Inputs).
- Design system tokens in `packages/theme` (Colors, Spacing, Radii, Shadows, Typography).
- Motion physics, spring animations, transitions in `MotionEngine`.
- Haptics, screen reader accessibility labels, responsiveness hooks.
- Presentation view models and DTO client mapping.

#### MUST NOT:
- Import `@prisma/client`, Prisma models, or backend infrastructure files.
- Bypass HTTP / Application APIs to query database tables directly.
- Modify backend repository interfaces to accommodate visual layout changes.
- Alter domain business rules or aggregate invariant checks.

#### REQUIRES REVIEW:
- Changes to shared API response DTOs or transport contracts.

---

### 2.2 BACKEND TEAM (Domain, Application, Modules, Infrastructure)

#### CAN CHANGE:
- Domain aggregates, value objects, domain events, domain exceptions.
- Application use cases, query handlers, command DTOs, response mappers.
- Infrastructure repository adapters (`PrismaObjectRepository`, `PrismaTimelineRepository`).
- NestJS controllers, middleware, guards, filters, modules.
- Outbox workers, background job processing, event consumers.

#### MUST NOT:
- Modify frontend UI primitives or theme tokens to solve backend data issues.
- Expose raw Prisma database models in controller responses or domain interfaces.
- Alter `IObjectRepository` (@lumora/shared) contract without platform review.
- Create per-object-type backend modules or controllers for new object catalog types.

#### REQUIRES ARCHITECTURE APPROVAL:
- Modifying `IObjectRepository` or `IObjectAggregateRepository` interfaces.
- Introducing a new top-level database entity outside Universal Object.

---

### 2.3 DATABASE TEAM (Prisma, PostgreSQL, Migrations, Indexes)

#### CAN CHANGE:
- Prisma schema (`prisma/schema.prisma`), database migrations, indexes, foreign keys.
- SQL query optimization, raw query performance tuning in repositories.
- Database connection pool settings, timeout configurations.

#### MUST NOT:
- Remove workspace isolation indexes (`workspaceId`).
- Alter the core `Object` table structure in ways that break `UniversalObject`.
- Create dedicated tables for specific catalog object types (e.g. `MedicineTable`).

#### REQUIRES ARCHITECTURE APPROVAL:
- Any migration altering existing column types or removing fields (data-loss risk).

---

### 2.4 DESIGN TEAM (Design System, Motion, Visual Assets)

#### CAN CHANGE:
- Design tokens (HSL colors, elevation levels, typography scales).
- Component visual specifications, icon sets, button variants, card styles.
- Motion curves, durations, ambient blurs, glassmorphism parameters.

#### MUST NOT:
- Request database schema changes for visual or aesthetic reasons.

> **GOLDEN RULE**: Design redesign ≠ database redesign.

---

### 2.5 SECURITY TEAM (Auth, Guards, Encryption, RBAC)

#### CAN CHANGE:
- Passport JWT strategies, token verification, session tracking, BCrypt hashing.
- RBAC permissions, permission guards, role definitions.
- Workspace execution context isolation guards.

#### MUST NOT:
- Introduce hardcoded fallback secrets in auth code.
- Commit secret files or keys into git repositories.

---

### 2.6 AI CODING AGENTS (Antigravity, Kiro, Automated Assistants)

#### MUST:
- Inspect existing source code before editing.
- Read `CURRENT_ARCHITECTURE.md`, `DEVELOPMENT_BOUNDARIES.md`, and relevant ADRs.
- Respect the three-tier repository classification (ADR-016).
- Run typecheck (`pnpm run typecheck`) and tests after edits.

#### MUST NOT:
- Invent new repositories when existing platform ports satisfy the requirement.
- Create per-object database models.
- Silently modify historical ADRs or delete existing documentation.
- Invent dummy fallback returns to hide broken code contracts.

#### STOP IMMEDIATELY IF:
1. A change requires breaking `IObjectRepository` contract in `@lumora/shared`.
2. A potential data-loss database migration is detected.
3. Tenant isolation ambiguity (`workspaceId`) is discovered.
4. Hardcoded security credentials or API secrets are exposed.
5. An unhandled architectural conflict between documents and code arises.

---

## 3. Operational Change Matrix

| Requested Change | Primary Responsible Layer | Required Approvals | DB Migration Needed? |
|---|---|---|:---:|
| **Redesign App Home Screen** | Mobile App / UI Package | Design / Frontend | **NO** |
| **Change Button Component Colors** | Theme Package | Design | **NO** |
| **Add New Universal Object Type (e.g., Book)** | JSON Catalog Metadata | Domain Architect | **NO** |
| **Add Attribute to Catalog Schema** | SchemaRegistry | Domain / Backend | **NO** |
| **Add Composite DB Index for Performance** | Prisma Schema | Database / Backend | **YES** |
| **Modify CAS Concurrency Logic** | PrismaObjectRepository | Staff Architect | **NO** |
| **Add New Lifecycle State to Objects** | Domain Aggregate & Prisma | Staff Architect + Security | **YES** |
