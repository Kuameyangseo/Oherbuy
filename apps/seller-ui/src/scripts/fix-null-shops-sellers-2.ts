import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Finding shops with sellers null or missing...');

  // Find documents where sellers is null OR field doesn't exist
  const docs: any = await prisma.$runCommandRaw({
    find: 'shops',
    filter: { $or: [{ sellers: null }, { sellers: { $exists: false } }] },
    limit: 100,
  });

  const items = docs?.cursor?.firstBatch ?? docs?.cursor?.docs ?? docs ?? [];
  console.log('Found count (fetched sample):', (items as any[]).length);

  for (const d of items as any[]) {
    console.log('id:', d._id?.toString() ?? d.id, 'sellers:', d.sellers);
    // update each to empty array
    const res = await prisma.$runCommandRaw({
      update: 'shops',
      updates: [
        {
          q: { _id: d._id ?? d.id },
          u: { $set: { sellers: [] } },
          multi: false,
        },
      ],
    });
    console.log('Updated result for id:', d._id ?? d.id, res);
  }

  console.log('Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });