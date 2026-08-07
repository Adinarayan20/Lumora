# ADR-014: Platform Kernel, Object Runtime, and Schema Registry Architecture

## Context & Problem Statement
Following the Senior Staff Architecture Review of Phase 5, Lumora requires a deterministic execution model for schema validation, capability attachment, template installation, dynamic UI rendering, and platform bootstrapping.

Without a central Object Runtime and Platform Kernel, object creation logic, capability hooks, and schema validation would drift across use cases and controllers.

## Decision Drivers
- **Schema Registry**: Upgrade Metadata Registry to Schema Registry with schema versioning (`schemaVersion`) and migration initializers.
- **Lumora Object Runtime**: Encapsulate object initialization, attribute validation, capability attachment, state transitions (`ACTIVE` → `ARCHIVED` → `DELETED`), and event emission inside `LumoraObjectRuntime`.
- **Capability Lifecycle**: Enforce explicit capability hooks (`Register` → `Initialize` → `Attach` → `Execute` → `Suspend` → `Resume` → `Detach`).
- **Dynamic Render Registries**: Introduce `FieldRegistry` (form controls) and `BlockRegistry` (detail blocks) for dynamic UI extension.
- **Lumora Platform Kernel**: Central initialization hub bootstrapping registries and capability bindings on application startup.

## Decision
1. Introduce `LumoraPlatformKernel` in `apps/backend/src/infrastructure/kernel/`.
2. Introduce `LumoraObjectRuntime` in `apps/backend/src/domain/objects/runtime/`.
3. Implement `SchemaRegistry`, `ObjectDefinitionRegistry`, `CapabilityRegistry`, `FieldRegistry`, and `BlockRegistry` in `@lumora/shared` and `apps/backend`.

## Status
Accepted

## Consequences

### Positive
- Centralizes object initialization and capability invocation into a single, testable runtime.
- Guarantees sub-2ms schema resolution and zero unvalidated attribute writes.
- Pluggable field and detail block extensions without modifying renderer source code.

### Negative / Trade-offs
- Small initial code footprint added for kernel bootstrapping during application startup.
