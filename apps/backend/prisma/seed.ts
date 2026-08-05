import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { GLOBAL_PERMISSIONS_SEED } from './data/permissions.seed';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_96SLNpxPXteZ@ep-silent-poetry-ayc8mmx1-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
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
