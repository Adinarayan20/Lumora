import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { randomBytes } from 'crypto';
import type { TraceContext } from './interfaces/trace-context.interface.js';

@Injectable()
export class TraceContextService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<TraceContext>();

  public run<R>(context: TraceContext, callback: () => R): R {
    return this.asyncLocalStorage.run(context, callback);
  }

  public getContext(): TraceContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  public getTraceId(): string | undefined {
    return this.getContext()?.traceId;
  }

  public getSpanId(): string | undefined {
    return this.getContext()?.spanId;
  }

  public getRequestId(): string | undefined {
    return this.getContext()?.requestId;
  }

  /**
   * Generates a W3C-compliant 32-character hex Trace ID (128-bit).
   */
  public generateTraceId(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * Generates a W3C-compliant 16-character hex Span ID (64-bit).
   */
  public generateSpanId(): string {
    return randomBytes(8).toString('hex');
  }
}
