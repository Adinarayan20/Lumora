# Lumora Architectural Roadmap

## Phase Overview

```
Phase 1: Engineering Foundation & Infrastructure Setup (COMPLETED)
Phase 2: Core Domain Construction & DDD Tactical Patterns (IN PROGRESS - Unit 1 Done, Unit 2 Done, Unit 3 Active)
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

### Unit 2: Use Cases, Repositories Implementation & Domain Integration (Completed)
- [x] `.editorconfig` enforcement across monorepo
- [x] Correlation ID middleware and JSON structured logger service
- [x] Concrete Prisma repository implementations with bidirectional mappers (`Prisma Model ↔ Aggregate`)
- [x] Application Use Cases (`CreateObjectUseCase`, `ScheduleReminderUseCase`, `SnoozeReminderUseCase`, `CompleteReminderUseCase`)
- [x] Domain aggregate response DTOs and mappers
- [x] Comprehensive domain unit tests & repository integration tests

### Unit 3: Stub & Bounded Context Implementations (Completed)
- [x] Batch 1: Notifications Delivery Bounded Context (`NotificationAggregate`, `NotificationPolicy`, `PrismaNotificationRepository`, `DeliverNotificationUseCase`, `MarkNotificationAsReadUseCase`)
- [x] Batch 2: Media & File Asset Management Bounded Context (`FileAssetAggregate`, `StorageQuotaPolicy`, `FileValidationPolicy`, `LocalStorageProvider`, `PrismaFileAssetRepository`, Use Cases)
- [x] Batch 3: Universal Search Indexing Bounded Context (`SearchIndexEntity` projection, `PrismaSearchRepository`, `IndexEntityUseCase`, `SearchObjectsQuery`)
- [x] Batch 4: Timeline Temporal Engine Bounded Context (`TimelineRecordEntity`, `PrismaTimelineRepository`, `RecordTimelineActivityUseCase`, `GetWorkspaceTimelineQuery`)
- [x] Batch 5: User & Workspace Settings Bounded Context (`UserSettingsAggregate`, `WorkspaceSettingsAggregate`, `PrismaUserSettingsRepository`, `PrismaWorkspaceSettingsRepository`, `UpdateUserSettingsUseCase`)
- [x] Batch 6: Controller CQRS Migration (Migrated 11 HTTP Transport Controllers to CQRS Use Cases/Queries)
- [x] Batch 7: Final Integration, Verification & Production Readiness Cleanup (DI Audit, E2E Verification, Dead Code Pruning, Quality Gates)

---

## Phase 3 — Scale, CQRS, Search & Observability (Planned)

### Search Engine Infrastructure Roadmap (PostgreSQL Native Engine)
- **PostgreSQL Full-Text Search (FTS)**: Upgrade `SearchIndex` query engine to use PostgreSQL native `tsvector` generated columns and GIN indexes for sub-millisecond query execution.
- **Relevance Ranking & Scoring**: Implement `ts_rank` and `ts_rank_cd` scoring algorithms to rank search results by relevance matching title and content density.
- **Language Stemming & Lexemes**: Configure `english` and multi-language dictionary stemmers to match word variations (e.g. "planning", "plans", "planned").
- **Typo Tolerance & Fuzzy Matching**: Integrate PostgreSQL `pg_trgm` trigram similarity matching (`similarity(title, query) > 0.3`) for automatic typo tolerance.
- **Asynchronous Projection Sync**: Wire Outbox event consumers (`ObjectCreatedEvent`, `SpaceCreatedEvent`, `CollectionCreatedEvent`) to index search projections asynchronously without blocking primary write transactions.

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
