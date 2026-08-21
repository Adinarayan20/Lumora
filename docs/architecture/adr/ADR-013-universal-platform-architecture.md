# ADR-013: Universal Life Operating System Platform Architecture

## Context & Problem Statement
Lumora is an AI-ready Personal Life Operating System designed around a **Universal Object Model** (Everything is an Object: Note, Task, Event, Reminder, Habit, Document, Goal, Recipe, Transaction, Book, Contact, etc.).

Building individual database tables, API endpoints, business logic, and UI screens for every new object type leads to massive code duplication, frequent database migrations, architectural fragility, and high maintenance overhead.

To support infinite object types over the next 10+ years without requiring rewrites, Lumora requires a metadata-driven platform architecture.

## Decision Drivers
- **Platform First Mandate**: Every architectural decision must increase Lumora's ability to support future object types without code modification.
- **Metadata Before Code**: Object attributes, validation rules, field types, and layout renderers must be metadata-driven.
- **Universal Capability Engine**: Core behaviors (Timeline, Reminders, Relationships, Search, Notifications, Media Attachments) are decoupled micro-capabilities automatically inherited by objects.
- **Data Model Permanence**: Core domain schema remains stable while object types and capabilities extend via JSON attributes and metadata registries.
- **Zero Magic & Clean Architecture**: Pure domain entities, strict layer boundaries (`UI → Application → Domain → Infrastructure`), and explicit event flow.

## Decision
1. Implement a triadic registry architecture consisting of:
   - `MetadataRegistry`: Field types, schemas, validation rules, custom attributes.
   - `ObjectDefinitionRegistry`: Object types, allowed capabilities, layout templates, system traits.
   - `CapabilityRegistry`: Universal capabilities detached from hardcoded business logic.
2. Build the platform incrementally across 8 reviewable milestones:
   - Milestone 1: Metadata Registry & Object Definition Registry
   - Milestone 2: Capability Registry & Universal Capability Engine
   - Milestone 3: Template Engine & Starter Library
   - Milestone 4: Dynamic Form & Detail Renderers
   - Milestone 5: Universal Relationship Engine
   - Milestone 6: Universal Timeline & Global Search Engine
   - Milestone 7: Smart Collections & Notification Engine
   - Milestone 8: Performance Optimization & Frontend Platform Integration

## Status
**SUPERSEDED** — see Lumora Cleanup Finalization + Migration Truth Gate report.

The frozen `00`–`04` architecture specification replaces this ADR's Capability
Engine, Template Engine, Relationship Engine, and Search/Timeline-coupling
decisions:

- **Capability Registry & Universal Capability Engine** (Milestone 2): rejected.
  `02_DOMAIN_BUSINESS_LOGIC.md` explicitly prohibits a generic plugin/capability
  runtime. `CapabilityRegistry`/`CapabilityExecutor`/`UniversalCapabilityEngine`
  have been deleted from the codebase.
- **Template Engine & Starter Library** (Milestone 3): rejected. `01`/`02` §10
  explicitly prohibit package-manager-style install/upgrade/rollback semantics
  for templates. Deleted from the codebase; see `ADR-015` (also superseded).
- **Universal Relationship Engine** (Milestone 5): deferred out of V1.
  `02` §41 / `03` §11 require no V1 storage, API, or service for Relationships.
  Removed from the codebase.
- **Universal Timeline & Global Search Engine, as coupled capabilities**
  (Milestone 6): Timeline is retained but is a Tier-3 read projection, not a
  "capability" in this ADR's sense. Search is deferred out of V1 per `02` §41 /
  `03` §11 — its code remains in the tree, physically isolated and unwired,
  pending a separate decision (see the Cleanup Finalization report).

Milestone 1 (Metadata Registry & Object Definition Registry) is not part of
this supersession — its current implementation (`CatalogModule`,
`ObjectDefinitionRegistry`) remains architecturally live and unaffected.

This document is retained as a historical record, not as active architecture.
Do not treat any milestone above as current guidance.

## Original Status (superseded)
Accepted

## Consequences

### Positive
- Future object types can be introduced purely via JSON metadata definitions without writing new business logic or database migrations.
- Eliminates code duplication across feature modules.
- Sub-2ms metadata resolution via multi-tenant Redis caching.

### Negative / Trade-offs
- Requires initial architectural discipline to enforce schema validation across dynamic attributes.
