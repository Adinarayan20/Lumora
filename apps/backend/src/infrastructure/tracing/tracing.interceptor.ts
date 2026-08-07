import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Response, Request } from 'express';
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

    const startTime = Date.now();
    const traceCtx = this.traceContextService.getContext();

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startTime;
          const statusCode = res.statusCode || 200;

          if (traceCtx) {
            this.logger.debug(
              `HTTP ${req.method} ${req.url} completed [status: ${statusCode}, duration: ${durationMs}ms, traceId: ${traceCtx.traceId}, requestId: ${traceCtx.requestId}]`,
            );
          }
        },
        error: (error: Error) => {
          const durationMs = Date.now() - startTime;
          if (traceCtx) {
            this.logger.error(
              `HTTP ${req.method} ${req.url} failed [duration: ${durationMs}ms, traceId: ${traceCtx.traceId}, requestId: ${traceCtx.requestId}]: ${error.message}`,
              error.stack,
            );
          }
        },
      }),
    );
  }
}
