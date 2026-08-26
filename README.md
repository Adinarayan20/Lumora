# Lumora — Personal Life Operating System

Lumora is a Personal Life Operating System built around a **Universal Object Model**. Rather than providing separate applications for separate categories of life, Lumora represents everything — tasks, notes, habits, events, plants, medicines, groceries, bills, pets, vehicles, documents, subscriptions, custom objects, and more — as first-class objects on a shared platform foundation.

Objects are supported by a shared platform capability model, allowing common capabilities such as identity, timeline, reminders, relationships, attachments, organization, and search to be used consistently where applicable. Which capabilities a given object type meaningfully uses is a product decision, not an engineering constraint.

The platform is designed to grow from personal use into family and future organizational contexts using the same underlying architecture, without rebuilding the core for each new scope.

---

## Current Status

Lumora is transitioning from foundational platform reconciliation into implementation of the product against established product, domain, architecture, security, and engineering contracts.

The backend platform, domain model, and infrastructure layer are the current implementation focus. Mobile (Expo/React Native), Web (Next.js), and Admin Panel applications are in early or scaffold state.

---

## Repository Structure

```
apps/
├── backend/        # NestJS API — platform authority, domain, infrastructure
│   └── prisma/     # Prisma schema, migrations, and seed
├── mobile/         # Expo / React Native client
└── admin/          # Next.js admin panel

packages/
├── shared/         # Shared domain types, catalog registry, utilities
├── ui/             # Shared UI component primitives
└── theme/          # Design system tokens

docs/               # Authoritative documentation (00–04)
.agents/            # Engineering constitution (AGENTS.md)
```

---

## Documentation

| Document | Purpose |
|---|---|
| [`docs/00_DOCUMENTATION_INDEX.md`](docs/00_DOCUMENTATION_INDEX.md) | Documentation authority, governance, and navigation |
| [`docs/01_PRODUCT_VISION.md`](docs/01_PRODUCT_VISION.md) | Product vision and direction |
| [`docs/02_DOMAIN_BUSINESS_LOGIC.md`](docs/02_DOMAIN_BUSINESS_LOGIC.md) | Domain rules and business behavior |
| [`docs/03_SYSTEM_ARCHITECTURE.md`](docs/03_SYSTEM_ARCHITECTURE.md) | System architecture and component boundaries |
| [`docs/04_DATA_SECURITY_RELIABILITY.md`](docs/04_DATA_SECURITY_RELIABILITY.md) | Data security, reliability, and failure contracts |

These five documents are the authoritative source of truth for product, domain, architecture, and security decisions. README.md is a navigation and orientation document — it does not supersede them.

---

## Engineering Constitution

[`.agents/AGENTS.md`](.agents/AGENTS.md) contains the durable engineering rules governing implementation of Lumora. All contributors and AI coding tools operating in this repository are expected to follow it.

---

## Multi-Client Architecture

Lumora is designed around a single backend that serves multiple clients — Mobile, Web, Admin Panel, Tablet, and future clients — through shared API contracts. All clients consume the same server-side business authority. No client independently implements domain rules, authorization, or core business logic. Clients differ in presentation, interaction patterns, and platform integration; the backend domain and application layer is shared across all of them.

No client in this repository should be considered production-complete at this stage.

---

## Engineering Principles

- **Universal Object Model** — every object type is built on the same shared platform foundation, never a separate application or engine per category.
- **No category-specific duplication** — one implementation supports every object type; behavior that varies by product category is driven by configuration or catalog data, not hardcoded per-category code.
- **Server-side authorization, always** — authorization is evaluated and enforced on the server before data crosses the API boundary.
- **No direct client/database access** — clients never access the database directly; data is authorized, projected, and scoped before it leaves the server.
- **Minimal API responses** — responses contain only the fields a use case requires.
- **Shared business authority** — all clients (Mobile, Web, Admin) share the same backend domain and application layer.
- **Feature isolation** — a failing feature, integration, or background job must not crash unrelated functionality.
- **Idempotent background operations** — jobs and retryable client mutations tolerate at-least-once delivery without duplicate side effects.
- **Testing before completion** — code is not considered complete because it compiles; tests appropriate to what changed are required.
- **Extend, don't rebuild** — new product capabilities extend the existing universal platform foundation rather than introducing separate implementations for individual categories.

---

## Security

Client applications do not access the database directly. Data access is authorized and scoped on the server before data crosses the API boundary.

See [`docs/04_DATA_SECURITY_RELIABILITY.md`](docs/04_DATA_SECURITY_RELIABILITY.md) for the complete security and data contract.

---

## Getting Started

**Prerequisites:**

- **Node.js 22** (specified in `.nvmrc`)
- **pnpm 11.18.0** (specified in `package.json` → `packageManager`)

**Install dependencies:**

```bash
pnpm install
```

**Available workspace scripts (from root):**

| Script | Description |
|---|---|
| `pnpm run dev` | Start all apps in development mode (via Turborepo) |
| `pnpm run dev:mobile` | Start mobile app only |
| `pnpm run dev:admin` | Start admin app only |
| `pnpm run build` | Build all packages and apps |
| `pnpm run lint` | Run ESLint/Prettier across all packages |
| `pnpm run typecheck` | TypeScript type-check across all packages |
| `pnpm run test` | Run tests across all packages |
| `pnpm run prisma:generate` | Regenerate the Prisma client |

**Backend-specific scripts (from `apps/backend/`):**

| Script | Description |
|---|---|
| `pnpm run start:dev` | Start the NestJS API in watch mode |
| `pnpm run test` | Run unit tests with Vitest |
| `pnpm run test:integration` | Run integration tests |
| `pnpm run prisma:generate` | Regenerate Prisma client |
| `pnpm run prisma:validate` | Validate the Prisma schema |

**Running the backend** requires external services. Copy `apps/backend/.env.example` to `apps/backend/.env` and configure:

| Variable | Purpose | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Required |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Token signing keys (min 32 chars) | ✅ Required |
| `REDIS_URL` | Redis connection string | ✅ Required |
| OAuth, S3/R2, Observability vars | Optional integrations | Optional |

Lint, typecheck, and unit tests do not require running external services.

---

## Tech Stack

| Layer | Technology |
|---|---|
| API / Backend | NestJS, TypeScript, Prisma (PostgreSQL) |
| Mobile | Expo, React Native, TypeScript |
| Admin Panel | Next.js, TypeScript |
| Shared packages | `@lumora/shared`, `@lumora/ui`, `@lumora/theme` |
| Background jobs | BullMQ (Redis) |
| Caching | Redis (ioredis) |
| Observability | OpenTelemetry, Prometheus (`prom-client`) |
| Build system | Turborepo, pnpm workspaces |
| Testing | Vitest (unit and integration) |
