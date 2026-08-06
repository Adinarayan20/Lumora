# Lumora — AI-Ready Life Operating System

Lumora is built around a **Universal Object Model** (Everything is an Object: Reminder, Note, Task, Event, Habit, Document, Collection) with deterministic business logic and layered architecture (`UI → Application → Domain → Infrastructure`).

---

## Workspace Setup Instructions

### Prerequisites
* **Node.js**: `v22.x` or higher
* **pnpm**: `v11.x` (`corepack enable pnpm`)
* **PostgreSQL**: `v16.x` or higher

### Fresh Clone Setup & Verification

Execute the following commands from the repository root:

```bash
# 1. Install dependencies across all workspace packages
pnpm install

# 2. Generate Prisma Client bindings
pnpm prisma generate

# 3. Build all workspace packages and apps
pnpm turbo build

# 4. Run all workspace unit tests
pnpm turbo test
```

### Approved Native Dependencies
In `pnpm-workspace.yaml`, native build scripts are configured under `allowBuilds` for seamless installation:
- `@firebase/util`
- `@prisma/client`
- `@prisma/engines`
- `@scarf/scarf`
- `@swc/core`
- `bcrypt`
- `esbuild`
- `msgpackr-extract`
- `prisma`
- `protobufjs`

---

## Core Monorepo Packages & Apps

- `packages/shared`: Shared domain contracts, primitives, validation errors, catalog registry, and event schemas.
- `apps/backend`: NestJS backend application with Prisma PostgreSQL persistence, soft-delete extensions, and Transactional Outbox workers.
- `apps/admin`: Next.js web application.
- `apps/mobile`: Expo / React Native mobile application.
