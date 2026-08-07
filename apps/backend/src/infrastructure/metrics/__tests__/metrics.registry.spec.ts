/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MetricsRegistry } from '../metrics.registry.js';

describe('MetricsRegistry Unit Tests', () => {
  let metricsRegistry: MetricsRegistry;
  let mockConfigService: any;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn().mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'METRICS_PREFIX') return 'lumora_test_';
        if (key === 'METRICS_ENABLED') return true;
        return defaultValue;
      }),
    };

    metricsRegistry = new MetricsRegistry(mockConfigService);
  });

  it('should initialize Prometheus registry with configured prefix and metrics', () => {
    expect(metricsRegistry.registry).toBeDefined();
    expect(metricsRegistry.httpRequestsTotal).toBeDefined();
    expect(metricsRegistry.httpRequestDurationSeconds).toBeDefined();
    expect(metricsRegistry.httpRequestsActive).toBeDefined();
    expect(metricsRegistry.httpRequestFailuresTotal).toBeDefined();
    expect(metricsRegistry.queueJobsTotal).toBeDefined();
  });

  it('should register default Node.js process metrics on module init', () => {
    expect(() => metricsRegistry.onModuleInit()).not.toThrow();
  });
});
