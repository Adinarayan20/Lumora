import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MetricsRegistry } from './metrics.registry.js';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(
    private readonly metricsRegistry: MetricsRegistry,
    private readonly configService: ConfigService,
  ) {}

  public async getMetrics(): Promise<string> {
    const enabled = this.configService.get<boolean>('METRICS_ENABLED', true);
    if (!enabled) {
      return '# Metrics collection is disabled by configuration.';
    }

    try {
      return await this.metricsRegistry.registry.metrics();
    } catch (error) {
      this.logger.error(
        `Failed to generate Prometheus metrics export: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  public getContentType(): string {
    return this.metricsRegistry.registry.contentType;
  }
}
