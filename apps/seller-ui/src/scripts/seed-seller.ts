import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedSellers() {
  const sellers = [
    {
      email: 'seller1@example.com',
      password: 'password123',
      name: 'Seller One',
      country: 'USA',
      phone_number: '+1-555-0101',
      stripeId: 'acct_1ExampleSellerOne',
      shop: {
        name: 'OherbuyStore',
        bio: 'Quality goods from Seller One',
        category: 'General',
        address: '123 Main St, Anytown, USA',
        opening_hours: 'Mon-Fri 9:00-18:00',
        website: 'https://sellerone.example.com',
        socialLinks: [],
        coverBanner: null,
      },
    },
    {
      email: 'seller2@example.com',
      password: 'password456',
      name: 'Seller Two',
      country: 'Canada',
      phone_number: '+1-555-0202',
      stripeId: 'acct_1ExampleSellerTwo',
      shop: {
        name: 'H2herbals',
        bio: 'Handmade items from Seller Two',
        category: 'Boutique',
        address: '456 Market Ave, Somecity, Canada',
        opening_hours: 'Tue-Sun 10:00-17:00',
        website: 'https://sellertwo.example.com',
        socialLinks: [],
        coverBanner: null,
      },
    },
  ];

  for (const s of sellers) {
    // ensure shop.name is present and trimmed so sidebar can display it
    if (!s.shop) s.shop = {} as any;
    s.shop.name = (s.shop.name || '').toString().trim();
    if (!s.shop.name) {
      s.shop.name = `${s.name} Shop`;
    }

    const hashed = await bcrypt.hash(s.password, 10);

    const seller = await prisma.sellers.upsert({
      where: { email: s.email },
      update: {
        password: hashed,
        name: s.name,
        country: s.country,
        phone_number: s.phone_number,
        stripeId: s.stripeId,
      },
      create: {
        email: s.email,
        password: hashed,
        name: s.name,
        country: s.country,
        phone_number: s.phone_number,
        stripeId: s.stripeId,
      },
    });

    console.log(`Seller ${seller.email} seeded/updated (id=${seller.id}).`);

    // upsert a shop for this seller (shops.sellerId is unique in your schema)
    try {
      await prisma.shops.upsert({
        where: { sellerId: seller.id },
        update: {
          name: s.shop.name,
          bio: s.shop.bio,
          category: s.shop.category,
          address: s.shop.address,
          opening_hours: s.shop.opening_hours,
          website: s.shop.website,
          socialLinks: s.shop.socialLinks,
          coverBanner: s.shop.coverBanner,
          updatedAt: new Date(),
        },
        create: {
          name: s.shop.name,
          bio: s.shop.bio,
          category: s.shop.category,
          address: s.shop.address,
          opening_hours: s.shop.opening_hours,
          website: s.shop.website,
          socialLinks: s.shop.socialLinks,
          coverBanner: s.shop.coverBanner,
          sellerId: seller.id,
        },
      });
      console.log(`Shop for seller ${seller.email} seeded/updated with name: "${s.shop.name}".`);
    } catch (err: any) {
      console.error(`Failed to upsert shop for seller ${seller.email}:`, err.message || err);
    }
  }

  await prisma.$disconnect();
}

seedSellers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });