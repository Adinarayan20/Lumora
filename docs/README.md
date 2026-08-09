# Lumora Master Documentation Index & Architecture Graph

Welcome to the Lumora Master Documentation Suite. This directory forms the single source of truth for engineering, product, design, operations, and AI coding agents.

---

## 1. Documentation Architecture & Flow Graph

```
                                  docs/README.md
                                        │
     ┌──────────────────────────────────┼──────────────────────────────────┐
     │                                  │                                  │
     ▼                                  ▼                                  ▼
TECHNICAL SOURCE OF TRUTH    PRODUCT EXPERIENCE & DESIGN      EXECUTION & DEBT
(What exists technically)    (Intended experience & UI)    (Sequence & backlog)
     │                                  │                                  │
     ├─ CURRENT_ARCHITECTURE.md         ├─ Product Experience Blueprint    ├─ PRODUCT_ROADMAP.md
     ├─ DEVELOPMENT_BOUNDARIES.md       └─ Icon Platform Constitution      ├─ TECH_DEBT.md
     ├─ IMPLEMENTATION_GUIDELINES.md                                       └─ PERFORMANCE_BASELINE.md
     └─ ADR-001 .. ADR-016
```

### Key Distinction Rules for Future Engineers & AI Agents:
- **[`CURRENT_ARCHITECTURE.md`](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/CURRENT_ARCHITECTURE.md)** = **TECHNICAL SOURCE OF TRUTH** (Describes what exists technically, data boundaries, CAS concurrency, tenant isolation, and backend rules).
- **Product Experience Blueprint** = **INTENDED EXPERIENCE & DESIGN DIRECTION** (Describes visual requirements: light/dark themes, liquid/glass motion, haptics, organic/3D visuals, progress/streaks, completion celebrations. *Visual/experience requirements MUST NEVER alter backend persistence architecture.*).
- **[`PRODUCT_ROADMAP.md`](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/PRODUCT_ROADMAP.md)** = **IMPLEMENTATION SEQUENCE** (Describes past completed phases, current reconciliation, and future build order).

---

## 2. Documentation Classification Inventory

### 2.1 Current Authoritative Technical Architecture
- **[`CURRENT_ARCHITECTURE.md`](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/CURRENT_ARCHITECTURE.md)**: Authoritative system inventory, dual object model (`UniversalObject` vs `ObjectAggregate`), three-tier repository audit, CAS concurrency, tenant isolation, outbox pattern, and UI Independence Law with Change Impact Matrix.
- **[`DEVELOPMENT_BOUNDARIES.md`](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/DEVELOPMENT_BOUNDARIES.md)**: Team ownership boundaries (Frontend, Backend, Database, Design, Security) and explicit AI Agent STOP rules.
- **[`IMPLEMENTATION_GUIDELINES.md`](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/IMPLEMENTATION_GUIDELINES.md)**: Tactical coding standards, layer dependency direction, error handling contracts, and DDD aggregate constraints.

### 2.2 Execution, Roadmap & Backlog
- **[`PRODUCT_ROADMAP.md`](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/PRODUCT_ROADMAP.md)**: Phase roadmap (Completed A–E, Current Reconciliation Pass, Next Product Construction Stage, Approved/Not Implemented, Deferred infrastructure).
- **[`TECH_DEBT.md`](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/TECH_DEBT.md)**: Technical debt registry tracking deferred items (TD-001 through TD-025) with trigger criteria and risks.
- **[`PERFORMANCE_BASELINE.md`](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/PERFORMANCE_BASELINE.md)**: Development environment SLA benchmarks, measurement context, pagination controls, and query limits.

### 2.3 Product Experience & Design System Specifications
- **[`lumora_icon_platform_constitution.md`](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/lumora_icon_platform_constitution.md)**: **DESIGN SYSTEM SPECIFICATION** — Standardizes icon semantics, touch target sizes, visual weights, and presentation tokens.
- **Product Experience Blueprint**: **PRODUCT EXPERIENCE SPECIFICATION** — Defines the visual direction for Lumora's UI experiences (light/dark themes, liquid/glass motion, haptics, organic/3D visuals, meaningful progress/streaks, subtle completion celebration).

