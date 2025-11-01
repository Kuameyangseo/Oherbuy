import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // get raw shops docs
  const shopsResp: any = await prisma.$runCommandRaw({ find: 'shops', filter: {}, limit: 1000 });
  const shops = shopsResp?.cursor?.firstBatch ?? [];

  for (const s of shops) {
    const sellerId = s.sellerId;
    if (!sellerId) continue;
    // check seller exists
    const sellerResp: any = await prisma.$runCommandRaw({
      find: 'sellers',
      filter: { _id: { $oid: sellerId } }, // if IDs are strings, change accordingly
      limit: 1,
    });
    const sellers = sellerResp?.cursor?.firstBatch ?? [];
    if (!sellers.length) {
      console.log('Orphan shop:', s._id?.['$oid'] ?? s._id ?? s.id, 'sellerId:', sellerId);
      // choose action: remove, set sellerId null, or create a placeholder seller
      // Example: set sellerId to null
      await prisma.$runCommandRaw({
        update: 'shops',
        updates: [{ q: { _id: s._id }, u: { $unset: { sellerId: "" } }, multi: false }],
      });
      console.log('Unset sellerId for shop', s._id);
    }
  }

  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });