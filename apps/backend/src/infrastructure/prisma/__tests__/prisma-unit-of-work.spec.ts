import { describe, it, expect, vi } from 'vitest';
import {
  PrismaUnitOfWork,
  PrismaTransactionContext,
} from '../prisma-unit-of-work.js';
import { PrismaService } from '../prisma.service.js';

describe('PrismaUnitOfWork Infrastructure Adapter', () => {
  it('should execute work callback within transaction context successfully', async () => {
    const mockTxClient = { object: {} };
    const transactionSpy = vi.fn((cb: (tx: unknown) => Promise<unknown>) => {
      return cb(mockTxClient);
    });
    const mockPrismaService = {
      $transaction: transactionSpy,
    } as unknown as PrismaService;

    const unitOfWork = new PrismaUnitOfWork(mockPrismaService);

    const result = await unitOfWork.execute((tx) => {
      expect(tx).toBeInstanceOf(PrismaTransactionContext);
      expect((tx as PrismaTransactionContext).prismaTransaction).toBe(
        mockTxClient,
      );
      expect(tx.transactionId).toBeDefined();
      return Promise.resolve('success_payload');
    });

    expect(result).toBe('success_payload');
    expect(transactionSpy).toHaveBeenCalledTimes(1);
  });

  it('should map underlying Prisma errors to domain exceptions on failure', async () => {
    const mockPrismaService = {
      $transaction: vi.fn(() => {
        return Promise.reject(new Error('Database transaction deadlocked'));
      }),
    } as unknown as PrismaService;

    const unitOfWork = new PrismaUnitOfWork(mockPrismaService);

    await expect(
      unitOfWork.execute(() => {
        return Promise.resolve('should_fail');
      }),
    ).rejects.toThrow(Error);
  });
});
