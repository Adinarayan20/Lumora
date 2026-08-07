import { Global, Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TraceContextService } from './trace-context.service.js';
import { TracingProvider } from './tracing.provider.js';
import { CorrelationIdMiddleware } from './correlation-id.middleware.js';
import { TracingInterceptor } from './tracing.interceptor.js';
import { StructuredLoggerProvider } from './structured-logger.provider.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    TraceContextService,
    TracingProvider,
    TracingInterceptor,
    StructuredLoggerProvider,
  ],
  exports: [
    TraceContextService,
    TracingProvider,
    TracingInterceptor,
    StructuredLoggerProvider,
  ],
})
export class TracingModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
