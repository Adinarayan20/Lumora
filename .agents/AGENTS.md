# Lumora Development Constitution & Engineering Manifesto

> **CORE OVERRIDING MANDATE**: Lumora is a platform, not a collection of features. Every architectural decision must increase the platform's ability to support future object types without requiring rewrites.

---

## Core Mandates & Engineering Philosophy
- **Goal**: Production-quality, highly scalable platform built to last without rewrites.
- **Product Model**: Lumora is NOT a productivity app. Lumora is an AI-ready Personal Life Operating System built around a **Universal Object Model** (Everything is an Object: Reminder, Note, Task, Event, Habit, Document, Collection, etc.).
- **Mission**: Build Lumora with production-grade engineering standards comparable to world-class software products. Every architectural decision must optimize for scalability, maintainability, performance, and long-term extensibility.

---

## Lumora Engineering Manifesto — Non-Negotiable Rules

1. **Never Hardcode Business Logic**: Product- and category-specific behavior must be data/configuration-driven, not baked into code per object type or screen. Forbidden in practice: `PlantService`, `MedicineService`, `if (objectType === 'plant')`, `if (workspaceType === 'family')`, `if (plan === 'premium')` outside the entitlement boundary (see Security & Data Access Boundary). This is not a license to turn genuine domain/business invariants into a generic metadata engine, rules engine, or configuration DSL — a real domain rule (an assignment invariant, an occurrence-derivation rule, an authorization check) stays explicit, readable domain/application code. Configuration-driven is for what varies by product category or catalog content; explicit code is for what the domain actually requires to be true.
2. **Never Duplicate Code**: One implementation should support every object type.
3. **Domain Layer is Single Source of Truth**: UI, database, networking, notifications, and future AI must never contain business rules.
4. **Performance First**: Every feature must be designed for speed before features or visual effects.
5. **Scalable First**: The architecture must support millions of objects and future modules without rewrites.
6. **Maintainability First**: Future developers should understand the code quickly.
7. **Testability First**: Business logic must be isolated and easy to test.
8. **Accessibility First**: Support accessibility features from the beginning.
9. **Security First**: Never expose sensitive information or create insecure data flows.
10. **Delete Code Rule**: Deleting unnecessary code is considered an improvement. The simplest maintainable solution is always preferred over unnecessary abstraction.

---

## Strategic Architectural Principles

### 1. Metadata Before Code
Before creating new code, determine whether the behavior is already represented by existing configuration, templates, catalog data, or reusable platform behavior. Use configuration when the behavior is genuinely configurable — product/category/catalog variation is the normal case. Keep genuine domain/application invariants explicit, readable, and testable in code; do not build a generic metadata engine, rules engine, or configuration DSL merely to avoid writing legitimate business logic.

### 2. Extension Before Modification (Open/Closed Principle)
Open for extension, closed for modification. Prefer extending an existing cohesive module when the responsibility naturally belongs there, over editing a stable module in a way that risks its existing behavior. Introduce a genuine extension mechanism only when the authoritative architecture or a demonstrated implementation requirement actually calls for one — do not build speculative plugin, capability-engine, or hook infrastructure in anticipation of needs that haven't materialized. (Note: a general-purpose capability engine was deliberately removed from this codebase during the architecture reset — don't reintroduce that shape of solution without an explicit decision to do so.)

### 3. Domain Events Where They Earn Their Keep
Use domain events (`ObjectCreated`, `ReminderCompleted`, `TimelineRecorded`, `TemplateInstalled`, `NotificationScheduled`) when a business event genuinely needs decoupled consumers, asynchronous processing, audit/history propagation, or another demonstrated architectural benefit. Prefer direct, cohesive application coordination when that's simpler and correct — don't introduce an event merely to avoid a direct module call. Where the authoritative architecture already requires event-driven infrastructure for a given flow, preserve it; this principle governs new decisions, not a redesign of what already exists.

