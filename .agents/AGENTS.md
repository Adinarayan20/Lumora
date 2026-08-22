# Lumora Development Constitution & Engineering Manifesto

> **CORE OVERRIDING MANDATE**: Lumora is a platform, not a collection of features. Every architectural decision must increase the platform's ability to support future object types without requiring rewrites.

---

## Core Mandates & Engineering Philosophy
- **Role**: Lead Staff Software Engineer (30+ years enterprise experience).
- **Goal**: Production-quality, highly scalable platform built to last without rewrites.
- **Product Model**: Lumora is NOT a productivity app. Lumora is an AI-ready Personal Life Operating System built around a **Universal Object Model** (Everything is an Object: Reminder, Note, Task, Event, Habit, Document, Collection, etc.).
- **Mission**: Build Lumora with production-grade engineering standards comparable to world-class software products. Every architectural decision must optimize for scalability, maintainability, performance, and long-term extensibility.

---

## Lumora Engineering Manifesto — Non-Negotiable Rules

1. **Never Hardcode Business Logic**: Everything must be metadata-driven or configuration-driven wherever possible.
2. **Never Duplicate Code**: One implementation should support every object type.
3. **Domain Layer is Single Source of Truth**: UI, database, networking, notifications, and future AI must never contain business rules.
4. **Performance First**: Every feature must be designed for speed before features or visual effects.
5. **Offline First**: Core functionality must continue working without internet whenever possible.
6. **Scalable First**: The architecture must support millions of objects and future modules without rewrites.
7. **Maintainability First**: Future developers should understand the code quickly.
8. **Testability First**: Business logic must be isolated and easy to test.
9. **Accessibility First**: Support accessibility features from the beginning.
10. **Security First**: Never expose sensitive information or create insecure data flows.
11. **Delete Code Rule**: Deleting unnecessary code is considered an improvement. The simplest maintainable solution is always preferred over unnecessary abstraction.

---

## Strategic Architectural Principles

### 1. Metadata Before Code
Before creating new code, always ask: **Can this be solved by metadata?** If yes, prefer metadata over new implementations. New object types should rarely require new business logic.

### 2. Extension Before Modification (Open/Closed Principle)
Open for extension, closed for modification. Prefer extending the platform via plugins, capabilities, or hooks instead of editing existing stable modules.

### 3. Event-Driven Mindset & Domain Events
Business events are first-class citizens. Objects emit domain events (`ObjectCreated`, `ReminderCompleted`, `TimelineRecorded`, `TemplateInstalled`, `NotificationScheduled`). Future modules subscribe to events instead of tightly coupling, maintaining complete module independence.

### 4. Observability First
Every critical operation must be observable via structured JSON logging, Prometheus metrics, OpenTelemetry distributed tracing, production health endpoints (`/health/live`, `/health/ready`, `/health/startup`), and explicit error reporting. Never deploy code that cannot be monitored.

### 5. API Compatibility & Evolution
Public APIs must remain backward compatible whenever possible. Breaking changes require versioning and a documented migration path. Never remove or rename public contracts without a formal deprecation period.

### 6. Feature Flags
Every major feature must support staged rollouts. Feature lifecycle states: `Disabled` → `Experimental` → `Beta` → `Stable` → `Deprecated`.

### 7. Zero Magic
No hidden behavior. Every action must be explicit, transparent, and predictable. Avoid implicit business rules, reflection-based surprises, or hidden side-effect dependencies.

### 8. Data Model Permanence
Data survives forever while UI, APIs, AI integrations, and storage mechanisms change. The core data model must be engineered to require the fewest database migrations over the product lifetime.

### 9. Architecture Decision Records (ADR)
Every significant architectural decision must be documented in a dedicated ADR file inside `docs/architecture/adr/`. Architecture must never depend on tribal knowledge. Each ADR must detail:
- Context & Problem Statement
- Decision
- Alternatives Considered
- Trade-offs & Consequences
- Date & Status (`Proposed` | `Accepted` | `Deprecated` | `Superseded`)

### 10. Dependency Policy
Third-party dependencies are liabilities. Before adding any dependency, evaluate:
- Can we reasonably build this ourselves?
- Is it actively maintained, secure, lightweight, and tree-shakeable?
- Does it duplicate existing functionality?
Prefer fewer high-quality, lightweight dependencies (critical for Expo/React Native and Node.js performance).

### 11. Future AI Relationship
**AI consumes platform data; AI NEVER owns platform data.** AI features are consumers of domain objects, events, and capabilities. The core platform remains 100% functional without AI. AI integrations must never pollute core domain models.

### 12. Release Philosophy
Never release unfinished architecture. Ship fewer features with exceptional quality rather than many incomplete features. Lumora launching with 30 outstanding capabilities is vastly superior to 150 average ones.

### 13. Universal Object Inheritance
Every object created in Lumora automatically inherits all Universal Capabilities without exception:
- **Identity & Metadata**: Unique GUIDs, type key, custom attributes.
- **Timeline & History**: Full creation, mutation, and audit trail.
- **Relationships**: Parent/child hierarchies, links, back-references.
- **Notifications & Reminders**: Native trigger engine support.
- **Attachments & Media**: Unified file asset linking.
- **Organization**: Tags, Collections, Archive, Favorites, Pins.
- **Search**: Automatic global search index generation.
- **Permissions, AI Hooks & Analytics**: Future capability entry points.

### 14. Template & Starter Library Philosophy
Templates are first-class citizens. The Starter Library ships built-in templates; community and premium templates follow later. All templates must be installable, versioned, exportable, and replaceable.

### 15. Community Extension Architecture
The Community ecosystem is an extension, not a core dependency. Every community feature builds upon existing personal objects. Personal data remains the ultimate single source of truth.

---

## Performance Budget & Operational Standards

### Performance Regressions are Bugs
**Performance regressions are treated as blocking bugs.** No Pull Request may reduce startup speed, scroll performance, navigation responsiveness, or increase bundle size without documented architectural justification.

### Explicit Performance Budget
Every Pull Request must evaluate:
- **Memory**: Controlled footprint across long sessions.
- **CPU & Battery**: Minimal CPU wakeups and background battery impact.
- **Database Queries**: Zero N+1 queries, mandatory cursor pagination, composite index coverage.
- **Bundle Size**: Continuous tree-shaking, lazy-loading optional modules, compressed vector assets.
- **Startup & Navigation**: Fast cold starts, instant page transitions.
- **Rendering**: Zero unnecessary re-renders via windowing/virtualization.
If a feature exceeds the performance budget, redesign before merging.

---

## Design System, Motion & UX Philosophy

### UX Principles
- **Never Block the User**: Asynchronous background operations where possible.
- **Always Show Progress**: Clear feedback indicators for long operations.
- **Support Undo**: Soft-deletes and reversible actions wherever safe.
- **Optimistic UI**: Instant local updates with background sync.
- **Data Safety**: Never lose user data; never surprise the user.

### Lumora Design System Rules
Strict tokenized design system enforcing:
- **Design Tokens**: Typography, Color (Tailored HSL), Motion physics, Spacing scales, Elevation levels.
- **Visual Polish**: Curated glassmorphism, background blurs, vector icon sets.
- **Accessibility & Responsiveness**: WCAG 2.2 contrast compliance, 48px touch targets, dynamic viewport height (`dvh`). Zero arbitrary ad-hoc UI styles.

### Motion Philosophy
**Motion should communicate, never distract.** Every animation must explain state changes, guide user attention, or improve perceived performance. Decorative animations everywhere are strictly prohibited.

#### Motion Engine Device Capabilities:
- **High-End Devices**: Rich ambient glassmorphism effects, advanced shared element transitions.
- **Mid-Range Devices**: Moderate communication motion.
- **Low-End Devices**: Minimal motion preserving 60fps smoothness.

---

## Streamlined Implementation Workflow (Single-Response Execution)
For every implementation unit, present all 4 steps together in a single response:
1. **Step 1 — Analyze**: Purpose, phase necessity, dependencies, risks, performance, security, scalability.
2. **Step 2 — Design**: Folder structure, public interfaces, responsibilities, data flow, dependency boundaries, engineering tradeoffs.
3. **Step 3 — Implement**: Production-ready code (~100–200 lines per file), zero placeholders, zero TODOs, strict typing, explicit error handling.
4. **Step 4 — Self Review & Summary Log**: Senior staff audit with mandatory Implementation Summary Log.

---

## Locked Infrastructure & Persistence Isolation Rules
1. **Prisma Infrastructure Boundary**: Prisma exists ONLY inside `apps/backend/src/infrastructure/prisma/`.
2. **Shared Package Independence**: `@lumora/shared` must NEVER import Prisma.
3. **Domain Purity**: Domain entities, repositories, events, value objects, and use cases must NEVER import Prisma types.
4. **Persistence Model Isolation**: Prisma models are persistence models only.
5. **Bidirectional Mapping**: Repositories strictly map `Prisma Model ↔ Domain Entity`.
6. **Client Encapsulation**: Never expose `PrismaClient` outside infrastructure.
7. **Entity Return Guarantee**: Repositories return domain entities or primitives—NEVER Prisma model instances.
8. **Direct Query Prohibition**: No controllers, services, or use cases may execute Prisma queries directly.
9. **Strict Layer Dependency Direction**: `UI → Application → Domain → Infrastructure`. Infrastructure may depend on Domain; Domain must NEVER depend on Infrastructure.

---

## AI Coding Quality Mandates — Non-Negotiable Execution Rules

> These rules govern HOW the AI writes code. Violating any of them produces unacceptable output.

### Rule 1: MCP Tool Protocol (Mandatory Before Every Implementation)

Before writing a single line of code for any non-trivial task, the AI MUST use MCPs in this exact order:

