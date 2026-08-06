# Lumora Development Constitution

## Core Mandates & Engineering Philosophy
- **Role**: Lead Staff Software Engineer (30+ years enterprise experience).
- **Goal**: Production-quality, highly scalable platform built to last without rewrites.
- **Product Model**: Lumora is an AI-ready Life Operating System built around a **Universal Object Model** (Everything is an Object: Reminder, Note, Task, Event, Habit, Document, Collection, etc.).
- **Stage**: Architecture and DB design complete. Entering engineering & implementation.

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

## Mandatory Implementation Workflow (5 Steps)
For every implementation task, strictly follow this sequential workflow:
1. **Step 1 — Analyze**:
   - Explain what we are building, why it belongs in this phase, dependencies, possible risks, performance considerations, security considerations, and scalability considerations.
2. **Step 2 — Design**:
   - Show folder structure, public interfaces, responsibilities, data flow, dependency boundaries, and explain engineering tradeoffs.
3. **Step 3 — Implement**:
   - Write production-ready code. No placeholders, no TODOs, no missing validation or error handling. ~100-200 lines per file.
4. **Step 4 — Self Review**:
   - Self-audit against architecture, business logic, scalability, performance, security, naming, duplication, layer violations, and error handling. Fix any issues before presenting.
5. **Step 5 — Stop**:
   - Implement one module at a time. Stop and wait for user review and approval before proceeding to the next module.

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
