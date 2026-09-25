#!/usr/bin/env node
/*
 * scripts/audit-missing-shops.js
 * Usage: node scripts/audit-missing-shops.js [limit]
 * Scans products for referenced shopIds and reports which shopIds are missing from the shops collection.
 */

// Load prisma client from project or fallback to @prisma/client
let prisma;
try {
  const projectPrisma = require('../packages/libs/prisma');
  prisma = projectPrisma && projectPrisma.default ? projectPrisma.default : projectPrisma;
} catch (e) {
  try {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  } catch (err) {
    console.error('Unable to require prisma client. Ensure @prisma/client is installed or build the project.');
    console.error(err);
    process.exit(2);
  }
}

const limit = Number(process.argv[2] || 10000);

(async () => {
  try {
    console.log(`Scanning up to ${limit} product records for shopId references...`);
    const products = await prisma.products.findMany({ where: { shopId: { not: null } }, select: { shopId: true }, take: limit });
    const shopIdSet = new Set(products.map(p => String(p.shopId)).filter(Boolean));
    const shopIds = Array.from(shopIdSet);
    console.log('Found', shopIds.length, 'distinct referenced shopIds (sample up to 50):', shopIds.slice(0, 50));

    if (shopIds.length === 0) {
      console.log('No referenced shopIds found in products. Exiting.');
      process.exit(0);
    }

    // Fetch existing shops for these ids
    const existingShops = await prisma.shops.findMany({ where: { id: { in: shopIds } }, select: { id: true } });
    const existingIds = new Set((existingShops || []).map(s => String(s.id)));
    const missing = shopIds.filter(id => !existingIds.has(id));

    console.log('Existing shop ids found:', existingIds.size);
    console.log('Missing shop ids:', missing.length);
    if (missing.length > 0) {
      console.log('Sample missing ids (up to 50):', missing.slice(0, 50));
    }

    // Optionally show a small mapping of product -> missing shop
    if (missing.length > 0) {
      const sampleProducts = await prisma.products.findMany({ where: { shopId: { in: missing } }, select: { id: true, title: true, shopId: true }, take: 50 });
      console.log('Sample products referencing missing shops (up to 50):');
      sampleProducts.forEach(p => console.log(`  productId: ${p.id} title: ${p.title} shopId: ${p.shopId}`));
    }

  } catch (err) {
    console.error('Error during audit:', err);
  } finally {
    try { await prisma.$disconnect(); } catch (_) {}
    process.exit(0);
  }
})();
