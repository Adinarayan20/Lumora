import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { GLOBAL_PERMISSIONS_SEED } from './data/permissions.seed';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    '❌ DATABASE_URL environment variable is not set. ' +
      'Copy apps/backend/.env.example to apps/backend/.env and fill in your database credentials.',
  );
  process.exit(1);
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting Prisma database seed...');

  for (const perm of GLOBAL_PERMISSIONS_SEED) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: {
        resource: perm.resource,
        action: perm.action,
        description: perm.description,
      },
      create: {
        key: perm.key,
        resource: perm.resource,
        action: perm.action,
        description: perm.description,
      },
    });
  }

  console.log(
    `✅ Successfully seeded ${GLOBAL_PERMISSIONS_SEED.length} global permissions.`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Database seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
