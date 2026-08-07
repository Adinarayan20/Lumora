import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TracingProvider implements OnModuleInit {
  private readonly logger = new Logger(TracingProvider.name);
  private enabled: boolean = true;
  private serviceName: string = 'lumora-backend';
  private otlpEndpoint?: string;

  constructor(private readonly configService: ConfigService) {}

  public onModuleInit(): void {
    this.enabled = this.configService.get<boolean>('OTEL_ENABLED', true);
    this.serviceName = this.configService.get<string>(
      'OTEL_SERVICE_NAME',
      'lumora-backend',
    );
    this.otlpEndpoint = this.configService.get<string>(
      'OTEL_EXPORTER_OTLP_ENDPOINT',
    );

    if (!this.enabled) {
      this.logger.log(
        'OpenTelemetry tracing is explicitly disabled by configuration.',
      );
      return;
    }

    this.logger.log(
      `OpenTelemetry tracing initialized [service: ${this.serviceName}, endpoint: ${this.otlpEndpoint || 'console/local'}]`,
    );
  }

  public isTracingEnabled(): boolean {
    return this.enabled;
  }

  public getServiceName(): string {
    return this.serviceName;
  }
}
