import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '../../generated/prisma/client.js';
import { softDeleteExtension } from './extensions/soft-delete.extension.js';

/**
 * Infrastructure service managing PostgreSQL connection lifecycle via Prisma Client.
 * Encapsulates database initialization, shutdown signals, and client extensions.
 *
 * Performance: `client` getter is memoized — the extended client is created once
 * per application lifetime. `$extends()` is not free; calling it on every database
 * operation caused unnecessary overhead.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private _extendedClient: ReturnType<typeof this.$extends> | null = null;

  constructor(options?: Prisma.PrismaClientOptions) {
    super(options as Prisma.PrismaClientOptions);
  }

  public get client() {
    if (!this._extendedClient) {
      this._extendedClient = this.$extends(softDeleteExtension);
    }
    return this._extendedClient;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    // Clear memoized client before disconnecting
    this._extendedClient = null;
    await this.$disconnect();
  }
}
