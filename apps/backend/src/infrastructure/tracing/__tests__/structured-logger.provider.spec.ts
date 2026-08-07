/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StructuredLoggerProvider } from '../structured-logger.provider.js';
import { TraceContextService } from '../trace-context.service.js';

describe('StructuredLoggerProvider Unit Tests', () => {
  let loggerProvider: StructuredLoggerProvider;
  let traceContextService: TraceContextService;

  beforeEach(() => {
    traceContextService = new TraceContextService();
    loggerProvider = new StructuredLoggerProvider(traceContextService);
  });

  it('should output structured JSON log containing passive trace context fields', () => {
    const stdoutSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);

    const context = {
      traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
      spanId: '00f067aa0ba902b7',
      requestId: 'req-123',
      startTime: Date.now(),
    };

    traceContextService.run(context, () => {
      loggerProvider.log('Test message log', 'TestContext');
    });

    expect(stdoutSpy).toHaveBeenCalled();
    const logJson = JSON.parse(stdoutSpy.mock.calls[0][0] as string);
    expect(logJson.traceId).toBe('4bf92f3577b34da6a3ce929d0e0e4736');
    expect(logJson.spanId).toBe('00f067aa0ba902b7');
    expect(logJson.requestId).toBe('req-123');
    expect(logJson.level).toBe('INFO');
    expect(logJson.message).toBe('Test message log');

    stdoutSpy.mockRestore();
  });
});
