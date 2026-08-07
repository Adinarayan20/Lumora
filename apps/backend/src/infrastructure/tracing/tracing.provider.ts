import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { trace, Tracer } from '@opentelemetry/api';

@Injectable()
export class TracingProvider implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TracingProvider.name);
  private sdk?: NodeSDK;
  private enabled: boolean = true;
  private serviceName: string = 'lumora-backend';

  constructor(private readonly configService: ConfigService) {}

  public onModuleInit(): void {
    this.enabled = this.configService.get<boolean>('OTEL_ENABLED', true);
    this.serviceName = this.configService.get<string>(
      'OTEL_SERVICE_NAME',
      'lumora-backend',
    );
    const otlpEndpoint = this.configService.get<string>(
      'OTEL_EXPORTER_OTLP_ENDPOINT',
    );

    if (!this.enabled) {
      this.logger.log(
        'OpenTelemetry tracing is explicitly disabled by configuration.',
      );
      return;
    }

    try {
      const traceExporter = otlpEndpoint
        ? new OTLPTraceExporter({ url: otlpEndpoint })
        : undefined;

      const resource = resourceFromAttributes({
        [ATTR_SERVICE_NAME]: this.serviceName,
      });

      this.sdk = new NodeSDK({
        resource,
        spanProcessor: traceExporter
          ? new SimpleSpanProcessor(traceExporter)
          : undefined,
        instrumentations: [new HttpInstrumentation()],
      });

      this.sdk.start();
      this.logger.log(
        `OpenTelemetry NodeSDK started successfully [service: ${this.serviceName}, endpoint: ${otlpEndpoint || 'none'}]`,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to start OpenTelemetry NodeSDK: ${(error as Error).message}. Tracing disabled gracefully.`,
      );
      this.enabled = false;
    }
  }

  public getTracer(name: string = 'lumora-tracer'): Tracer {
    return trace.getTracer(name);
  }

  public isTracingEnabled(): boolean {
    return this.enabled;
  }

  public getServiceName(): string {
    return this.serviceName;
  }

  public async onModuleDestroy(): Promise<void> {
    if (this.sdk) {
      this.logger.log('Shutting down OpenTelemetry NodeSDK cleanly...');
      await this.sdk.shutdown();
      this.sdk = undefined;
    }
  }
}
