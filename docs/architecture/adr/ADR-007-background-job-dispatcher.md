# ADR-007: Background Job Dispatcher & BullMQ Infrastructure Isolation

## Context & Problem Statement
As Lumora scales asynchronous background operations (reminders, notifications, email delivery, webhooks), job queuing and worker processing require robust queue management, retries, exponential backoffs, and dead letter strategy support. Directly injecting third-party queue libraries (`BullMQ`) into application use cases or outbox workers violates Clean Architecture rules (`UI → Application → Domain → Infrastructure`) and prevents replacing the underlying queue broker in the future.

## Decision Drivers
- **Clean Architecture Infrastructure Isolation**: The application layer defines `IBackgroundJobDispatcher` (`BACKGROUND_JOB_DISPATCHER_TOKEN`) using domain DTOs (`DispatchReminderJobDto`, `DispatchNotificationJobDto`, `DispatchEmailJobDto`). BullMQ types (`Queue`, `Worker`, `Job`) are forbidden in application or domain layers.
- **Dedicated Queue Isolation**: Queues are isolated by domain capability (`lumora-reminder-queue`, `lumora-notification-queue`, `lumora-email-queue`, `lumora-webhook-queue`).
- **Configuration-Driven Retries & Backoffs**: Queue concurrency, retry counts, and exponential backoff parameters are managed via `ConfigService` (`QueueOptionsProvider`).
- **Observability & Structured Logging**: Job processors log structured metadata (`jobId`, `queue`, `eventType`, `attempt`, `correlationId`, `executionTime`).
- **Future Migration Path**: Decoupling `IBackgroundJobDispatcher` enables migrating to RabbitMQ, Kafka, or AWS SQS without modifying application use-cases.

## Decision
1. Implement `IBackgroundJobDispatcher` interface in `apps/backend/src/application/jobs/`.
2. Implement `BullMQJobDispatcher` and dedicated workers (`ReminderQueueProcessor`, `NotificationQueueProcessor`, `EmailQueueProcessor`) inside `apps/backend/src/infrastructure/queue/`.
3. Export `BACKGROUND_JOB_DISPATCHER_TOKEN` from `BullMQModule`.
4. Inject `IBackgroundJobDispatcher` into `OutboxWorker`.

## Status
Accepted

## Consequences

### Positive
- **Complete Decoupling**: Application use-cases dispatch background jobs using clean domain DTOs.
- **Resilient Queuing**: Automatic retries, exponential backoffs, and failure handling via BullMQ.
- **Zero Leakage**: No BullMQ dependencies leak outside `apps/backend/src/infrastructure/queue/`.

### Negative / Trade-offs
- Requires Redis connection for BullMQ queues.
