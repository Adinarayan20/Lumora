import { describe, it, expect, beforeEach } from 'vitest';
import { TraceContextService } from '../trace-context.service.js';

describe('TraceContextService Unit Tests', () => {
  let service: TraceContextService;

  beforeEach(() => {
    service = new TraceContextService();
  });

  it('should generate valid 32-character hex W3C Trace ID', () => {
    const traceId = service.generateTraceId();
    expect(traceId).toHaveLength(32);
    expect(traceId).toMatch(/^[0-9a-f]{32}$/);
  });

  it('should generate valid 16-character hex W3C Span ID', () => {
    const spanId = service.generateSpanId();
    expect(spanId).toHaveLength(16);
    expect(spanId).toMatch(/^[0-9a-f]{16}$/);
  });

  it('should store and retrieve active trace context in AsyncLocalStorage', () => {
    const context = {
      traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
      spanId: '00f067aa0ba902b7',
      requestId: 'req-123',
      startTime: Date.now(),
    };

    service.run(context, () => {
      expect(service.getTraceId()).toBe('4bf92f3577b34da6a3ce929d0e0e4736');
      expect(service.getSpanId()).toBe('00f067aa0ba902b7');
      expect(service.getRequestId()).toBe('req-123');
    });

    expect(service.getContext()).toBeUndefined();
  });
});
