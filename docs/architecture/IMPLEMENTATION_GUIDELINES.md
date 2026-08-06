# Lumora Implementation & Architectural Guidelines

## 1. Layer Dependency Rules

Dependencies must strictly follow the Hexagonal / Layered Architecture direction:

```
Transport / Controller Layer (NestJS DTOs, Controllers, Guards)
               ↓
Application Layer (Use Cases: Commands & Queries)
               ↓
Domain Layer (Aggregates, Entities, Value Objects, Domain Events, Repository Interfaces)
               ↓
Infrastructure Layer (Prisma Repositories, Outbox Workers, External Adapters)
```

- **Domain Layer Isolation**: The `domain/` directory must contain ZERO dependencies on database frameworks (Prisma), NestJS decorators, or external libraries (except `@lumora/shared`).
- **Infrastructure Layer Boundary**: All database queries, PrismaClient instances, and ORM mapping must reside strictly in `infrastructure/prisma/`.
- **Application Layer Scope**: Use Cases orchestrate domain aggregates and repository interfaces. Controllers handle HTTP validation, authentication guards, and response DTO mapping.

### Forbidden Dependencies Boundary
- **Domain → ❌ Infrastructure**: Domain entities, value objects, domain events, and repository interfaces MUST NEVER import Prisma types, database clients, ORM mappers, or infrastructure packages.
- **Application → ❌ Prisma**: Use Cases, application services, and application DTOs MUST NEVER import `@prisma/client`, Prisma types, or execute raw database queries.
- **Controller → ❌ Repository Implementation**: Transport controllers MUST NEVER import concrete `Prisma*Repository` infrastructure classes directly. Controllers depend on Use Cases or domain repository interfaces (`I*Repository`).

---

## 2. Naming Conventions

- **Bounded Contexts**: Plural nouns in lowercase (`objects`, `reminders`, `spaces`, `collections`, `workspaces`).
- **Aggregates**: PascalCase noun ending in `.aggregate.ts` (e.g. `ObjectAggregate`, `ReminderAggregate`).
- **Entities**: PascalCase noun ending in `.entity.ts` (e.g. `CollectionItemEntity`, `DeviceEntity`).
- **Value Objects**: PascalCase noun representing business concept in single file (e.g. `EmailAddress`, `WorkspaceSlug`, `RecurrenceRule`).
- **Domain Events**: PascalCase past-tense business events ending in `.event.ts` or grouped in `<context>.events.ts` (e.g. `ObjectCreatedEvent`, `ReminderScheduledEvent`).
- **Repository Interfaces**: Standard `I` prefix + PascalCase ending with `Repository` (e.g. `IObjectRepository`, `IReminderRepository`).
- **Infrastructure Repositories**: `Prisma` prefix + PascalCase ending with `Repository` (e.g. `PrismaObjectRepository`, `PrismaReminderRepository`).
- **Use Cases**: Verb + Noun + `UseCase` (e.g. `CreateObjectUseCase`, `ScheduleReminderUseCase`).
- **Response DTOs**: Noun + `ResponseDto` (e.g. `ObjectResponseDto`, `ReminderResponseDto`).

---

## 3. Aggregate Rules

1. **Encapsulation**: Constructors MUST be `private`. Aggregates are instantiated exclusively through static `create()` (new entities) or `reconstitute()` (persisted entities) factory methods.
2. **Invariant Protection**: All properties are private/protected. State modifications occur via explicit behavior methods (`updateTitle()`, `snooze()`, `complete()`, `archive()`). No public property setters.
3. **Guard Evaluation**: Factory methods MUST explicitly check `guard.isFailure` on all `Guard.*` checks and throw or return domain errors immediately upon failure.
4. **Cross-Aggregate References**: Aggregates reference other aggregates strictly by primary key (`UniqueEntityId` or `string`). Direct object references across aggregate boundaries are prohibited.
5. **Domain Event Registration**: Aggregates collect domain events internally using `this.addDomainEvent()`. Events are pulled and flushed via `pullDomainEvents()` during unit of work commit.

---

## 4. Repository Rules

