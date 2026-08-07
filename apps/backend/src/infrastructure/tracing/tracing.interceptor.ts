import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Response, Request } from 'express';
import { SpanStatusCode } from '@opentelemetry/api';
import { TraceContextService } from './trace-context.service.js';
import { TracingProvider } from './tracing.provider.js';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TracingInterceptor.name);

  constructor(
    private readonly traceContextService: TraceContextService,
    private readonly tracingProvider: TracingProvider,
  ) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    if (!this.tracingProvider.isTracingEnabled()) {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<Request>();
    const res = httpContext.getResponse<Response>();

    const routePath = (req as unknown as { route?: { path?: string } }).route
      ?.path;
    const spanName = `HTTP ${req.method} ${routePath || req.url}`;
    const tracer = this.tracingProvider.getTracer('lumora-http-interceptor');
    const span = tracer.startSpan(spanName, {
      attributes: {
        'http.method': req.method,
        'http.url': req.url,
        'http.target': req.originalUrl || req.url,
      },
    });

    const startTime = Date.now();
    const traceCtx = this.traceContextService.getContext();

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startTime;
          const statusCode = res.statusCode || 200;

          span.setAttribute('http.status_code', statusCode);
          if (statusCode >= 400) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: `HTTP Status ${statusCode}`,
            });
          } else {
            span.setStatus({ code: SpanStatusCode.OK });
          }

          if (traceCtx) {
            this.logger.debug(
              `HTTP ${req.method} ${req.url} completed [status: ${statusCode}, duration: ${durationMs}ms, traceId: ${traceCtx.traceId}, requestId: ${traceCtx.requestId}]`,
            );
          }

          span.end();
        },
        error: (error: Error) => {
          const durationMs = Date.now() - startTime;
          span.recordException(error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });

          if (traceCtx) {
            this.logger.error(
              `HTTP ${req.method} ${req.url} failed [duration: ${durationMs}ms, traceId: ${traceCtx.traceId}, requestId: ${traceCtx.requestId}]: ${error.message}`,
              error.stack,
            );
          }

          span.end();
        },
      }),
    );
  }
}
