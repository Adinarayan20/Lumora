/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TracingProvider } from '../tracing.provider.js';

describe('TracingProvider Unit Tests', () => {
  let provider: TracingProvider;
  let mockConfigService: any;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn().mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'OTEL_ENABLED') return true;
        if (key === 'OTEL_SERVICE_NAME') return 'lumora-backend-test';
        if (key === 'OTEL_EXPORTER_OTLP_ENDPOINT') return undefined;
        return defaultValue;
      }),
    };

    provider = new TracingProvider(mockConfigService);
  });

  it('should initialize OpenTelemetry NodeSDK and return valid tracer', () => {
    provider.onModuleInit();

    expect(provider.isTracingEnabled()).toBe(true);
    expect(provider.getServiceName()).toBe('lumora-backend-test');

    const tracer = provider.getTracer('test-tracer');
    expect(tracer).toBeDefined();
  });

  it('should gracefully handle disabled tracing configuration', () => {
    mockConfigService.get.mockImplementation(
      (key: string, defaultValue?: any) => {
        if (key === 'OTEL_ENABLED') return false;
        return defaultValue;
      },
    );

    provider.onModuleInit();
    expect(provider.isTracingEnabled()).toBe(false);
  });

  it('should shutdown NodeSDK cleanly on module destroy', async () => {
    provider.onModuleInit();
    await expect(provider.onModuleDestroy()).resolves.not.toThrow();
  });
});
