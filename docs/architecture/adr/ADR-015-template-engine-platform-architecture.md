# ADR-015: Template Engine & Starter Library Platform Architecture

## Context & Problem Statement
Lumora is a Universal Life Operating System platform designed to support thousands of future object types (tasks, notes, habits, recipes, transactions, books, custom types) without custom business logic or database schema rewrites.

Phase 5 — Milestone 3 introduces the **Template Engine & Starter Library**, establishing templates as first-class metadata packages.

## Decision Drivers
- **Metadata Before Code**: Features are shipped as metadata templates containing Object Definitions, Schemas, Capability Requirements, Form & Detail Screen Layout Blueprints, and Categorized Seed Objects.
- **Package Manifest / Content Split**: `TemplateManifest` encapsulates identity (`packageUuid`, `publisherUuid`, `packageHash`, `PublisherTrustLevel`), permissions, capability constraints, and topological dependencies. `TemplateContent` encapsulates schemas, definitions, layout blueprints, and seed objects.
- **Dependency & Compatibility Resolution**: `TemplateDependencyResolver` computes Directed Acyclic Graphs (DAG) for nested template dependencies; `CompatibilityChecker` evaluates capability version compatibility.
- **Dry-Run & Planning Pipeline**: `TemplatePlanner` generates execution blueprints (`TemplatePlan`) with dry-run support prior to database mutation.
- **First-Class Rollback Engine**: `TemplateSnapshot`, `RollbackPlan`, `RollbackExecutor` support state rollback on installation/upgrade failures.
- **Exclusive Operation Locking**: `TemplateOperationLock` prevents concurrent workspace template mutations with deterministic TTL recovery.
- **Policy Engine**: `ITemplatePolicyEngine` sits in the planning pipeline enforcing workspace limits, license rules, permission boundaries, and feature flags.

## Decision
1. Implement `TemplateManifest` & `TemplateContent` in `@lumora/shared/src/core/templates/`.
2. Implement `TemplateDependencyResolver`, `TemplatePlanner`, `TemplateInstaller`, `TemplateUpgradeEngine`, `TemplateRollbackEngine`, and `TemplateUninstallEngine` in `apps/backend/src/domain/templates/`.
3. Ship 5 production starter templates in `StarterLibraryCatalog` (`Daily Reflective Journal`, `Project & Goal OS`, `Habit Tracker`, `Knowledge Base & Book Notes`, `Financial Ledger & Subscriptions`).
4. Publish 9 explicit domain events through the Transactional Outbox stream.

## Status
Accepted

## Consequences

### Positive
- Enables zero-code extension for new life operating system domains.
- Full transactional safety with dry-run analysis and state rollback on failure.
- Complete Open/Closed architecture supporting future Community Marketplace & AI integrations without core platform modifications.

### Negative / Trade-offs
- Requires careful handling of multi-template dependency graphs during batch installations.
