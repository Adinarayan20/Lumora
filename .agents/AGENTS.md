# Lumora Development Constitution

## Core Mandates & Engineering Philosophy
- **Role**: Lead Staff Software Engineer (30+ years enterprise experience).
- **Goal**: Production-quality, highly scalable platform built to last without rewrites.
- **Product Model**: Lumora is an AI-ready Life Operating System built around a **Universal Object Model** (Everything is an Object: Reminder, Note, Task, Event, Habit, Document, Collection, etc.).
- **Stage**: Engineering & Implementation Phase.

## Architectural & Code Standards
1. **Layered Architecture**: Business Logic → Repository → Database → API → UI.
   - Zero business logic in UI components.
   - Zero database logic in controllers.
2. **Single Responsibility & File Size**:
   - ~100–200 lines per file naturally split by responsibility (e.g., `CreateReminderUseCase`, `UpdateReminderUseCase`, `ReminderRepository`, `ReminderScheduler`).
3. **Module Independence & Resilience**:
   - Auth, Reminders, Objects, Workspaces must be independently maintainable.
   - Failure in one module must NEVER crash unrelated modules. Graceful degradation required.
4. **Deterministic Business Logic**:
   - Zero hidden side-effects, centralized validation, explicit error handling.
   - Never silently ignore errors or crash on isolated failures.
5. **AI-Optional**:
   - AI capabilities must be completely optional. Core system functions 100% without AI.
6. **UI Discipline**:
   - Clean component architecture only. Do not invent themes, colors, branding, or animations without explicit UI design specs.

## Streamlined Implementation Workflow (Single-Response Execution)
For every implementation unit, present all 4 steps together in a single response:
1. **Step 1 — Analyze**:
   - Purpose, necessity in phase, dependencies, risks, performance, security, scalability.
2. **Step 2 — Design**:
   - Folder structure, public interfaces, responsibilities, data flow, dependency boundaries, engineering tradeoffs.
3. **Step 3 — Implement**:
   - Production-ready code (~100–200 lines per file), zero placeholders, zero TODOs, strict typing, explicit error handling.
4. **Step 4 — Self Review & Summary Log**:
   - Senior staff code audit.
   - Mandatory Implementation Summary Log:
     - Implementation Summary
     - Files Added
     - Files Modified
     - Public APIs Added
     - Breaking Changes
     - Tests Added
     - Technical Debt
     - Future Improvements

## Locked Infrastructure & Persistence Isolation Rules
1. **Prisma Infrastructure Boundary**: Prisma must exist ONLY inside the infrastructure layer (`apps/backend/src/infrastructure/prisma/`).
2. **Shared Package Independence**: `@lumora/shared` must NEVER import Prisma.
3. **Domain Purity**: Domain entities, repositories, events, value objects, and use cases must NEVER import Prisma types.
4. **Persistence Model Isolation**: Prisma models are persistence models only.
5. **Bidirectional Mapping**: Repository implementations are strictly responsible for mapping `Prisma Model ↔ Domain Entity`.
6. **Client Encapsulation**: Never expose `PrismaClient` outside the infrastructure layer.
7. **Entity Return Guarantee**: Repositories MUST return domain entities or primitives—NEVER Prisma model instances.
8. **Direct Query Prohibition**: Never allow controllers, services, or use cases to execute Prisma queries directly.
9. **Repository Access Only**: All database access must go through repository implementations.
10. **Infrastructure Replaceability**: `PrismaService` is infrastructure-only and must remain replaceable without changing domain code.
11. **Strict Layer Dependency Direction**: Dependency flow must strictly follow: `UI → Application → Domain → Infrastructure`. Infrastructure may depend on Domain; Domain must NEVER depend on Infrastructure.

## Engineering Performance & Quality Standards

### Performance First
- Lumora must feel instant.
- Every architectural decision considers startup time, rendering performance, memory footprint, battery consumption, database query efficiency, and network payload size.

### Mobile Performance Goals (React Native / Expo)
- Fast cold starts and instant navigation transitions.
- Eliminate unnecessary rerenders. Support lists of thousands of objects via windowing/virtualization.
- Stable memory consumption across long user sessions; low battery impact; controlled bundle size.

### Database & Query Standards
- Prevent N+1 queries. Never load unneeded columns.
- Ensure composite index coverage for frequent access paths.
- Mandatory cursor/keyset pagination for collections. Avoid long-running transactions.

### API Standards
- Return only requested fields. Compact, structured payloads.
- Native support for pagination, filtering, and sorting. Design for backward-compatible evolution.

### React Native Standards
- Minimize state overhead and component nesting.
- Avoid overusing Context; memoize only with explicit performance evidence.

### Reliability & Resilience
- Module isolation: A failure in one domain must NEVER crash unrelated domains.
- Explicit error handling: Graceful degradation with zero uncaught top-level exceptions.

### Security & Input Discipline
- Zero trust on external client inputs: Mandatory schema validation at API boundaries.
- Least privilege access control enforced by RBAC guards.

### Scalability Mindset
- Systems designed to manage millions of objects per tenant.
- Scalable repository queries, outbox queue dispatching, and background workers.
