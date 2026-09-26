import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Setting null/undefined country -> "unknown" for users collection (Mongo raw command)...');

  const res = await prisma.$runCommandRaw({
    update: 'users',
    updates: [
      {
        q: { country: null },
        u: { $set: { country: 'unknown' } },
        multi: true,
      },
    ],
  });

  console.log('Result:', res);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });