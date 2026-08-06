import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CorrelationIdMiddleware } from './correlation-id.middleware.js';
import { JsonLoggerService } from './json-logger.service.js';

@Module({
  providers: [JsonLoggerService],
  exports: [JsonLoggerService],
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