### 4. Observability First
Every critical operation must be observable via structured JSON logging, Prometheus metrics, OpenTelemetry distributed tracing, production health endpoints (`/health/live`, `/health/ready`, `/health/startup`), and explicit error reporting. Never deploy code that cannot be monitored. Never log secrets, tokens, passwords, or unnecessary raw personal data — redact sensitive fields at the logging boundary, don't rely on convention to avoid printing them.

### 5. Backward-Compatible Evolution
Changes to public APIs, shared packages, persistence boundaries, or platform interfaces must consider existing consumers, not just the change itself. Prefer additive, backward-compatible evolution where practical. When a breaking change is genuinely required, identify affected consumers and compatibility impact before implementation, and provide a documented migration path with a formal deprecation period — never remove or rename a shared contract silently. The exact migration plan for a specific change is not defined here.

### 6. Zero Magic
No hidden behavior. Every action must be explicit, transparent, and predictable. Avoid implicit business rules, reflection-based surprises, or hidden side-effect dependencies.

### 7. Data Model Stability
User data must be modeled independently from replaceable UI, API, AI, and storage implementations. Changes to those layers should not unnecessarily destroy or invalidate persisted user data. This is a principle of durable, stable modeling requiring the fewest database migrations over the product lifetime — not a claim that data can never be deleted; legitimate deletion, retention, privacy, and legal lifecycle requirements are defined elsewhere and this principle does not override them.

### 8. Architectural Decisions Are Recorded, Not Tribal Knowledge
Significant architectural decisions must be recorded somewhere durable — never left as tribal knowledge. This document does not prescribe a specific mechanism, file format, or directory for that record; `docs/architecture/adr/` and the rest of the pre-reset documentation tree were intentionally retired and are not to be recreated. Decision-recording follows whatever governance `docs/00_DOCUMENTATION_INDEX.md` and later-approved implementation documentation establish.

### 9. Dependency Policy
Third-party dependencies are liabilities. Before adding any dependency, evaluate:
- Can we reasonably build this ourselves?
- Is it actively maintained, secure, lightweight, and tree-shakeable?
- Does it duplicate existing functionality?
Prefer fewer high-quality, lightweight dependencies (critical for Expo/React Native and Node.js performance).

### 10. Future AI Relationship
**AI consumes platform data; AI NEVER owns platform data.** AI features are consumers of domain objects, events, and capabilities. The core platform remains 100% functional without AI. AI integrations must never pollute core domain models.

### 11. Release Philosophy
Never release unfinished architecture. Ship fewer features with exceptional quality rather than many incomplete features. Lumora launching with 30 outstanding capabilities is vastly superior to 150 average ones.

### 12. Universal Object Model
Every object created in Lumora is built on the same universal foundation — Identity & Metadata, Timeline & History, Relationships, Notifications & Reminders, Attachments & Media, Organization (Tags/Collections/Archive/Favorites/Pins), Search, and Permissions/AI Hooks/Analytics as future extension points. This means every object *can* use these capabilities through one shared implementation — it does not mean every object *must* activate every capability. Whether a given capability is meaningfully used by a given object type is a product/domain decision, not an engineering mandate. Shared capabilities are reused via the same implementation, never reimplemented per object type.

### 13. Template & Starter Library Philosophy
Templates are first-class citizens. All templates must be installable, versioned, exportable, and replaceable. Which templates ship at launch versus later, and any community or premium template model, is a product/roadmap decision — it belongs in `01_PRODUCT_VISION.md` or the implementation roadmap, not here.

### 14. Community Extension Architecture
The Community ecosystem is an extension, not a core dependency. Every community feature builds upon existing personal objects. Personal data remains the ultimate single source of truth.

---

## Failure Isolation & Feature Independence

