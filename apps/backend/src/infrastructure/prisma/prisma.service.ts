import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/index.js';
import { softDeleteExtension } from './extensions/soft-delete.extension.js';

/**
 * Infrastructure service managing PostgreSQL connection lifecycle via Prisma Client.
 * Encapsulates raw connection management and exposes a single, unified extended client instance.
 * All repository persistence drivers MUST access database operations exclusively through client.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly _extendedClient = this.$extends(softDeleteExtension);

  /**
   * Unified single entrypoint for database query execution.
   * Enforces soft-delete query scoping across all repository operations.
   */
  public get client() {
    return this._extendedClient;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
