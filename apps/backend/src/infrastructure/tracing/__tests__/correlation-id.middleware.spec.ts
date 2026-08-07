/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { CorrelationIdMiddleware } from '../correlation-id.middleware.js';
import { TraceContextService } from '../trace-context.service.js';

describe('CorrelationIdMiddleware Unit Tests', () => {
  let middleware: CorrelationIdMiddleware;
  let traceContextService: TraceContextService;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    traceContextService = new TraceContextService();
    middleware = new CorrelationIdMiddleware(traceContextService);

    mockRequest = {
      headers: {},
    };

    mockResponse = {
      setHeader: vi.fn(),
    };
  });

  it('should parse valid W3C traceparent header and propagate traceId', () => {
    mockRequest.headers['traceparent'] =
      '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';

    const next = vi.fn().mockImplementation(() => {
      expect(traceContextService.getTraceId()).toBe(
        '4bf92f3577b34da6a3ce929d0e0e4736',
      );
    });

    middleware.use(mockRequest as Request, mockResponse as Response, next);

    expect(next).toHaveBeenCalled();
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'x-trace-id',
      '4bf92f3577b34da6a3ce929d0e0e4736',
    );
  });

  it('should generate new Trace ID when traceparent header is absent', () => {
    const next = vi.fn().mockImplementation(() => {
      expect(traceContextService.getTraceId()).toBeDefined();
    });

    middleware.use(mockRequest as Request, mockResponse as Response, next);

    expect(next).toHaveBeenCalled();
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'x-trace-id',
      expect.any(String),
    );
  });
});
