import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RedisModule } from '../redis/redis.module.js';
import { TracingModule } from '../tracing/tracing.module.js';
import { GracefulShutdownService } from './shutdown.service.js';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule, RedisModule, TracingModule],
  providers: [GracefulShutdownService],
  exports: [GracefulShutdownService],
})
export class ShutdownModule {}
