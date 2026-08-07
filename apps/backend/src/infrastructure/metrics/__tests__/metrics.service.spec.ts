/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MetricsService } from '../metrics.service.js';
import { MetricsRegistry } from '../metrics.registry.js';

describe('MetricsService Unit Tests', () => {
  let service: MetricsService;
  let metricsRegistry: MetricsRegistry;
  let mockConfigService: any;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn().mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'METRICS_ENABLED') return true;
        return defaultValue;
      }),
    };

    metricsRegistry = new MetricsRegistry(mockConfigService);
    service = new MetricsService(metricsRegistry, mockConfigService);
  });

  it('should generate Prometheus text output format when enabled', async () => {
    metricsRegistry.httpRequestsTotal.inc({
      method: 'GET',
      route: '/api/v1/objects',
      status_code: '200',
    });

    const output = await service.getMetrics();
    expect(output).toContain('http_requests_total');
    expect(output).toContain('method="GET"');
    expect(service.getContentType()).toContain('text/plain');
  });

  it('should return disabled message when METRICS_ENABLED is false', async () => {
    mockConfigService.get.mockReturnValue(false);

    const output = await service.getMetrics();
    expect(output).toBe('# Metrics collection is disabled by configuration.');
  });
});
