/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { Prisma } from '../../../generated/prisma/client.js';

/**
 * Prisma Client Extension enforcing automated soft-delete query scoping.
 * Intercepts query execution to exclude soft-deleted records (deletedAt != null)
 * and mutates delete operations into soft-delete timestamp updates.
 */
export const softDeleteExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    name: 'softDeleteExtension',
    query: {
      $allModels: {
        async findUnique({ args, query }) {
          const extendedWhere = { ...args.where, deletedAt: null };
          return await query({ ...args, where: extendedWhere } as any);
        },
        async findUniqueOrThrow({ args, query }) {
          const extendedWhere = { ...args.where, deletedAt: null };
          return await query({ ...args, where: extendedWhere } as any);
        },
        async findFirst({ args, query }) {
          const extendedWhere = { ...args.where, deletedAt: null };
          return await query({ ...args, where: extendedWhere } as any);
        },
        async findFirstOrThrow({ args, query }) {
          const extendedWhere = { ...args.where, deletedAt: null };
          return await query({ ...args, where: extendedWhere } as any);
        },
        async findMany({ args, query }) {
          const extendedWhere = { ...args.where, deletedAt: null };
          return await query({ ...args, where: extendedWhere } as any);
        },
        async count({ args, query }) {
          const extendedWhere = { ...args.where, deletedAt: null };
          return await query({ ...args, where: extendedWhere } as any);
        },
        async aggregate({ args, query }) {
          const extendedWhere = { ...args.where, deletedAt: null };
          return await query({ ...args, where: extendedWhere } as any);
        },
        async groupBy({ args, query }) {
          const extendedWhere = { ...args.where, deletedAt: null };
          return await query({ ...args, where: extendedWhere } as any);
        },
        async delete({ model, args }) {
          const modelName = model.toLowerCase();
          const delegate = (client as Record<string, any>)[modelName];
          if (delegate && typeof delegate.update === 'function') {
            return await delegate.update({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
          throw new Error(
            `Soft delete failed: Model '${model}' update delegate is undefined.`,
          );
        },
        async deleteMany({ model, args }) {
          const modelName = model.toLowerCase();
          const delegate = (client as Record<string, any>)[modelName];
          if (delegate && typeof delegate.updateMany === 'function') {
            return await delegate.updateMany({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
          throw new Error(
            `Soft deleteMany failed: Model '${model}' updateMany delegate is undefined.`,
          );
        },
      },
    },
  });
});

export type ExtendedPrismaClient =
  ReturnType<typeof Prisma.defineExtension> extends (client: any) => infer R
    ? R
    : never;
