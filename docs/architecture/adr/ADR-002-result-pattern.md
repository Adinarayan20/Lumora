# ADR-002: Functional Result<T, E> Pattern for Expected Domain Outcomes

## Context & Problem Statement
In Lumora's application services and use case layer, expected business domain outcomes (e.g., entity not found, duplicate resource key conflict, invalid state transition, optimistic lock revision conflict) were previously modeled either by returning `null`/`undefined` or throwing transport-unaware domain exceptions. 

Relying on exception throwing for expected business control flows introduces high runtime performance overhead, conceals potential failure paths from callers' type signatures, and creates ambiguous failure handling across nested application service calls.

## Decision Drivers
- **Explicit Type Contracts**: Function signatures must explicitly declare expected error types (`Promise<Result<T, ApplicationException>>`).
- **Elimination of Control-Flow Exceptions**: Expected domain outcomes must never rely on expensive stack-trace generation or hidden control flow jumps via thrown exceptions.
- **Pure Monadic Combinators**: Application code must support clean functional pipelines using `map`, `flatMap`, `match`, `unwrapOr`, and `combine`.
- **Infrastructure Isolation**: Unexpected infrastructure failures (e.g., database connection loss, network timeouts) may still throw uncaught exceptions to be handled by NestJS filters, preserving clear operational boundaries.

## Decision
We adopt a monadic `Result<T, E>` primitive across all `@lumora/shared` domain primitives and application services in `apps/backend`.

1. **Primitive Enhancement**:
   - `Result<T, E>` in `@lumora/shared` is expanded with functional combinators: `unwrapOr(fallback)`, `map(fn)`, `flatMap(fn)`, `match(onOk, onFail)`, and static `Result.combine(results)`.
2. **Application Service Signature**:
   - All expected service operations return `Promise<Result<T, ApplicationException>>`.
   - On expected business failure, services return `Result.fail(new SpecificApplicationException(...))`.
   - On success, services return `Result.ok(value)`.
3. **Use Case Passthrough & Composition**:
   - CQRS Command & Query Use Cases execute service logic or domain aggregate methods and pass through `Result<T, ApplicationException>` instances without generic `try/catch` wrapping.
4. **Controller Boundary Unwrapping**:
   - NestJS Controllers unwrap `Result` instances explicitly:
     ```typescript
     const result = await this.useCase.execute(command);
     if (result.isFailure) throw result.getError();
     return result.getValue();
     ```
   - When a controller throws `result.getError()`, the global `ApplicationExceptionFilter` intercepts the typed `ApplicationException` and maps its `ErrorCode` to the appropriate HTTP status code.

## Status
Accepted

## Consequences

### Positive
- **Deterministic Control Flow**: Complete compile-time visibility into expected failure outcomes without surprise uncaught domain exceptions.
- **Clean Architecture Compliant**: Domain and application logic remain 100% framework-independent with zero NestJS imports.
- **Compositional Strength**: Complex multi-step use cases compose via `flatMap` and `combine` without nested `try/catch` blocks.
- **Performance**: Zero stack trace overhead generated for normal business validation failures.

### Negative / Trade-offs
- Slight verbosity in controllers requiring `if (result.isFailure) throw result.getError();` unwrapping prior to response return.
