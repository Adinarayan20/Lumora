/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import { MetricsController } from '../metrics.controller.js';

describe('MetricsController Unit Tests', () => {
  let controller: MetricsController;
  let mockMetricsService: any;
  let mockResponse: any;

  beforeEach(() => {
    mockMetricsService = {
      getMetrics: vi
        .fn()
        .mockResolvedValue('# HELP lumora_http_requests_total Total count'),
      getContentType: vi
        .fn()
        .mockReturnValue('text/plain; version=0.0.4; charset=utf-8'),
    };

    mockResponse = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    controller = new MetricsController(mockMetricsService);
  });

  it('should serve GET /metrics endpoint with 200 OK and text/plain Content-Type', async () => {
    await controller.getMetrics(mockResponse as Response);

    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/plain; version=0.0.4; charset=utf-8',
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(
      '# HELP lumora_http_requests_total Total count',
    );
  });
});
