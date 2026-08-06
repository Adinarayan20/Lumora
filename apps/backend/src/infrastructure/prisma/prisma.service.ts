import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { softDeleteExtension } from './extensions/soft-delete.extension.js';

/**
 * Infrastructure service managing PostgreSQL connection lifecycle via Prisma Client.
 * Encapsulates database initialization, shutdown signals, and client extensions.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  public get client() {
    return this.$extends(softDeleteExtension);
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
