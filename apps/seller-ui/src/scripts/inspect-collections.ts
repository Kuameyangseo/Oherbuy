import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Listing collections and one sample document each...\n');

  const listResp: any = await prisma.$runCommandRaw({ listCollections: 1 });
  const collections = listResp?.cursor?.firstBatch ?? [];

  if (!collections.length) {
    console.log('No collections found (or permission issue).');
  }

  for (const c of collections) {
    const name = c.name;
    console.log('--- Collection:', name);

    try {
      const sample: any = await prisma.$runCommandRaw({
        find: name,
        filter: {},
        limit: 1,
      });

      // prisma $runCommandRaw find result shape may vary; try common fields
      const docs = sample?.cursor?.firstBatch ?? sample?.documents ?? sample ?? [];
      if (Array.isArray(docs) && docs.length) {
        console.log(JSON.stringify(docs[0], null, 2));
      } else {
        console.log('(no documents returned or incompatible response shape)');
      }
    } catch (err: any) {
      console.log('Error reading collection sample:', err.message || err);
    }
    console.log('');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});