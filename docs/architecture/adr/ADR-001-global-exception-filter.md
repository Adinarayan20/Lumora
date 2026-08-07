# ADR-001: Global ApplicationException Filter

**Status**: Accepted  
**Date**: 2026-08-07  
**Phase**: Phase 3 — Unit 1  
**Resolves**: TD-016

---

## Context

The Lumora backend has a structured exception hierarchy in `@lumora/shared`:

```
ApplicationException (abstract)
├── DomainException (abstract)
│   ├── EntityNotFoundException
│   ├── DomainValidationException
│   ├── ConflictException
│   ├── RevisionConflictException
│   └── ... (domain-specific subclasses)
├── SecurityException (abstract)
│   ├── UnauthorizedException
│   └── ForbiddenException
└── SystemException
```

Prior to this change, every controller performed **string-based exception mapping** to translate service errors into HTTP responses:

```typescript
// Fragile substring matching — present across 5 controllers, ~40 call sites
if (msg.includes('not found')) throw new NotFoundException(msg);
if (msg.includes('mismatch'))  throw new ConflictException(msg);
if (msg.includes('ACTIVE'))    throw new ConflictException(msg);
```

This pattern had four critical defects:

1. **Fragility**: A message text change in any service silently broke the HTTP status mapping.
2. **Duplication**: The same matching logic was repeated across 5 controllers.
3. **Incompleteness**: Messages that didn't match any known substring fell to an incorrect HTTP code (usually 500 or 400).
4. **Leakage of service implementation details** into the transport layer: controllers had to know what error messages services produce.

---

## Decision Drivers

The global exception filter pattern was selected based on the following key drivers:

- **Eliminate Duplicated Controller Logic**: Remove identical try/catch or error-checking blocks repeated across every controller in the system.
- **Remove Fragile String Matching**: Replace string comparison heuristics (`msg.includes('...')`) with strongly typed, machine-readable `ErrorCode` enums.
- **Centralize HTTP Transport Concerns**: Keep HTTP status code mapping strictly inside the web/transport layer, preventing HTTP framework leakage into application services or domain logic.
- **Preserve Clean Architecture Boundaries**: Domain entities and application use cases throw pure domain exceptions (`ApplicationException` subclasses) with zero dependency on NestJS or HTTP protocol types.
- **Improve Maintainability and Testability**: Ensure error mapping is testable in isolated unit tests without requiring a full NestJS integration test setup, and guarantee compile-time exhaustiveness checks when new error codes are introduced.

---

## Problem

The transport layer (controllers) was performing business-error classification work that belongs in the infrastructure boundary. Controllers should be responsible for **routing requests to use cases** and **serializing results** — not for interpreting error semantics.

---

## Decision

Introduce a **single global `ApplicationExceptionFilter`** (NestJS `@Catch(ApplicationException)`) registered via `APP_FILTER` in `AppModule`.

The filter:
1. Catches any `ApplicationException` subclass thrown from any controller, use case, or service.
2. Inspects the structured `exception.code` (an `ErrorCode` enum value).
3. Maps the code to an HTTP status code via an exhaustive `switch` statement with compile-time exhaustiveness checks.
4. Provides a documented extension point (`logException()`) for production structured logging.
5. Returns a standardized error body: `{ error: { code, message, details? } }`.

All services and sub-services were updated to throw `ApplicationException` subclasses instead of NestJS HTTP exceptions (`NotFoundException`, `BadRequestException`, etc.). All controllers were cleaned up to simply re-throw the `Result` error:

```typescript
// After: clean, framework-agnostic
const result = await this.createSpaceUseCase.execute(cmd);
if (result.isFailure) throw result.getError();
return result.getValue();
```

### ErrorCode → HTTP Status Mapping

| ErrorCode(s) | HTTP Status |
|---|---|
| `ENTITY_NOT_FOUND` | 404 Not Found |
| `RESOURCE_CONFLICT`, `REVISION_CONFLICT`, `EMAIL_ALREADY_REGISTERED`, `USERNAME_TAKEN` | 409 Conflict |
| `UNAUTHENTICATED`, `INVALID_CREDENTIALS`, `SESSION_EXPIRED`, `INVALID_REFRESH_TOKEN` | 401 Unauthorized |
| `INSUFFICIENT_PERMISSIONS` | 403 Forbidden |
| `DOMAIN_VALIDATION_ERROR`, `OAUTH_ACCOUNT_RESOLUTION_FAILED`, `PERSONAL_WORKSPACE_DELETION_FORBIDDEN`, `TARGET_NOT_WORKSPACE_MEMBER`, `RECURRENCE_RULE_INVALID`, `REMINDER_ONLY_ACTIVE_CAN_SNOOZE` | 400 Bad Request |
| `SYSTEM_ERROR` / Unmapped code (runtime fallback) | 500 Internal Server Error |

> The unmapped fallback is intentionally **500** (fail-safe). An unknown error code reveals nothing about system internals and prevents incorrect client retries.

### New `ErrorCode` values added

Twelve domain-specific codes were added to the existing `ErrorCode` constant:

