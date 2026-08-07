# ADR-007: Background Job Dispatcher & BullMQ Infrastructure Isolation

## Context & Problem Statement
As Lumora scales asynchronous background operations (reminders, notifications, email delivery, webhooks), job queuing and worker processing require robust queue management, retries, exponential backoffs, and dead letter strategy support. Directly injecting third-party queue libraries (`BullMQ`) into application use cases or outbox workers violates Clean Architecture rules (`UI → Application → Domain → Infrastructure`) and prevents replacing the underlying queue broker in the future.

## Decision Drivers
- **Clean Architecture Infrastructure Isolation**: The application layer defines `IBackgroundJobDispatcher` (`BACKGROUND_JOB_DISPATCHER_TOKEN`) using domain DTOs (`DispatchReminderJobDto`, `DispatchNotificationJobDto`, `DispatchEmailJobDto`). BullMQ types (`Queue`, `Worker`, `Job`) are forbidden in application or domain layers.
- **Dedicated Connection Provider**: `BullMQConnectionProvider` acts as the single source of truth for parsing `REDIS_URL` into BullMQ connection parameters across dispatcher and processors.
- **Base Queue Processor & Observability**: `BaseQueueProcessor<T>` encapsulates worker lifecycle, structured logging, failure handling, and `QueueEvents` listeners (`waiting`, `active`, `completed`, `failed`, `stalled`) for Unit 5 Prometheus metrics.
- **Centralized Job Names**: `JOB_NAMES` constant defines all job names (`process-reminder`, `process-notification`, `process-email`, `process-webhook`), eliminating magic strings.
- **Dedicated Queue Isolation**: Queues are isolated by domain capability (`lumora-reminder-queue`, `lumora-notification-queue`, `lumora-email-queue`, `lumora-webhook-queue`).
- **Configuration-Driven Retries & Backoffs**: Queue concurrency, retry counts, and exponential backoff parameters are managed via `ConfigService` (`QueueOptionsProvider`).

## Decision
1. Implement `IBackgroundJobDispatcher` interface in `apps/backend/src/application/jobs/`.
2. Implement `BullMQConnectionProvider`, `BullMQJobDispatcher`, `BaseQueueProcessor<T>`, and dedicated workers (`ReminderQueueProcessor`, `NotificationQueueProcessor`, `EmailQueueProcessor`) inside `apps/backend/src/infrastructure/queue/`.
3. Export `BACKGROUND_JOB_DISPATCHER_TOKEN` from `BullMQModule`.
4. Inject `IBackgroundJobDispatcher` into `OutboxWorker`.

## Status
Accepted

## Consequences

### Positive
- **Complete Decoupling**: Application use-cases dispatch background jobs using clean domain DTOs.
- **Single Connection Provider**: Eliminates duplicate `REDIS_URL` parsing.
- **Observability Hooks**: `QueueEvents` prepare backend for Prometheus metrics monitoring in Unit 5.

### Negative / Trade-offs
- Requires Redis connection for BullMQ queues.
