import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // parse optional --email argument: node print-shops.ts --email=seller2@example.com
  const emailArg = process.argv.find((arg) => arg.startsWith('--email='));
  const email = emailArg ? emailArg.split('=')[1] : null;

  if (email) {
    const seller = await prisma.sellers.findUnique({
      where: { email },
      include: { shop: true },
    });

    if (!seller) {
      console.log(`No seller found with email: ${email}`);
    } else if (!seller.shop || seller.shop.length === 0) {
      console.log(`Seller found (id=${seller.id}, email=${seller.email}) but no shop record exists.`);
    } else {
      // seller.shop is an array according to the Prisma type; use the first shop or iterate as needed
      const firstShop = Array.isArray(seller.shop) ? seller.shop[0] : seller.shop;
      console.log(`Seller: ${seller.name} <${seller.email}>`);
      console.log(`Shop name: ${firstShop?.name ?? '(no name)'}`);
      console.log(`Shop record:`, seller.shop);
    }

    await prisma.$disconnect();
    return;
  }

  // No email provided: list all shops
  const shops = await prisma.shops.findMany({
    select: {
      id: true,
      name: true,
      sellerId: true,
      website: true,
      address: true,
    },
    orderBy: { id: 'asc' },
  });

  if (!shops.length) {
    console.log('No shops found in the database.');
  } else {
    console.table(shops);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Error querying shops:', err);
  prisma.$disconnect().finally(() => process.exit(1));
});
