import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TraceContextService } from './trace-context.service.js';
import type { TraceContext } from './interfaces/trace-context.interface.js';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly traceContextService: TraceContextService) {}

  public use(req: Request, res: Response, next: NextFunction): void {
    const rawTraceparent = req.headers['traceparent'];
    let traceId: string | undefined;
    let parentSpanId: string | undefined;

    if (rawTraceparent && typeof rawTraceparent === 'string') {
      const parts = rawTraceparent.split('-');
      if (parts.length >= 4 && parts[0] === '00') {
        traceId = parts[1];
        parentSpanId = parts[2];
      }
    }

    if (!traceId) {
      traceId = this.traceContextService.generateTraceId();
    }

    const spanId = this.traceContextService.generateSpanId();
    const rawRequestId = req.headers['x-request-id'];
    const requestId =
      typeof rawRequestId === 'string' && rawRequestId.trim().length > 0
        ? rawRequestId.trim()
        : uuidv4();

    const traceContext: TraceContext = {
      traceId,
      spanId,
      requestId,
      parentSpanId,
      startTime: Date.now(),
    };

    res.setHeader('x-trace-id', traceId);
    res.setHeader('x-request-id', requestId);

    this.traceContextService.run(traceContext, () => {
      next();
    });
  }
}