### 2.4 Current Operational Documentation
- **[`operations/DEPLOYMENT_GUIDE.md`](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/operations/DEPLOYMENT_GUIDE.md)**: Production environment setup, database migrations, security configuration, and health probes.
- **[`operations/RUNBOOK.md`](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/operations/RUNBOOK.md)**: Local development setup, Prisma migration workflows, and common operational tasks.
- **[`architecture/capability-engine-runtime.md`](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/capability-engine-runtime.md)**: Operational guide for `UniversalCapabilityEngine` execution and dependency resolution.

### 2.5 Historical & Review Evidence (Retained)
- **[`architecture/PHASE_5_MASTER_ARCHITECTURE.md`](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/PHASE_5_MASTER_ARCHITECTURE.md)**: `HISTORICAL / PARTIALLY SUPERSEDED` — Original Phase 5 master platform design blueprint.
- **[`architecture/PHASE_5_ARCHITECTURE_REVIEW.md`](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/PHASE_5_ARCHITECTURE_REVIEW.md)**: `HISTORICAL / PARTIALLY SUPERSEDED` — Senior staff architecture review panel evaluation.

---

## 3. Architecture Decision Records (ADR) Index

| ADR ID | Title | Status | Primary Focus |
|---|---|:---:|---|
| **[ADR-001](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/adr/ADR-001-global-exception-filter.md)** | Global ApplicationException Filter | Accepted | Transport Exception Mapping |
| **[ADR-002](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/adr/ADR-002-result-pattern.md)** | Monadic Result Pattern for Control Flow | Accepted | Error Control Flow |
| **[ADR-003](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/adr/ADR-003-timeline-schema-v2.md)** | Universal Timeline & Audit Engine | Accepted | History & Timeline Audit |
| **[ADR-004](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/adr/ADR-004-facade-cleanup.md)** | CQRS Pattern & Application Use Cases | Accepted | Application Use Cases |
| **[ADR-005](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/adr/ADR-005-redis-infrastructure.md)** | Keyset (Cursor) Pagination Architecture | Accepted | Pagination Infrastructure |
| **[ADR-006](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/adr/ADR-006-universal-search.md)** | Search Indexing Projection Engine | Accepted | Search Projection |
| **[ADR-007](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/adr/ADR-007-media-and-attachments.md)** | File Asset & Media Storage Abstraction | Accepted | Media Storage |
| **[ADR-008](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/adr/ADR-008-notifications-engine.md)** | Notification & Reminder Engine | Accepted | Notifications & Reminders |
| **[ADR-009](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/adr/ADR-009-user-and-workspace-settings.md)** | Settings Engine Bounded Context | Accepted | User & Workspace Settings |
| **[ADR-010](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/adr/ADR-010-design-system-foundations.md)** | Design System Foundation & Motion Engine | Accepted | UI Tokens & Motion Physics |
| **[ADR-011](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/adr/ADR-011-capability-engine-architecture.md)** | Universal Capability Engine Architecture | Accepted | Capability Engine & Lifecycle |
| **[ADR-012](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/adr/ADR-012-starter-library-template-system.md)** | Starter Library & Template Package System | Accepted | Package & Manifest System |
| **[ADR-013](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/adr/ADR-013-universal-platform-architecture.md)** | Universal Life Operating System Platform | Accepted | Platform Architecture |
| **[ADR-014](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/adr/ADR-014-platform-kernel-and-runtime.md)** | Platform Kernel, Runtime & Schema Registry | Accepted | Kernel & Runtime Engine |
| **[ADR-015](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/adr/ADR-015-phase-e-persistence-foundation.md)** | Phase E Persistence Foundation & CAS | Accepted | Atomic CAS Persistence |
| **[ADR-016](file:///c:/Users/adina/OneDrive/Desktop/Job/Project/Lumora/docs/architecture/adr/ADR-016-object-repository-migration-path.md)** | Three-Tier Object Repository Migration | Accepted | Repository Disambiguation |