1. **No Feature Is Load-Bearing for Another**: An unavailable, disabled, misconfigured, or failing feature, integration, background job, or optional capability must not crash or disable unrelated functionality.
2. **Shared Foundations Stay Small and Stable**: Code shared across features must be independently testable and explicitly owned — not a side effect of two features happening to reuse the same file.
3. **No Startup-Time Coupling to Optional Features**: Application startup must not depend on an optional product capability unless the authoritative architecture explicitly requires it.
4. **Fail at the Smallest Boundary**: When something fails, it fails as locally as possible — observably, diagnosably, and without silently hiding the error.
5. **Atomicity Where It's Actually Required**: Use a transaction when a logical operation genuinely needs all-or-nothing consistency. Don't force every multi-record operation into one transaction when the workflow is intentionally asynchronous — those use explicit state transitions and safe recovery instead.
6. **Background Jobs Are Idempotent**: Any job or event consumer must tolerate at-least-once delivery without duplicate side effects. One consumer's retry must not require or trigger another's.
7. **Failure Classes Are Explicit**: Distinguish validation, authentication, authorization, not-found, conflict/state-transition, transient/retryable, and terminal failures. No single generic catch-and-log standing in for all of them.
8. **No Internal Leakage in Errors**: API error responses returned to a client never expose stack traces, internal identifiers, or infrastructure detail.
9. **Client-Retried Mutations Are Idempotent**: A client-initiated mutating request that can be retried because of network failure, timeout, or app suspend/resume uses an idempotency mechanism whenever duplicate execution could produce an incorrect result or a duplicate side effect. This document does not prescribe the specific persistence implementation for that mechanism.

---

## Performance Budget & Operational Standards

### Performance Regressions are Bugs
**Performance regressions are treated as blocking bugs.** No Pull Request may reduce startup speed, scroll performance, navigation responsiveness, or increase bundle size without documented architectural justification.

### Explicit Performance Budget
Every Pull Request must evaluate:
- **Memory**: Controlled footprint across long sessions.
- **Mobile & Tablet Memory Pressure**: Do not assume desktop-level memory or network headroom — large collections and cached state must respect constrained-device limits.
- **CPU & Battery**: Minimal CPU wakeups and background battery impact.
- **Database Queries**: Avoid N+1 query patterns. Queries must be bounded and appropriate to the access pattern, with indexing and projection designed from actual query requirements — prefer cursor/keyset pagination for large or continuously changing collections where appropriate, rather than mandating it universally. Any intentionally repeated query pattern must have a demonstrated engineering reason.
- **Bundle Size**: Continuous tree-shaking, lazy-loading optional modules, compressed vector assets.
- **Startup & Navigation**: Fast cold starts, instant page transitions.
- **Rendering**: Zero unnecessary re-renders via windowing/virtualization.
If a feature exceeds the performance budget, redesign before merging.

---

## Design System, Motion & UX Philosophy

### UX Principles
- **Responsive Feedback**: Use asynchronous interaction where appropriate, and provide clear progress, success, and failure feedback for operations that may take noticeable time.
- **Always Show Progress**: Clear feedback indicators for long operations.
- **Support Undo**: Soft-deletes and reversible actions wherever safe.
- **Optimistic UI Where It's Safe**: Use optimistic local updates only where the operation is safely reversible or reconcilable and server authority remains authoritative — not as a default for every operation.
- **Data Safety**: Never silently lose or corrupt user data. Destructive or irreversible actions must be explicit and appropriately recoverable where the product contract permits.

### Reusable UI Architecture
A single, tokenized design system is required — no ad-hoc, one-off styling per screen. The specific tokens (typography, color, spacing, elevation, motion physics) and visual treatment are design/product decisions owned elsewhere; this document requires that a token system exists and is used consistently, not what the tokens are. What AGENTS.md does require:
- **Accessibility & Responsiveness**: Compliant contrast, adequate touch targets, layouts that respond correctly across viewport sizes.
- **Rendering Discipline**: No unnecessary re-renders; large collections are windowed/virtualized appropriately.
- **Reuse**: A component or interaction pattern designed once is reused, not recreated per screen.

### Motion Philosophy
**Motion should communicate, never distract.** Every animation must explain a state change, guide attention, or improve perceived performance — not decorate. Motion complexity should scale down on lower-capability devices to preserve rendering performance; the specific motion treatments per device tier are a design decision, not specified here.

---

