import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing shops documents with null sellers -> set to empty array');

  const res = await prisma.$runCommandRaw({
    update: 'shops', // change to your Mongo collection name if different
    updates: [
      {
        q: { sellers: null },
        u: { $set: { sellers: [] } },
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