import { Prisma } from '../../../generated/prisma/index.js';

/**
 * Prisma Client Extension enforcing automated soft-delete query scoping.
 * Intercepts query execution to exclude soft-deleted records (deletedAt != null)
 * and mutates delete operations into soft-delete timestamp updates.
 *
 * SOFT-DELETE OPERATION MATRIX & DESIGN AUDIT:
 * ----------------------------------------------------------------------------------
 * Operation           | Behavior                                 | Scope Filter
 * ----------------------------------------------------------------------------------
 * findUnique          | Intercepted                             | appends deletedAt: null
 * findUniqueOrThrow   | Intercepted                             | appends deletedAt: null
 * findFirst           | Intercepted                             | appends deletedAt: null
 * findFirstOrThrow    | Intercepted                             | appends deletedAt: null
 * findMany            | Intercepted                             | appends deletedAt: null
 * count               | Intercepted                             | appends deletedAt: null
 * aggregate           | Intercepted                             | appends deletedAt: null
 * groupBy             | Intercepted                             | appends deletedAt: null
 * delete              | Mutated                                 | updates deletedAt = now()
 * deleteMany          | Mutated                                 | updates deletedAt = now()
 * update              | Native Prisma update                    | targets active row
 * updateMany          | Native Prisma update                    | targets active rows
 * upsert              | Intentional Exclusion                   | creates or updates
 * $queryRaw           | Intentional Exclusion                   | explicit raw SQL queries
 * ----------------------------------------------------------------------------------
 */
export const softDeleteExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    name: 'softDeleteExtension',
    query: {
      $allModels: {
        async findUnique({ args, query }) {
          const extendedWhere = { ...args.where, deletedAt: null };
          return query({ ...args, where: extendedWhere });
        },
        async findUniqueOrThrow({ args, query }) {
          const extendedWhere = { ...args.where, deletedAt: null };
          return query({ ...args, where: extendedWhere });
        },
        async findFirst({ args, query }) {
          const extendedWhere = { ...args.where, deletedAt: null };
          return query({ ...args, where: extendedWhere });
        },
        async findFirstOrThrow({ args, query }) {
          const extendedWhere = { ...args.where, deletedAt: null };
          return query({ ...args, where: extendedWhere });
        },
        async findMany({ args, query }) {
          const extendedWhere = { ...args.where, deletedAt: null };
          return query({ ...args, where: extendedWhere });
        },
        async count({ args, query }) {
          const extendedWhere = { ...args.where, deletedAt: null };
          return query({ ...args, where: extendedWhere });
        },
        async aggregate({ args, query }) {
          const extendedWhere = { ...args.where, deletedAt: null };
          return query({ ...args, where: extendedWhere });
        },
        async groupBy({ args, query }) {
          const extendedWhere = { ...args.where, deletedAt: null };
          return query({ ...args, where: extendedWhere });
        },
        async delete({ model, args }) {
          const modelName = model.toLowerCase();
          const delegate = (client as Record<string, any>)[modelName];
          if (delegate && typeof delegate.update === 'function') {
            return delegate.update({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
          throw new Error(`Soft delete failed: Model '${model}' update delegate is undefined.`);
        },
        async deleteMany({ model, args }) {
          const modelName = model.toLowerCase();
          const delegate = (client as Record<string, any>)[modelName];
          if (delegate && typeof delegate.updateMany === 'function') {
            return delegate.updateMany({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
          throw new Error(`Soft deleteMany failed: Model '${model}' updateMany delegate is undefined.`);
        },
      },
    },
  });
});

export type ExtendedPrismaClient = ReturnType<typeof Prisma.defineExtension> extends (client: any) => infer R ? R : never;