## Streamlined Implementation Workflow (Single-Response Execution)
For every implementation unit, present all 4 steps together in a single response:
1. **Step 1 — Analyze**: Purpose, phase necessity, dependencies, risks, performance, security, scalability.
2. **Step 2 — Design**: Folder structure, public interfaces, responsibilities, data flow, dependency boundaries, engineering tradeoffs.
3. **Step 3 — Implement**: Production-ready code with appropriate file and module boundaries, cohesive responsibilities, strict typing, and explicit error handling — zero placeholders, zero TODOs.
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

## Module Creation Discipline

Before creating a new module, in order:
1. Identify the architectural layer it belongs to (UI / Application / Domain / Infrastructure).
2. Identify whether an existing module already owns this responsibility.
3. Determine whether that existing module should be extended instead.
4. Create a new module only when the responsibility is genuinely different from anything that exists.

Do not create a new folder, service, or module purely for convenience.

---

## Monorepo Boundaries

Applications do not import another application's internal source. For example: `apps/mobile` does not import from `apps/backend/src/*`; `apps/admin` does not import from `apps/backend/src/*` or `apps/mobile/*`. Shared cross-application behavior belongs in an approved shared package (`packages/*`), never a direct app-to-app import. Do not create a new package unless the implementation genuinely requires one — this is a boundary rule, not license to fragment `packages/` for its own sake.

---

## Security & Data Access Boundary — Non-Negotiable

1. **Two Authorization Mechanisms, Never a Third**: RBAC governs workspace/platform administration. Ownership/Grants govern object-level access and action authority. These are architecturally distinct layers answering different questions — never merge them, never invent a third mechanism.
2. **Server-Side Authorization, Always**: Never trust client-supplied role, ownership, or workspace claims. Every protected read or write is authorized server-side before data leaves the persistence boundary.
3. **No Direct Database Exposure**: Web, Mobile, Tablet, and Admin Panel never receive `DATABASE_URL`, `PrismaClient`, or unrestricted persistence models. The only path is: Client → API → authentication → authorization → application/use case → authorization-scoped query → minimal projection → DTO → client.
4. **Search Is Authorization-Scoped**: Search queries filter by authorization at query time. Never "load everything, then filter" in application memory or on the client.
5. **Minimal API Responses**: Return only the fields the use case requires. Never serialize an entire persistence model as a convenience.
6. **Cache Authorization Isolation**: Any cache holding user/workspace/object-specific data keys on the requesting actor's authorization scope. A cache lookup must never return another actor's data because of a missing or incorrect scope key.
7. **Entitlement Is Not a Domain Concern**: No domain rule references subscription or entitlement state, even implicitly. Entitlement is evaluated once at the application boundary before a domain operation is invoked — never scattered as `if (plan === ...)` checks through business logic.

---

## Multi-Client Architecture

1. **One Backend, Many Clients, Through API Contracts**: The authoritative direction is Client → API contract → server application/use case → domain → infrastructure. Web, Admin Panel, Mobile, and Tablet consume the same server-side business authority through the appropriate API contracts — they do not directly consume the application or domain layer itself. No `AdminBusinessLogic`, `MobileBusinessLogic`, or equivalent client-specific reimplementation of core business rules. Web and Tablet are not separate business platforms any more than Mobile or Admin are.
2. **Admin Panel Is Not a Second Backend**: Elevated administrative capability is expressed as an authorization-elevated operation on the existing API, never a parallel persistence or business-logic path.
3. **Clients Own Presentation Only**: Navigation, rendering, device integration, interaction patterns, and justified client-specific caching/synchronization may be platform-specific.
4. **Clients Do Not Redefine Core Rules**: No client independently reimplements domain rules, authorization, core validation, object lifecycle, business calculations, or entitlement rules. The backend remains the shared authority for all of these.
5. **A Client Requirement Does Not Become a Client-Specific Implementation**: When a requirement originates from one client (e.g. Mobile needs a new capability), the correct direction is shared platform/domain/application authority → API contract → client presentation/integration — not a mobile-specific business implementation that gets duplicated later for Web, Admin, and Tablet. Admin, Mobile, Web, and Tablet may differ in presentation, interaction, device integration, caching, and synchronization; they consume the same server-side business authority regardless of which client's request originated the need for it.

