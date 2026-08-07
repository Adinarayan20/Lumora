import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Registry,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsRegistry implements OnModuleInit {
  public readonly registry: Registry;

  // HTTP Metrics
  public readonly httpRequestsTotal: Counter<string>;
  public readonly httpRequestDurationSeconds: Histogram<string>;
  public readonly httpRequestsActive: Gauge<string>;
  public readonly httpRequestFailuresTotal: Counter<string>;

  // Queue (BullMQ) Metrics
  public readonly queueJobsTotal: Counter<string>;
  public readonly queueJobDurationSeconds: Histogram<string>;
  public readonly queueDepthGauge: Gauge<string>;
  public readonly queueRetriesTotal: Counter<string>;

  // Redis & Infrastructure Metrics
  public readonly redisConnectionStateGauge: Gauge<string>;

  // Database Metrics
  public readonly databaseQueryDurationSeconds: Histogram<string>;

  // Outbox Metrics
  public readonly outboxPendingMessagesGauge: Gauge<string>;
  public readonly outboxProcessingLagSeconds: Histogram<string>;

  constructor(private readonly configService: ConfigService) {
    this.registry = new Registry();

    const prefix = this.configService.get<string>('METRICS_PREFIX', 'lumora_');

    // HTTP Metrics Initialization
    this.httpRequestsTotal = new Counter({
      name: `${prefix}http_requests_total`,
      help: 'Total count of HTTP requests processed',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestDurationSeconds = new Histogram({
      name: `${prefix}http_request_duration_seconds`,
      help: 'HTTP request execution duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    this.httpRequestsActive = new Gauge({
      name: `${prefix}http_requests_active`,
      help: 'Current active HTTP requests in flight',
      labelNames: ['method'],
      registers: [this.registry],
    });

    this.httpRequestFailuresTotal = new Counter({
      name: `${prefix}http_request_failures_total`,
      help: 'Total count of failed HTTP requests',
      labelNames: ['method', 'route', 'error_type'],
      registers: [this.registry],
    });

    // Queue Metrics Initialization
    this.queueJobsTotal = new Counter({
      name: `${prefix}bullmq_jobs_total`,
      help: 'Total count of BullMQ background jobs processed',
      labelNames: ['queue', 'event_type', 'status'],
      registers: [this.registry],
    });

    this.queueJobDurationSeconds = new Histogram({
      name: `${prefix}bullmq_job_duration_seconds`,
      help: 'BullMQ job processing duration in seconds',
      labelNames: ['queue', 'event_type'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 5, 10, 30],
      registers: [this.registry],
    });

    this.queueDepthGauge = new Gauge({
      name: `${prefix}bullmq_queue_depth`,
      help: 'Current number of waiting/active jobs in BullMQ queues',
      labelNames: ['queue'],
      registers: [this.registry],
    });

    this.queueRetriesTotal = new Counter({
      name: `${prefix}bullmq_retries_total`,
      help: 'Total count of BullMQ job retry attempts',
      labelNames: ['queue', 'event_type'],
      registers: [this.registry],
    });

    // Redis Infrastructure Metrics
    this.redisConnectionStateGauge = new Gauge({
      name: `${prefix}redis_connection_state`,
      help: 'Redis infrastructure connection status (1 = connected, 0 = disconnected)',
      registers: [this.registry],
    });

    // Database Metrics
    this.databaseQueryDurationSeconds = new Histogram({
      name: `${prefix}database_query_duration_seconds`,
      help: 'Prisma database query duration in seconds',
      labelNames: ['model', 'action'],
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
      registers: [this.registry],
    });

    // Outbox Metrics Initialization
    this.outboxPendingMessagesGauge = new Gauge({
      name: `${prefix}outbox_pending_messages`,
      help: 'Current number of unprocessed domain events in outbox queue',
      registers: [this.registry],
    });

    this.outboxProcessingLagSeconds = new Histogram({
      name: `${prefix}outbox_processing_lag_seconds`,
      help: 'Lag in seconds between outbox message creation and dispatch',
      buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 120, 300],
      registers: [this.registry],
    });
  }

  public onModuleInit(): void {
    const enabled = this.configService.get<boolean>('METRICS_ENABLED', true);
    if (enabled) {
      collectDefaultMetrics({ register: this.registry });
    }
  }
}
