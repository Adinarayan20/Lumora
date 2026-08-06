# Lumora Architectural Roadmap

## Phase Overview

```
Phase 1: Engineering Foundation & Infrastructure Setup (COMPLETED)
Phase 2: Core Domain Construction & DDD Tactical Patterns (IN PROGRESS - Unit 1 Done, Unit 2 Active)
Phase 3: High Scale, CQRS, Search & Observability (PLANNED)
Phase 4: Global Production, Compliance & Multi-Region Enterprise (PLANNED)
```

---

## Phase 1 — Foundation & Infrastructure (Completed)
- [x] Monorepo structure setup (`packages/shared`, `packages/theme`, `packages/ui`, `apps/backend`, `apps/mobile`, `apps/admin`)
- [x] Core domain primitives (`ValueObject`, `Result`, `UniqueEntityId`, `Guard`, `AggregateRoot`)
- [x] Prisma ORM integration, initial database schema, and soft-delete extension
- [x] Transactional Outbox pattern foundation (`OutboxMessage`, `PrismaOutboxRepository`, `OutboxWorker`)
- [x] Keyset pagination boundaries (`CursorEncoder`, `PaginationParams`, `PaginatedResult`)

---

## Phase 2 — Core Domain Construction (Current Phase)

### Unit 1: Domain Primitives, Aggregates & Repositories (Completed)
- [x] Standardized domain error hierarchy (`DomainException`, `ErrorCode`, `ApplicationException`)
- [x] Universal Object Catalog definitions and registry (`ObjectCatalogRegistry`, `ObjectTypeMetadata`)
- [x] Core Domain Aggregates & Entities (`User`, `Workspace`, `LumoraObject`, `Space`, `Collection`, `Reminder`)
- [x] Pure domain repository interfaces in `src/domain/*/repositories/`
- [x] `PrismaUnitOfWork` implementation with `ITransactionContext` abstraction

### Unit 2: Use Cases, Repositories Implementation & Domain Integration (Active Unit)
- [x] `.editorconfig` enforcement across monorepo
- [x] Correlation ID middleware and JSON structured logger service
- [x] Concrete Prisma repository implementations with bidirectional mappers (`Prisma Model ↔ Aggregate`)
- [x] Application Use Cases (`CreateObjectUseCase`, `ScheduleReminderUseCase`, `SnoozeReminderUseCase`, `CompleteReminderUseCase`)
- [x] Domain aggregate response DTOs and mappers
- [x] Comprehensive domain unit tests & repository integration tests
- [ ] Migrate transport controllers completely from legacy services (`ObjectsService`, `RemindersService`) to CQRS Use Cases during the next application-layer refactoring batch

### Unit 3 & Beyond: Stub Module Implementations
- [ ] Notifications Delivery module
- [ ] Universal Search & Indexing module
- [ ] Timeline Temporal Engine module
- [ ] Media & Asset Management module
- [ ] User & Workspace Settings module
- [ ] Household bounded context implementation

---

## Phase 3 — Scale, CQRS, Search & Observability (Planned)

| Capability | Priority | Target Phase | Deferred Reference |
|---|:---:|:---:|---|
| **Kafka Event Bus Integration** | High | Phase 3 | `TD-001` in `TECH_DEBT.md` |
| **RabbitMQ Task Queue Cluster** | Medium | Phase 3 | `TD-002` in `TECH_DEBT.md` |
| **Elasticsearch Engine Integration** | High | Phase 3 | `TD-003` in `TECH_DEBT.md` |
| **OpenTelemetry APM & Tracing** | Medium | Phase 3 | `TD-004` in `TECH_DEBT.md` |
| **PostgreSQL Read Replicas & CQRS** | High | Phase 3 | `TD-005` in `TECH_DEBT.md` |
| **Redis Distributed Cache Layer** | Medium | Phase 3 | `TD-006` in `TECH_DEBT.md` |
| **Kubernetes Scaling (HPA)** | Medium | Phase 3 | `TD-012` in `TECH_DEBT.md` |

---

## Phase 4 — Global Enterprise, Compliance & Production (Planned)

| Capability | Priority | Target Phase | Deferred Reference |
|---|:---:|:---:|---|
| **Cloudflare / CloudFront CDN** | Low | Phase 4 | `TD-007` in `TECH_DEBT.md` |
| **Multi-Region Active-Active DB** | Low | Phase 4 | `TD-008` in `TECH_DEBT.md` |
| **SOC2 Type II Audit Compliance** | Medium | Phase 4 | `TD-009` in `TECH_DEBT.md` |
| **ISO27001 ISMS Certification** | Low | Phase 4 | `TD-010` in `TECH_DEBT.md` |
| **Automated Multi-Region DR** | Medium | Phase 4 | `TD-011` in `TECH_DEBT.md` |
| **Dynamic Plugin Kernel** | Low | Phase 4 | `TD-013` in `TECH_DEBT.md` |