---

## Client-Side Authority

Client-held state may improve responsiveness, UX, caching, synchronization, and offline behavior. It is never authoritative for:

- ownership
- grants
- workspace permissions
- entitlement
- security decisions
- object lifecycle
- business state transitions

A connectivity loss must fail gracefully where applicable. Offline support, where built, is feature-specific — it must not create a second business-logic implementation or a second source of truth that can drift from the server.

---

## Documentation Governance

This document does not recreate the retired documentation structure — no ADR tree, no `docs/architecture/`, `docs/archive/`, `docs/audits/`, `docs/design/`, `docs/operations/`, or parallel product/architecture authority files, regardless of whether they existed historically. Documentation governance is defined by `docs/00_DOCUMENTATION_INDEX.md` and whatever implementation documentation is later approved. AGENTS.md is not itself an architecture decision record, and it does not compete with `00`–`04` as an authority.

---

## AI Coding Quality Mandates — Non-Negotiable Execution Rules

> These rules govern HOW the AI writes code. Violating any of them produces unacceptable output.

### Rule 1: Inspect Before You Implement

Before writing a single line of code for any non-trivial task:

1. Read the relevant existing source code — don't assume what's there.
2. Check the authoritative documentation (`00`–`04`) for anything that already governs this behavior.
3. Check existing interfaces, dependencies, and tests in the affected area.
4. Confirm you're not duplicating something that already exists.

Do not implement from assumption when the evidence is available to check. This document does not mandate a specific AI tool, MCP server, or IDE — use whatever tooling is actually available in the environment to do the above; the requirement is the inspection, not the mechanism.

---

### Rule 2: File Size Is a Review Signal, Not a Hard Gate

A large file is a prompt to look closer, not an automatic failure. Prefer one clear responsibility per file. Split a file when it mixes concerns — e.g., a use case that also does mapping, validation, and persistence orchestration — not because it crossed an arbitrary line count. A long file with one genuinely cohesive responsibility is better than three short files that fragment one responsibility across artificial boundaries.

---

### Rule 3: Forbidden Anti-Patterns (Never Write These)

The following patterns are strictly prohibited and must NEVER appear in any Lumora codebase:

- ❌ `any` type in TypeScript — use `unknown` and narrow with type guards
- ❌ `// TODO`, `// FIXME`, `// HACK` — finish the implementation or do not write it
- ❌ `console.log` in production code — use the structured logger only
- ❌ `try { } catch (e) {}` empty catch blocks — always handle or re-throw
- ❌ Time-dependent domain/application behavior reading the system clock directly — use the application's time abstraction so it stays deterministic and testable. Direct `new Date()` / system-clock access is fine at the appropriate infrastructure/boundary location; the rule is about determinism in domain/application logic, not a blanket ban.
- ❌ Duplicating a business-critical key, type, status, or protocol value as an unexplained literal when a canonical enum, constant, or existing definition already owns that value — reuse the existing definition. (Ordinary user-facing strings and legitimate local literals are not violations; don't create a constants file just to hold them.)
- ❌ Deeply nested conditional expressions that reduce readability — prefer a named function or explicit control flow when that makes the behavior clearer
- ❌ God functions mixing multiple unrelated responsibilities — split by responsibility, cohesion, readability, and testability, not by an arbitrary line count
- ❌ React components owning domain/business rules — keep business behavior in the appropriate shared/application layer or hook/service boundary, not mechanically in every `useEffect`
- ❌ Importing another module's private internals — depend only on that module's approved public interface
- ❌ `SELECT *` or equivalent unscoped queries — always select explicit fields
- ❌ Avoidable synchronous blocking work on latency-sensitive or UI execution paths — use appropriate asynchronous or background execution where it's actually required, not as a mechanical conversion of every synchronous call
- ❌ Copying the same validation logic in multiple places — extract to a shared validator

---

### Rule 4: Mandatory Self-Review Checklist

After writing any code, the AI MUST silently audit its own output against this checklist before responding:

- [ ] Does this file mix responsibilities that would be clearer split apart? If yes → split it.
- [ ] Is there any duplicated logic that already exists in the codebase? If yes → delete and reuse.
- [ ] Does every function have a single, clear responsibility? If no → split it.
- [ ] Are all types explicit with zero `any`? If no → fix them.
- [ ] Does the implementation respect the `UI → Application → Domain → Infrastructure` layer rule?
- [ ] Are all error paths handled explicitly? No silent failures?
- [ ] Is this the simplest correct implementation without sacrificing clarity, cohesion, testability, performance, or maintainability?
- [ ] Does the code introduce any new external dependency? If yes → justify it explicitly.
- [ ] Are there any hardcoded values that should be config or enum? If yes → extract them.
- [ ] If this feature includes offline behavior or client-side synchronization: does the implementation preserve server authority and define its failure, reconciliation, and retry behavior?
- [ ] Does this touch authorization, ownership, or sensitive data? If yes → is there a regression test proving unauthorized access is rejected?

---

### Rule 5: TypeScript Strict Mode — Always

TypeScript code must comply with the repository's approved strict type-safety configuration — this document does not prescribe the exact compiler flags, the repository's `tsconfig` owns them. Never weaken type safety (loosening a strict flag, widening a type, adding an `any`) merely to make an implementation compile.

- Exported APIs, public interfaces, domain/application boundaries, repository contracts, and controller/route contracts require explicit types.
- Simple local implementation details may use TypeScript's inference where it improves readability without weakening type safety.
- Optional properties are handled with null-coalescing, not cast away.
- Avoid `as` type assertions where the type can be narrowed safely instead. Where a non-obvious assertion is genuinely necessary and its safety isn't evident from surrounding invariants, document why it's safe — not every assertion needs a comment, only the ones a reviewer couldn't otherwise verify.

---

### Rule 6: Naming Conventions — Zero Ambiguity

| Construct | Convention | Example |
|-----------|-----------|---------|
| Domain Entity | `PascalCase` noun | `LumoraObject`, `Reminder` |
| Use Case | `PascalCase` + verb | `CreateObject`, `CompleteReminder` |
| Domain Event | `PascalCase` + past tense | `ObjectCreated`, `ReminderCompleted` |
| Repository Interface | Follow the existing repository convention already established in the codebase — no imposed prefix | see current codebase pattern |
| Value Object | `PascalCase` noun | `ObjectId`, `DueDate` |
| React Component | `PascalCase` noun | `ObjectCard`, `TimelineView` |
| Custom Hook | `use` prefix + noun/verb | `useObjectStore`, `useReminderTrigger` |
| Service | `PascalCase` + `Service` suffix | `NotificationService` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_OBJECTS_PER_PAGE` |
| Enum values | `SCREAMING_SNAKE_CASE` | `ObjectType.REMINDER` |
| Boolean variables | `is`, `has`, `can`, `should` prefix | `isArchived`, `hasAttachments` |
| Event handlers | `handle` + event | `handleObjectCreate` |

File names always match the primary export name, in `kebab-case`: `create-object.use-case.ts`, `object.entity.ts`, `object-card.component.tsx`.

---

### Rule 7: Testing Is Not Optional

Code is not complete because it compiles. Every non-trivial change requires tests appropriate to what changed:

- **Domain/application logic** → unit tests at the business-rule boundary.
- **Authorization-sensitive paths** → a test proving unauthorized access is rejected, not merely that authorized access succeeds.
- **Data-access changes** → migration/repository tests.
- **API/integration-level behavior** → API or integration tests, where applicable.
- **Cross-module changes** → regression tests on the affected existing behavior, not only the new code.
- **Critical user flows or performance-sensitive changes** → end-to-end or performance tests, where applicable.

Do not write tests solely to inflate coverage numbers. A test that doesn't assert a real behavior is worse than no test — it hides the absence of one.
