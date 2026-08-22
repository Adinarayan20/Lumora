# Lumora Architecture Specification

> **STATUS:** AUTHORITATIVE TARGET ARCHITECTURE  
> **OWNS:** Intended system architecture, domain boundaries, persistence boundaries, extension points, and migration direction.  
> **DOES NOT OWN:** Product market strategy, coding conventions, or current implementation truth.  
> **CURRENT-STATE RULE:** Current behavior is established by code, Prisma schema, migrations, and executable tests. Where current code differs from this target, the target is labelled as a migration destination, not as implemented behavior.

## 1. Architecture goals

Lumora optimizes, in order, for correctness, security, simplicity, speed, modularity, extensibility, observability, testability, and user value. The chosen deployment shape is a modular monolith with PostgreSQL, a transactional outbox, background workers, and replaceable infrastructure adapters. Services are split only after measured operational need.

## 2. Chosen approach and alternatives

| Decision | Alternatives considered | Chosen approach | Why / future impact |
|---|---|---|---|
| Object storage | Table per type; EAV; pure JSON; document DB; graph DB | Universal Object core + JSON attributes + typed sidecars | Keeps identity/access universal while preserving integrity escape hatches |
| Actions | Object-specific task tables; reminders only; workflow engine | First-class Responsibility and ResponsibilityOccurrence | Generalizes assignment, execution, recurrence, and critical completion |
| Async work | synchronous hooks; DB triggers; direct queues; event broker | Transactional outbox + idempotent consumers | Avoids lost publication and optional-service coupling |
| Capabilities | plug-in runtime; giant switch; rules engine; microservices | Code-backed modules with declarative descriptors | Extensible without untrusted execution complexity |
| API | GraphQL; RPC; BFF; event-only | REST resources plus explicit commands | Stable, observable, mobile-friendly contracts |
| Tenancy | application filter only; schema per tenant; DB per tenant; RLS | Shared database, strict authorization, tenant-scoped repositories; RLS later as defense-in-depth | Right complexity for current stage |
| UI | type-specific apps; generic schema renderer; microfrontends | Dynamic base UI + curated type-specific quick-add/detail sections | Preserves platform while delivering usable experiences |

## 3. System context and dependency direction

```text
Mobile / Web / Admin
  → REST API and DTO contracts
  → application use cases and authorization policies
  → domain aggregates, rules, ports, events
  → infrastructure adapters
  → PostgreSQL / queue / storage / provider SDKs
```

Domain code does not depend on Prisma, Nest controllers, React Native, queues, cloud storage, payment SDKs, AI SDKs, or localization libraries. UI does not access Prisma or internal infrastructure.

## 4. Domain modules

Core modules are Identity, Workspace, Authorization, Objects, Object Definitions, Responsibilities, History, Attachments, Relationships, Templates, Search, Notifications, Entitlements, and Audit.

Optional modules are Gamification, Chat, AI, Analytics, Integrations, and Company workflows. Optional modules consume stable events and may not be dependencies of Object mutation.

## 5. Universal Object Model

The Object aggregate owns identity, tenant identity, title, type key, lifecycle, revision, core system state, attributes, and domain events. Every object uses a stable namespaced type key. Object definitions and templates are versioned records/configuration with controlled validation; arbitrary executable user code is prohibited.

### JSON versus relational boundaries

Use relational structures for identity, workspace ownership, ACLs, memberships, responsibility execution, files, money, schedules requiring integrity, relations, events, and audit. Use JSONB for low-risk type-specific attributes that do not need relational integrity, uniqueness, aggregate reporting, or frequent indexed querying.

## 6. Responsibility architecture

`Responsibility` defines the intent and policy. `ResponsibilityOccurrence` represents a concrete due execution. `ResponsibilityExecution` is immutable evidence of an outcome.

```text
Object → Responsibility → ResponsibilityOccurrence → ResponsibilityExecution
```

The minimal model contains object reference, workspace, title, status, schedule/due time, assigned people, allowed actors, priority, criticality, revision, and timestamps. Claim, evidence, approval, escalation, dependencies, location, and handover are optional extensions.

Critical occurrences use a database transaction with conditional state transition and an idempotency key. Completion returns a conflict containing safe status information if another actor already completed it. Offline clients submit a stable action idempotency key and reconcile against server truth.

## 7. Access, authorization, and tenancy

Authorization is evaluated at three levels:

```text
Workspace membership and role
  → Object visibility/ACL
  → Capability or action permission
```

Workspace membership is necessary but insufficient. Access scopes are Private, Selected People, Team, Workspace, and Temporary External. Roles are policy names such as Owner, Manager, Member, Contributor, Caregiver, and Guest; family or job titles are not hardcoded.

Every tenant request has one canonical workspace context from its route or signed command. Request bodies never establish or override workspace identity. Repositories require workspace scope by default. Background jobs must validate workspace/object ownership before mutation. Cache keys and projection records include workspace identity.

## 8. Capability architecture

A capability is a versioned, code-backed module with stable key, object compatibility, owner module, permission requirements, event subscriptions, UI metadata, retry policy, and optional entitlement requirement. Capabilities attach by policy/definition/template; they are not arbitrary hook code running inside object writes.

Core validation capabilities may run synchronously only when they protect correctness. Derived capabilities subscribe asynchronously to outbox events. A new capability must declare data ownership and projection rebuild strategy.

## 9. Runtime and command architecture

The production runtime is the application command path, not a second competing object framework.

```text
Controller → authenticate → authorize → use case → aggregate/rules
→ transaction + CAS + outbox → response
```

If a generic Object Runtime remains, it is a thin orchestration/validation component invoked by this path. It must not maintain a separate persistence abstraction or lifecycle that diverges from aggregates.

## 10. Events, outbox, idempotency, retries, and projections

Object and responsibility mutations stage an outbox message in the same transaction. Consumer delivery is at-least-once. Each consumer is idempotent using event identity or projection natural keys.

```text
Committed core transaction
  → Outbox event
  → consumer retry/backoff
  → completed or dead-lettered state
  → replay/rebuild supported
```

Projection handler errors must propagate to the worker retry mechanism; logging an error and marking an event complete is forbidden. Every projection has a natural unique identity and replay mechanism.

## 11. Search, timeline, reminder, notification, and attachment architecture

**Search:** authorized workspace-scoped projection. Begin with PostgreSQL full-text search and bounded results; replace through a provider port only when measured needs justify it. Reindexing is mandatory.

**Timeline/history:** append-only, idempotent, event-correlated records. History is paginated and contains actor, time, action, safe metadata, and object/workspace context. It is not a generic social feed.

**Reminders:** responsibilities generate occurrences. A scheduler identifies due occurrences and dispatches idempotent work. Time zones are explicit. A missed delivery does not erase the occurrence.

**Notifications:** notification intent is created from events; provider delivery is asynchronous and retryable. Recipients, visibility, lock-screen content, and delivery attempts are persisted. Provider failure cannot alter core action state.

**Attachments:** API issues an authorized upload intent; storage upload, validation/scan, finalization, thumbnail/OCR, and download access are separate. Downloads use short-lived scoped URLs. Attachment metadata is linked to object/workspace and is never public by default.

## 12. API and DTO contract strategy

REST endpoints use resource operations and explicit state-transition commands. DTOs validate syntax; domain/application rules validate semantics. Responses are projections, never raw Prisma models. Errors use a stable machine-readable contract. Unbounded lists require cursors. Non-idempotent creates and critical completion commands require idempotency keys. Mutations use revision/ETag/CAS semantics.

## 13. Database architecture, indexing, and concurrency

PostgreSQL is the source of persistence truth. Every tenant-scoped table has non-null workspace ownership unless deliberately global, appropriate FKs, natural uniqueness, and indexes that match access patterns.

Required index patterns include:

- workspace + lifecycle/filter + cursor order for objects and responsibilities;
- workspace + due state/time for scheduler work;
- workspace + projection identity for search/history;
- object + chronology for history/attachments;
- expiry time for temporary access;
- idempotency key for externally retried commands.

Use optimistic concurrency for user edits. Use conditional atomic transitions or locking for critical execution. Avoid offset pagination for growing collections. Avoid N+1 query patterns through explicit read projections, not accidental eager graphs.

## 14. Caching and performance

Caching may accelerate derived read models only. It is never the authorization source of truth and never the only representation of core user data. Cache keys include workspace and projection identity. Invalidations are event-driven where practical; cache misses must remain correct.

List views are light; detail views fetch relevant depth; attachments and history load lazily; search returns bounded projections. Mobile clients use network-aware retries and optimistic UI only where server conflicts are clear and safe.

## 15. UI, mobile, design system, and localization boundaries

The UI consumes stable contracts and presentation metadata. Motion, depth, 3D illusion, theme, layout, and gamified feedback live in design-system and client layers. Reduced-motion and accessibility variants are mandatory. No animation, screen component, or language condition may leak into domain/persistence logic.

Localization uses message IDs, locale resources, ICU pluralization, user/workspace locale preferences, timezone-aware formatting, and future RTL-ready tokens. Domain keys remain locale-neutral.

## 16. Entitlements, AI, chat, integrations, service providers, and company workflows

Entitlements are a server-side module that exposes plan, capability access, limits, quotas, usage, and grace periods. No scattered premium checks.

AI is an optional, consent-aware, permission-scoped provider behind a port. It receives minimal authorized context, logs safe audit metadata, and cannot mutate core data without an explicit user-approved command.

Chat is a future module with object/action threads, workspace announcements, and later private conversations. It reuses access policies but owns its retention, message, notification, and attachment data.

Integrations are asynchronous adapters consuming/outgoing events. Company and service-provider workflows reuse objects, responsibilities, ACLs, teams, evidence, approval, and temporary access rather than a separate platform.

## 17. Observability, security, failure isolation, and scalability

Structured logs use correlation IDs and redact private content, tokens, attachment paths, and sensitive attributes. Metrics cover API latency, authorization failure, outbox lag/retries/dead letters, scheduler latency, notification delivery, storage failures, and projection age. Health endpoints distinguish process liveness, startup, readiness, and worker health.

Core availability depends on PostgreSQL and required authorization infrastructure only. Search, timeline, provider delivery, AI, chat, analytics, gamification, and integrations degrade independently. Workers are deployable separately when workload requires it.

At early scale, use a modular monolith. At larger scale, separate workers, storage/CDN, and search only after measurement. Do not adopt microservices, Kubernetes, graph databases, workflow engines, distributed caches, or multi-region writes without demonstrated need.

## 18. Extension points and future-change budget

| Change | Expected change | Migration expectation | Bottleneck to avoid |
|---|---|---|---|
| Object type | definition/template/UI, optional sidecar | Usually none | platform switch statements |
| Responsibility type | policy/template/capability | Usually none | per-category action tables |
| Capability | module + events + projection | Only if it owns durable data | runtime plug-in coupling |
| Workspace type/role | defaults and policies | Usually none | duplicate auth systems |
| Language | translation resources | None | language in domain rules |
| Provider | infrastructure adapter | None unless data model changes | SDK leakage |
| Chat/gamification/AI | optional module/projection | Isolated tables | core-write dependency |
| Offline support | sync protocol/conflicts | Significant, later | pretending HTTP cache is sync |
| Import/export | contract module | Additive after stable data contract | exporting internal schema |

## 19. Current migration direction

Current implementation has useful Object, Prisma, CAS, outbox, RBAC, UI, and template foundations. It also has legacy object paths, inconsistent event paths, inactive operational modules, unused runtime/capability execution, insecure endpoint boundaries, and incomplete product clients. Preserve proven aggregate/CAS/outbox patterns; migrate legacy paths incrementally with contract and tenant tests. No target claim in this document implies current implementation exists.

## 20. Architectural anti-patterns and decision rules

Never introduce: a giant object-type switch, arbitrary user code, a generic plug-in runtime, object-specific foundational tables, raw provider SDKs outside infrastructure, public “internal” endpoints, required external side effects inside core transactions, unbounded list endpoints, or UI-driven persistence rules.

Before accepting a design, ask: does it strengthen correctness/security, preserve optional failure isolation, remain additive for types/capabilities, avoid language/provider/UI coupling, and have a testable migration path? If not, prefer the simpler design.