1. **Domain Pure Contracts**: Interfaces live in `src/domain/<context>/repositories/`. Method signatures accept and return Domain Aggregates, Domain Entities, or primitive IDs — NEVER Prisma models or DTOs.
2. **Tenant Isolation**: Every query that fetches or mutates workspace-bound objects MUST include `workspaceId` as a mandatory parameter to enforce tenant isolation.
3. **Soft-Delete Filtering**: Repositories MUST filter out soft-deleted records (`deletedAt: null`) by default unless explicit historic query parameters are supplied.
4. **Optimistic Concurrency**: Repository updates check version fields or `updatedAt` timestamps to prevent silent overwrite race conditions.
5. **Exception Translation**: All infrastructure repository methods wrap Prisma calls with `PrismaExceptionMapper.toDomainException(error, context)` to convert database errors into stable domain exceptions.

---

## 5. Value Object Rules

1. **Immutability**: Value objects are completely immutable. Any state change returns a new instance of the Value Object.
2. **Structural Equality**: Equality is determined by comparing underlying primitive values via `equals()`, not reference identity.
3. **Centralized Validation**: Validation rules (length, format, regex, allowed values) are enforced inside `create()` static factory methods, returning `Result<TValueObject, ApplicationException>`.
4. **No Over-Engineering**: Decorative display primitives (`icon`, `emoji`, `color`, `cover`) remain primitive strings unless complex validation logic is required.

---

## 6. Domain Event Rules

1. **Contract Standard**: Every domain event MUST implement `DomainEvent<TName, TPayload>` from `@lumora/shared`.
2. **Business Relevance**: Event names represent past-tense domain occurrences (`object.created`, `reminder.scheduled`, `workspace.member_invited`), not technical database triggers.
3. **Transactional Staging**: Events are staged in `OutboxMessage` table within the active `ITransactionContext` unit of work.
4. **Idempotent Handling**: Outbox processors and event handlers enforce unique event execution checks.

---

## 7. Testing Standards

1. **Domain Unit Tests**: Every Aggregate, Value Object, Policy, and Domain Service MUST have isolated unit tests in `__tests__/` subdirectories. Target: 100% domain logic branch coverage.
2. **Repository Integration Tests**: Infrastructure repositories are tested against test databases or mocked Prisma instances to verify CRUD operations, soft-delete filtering, and exception mapping.
3. **Use Case Isolation**: Use Cases are tested using mock repository interfaces to verify business workflow execution and event staging.
4. **Fast Execution**: Unit tests MUST complete in under 5 seconds monorepo-wide.

---

## 8. Code Review Checklist

- [ ] Does domain code contain any imports from `prisma`, `@prisma/client`, or `generated/prisma`? (Must be NO)
- [ ] Are all aggregate property getters returning immutable copies or primitives?
- [ ] Are all Guard check results evaluated with `if (guard.isFailure)`?
- [ ] Are tenant boundaries (`workspaceId`) enforced on every database query?
- [ ] Does every Use Case stage domain events via the transactional outbox?
- [ ] Are DTO inputs trimmed and validated at transport boundaries?
- [ ] Are all new unit tests passing cleanly?

---

## 9. Pull Request Checklist

- [ ] `pnpm build` compiles without TypeScript or linter errors.
- [ ] `pnpm test` executes all unit and integration test suites cleanly.
- [ ] No raw ORM/Prisma types exposed in public controller APIs or DTOs.
- [ ] New domain events registered in `@lumora/shared` `DomainEventName` union.
- [ ] Architectural recommendations categorized and recorded in `Roadmap.md` / `TECH_DEBT.md`.

---

## 10. Architecture Do's and Don'ts

### DO:
- **DO** keep domain entities pure, deterministic, and free of side effects.
- **DO** translate infrastructure exceptions into stable `ErrorCode` domain exceptions.
- **DO** enforce tenant isolation (`workspaceId`) at the repository level.
- **DO** use single-purpose Use Case classes for business workflow execution.

### DON'T:
- **DON'T** leak ORM entity types into application or presentation layers.
- **DON'T** bypass aggregate root boundaries to mutate child entities directly in repositories.
- **DON'T** introduce external message brokers (Kafka/RabbitMQ) or distributed caches before Phase 3 scalability benchmarks require them.
- **DON'T** ignore Guard return results or assume implicit throws.
