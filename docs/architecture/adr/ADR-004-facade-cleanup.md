# ADR-004: Façade Use Case Cleanup & Domain Aggregate Replacement

## Context & Problem Statement
During initial platform bootstrapping, controller-facing "façade" use cases were introduced to delegate requests directly to legacy NestJS services (e.g., `ObjectsService`, `RemindersService`, `WorkspacesService`, `SpacesService`, `CollectionsService`).

Tech debt item `TD-015` tracked the presence of these façade use cases. However, a blanket replacement of all façades with aggregate-backed use cases without evaluating domain boundaries would create unnecessary complexity where thin delegation services already correctly wrap pure domain repositories (`WorkspaceRepository`, `SpaceRepository`, `CollectionRepository`).

## Decision Drivers
- **Aggregate Maturity**: Domain aggregates `ObjectAggregate` and `ReminderAggregate` have reached production maturity with complete encapsulation, aggregate validation policies, and domain event publishing capabilities.
- **Architectural Distinction**: Controllers must invoke pure aggregate-backed CQRS use cases when rich domain aggregate boundaries exist (`CreateObjectUseCase`, `ScheduleReminderUseCase`).
- **Service Delegation Validity**: Thin delegation use cases wrapping domain services (`WorkspacesService`, `SpacesService`, `CollectionsService`) that encapsulate multi-entity orchestration, slug generation, and transaction boundary policies are architecturally sound and do NOT warrant redundant replacement.

## Decision
1. Wire `CreateObjectUseCase` (which saves `ObjectAggregate` via `OBJECT_REPOSITORY_TOKEN`) directly into `ObjectsController` and `ObjectsModule`.
2. Wire `ScheduleReminderUseCase` (which saves `ReminderAggregate` via `REMINDER_REPOSITORY_TOKEN`) directly into `RemindersController` and `RemindersModule`.
3. Annotate legacy `CreateObjectFacadeUseCase` and `CreateReminderFacadeUseCase` with JSDoc `@deprecated`.
4. Reclassify Workspace, Space, and Collection thin-delegation use cases as **intentional delegation patterns** (not technical debt) in `TECH_DEBT.md`.

## Status
Accepted

## Consequences

### Positive
- **Domain Entity Integrity**: Object and Reminder creation flows enforce 100% domain aggregate invariants, value object instantiation, and repository persistence.
- **Clean CQRS Wiring**: Controllers consume production-ready aggregate use cases.
- **Resolves TD-015**: Technical debt item TD-015 is updated with clear criteria distinguishing legacy debt from valid service delegation.

### Negative / Trade-offs
- Deprecated façade classes are retained until Phase 4 removal pass to prevent potential external dependency breakage.
