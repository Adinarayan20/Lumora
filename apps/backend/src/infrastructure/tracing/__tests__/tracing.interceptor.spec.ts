/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { TracingInterceptor } from '../tracing.interceptor.js';

describe('TracingInterceptor Unit Tests', () => {
  let interceptor: TracingInterceptor;
  let mockTraceContextService: any;
  let mockTracingProvider: any;
  let mockExecutionContext: any;
  let mockCallHandler: any;
  let mockSpan: any;

  beforeEach(() => {
    mockTraceContextService = {
      getContext: vi.fn().mockReturnValue({
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        spanId: '00f067aa0ba902b7',
        requestId: 'req-123',
      }),
    };

    mockSpan = {
      setAttribute: vi.fn(),
      setStatus: vi.fn(),
      recordException: vi.fn(),
      end: vi.fn(),
    };

    mockTracingProvider = {
      isTracingEnabled: vi.fn().mockReturnValue(true),
      getTracer: vi.fn().mockReturnValue({
        startSpan: vi.fn().mockReturnValue(mockSpan),
      }),
    };

    mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: () => ({ method: 'GET', url: '/api/v1/objects' }),
        getResponse: () => ({ statusCode: 200 }),
      }),
    };

    mockCallHandler = {
      handle: vi.fn().mockReturnValue(of({ success: true })),
    };

    interceptor = new TracingInterceptor(
      mockTraceContextService,
      mockTracingProvider,
    );
  });

  it('should intercept execution and start/end OpenTelemetry span cleanly', () => {
    return new Promise<void>((resolve) => {
      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe({
          next: (result) => {
            expect(result).toEqual({ success: true });
            expect(mockSpan.setStatus).toHaveBeenCalled();
            expect(mockSpan.end).toHaveBeenCalled();
            resolve();
          },
        });
    });
  });

  it('should catch error and record exception on OpenTelemetry span', () => {
    mockCallHandler.handle.mockReturnValue(
      throwError(() => new Error('Db error')),
    );

    return new Promise<void>((resolve) => {
      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe({
          error: (err: Error) => {
            expect(err.message).toBe('Db error');
            expect(mockSpan.recordException).toHaveBeenCalled();
            expect(mockSpan.end).toHaveBeenCalled();
            resolve();
          },
        });
    });
  });
});