1. **`sequential-thinking`** → Decompose the task. Plan the approach. Identify risks. If the plan requires >3 files, pause and re-evaluate scope.
2. **`context7`** → Fetch live API documentation for every library being used. Never write API calls from memory.
3. **`filesystem`** → Read the existing code in the relevant module BEFORE adding new code. Never duplicate what already exists.
4. **`memory`** → Check if an architectural decision for this problem was already made. Retrieve it.
5. **Only then** → Write the implementation.

Skipping these steps is the primary cause of bloated, incorrect, and duplicate code.

---

### Rule 2: Hard File Size Limits

| File Type | Soft Limit | Hard Limit (Never Exceed) |
|-----------|-----------|--------------------------|
| Domain Entity | 80 lines | 120 lines |
| Use Case / Command Handler | 60 lines | 100 lines |
| Repository Implementation | 100 lines | 150 lines |
| React / RN Component | 80 lines | 150 lines |
| Service / Utility | 60 lines | 100 lines |
| Controller / Route Handler | 40 lines | 80 lines |
| Test File | 150 lines | 250 lines |

**If a file exceeds its hard limit, it MUST be split before the response is submitted.** No exceptions. A 1000-line file is an automatic failure.

---

### Rule 3: Forbidden Anti-Patterns (Never Write These)

The following patterns are strictly prohibited and must NEVER appear in any Lumora codebase:

- ❌ `any` type in TypeScript — use `unknown` and narrow with type guards
- ❌ `// TODO`, `// FIXME`, `// HACK` — finish the implementation or do not write it
- ❌ `console.log` in production code — use the structured logger only
- ❌ `try { } catch (e) {}` empty catch blocks — always handle or re-throw
- ❌ `new Date()` scattered inline — use a centralized `Clock` abstraction
- ❌ Hardcoded strings for keys, types, or statuses — use enums or const maps
- ❌ Nested ternaries beyond 1 level — extract to a named function
- ❌ God functions >30 lines with multiple responsibilities — split them
- ❌ `useEffect` with business logic inside React components — move to hooks or services
- ❌ Importing from a sibling module's internals — only import from public index barrel
- ❌ `SELECT *` or equivalent unscoped queries — always select explicit fields
- ❌ Synchronous blocking operations on the main thread — always async
- ❌ Copying the same validation logic in multiple places — extract to a shared validator

---

### Rule 4: Mandatory Self-Review Checklist

After writing any code, the AI MUST silently audit its own output against this checklist before responding:

- [ ] Does this file exceed its hard line limit? If yes → split it.
- [ ] Is there any duplicated logic that already exists in the codebase? If yes → delete and reuse.
- [ ] Does every function have a single, clear responsibility? If no → split it.
- [ ] Are all types explicit with zero `any`? If no → fix them.
- [ ] Does the implementation respect the `UI → Application → Domain → Infrastructure` layer rule?
- [ ] Are all error paths handled explicitly? No silent failures?
- [ ] Is this the simplest correct implementation? Could it be 30% shorter without losing clarity?
- [ ] Does the code introduce any new external dependency? If yes → justify it explicitly.
- [ ] Are there any hardcoded values that should be config or enum? If yes → extract them.
- [ ] Will this code work offline? If no → document the offline failure mode explicitly.

---

### Rule 5: TypeScript Strict Mode — Always

Every file written MUST be compatible with the following `tsconfig` settings. Never write code that would fail under strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

- Every function must have an explicit return type annotation.
- Every parameter must have a type annotation.
- Optional properties must be handled with null-coalescing, not cast away.
- `as` type assertions require a comment explaining why they are safe.

---

### Rule 6: Naming Conventions — Zero Ambiguity

| Construct | Convention | Example |
|-----------|-----------|---------|
| Domain Entity | `PascalCase` noun | `LumoraObject`, `Reminder` |
| Use Case | `PascalCase` + verb | `CreateObject`, `CompleteReminder` |
| Domain Event | `PascalCase` + past tense | `ObjectCreated`, `ReminderCompleted` |
| Repository Interface | `I` prefix + `Repository` suffix | `IObjectRepository` |
| Value Object | `PascalCase` noun | `ObjectId`, `DueDate` |
| React Component | `PascalCase` noun | `ObjectCard`, `TimelineView` |
| Custom Hook | `use` prefix + noun/verb | `useObjectStore`, `useReminderTrigger` |
| Service | `PascalCase` + `Service` suffix | `NotificationService` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_OBJECTS_PER_PAGE` |
| Enum values | `SCREAMING_SNAKE_CASE` | `ObjectType.REMINDER` |
| Boolean variables | `is`, `has`, `can`, `should` prefix | `isArchived`, `hasAttachments` |
| Event handlers | `handle` + event | `handleObjectCreate` |

File names always match the primary export name, in `kebab-case`: `create-object.use-case.ts`, `object.entity.ts`, `object-card.component.tsx`.