- **Auth**: `EMAIL_ALREADY_REGISTERED`, `USERNAME_TAKEN`, `INVALID_CREDENTIALS`, `SESSION_EXPIRED`, `INVALID_REFRESH_TOKEN`, `OAUTH_ACCOUNT_RESOLUTION_FAILED`
- **Workspace**: `PERSONAL_WORKSPACE_DELETION_FORBIDDEN`, `TARGET_NOT_WORKSPACE_MEMBER`
- **Reminder**: `RECURRENCE_RULE_INVALID`, `REMINDER_ONLY_ACTIVE_CAN_SNOOZE`
- **Domain/Generic**: `REVISION_CONFLICT`

### New exception classes added to `@lumora/shared`

Concrete typed exception classes were added to `domain-exceptions.ts` covering all new `ErrorCode` values. This ensures every thrown error carries a machine-readable code and structured context.

---

## Alternatives Considered

### Alternative A: Per-Controller Exception Mapping Helper

A shared `mapResultErrorToHttp(error)` helper function used by every controller.

**Rejected because**:
- Still requires every controller to call the helper — opt-in rather than opt-out.
- Still encodes HTTP status knowledge at the application layer.
- Does not benefit from NestJS's exception filter lifecycle (no request context, logging hooks, etc.).

### Alternative B: Keep Substring Matching, Just Centralize the Strings

Define string constants for each known error message and compare against those.

**Rejected because**:
- Fundamentally the same fragility — two text values must remain in sync (throw site and comparison site).
- Does not solve the core problem of inferring error semantics from presentation strings.

### Alternative C: Custom Result Type With ErrorCode Field

Change `Result<T, E>` to `Result<T, ApplicationException>` and inspect `.code` directly in controllers.

**Rejected because**:
- Services already throw `ApplicationException` subclasses; the global filter catch is equivalent and zero-configuration.
- Requires every controller to import and inspect `ErrorCode` — the filter centralizes this.

---

## Consequences

### Positive

- **Single source of truth** for `ErrorCode → HTTP status` mapping.
- **Zero string matching** anywhere in the codebase after this change.
- **Uniform error response shape** across every endpoint: `{ error: { code, message, details? } }`.
- **Type safety**: Adding a new `ErrorCode` will produce a TypeScript compile-time exhaustiveness error if `ApplicationExceptionFilter.toHttpStatus` is not updated.
- **Testable in isolation**: The filter is a plain class with a dedicated unit test suite (`application-exception.filter.spec.ts`); the mapping table and response serialization are tested without a running NestJS app.
- **Production logging ready**: Includes an explicit `logException()` extension point.
- **Framework boundary preserved**: Domain and application layers throw domain exceptions. The filter is the only place that knows about HTTP.

### Negative / Trade-offs

- **NestJS HTTP exception passthrough**: NestJS's own `NotFoundException`, `BadRequestException`, etc. are **not** caught by this filter (they are caught by NestJS's built-in `HttpExceptionFilter`). This is correct — the built-in filter handles framework exceptions, ours handles domain exceptions. Both can coexist.
- **All remaining code must use domain exceptions**: If any new code introduces a NestJS HTTP exception in a service layer, it will bypass this filter's structured response format. The `CODING_STANDARDS.md` (Phase 3 Unit 7) will codify this constraint.

### Files Changed

| Status | File |
|---|---|
| MODIFIED | `packages/shared/src/core/errors/error-code.ts` |
| MODIFIED | `packages/shared/src/core/errors/domain-exceptions.ts` |
| NEW | `apps/backend/src/common/filters/application-exception.filter.ts` |
| NEW | `apps/backend/src/common/filters/index.ts` |
| NEW | `apps/backend/src/common/filters/__tests__/application-exception.filter.spec.ts` |
| MODIFIED | `apps/backend/src/app.module.ts` |
| MODIFIED | `apps/backend/src/modules/objects/objects.service.ts` |
| MODIFIED | `apps/backend/src/modules/objects/objects.controller.ts` |
| MODIFIED | `apps/backend/src/modules/spaces/spaces.service.ts` |
| MODIFIED | `apps/backend/src/modules/spaces/spaces.controller.ts` |
| MODIFIED | `apps/backend/src/modules/collections/collections.service.ts` |
| MODIFIED | `apps/backend/src/modules/collections/collections.controller.ts` |
| MODIFIED | `apps/backend/src/modules/reminders/reminders.service.ts` |
| MODIFIED | `apps/backend/src/modules/reminders/reminders.controller.ts` |
| MODIFIED | `apps/backend/src/modules/reminders/services/reminder-scheduler.service.ts` |
| MODIFIED | `apps/backend/src/modules/workspaces/workspaces.service.ts` |
| MODIFIED | `apps/backend/src/modules/workspaces/workspaces.controller.ts` |
| MODIFIED | `apps/backend/src/modules/workspaces/services/workspace-member.service.ts` |
| MODIFIED | `apps/backend/src/modules/workspaces/services/workspace-invitation.service.ts` |
| NEW | `docs/architecture/adr/ADR-001-global-exception-filter.md` |
