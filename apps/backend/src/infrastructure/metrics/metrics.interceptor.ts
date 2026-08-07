import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { MetricsRegistry } from './metrics.registry.js';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    private readonly metricsRegistry: MetricsRegistry,
    private readonly configService: ConfigService,
  ) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const enabled = this.configService.get<boolean>('METRICS_ENABLED', true);
    if (!enabled) {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<Request>();
    const res = httpContext.getResponse<Response>();

    const method = req.method || 'GET';
    const route =
      (req as unknown as { route?: { path?: string } }).route?.path ||
      req.originalUrl ||
      req.url ||
      'unknown';

    this.metricsRegistry.httpRequestsActive.inc({ method });
    const startTime = process.hrtime();

    return next.handle().pipe(
      tap({
        next: () => {
          this.metricsRegistry.httpRequestsActive.dec({ method });
          const diff = process.hrtime(startTime);
          const durationSeconds = diff[0] + diff[1] / 1e9;
          const statusCode = String(res.statusCode || 200);

          this.metricsRegistry.httpRequestsTotal.inc({
            method,
            route,
            status_code: statusCode,
          });

          this.metricsRegistry.httpRequestDurationSeconds.observe(
            { method, route, status_code: statusCode },
            durationSeconds,
          );
        },
        error: (error: Error) => {
          this.metricsRegistry.httpRequestsActive.dec({ method });
          const diff = process.hrtime(startTime);
          const durationSeconds = diff[0] + diff[1] / 1e9;
          const statusCode = String(res.statusCode || 500);

          this.metricsRegistry.httpRequestsTotal.inc({
            method,
            route,
            status_code: statusCode,
          });

          this.metricsRegistry.httpRequestDurationSeconds.observe(
            { method, route, status_code: statusCode },
            durationSeconds,
          );

          this.metricsRegistry.httpRequestFailuresTotal.inc({
            method,
            route,
            error_type: error.name || 'Error',
          });
        },
      }),
    );
  }
}
