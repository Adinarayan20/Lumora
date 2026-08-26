# Lumora System Architecture

> **STATUS:** FROZEN
> **OWNS:** Technical architecture, module boundaries, dependency direction, persistence and concurrency mechanisms, failure isolation, implementation-truth tracking.
> **DOES NOT OWN:** Product intent (`01`), domain meaning/invariants (`02`), security/reliability operational detail (`04`), implementation sequencing (`05`). This document implements the frozen domain contract; it does not reinterpret it.
> **AUTHORITY:** Per `00_DOCUMENTATION_INDEX.md`. Compiled from a series of drafting and correction-gate passes; every decision below was independently verified against `02` before being frozen, not asserted.

---

## 1. Architecture Goals and Approach

Correctness, security, simplicity, speed, modularity, extensibility, observability, testability, cost — in that priority order when they conflict. Deployment shape: modular monolith, PostgreSQL, transactional outbox, background workers. Services split only after measured operational need — a standing decision, not a placeholder deferral.

## 2. Chosen Approach vs. Alternatives

| Decision | Alternatives rejected | Chosen | Why |
|---|---|---|---|
| Object storage | table-per-category; pure EAV; pure JSON document store | Typed common columns + JSONB attributes | Preserves identity/access/history as real relational integrity while keeping category-specific fields flexible |
| Occurrence identity | pre-materialized rows per future date; ad-hoc per-request generation | Deterministic key, computed on demand, no dedicated table | Avoids unbounded row growth for never-acted-on occurrences (02 §5.4) |
| Concurrency (fields) | last-write-wins; CRDT merge; pessimistic locking | Object-level optimistic revision | Matches 02 §24 exactly; no new infrastructure class |
| Concurrency (Execution/Item) | application-level discipline only | Atomic check-and-set on a Derived-State tracking row | Provable idempotency without mutating immutable Facts |
| Async work | synchronous side effects in the write path; direct message broker | Transactional outbox + idempotent consumers | Tier-1 truth (History) is never coupled to Tier-3 delivery |
| Time-driven work | outbox consumer | Separate scheduler with idempotent claim | Due-instant is not a domain mutation; nothing exists for an outbox to react to |
| Capabilities | generic plugin/registry runtime | Ordinary application code, governed by 02 §35's checklist | Directly closes a failure mode already observed once in this project's repository history |
| API | GraphQL; RPC-only | REST resources + explicit state-transition commands | Bounded payloads, observable, mobile-friendly |

## 3. System Context and Dependency Direction

```
Mobile / Web / Admin
  → REST API + DTO contracts
  → Application layer (use cases, authorization policies)
  → Domain layer (Object, Responsibility, Occurrence, Execution, Correction, Access, History — pure, no framework deps)
  → Infrastructure adapters (Prisma, queue, storage)
  → PostgreSQL / queue / storage
```

Domain code has zero dependency on ORM, HTTP framework, queue client, or provider SDK — a hard boundary. This directly fixes the one concrete violation found in the original repository audit: a service layer that imported generated Prisma types directly into what should have been pure domain logic.

## 4. Domain Module Boundaries — Two Distinct Categories, Not One

**V1 optional Object capabilities** (Notes, Attachments, Items, Responsibility): additive, transactional, part of the core write path when invoked. Never async consumers. Never Tier 3.

**Tier-3 projections** (Timeline, Search, Usage Metadata, Analytics, Gamification, Notification *delivery* — not the Responsibility's notification-enabled flag, which is core state): async, outbox- or scheduler-driven, independently failable, never authoritative.

No Tier-3 projection may be imported by a Core module. Core truth must never depend on a projection's freshness or availability. V1 capabilities are not "optional modules consuming events" — they are part of the transactional core when in use.

## 5. Object Runtime and Command Path

```
Controller → authenticate (stateless) → resolve Workspace server-side, never from request body (stateless)
  → BEGIN transaction
      → evaluate authorization against current authoritative state (Ownership / assignee / Grant)
      → execute domain mutation
  → COMMIT
```

Authentication and Workspace resolution are cheap gatekeeping before any transaction begins. The authorization *decision* happens transactionally, evaluated against current state in the same transaction as the mutation it gates — closing the TOCTOU gap that would exist if authorization were checked earlier and separately. One command path; no second, parallel "generic object runtime."

## 6. Responsibility → Occurrence → Execution → Correction Architecture

**Tier 1 Facts, immutable, append-only, UPDATE/DELETE revoked at the database-role level:**
- `execution`: `id, occurrence_key, actor_id, outcome (Completed|Skipped), created_at`. Skip is not a separate mechanism — it is an Execution row parameterized by outcome, using the identical constraint and reconstruction logic as Completed.
- `correction`: `id, execution_id (FK, UNIQUE), actor_id, created_at`. The `UNIQUE(execution_id)` constraint enforces "at most one Correction per Execution" at the database level, backing a rule already true at the domain level (02 §23's "still active" precondition) — not a separate policy invented for convenience.

**Tier 2 Derived State, disposable, provably reconstructible from Tier 1:**
- `occurrence_tracking`: `occurrence_key (PK), current_execution_id (nullable FK)`. Materializes lazily on first Execution.
- **Reconstruction rule, proven, not assumed:** at any point in time, at most one Execution per `occurrence_key` has no corresponding Correction — a direct consequence of the transactional design (a new Execution can only be created when none is active; a Correction can only target the currently-active one). That one Execution, if it exists, is the reconstructed `current_execution_id`.
- **Recovery safety:** there is no "missing row defaults to NULL" code path anywhere. Every read that finds no tracking row triggers reconstruction from Facts in the same transaction, then `INSERT ... ON CONFLICT DO NOTHING`. Reconstruction is a pure, deterministic function of immutable Facts — concurrent reconstructions of the same missing row compute identical answers independently, so it doesn't matter which insert wins the race.

**Concurrency, stated precisely (not "first wins"):** operations serialize at the `occurrence_tracking` boundary; each operation evaluates against the state committed by the immediately preceding one. A later, *different-type* operation may legitimately change the effective outcome — a Completion committing, followed by a Correction that legitimately succeeds against that now-current state, is the expected chain, not a race anomaly. Only same-type operations racing for the same transition (two Completions, two Corrections) resolve to "first succeeds, second idempotently resolves to the existing fact."

**Correction Window:** evaluated against the Execution's server-recorded timestamp, never client-perceived elapsed time — holds identically online and offline (02 §23).

## 7. History Architecture — Tier 1, Not a Projection

```
Domain Mutation
      │
      ├── specialized authoritative Fact (Execution / Correction, where applicable)
      │
      └── authoritative History record — same transaction, independently authoritative
```

Execution is authoritative for Execution semantics. Correction is authoritative for Correction semantics. **History is authoritative for the historical record of meaningful domain actions — a first-class Tier-1 fact, not a byproduct and not a projection of the specialized tables.** For most action types (Object lifecycle, Grant, Occurrence Override, Attachment, Responsibility pause/resume/cancel), History is the *only* Tier-1 record — there is no specialized table for it to be "derived from." Where Execution/Correction are involved, both are written atomically in the same transaction as History; divergence is structurally impossible, not merely unlikely, because there is no window in which one could exist without the other.

`Timeline` remains downstream of `History` (Tier 3 over Tier 1) — unchanged, correct, and the one place a genuine projection relationship exists in this chain.

## 8. Occurrence Persistence and next_due_at

**Decision, stated explicitly:** Occurrence has deterministic identity (02 §5.4) but no dedicated table. Nothing is persisted for an occurrence that hasn't been acted on.

**`Responsibility.next_due_at`** — Tier 2, a scheduling/query optimization only. **It is not "the current occurrence," "the current Execution," or "the only actionable occurrence."** A Missed occurrence can sit at `next_due_at` indefinitely; any occurrence — historical, Missed, or future — remains independently addressable by its own deterministic identity and actionable per domain rules regardless of what this field currently points at.

**Precise definition:** the due-instant of the earliest occurrence in the Schedule's sequence with no active Execution.

**Recompute triggers:**
- Creation: from the Schedule's first occurrence.
- Completion/Skip of the occurrence at `next_due_at`: advances to the next occurrence in sequence.
- **Missed: no change** — stays pinned, so a backlog of missed occurrences stays visible rather than silently rolling forward.
- Correction: moves backward if the corrected occurrence's due-instant is ≤ the current value.
- Schedule edit: recomputed under the new Schedule only if not-yet-due; unaffected if already-due-and-unresolved (02 §32).
- Pause: cleared. Resume: recomputed fresh. Cancel: cleared permanently.
- Timezone change/DST: never cached independent of recomputation — every trigger above recomputes through 02 §32's wall-clock-anchored logic fresh.

## 9. Notification and Scheduler Architecture

**Causality, corrected and explicit:**
```
Responsibility/Schedule → Occurrence → notification scheduling → Notification Intent → delivery
                                                                                            ↓
                                                                                      user action
                                                                                            ↓
                                                                                completion command
                                                                                            ↓
                                                                          Execution idempotency (§6)
```
Notification has no authority to create an Execution. Duplicate delivery is harmless because the completion command's idempotency, not the notification, is what prevents duplicate facts.

**Outbox vs. scheduler, distinct mechanisms:** the transactional outbox reacts to domain *writes*. The notification scheduler reacts to the *passage of time* — a due instant is not a mutation, so nothing exists for an outbox to consume. A separate, periodic process scans `next_due_at <= now`.

**Scheduler concurrency:** `notification_intent` carries `UNIQUE(responsibility_id, occurrence_key)`. Workers attempt `INSERT ... ON CONFLICT DO NOTHING`; only the worker whose insert lands proceeds to dispatch — the same idempotent-claim pattern as Execution, reused rather than reinvented.

Content redaction (elevated Sensitivity, 02 §12.4/§13.9) happens at Intent-creation time, before any provider is involved.

## 10. Final Tier Model

| Tier | Contents | Guarantee |
|---|---|---|
| **1 — Authoritative Facts** | Object, Access, History, Responsibility, Execution, Correction | Never derived, never stale, never optional |
| **2 — Derived State** | Effective Occurrence outcome, `occurrence_tracking`, `next_due_at` | Always reconstructible from Tier 1; disposable; never independently authoritative |
| **3 — Projections** | Timeline, Search, Usage Metadata, Analytics, Gamification | May be stale, rebuilt, or unavailable without touching Tier 1 or 2 |

## 11. Timeline, Search, and Relationships — Extension Points Only

Timeline: read-only materialized view over History Facts, rebuildable, no write path into it except its own consumer. Search and Relationships: no V1 storage, API, or service — the outbox already carries every event a future consumer would need; adding one later is additive, not a migration.

## 12. Items Architecture

`item` rows, FK'd to a List-shaped Object, each independently updatable (own optimistic check, not the parent Object's revision — forcing Item edits to contend on Object-level revision would break concurrent checkoff on a shared list, 02 §6.3). No `responsibility_id`, no independent history, no independent access column on Item, ever — enforced by schema, not discipline. Promotion to a full Object (02 §6.4) is an explicit application operation, never an in-place schema change.

## 13. Workspace and Access Enforcement Boundary

Every request carries one resolved Workspace context, derived server-side, never trusted from a request body. Every Object read re-checks `object.workspace_id` against the resolved context on every access, not only at creation. Grant evaluation and Owner-override (02 §8.5.1, with its explicit rationale) execute inside the same transaction as the operation they gate.

## 14. Authorization Architecture — Capability Keys Are Vocabulary, Not RBAC

A capability key (`responsibility.occurrence.complete`) names *what* is checked — it is not a role, a permission grant, or evidence of a role-resolution engine. For V1, the evaluation behind nearly every key is simply "is the actor the Object's Owner" (02's Owner-only rules, restored after "workspace role with edit authority" was found undefined in five places during domain hardening). The one exception is Responsibility completion, where an active assignee also qualifies. No permission matrix, no role table, no general resolution engine exists or is implied. This applies specifically to object-level access and action authority — whether a given actor may view or act on a given Object — which `02` §8 governs via Owner status and Grants. It does not describe or constrain workspace/platform-administration authorization (workspace membership, workspace-level roles, administrative operations), which remains a separate concern served by the existing RBAC infrastructure (`Role`/`Permission`/`RolePermission`). The two are architecturally distinct layers answering different questions — workspace-administration authority versus object-level access — and neither replaces the other.

## 15. Category/TypeKey Presentation Architecture

`Object.type_key`: plain, namespaced string, data, never a domain branch point (02 §12.1). Static presentation registry (external to the domain layer) maps `type_key → { icon, display name, quick-add hints, default Sensitivity, curated-experience component if any }`. Custom objects: null/generic `type_key`, generic fallback experience, no special-casing.

**`type_key` is immutable after creation — a `03` architectural decision, not a `02` mandate** (02 uses "stable," which doesn't itself disambiguate mutability). Chosen for consistency with Template Provenance's immutability and with the explicit V1-Not-Supported status of retroactive template application (02 §38) — allowing free re-labeling of presentation category while forbidding retroactive re-structuring would be an inconsistent pair of rules. A future "recategorize" feature remains a distinct, small, unresolved possibility — not decided here.

## 16. Template Snapshot Storage

Selecting a template copies content into the new Object's own rows in the same transaction as creation. `template_id`/`template_version` stored as provenance only, never re-read by domain operations. Usage Metadata computed by a separate periodic aggregation job — never a live query in the Object-creation or read path.

## 17. Offline Synchronization Boundary

- **SET-A-FACT** (Execution/Completion, Skip, Item state): idempotent by deterministic key; safe to queue and replay unmodified.
- **FIELD EDIT** (Object attributes, Notes): revision-checked identically offline and online — a replayed edit against a stale revision is rejected exactly as online, never silently applied.
- **CAPABILITY-SPECIFIC** (Attachments): not assumed covered by the above two patterns. Attachment upload involves byte transfer, partial-failure handling, and quota — fundamentally different from replaying a small command. Offline attachment queueing is not guaranteed by this general model in V1 and would need its own explicit design if required.

**Named test:** Execution created at server T0; client goes offline; Correction submitted at local-elapsed T0+8min but server-observed T0+35min → rejected. Window evaluated against server-recorded T0, never client-perceived elapsed time.

## 18. API/DTO Contract Boundary

REST resources plus explicit state-transition commands (`POST /occurrences/{key}/complete`, `POST /executions/{id}/correct`), never `PATCH` on a raw field bag. Mutating responses return actual current domain state (per the transactional check), never a client-echoed guess. DTOs hand-shaped per use case, never a serialized ORM model.

## 19. Observability

Structured logs, correlation IDs, redaction of any field belonging to an elevated-Sensitivity Object. Per-consumer outbox lag/dead-letter metrics (Notification, Timeline, Search, Usage Metadata tracked separately — a stuck consumer must be diagnosable without being masked by a healthy one). **Reminder delivery success rate** elevated to a first-class named metric, not incidental monitoring, per 01's identification of it as the single highest-stakes technical dependency of the product thesis. Health endpoints distinguish liveness, readiness, startup, and worker health separately.

## 20. Testing Boundaries

Domain layer: pure unit tests, no database, no framework — guaranteed by §3's dependency direction. **02's Testable Rules sections are the literal acceptance-test specification**, including the full five-branch precedence tree (02 §39). Use-case layer: integration tests against a real test database, with mandatory concurrency tests — two simultaneous completions must be tested to produce exactly one Execution; two simultaneous field edits must be tested to produce one accepted write and one surfaced conflict.

**Required named tests, this document:** History/Execution/Correction atomicity (§7); occurrence_tracking recovery under concurrent reconstruction (§6); the sequential-not-racing Completion→Correction chain (§6); offline Correction-window rejection (§17); scheduler duplicate-intent prevention (§9).

## 21. Scalability and Cost Boundaries

Modular monolith remains one deployable unit; workers separated only where genuinely needed for throughput. No Kubernetes, no managed search cluster, no Redis — consistent with standing cost discipline and the original repository audit's finding that Redis was premature there. Indexes derived from the explicit persistence model above: `(workspace_id, next_due_at)` on `responsibility` (not on any Occurrence table, since none exists), `(object_id, created_at)` on `history`, unique-where-current on `occurrence_tracking.occurrence_key`. Execution/Correction/History grow unboundedly by design — a storage-volume question deferred to real usage data, not a correctness risk.

## 22. Security Threat Model — Summary (full detail owned by `04`)

Non-sequential Object IDs remove enumeration as a viable attack independent of workspace-scoping (defense in depth, not reliance on either alone). Every controller passes through the identical authentication + authorization guard — a structural rule specifically because the repository audit found one controller (Templates) that skipped it, with a spoofable `workspaceId` accepted from the request body. Attachment downloads use short-lived scoped signed URLs. Admin operations require their own explicit authorization check, distinct from ordinary Object-level checks.

## 23. Implementation Truth vs. Target

Repository truth as of HEAD `4974ccaae3e2fd10bca5084fd833ad4b298ffb34` (refreshed from the original `903fbad` snapshot). This describes what the repository's source code, `schema.prisma`, and committed migration files contain — it does not describe or assume the state of any actual database, which repository evidence alone cannot establish.

| Item | Repository Truth |
|---|---|
| Space | Domain aggregate and `Object.spaceId` removed from application source and `schema.prisma`. A migration dropping the `Space` table and `Object.spaceId` column is committed to the repository's migration history; whether it has been executed against any database is not established by repository evidence. |
| Relationship | Domain/application/infrastructure code and the `Relationship` model removed from application source and `schema.prisma`. The same migration referenced above also drops the `Relationship` table; same caveat on execution status. |
| Household | Removed from application source. Never had a corresponding table in any committed migration — no database-side action was ever required for this one. |
| Template Engine | Package-manager-style install/upgrade/rollback/version/dependency-resolution code removed from application source. `Template`/`InstalledTemplate` removed from `schema.prisma`; neither ever had a corresponding table in any committed migration. |
| Capability Engine | `CapabilityRegistry`, `CapabilityExecutor`, and `UniversalCapabilityEngine` — the capability-execution runtime — removed from application source. Distinct from the object-type cataloging code that remains: `ObjectCatalogRegistry` (`packages/shared`, static/in-memory) is live, wired, and consumed by `LumoraPlatformKernel` at boot. `SchemaRegistryAggregate` and `ObjectDefinitionRegistryAggregate` (`apps/backend/src/domain/catalog/`) and their application-layer use-cases exist and are tested but are not registered as a provider in any module — `CatalogModule` itself wires only an intentionally-stubbed `CatalogService`/`CatalogController`. None of this was part of what was removed. |
| `LumoraObjectRuntime` | Removed from application source (confirmed zero consumers outside its own test file prior to removal). |
| Unused domain Redis caches | Object/Workspace/User cache providers removed from application source, after confirming zero consumers in the repository. |
| Legitimate Redis infrastructure | Rate limiting, schema cache, and queue transport (BullMQ) remain in the repository, each retained independently of the removal above. |
| Reminder / ReminderExecution / Notification | Unchanged from the pre-cleanup model in application source — still the mutable-state implementation. Rebuild has not started; excluded from the approved clean-baseline migration target under design (§6 of this document specifies the intended replacement architecture). |
| RBAC (`Role`/`Permission`/`RolePermission`) | Unchanged, present in application source. See §14's clarified scope for its relationship to object-level Grants. |
| Mobile app | Clean scaffold, zero product screens, unchanged from the original repository state. |

**Build/test health: unverified** — `prisma generate` blocked by this sandbox's network allowlist (`binaries.prisma.sh` not reachable); stated as an environment limitation, not claimed either way. **Target architecture: defined** (this document). **Implementation conformance: not yet established.**

## 24. Deferred to `04_DATA_SECURITY_RELIABILITY.md`

Exact retention/erasure mechanics and legal policy, encryption specifics, detailed rate-limit thresholds, backup/disaster-recovery procedures, incident response process, full threat model.

## 25. Deferred to `05_ROADMAP_IMPLEMENTATION_CONTRACT.md`

Implementation sequencing, phase ordering, engineering-process rules.
