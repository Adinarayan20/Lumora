/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { MetricsInterceptor } from '../metrics.interceptor.js';
import { MetricsRegistry } from '../metrics.registry.js';

describe('MetricsInterceptor Unit Tests', () => {
  let interceptor: MetricsInterceptor;
  let metricsRegistry: MetricsRegistry;
  let mockConfigService: any;
  let mockExecutionContext: any;
  let mockCallHandler: any;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn().mockReturnValue(true),
    };

    metricsRegistry = new MetricsRegistry(mockConfigService);

    mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: () => ({
          method: 'GET',
          url: '/api/v1/objects',
          route: { path: '/api/v1/objects' },
        }),
        getResponse: () => ({ statusCode: 200 }),
      }),
    };

    mockCallHandler = {
      handle: vi.fn().mockReturnValue(of({ success: true })),
    };

    interceptor = new MetricsInterceptor(metricsRegistry, mockConfigService);
  });

  it('should intercept execution and record HTTP request count and duration metrics', () => {
    const incSpy = vi.spyOn(metricsRegistry.httpRequestsTotal, 'inc');
    const observeSpy = vi.spyOn(
      metricsRegistry.httpRequestDurationSeconds,
      'observe',
    );

    return new Promise<void>((resolve) => {
      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe({
          next: (result) => {
            expect(result).toEqual({ success: true });
            expect(incSpy).toHaveBeenCalledWith({
              method: 'GET',
              route: '/api/v1/objects',
              status_code: '200',
            });
            expect(observeSpy).toHaveBeenCalled();
            resolve();
          },
        });
    });
  });

  it('should record request failure metrics on stream error', () => {
    const failureSpy = vi.spyOn(
      metricsRegistry.httpRequestFailuresTotal,
      'inc',
    );
    mockCallHandler.handle.mockReturnValue(
      throwError(() => new Error('Service Unavailable')),
    );

    return new Promise<void>((resolve) => {
      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe({
          error: (err: Error) => {
            expect(err.message).toBe('Service Unavailable');
            expect(failureSpy).toHaveBeenCalledWith({
              method: 'GET',
              route: '/api/v1/objects',
              error_type: 'Error',
            });
            resolve();
          },
        });
    });
  });
});
