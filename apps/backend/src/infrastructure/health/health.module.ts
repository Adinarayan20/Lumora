import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RedisModule } from '../redis/redis.module.js';
import { BullMQModule } from '../queue/bullmq.module.js';
import { HealthService } from './health.service.js';
import { HealthController } from './health.controller.js';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule, RedisModule, BullMQModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
