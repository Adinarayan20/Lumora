# Lumora Master Documentation Index & Information Architecture

> **STATUS**: Authoritative Documentation Index & Governance Rule
> **LAST RECONCILED**: 2026-08-10 (HEAD `92fb2fe`)

Welcome to the Lumora Master Documentation Suite. This directory forms Lumora's documentation governance system. Authority is category-based across engineering, product, design, operations, and AI coding agents.

---

## 1. Permanent System Principles

### 1.1 Category-Based Claim Authority Model

Documentation authority is **claim-category based**, not a blunt scalar override chain. When a conflict or question arises, authority is determined by the *category of claim*:

| Claim Category | Primary Authoritative Source | Secondary Reference | Prohibited Source |
|---|---|---|---|
| **Current Execution Behavior & Data Schema** | **Source Code, Prisma Schema, Active Database Migrations & Executable Tests** | [CURRENT_ARCHITECTURE.md](architecture/CURRENT_ARCHITECTURE.md) | Stale Markdown / Legacy Reports |
| **System Behavioral Contracts & Requirements** | **[SRS.md](product/SRS.md)** | [PRODUCT_REQUIREMENTS.md](product/PRODUCT_REQUIREMENTS.md) | Informal Chat / Stray Comments |
| **Product Purpose, Core Intent & Scope** | **[PRODUCT_VISION.md](product/PRODUCT_VISION.md)** | [PRODUCT_ROADMAP.md](product/PRODUCT_ROADMAP.md) | Architectural Implementation Details |
| **Architectural Decision Rationale & History** | **`docs/architecture/adr/ADR-xxx.md` (Immutable)** | [CURRENT_ARCHITECTURE.md](architecture/CURRENT_ARCHITECTURE.md) | Rewritten / Edited ADRs |
| **Security Law & Permission Governance** | **[SECURITY_ARCHITECTURE.md](architecture/SECURITY_ARCHITECTURE.md)** | Security Test Specs | Code Comments / Implicit Rules |
| **UI Design System & Token Governance** | **[DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md)** | Token Source Code (`@lumora/ui`) | Hardcoded Ad-hoc CSS / Inline Styles |
| **Point-in-Time Diagnostic Evidence** | **`docs/audits/*.md`** | Issue Tracker | Live Architecture Docs |
| **Historical & Retired System State** | **`docs/archive/*`** | — | Active Documentation Tree |

---

### 1.2 UI / Data Independence & State Categorization Rule

> **CORE PRINCIPLE**: Presentation and user experience layers are strictly decoupled from domain semantics and persistence schemas.
>
> 1. **Visual Semantics vs Domain Semantics**:
>    - Visual redesigns (*"make card blue", "change font/padding"*) → **UI / Theme Package Only**.
>    - New domain capability (*"allow recurring dosage schedule on medicine"*) → **Domain / Application / Persistence**.
> 2. **State Categorization**:
>    - **User Domain Data** → Universal Object / DB Persistence (`Object` table).
>    - **User Account / Workspace Preferences** (*"dark mode choice", "workspace notification preferences"*) → User/Workspace Settings Model (`UserSettings`, `WorkspaceSettings`).
>    - **Ephemeral UI State** (*"modal open status, active tab, scroll position"*) → Client Component State (`React` / `Zustand`).
>    - **Design Tokens** → Theme Package (`@lumora/theme`).
>    - **System Environment Config** → Backend Environment (`.env`).

---

## 2. Reconciled Information Architecture Directory

```
docs/
├── README.md                          # Master Directory Index (This file)
│
├── product/                           # Product Management & Behavioral Specifications
│   ├── PRODUCT_VISION.md              # Purpose, core philosophy, non-negotiable principles
│   ├── SRS.md                         # Software Requirements Specification (21 reconciled requirements)
│   ├── PRODUCT_REQUIREMENTS.md        # Prioritized feature capability matrix
│   ├── PRODUCT_EXPERIENCE.md          # UX expectations, screen flows, motion standards
│   └── PRODUCT_ROADMAP.md             # Master phase map and roadmap milestones
│
├── architecture/                      # Technical System Design & Layer Contracts
│   ├── CURRENT_ARCHITECTURE.md        # System context, boundaries, subsystem status
│   ├── DATA_ARCHITECTURE.md           # Universal Object schema, JSONB, indexes, migrations
│   ├── API_ARCHITECTURE.md            # REST contracts, DTOs, error mapping, pagination
│   ├── RUNTIME_ARCHITECTURE.md        # Outbox worker, Event router, Capability Engine, lifecycle
│   ├── SECURITY_ARCHITECTURE.md       # Auth, JWT, RBAC, tenant isolation, session hashing, CORS
│   ├── DEVELOPMENT_BOUNDARIES.md      # Layer rules (UI -> App -> Domain -> Infra, no Prisma leaks)
│   ├── IMPLEMENTATION_GUIDELINES.md   # Coding patterns, Result<T,E>, value objects, command handlers
│   ├── CHANGE_IMPACT_MATRIX.md        # Matrix cross-referencing changes vs required reviews
│   ├── TECH_DEBT.md                   # Strict machine-readable technical debt schema (TD-001..TD-038)
│   ├── PERFORMANCE_BASELINE.md        # Measured dev benchmarks vs target production SLAs
│   └── adr/                           # Architectural Decision Records (Immutable ADR-001..ADR-016)
│
├── operations/                        # Infrastructure, CI/CD & Operational Runbooks
│   ├── DEPLOYMENT_GUIDE.md            # Docker, env vars, build pipelines, production startup
│   └── RUNBOOK.md                     # Operational procedures, incident response, health checks
│
├── design/                            # UI, UX, Motion & Accessibility Specs
│   ├── DESIGN_SYSTEM.md               # HSL color tokens, typography scales, spacing tokens
│   └── ICON_PLATFORM_CONSTITUTION.md  # Vector asset guidelines, SVG optimization, iconography rules
│
├── audits/                            # Historical Point-in-Time Diagnostic Audits
│   ├── 2026-08-10-source-verified-audit-part1.md
│   └── 2026-08-10-source-verified-audit-part2.md
│
└── archive/                           # Historical Planning & Superseded Reports
    ├── LUMORA_TRUTH_REPORT.md          # Archived prior truth report (SHA 8bfdc0f)
    ├── PHASE_5_ARCHITECTURE_REVIEW.md  # Archived historical planning doc
    └── PHASE_5_MASTER_ARCHITECTURE.md  # Archived historical planning doc
```

---

## 3. Architecture Decision Records (ADR) Index

All 16 ADRs (`docs/architecture/adr/ADR-001.md` through `ADR-016.md`) remain **immutable historical records**.
