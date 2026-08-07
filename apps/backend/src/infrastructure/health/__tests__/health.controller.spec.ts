/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import { HealthController } from '../health.controller.js';

describe('HealthController Unit Tests', () => {
  let controller: HealthController;
  let mockHealthService: any;
  let mockResponse: any;

  beforeEach(() => {
    mockHealthService = {
      checkLiveness: vi.fn().mockReturnValue({
        status: 'up',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        durationMs: 1,
        details: { process: { status: 'up' } },
      }),
      checkStartup: vi.fn().mockReturnValue({
        status: 'up',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        durationMs: 1,
        details: { startup: { status: 'up' } },
      }),
      checkReadiness: vi.fn().mockResolvedValue({
        status: 'up',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        durationMs: 4,
        details: {
          postgres: { status: 'up' },
          redis: { status: 'up' },
          bullmq: { status: 'up' },
          config: { status: 'up' },
        },
      }),
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    controller = new HealthController(mockHealthService);
  });

  it('should return 200 OK for GET /health/live', () => {
    controller.getLiveness(mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'up' }),
    );
  });

  it('should return 200 OK for GET /health/startup when startup is complete', () => {
    controller.getStartup(mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'up' }),
    );
  });

  it('should return 200 OK for GET /health/ready when all dependencies are ready', async () => {
    await controller.getReadiness(mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'up' }),
    );
  });

  it('should return 503 SERVICE_UNAVAILABLE for GET /health/ready when readiness probe fails', async () => {
    mockHealthService.checkReadiness.mockResolvedValue({
      status: 'down',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      durationMs: 5,
      details: { postgres: { status: 'down', error: 'DB connection error' } },
    });

    await controller.getReadiness(mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'down' }),
    );
  });
});
