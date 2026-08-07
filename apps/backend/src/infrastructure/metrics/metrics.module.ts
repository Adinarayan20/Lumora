import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MetricsRegistry } from './metrics.registry.js';
import { MetricsService } from './metrics.service.js';
import { MetricsInterceptor } from './metrics.interceptor.js';
import { MetricsController } from './metrics.controller.js';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [MetricsController],
  providers: [MetricsRegistry, MetricsService, MetricsInterceptor],
  exports: [MetricsRegistry, MetricsService, MetricsInterceptor],
})
export class MetricsModule {}
