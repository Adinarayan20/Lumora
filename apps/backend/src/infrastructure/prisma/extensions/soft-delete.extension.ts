import { Prisma } from '../../../generated/prisma/index.js';

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
          const extendedWhere = {
            ...args.where,
            deletedAt: null,
          };
          return query({ ...args, where: extendedWhere });
        },
        async findFirst({ args, query }) {
          const extendedWhere = {
            ...args.where,
            deletedAt: null,
          };
          return query({ ...args, where: extendedWhere });
        },
        async findMany({ args, query }) {
          const extendedWhere = {
            ...args.where,
            deletedAt: null,
          };
          return query({ ...args, where: extendedWhere });
        },
        async count({ args, query }) {
          const extendedWhere = {
            ...args.where,
            deletedAt: null,
          };
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
