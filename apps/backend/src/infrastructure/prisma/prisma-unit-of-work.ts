import { Injectable } from '@nestjs/common';
import { IdGenerator } from '@lumora/shared';
import { PrismaService } from './prisma.service.js';
import { PrismaExceptionMapper } from './mappers/prisma-exception.mapper.js';
import type { IUnitOfWork } from '../../domain/common/unit-of-work/unit-of-work.interface.js';
import type { ITransactionContext } from '../../domain/common/unit-of-work/transaction-context.interface.js';

/**
 * Concrete implementation of ITransactionContext wrapping Prisma's interactive transaction client.
 */
export class PrismaTransactionContext implements ITransactionContext {
  public readonly transactionId: string;

  constructor(public readonly prismaTransaction: unknown) {
    this.transactionId = IdGenerator.generate();
  }
}

/**
 * Infrastructure adapter implementing IUnitOfWork using Prisma Client $transaction.
 */
@Injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Executes domain operations within an interactive PostgreSQL database transaction.
   */
  public async execute<T>(
    work: (tx: ITransactionContext) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.prisma.$transaction(async (txClient) => {
        const txContext = new PrismaTransactionContext(txClient);
        return await work(txContext);
      });
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error, 'UnitOfWork');
    }
  }
}
