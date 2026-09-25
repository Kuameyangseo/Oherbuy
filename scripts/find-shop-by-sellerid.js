#!/usr/bin/env node
/*
 * scripts/find-shop-by-sellerid.js
 * Usage: node scripts/find-shop-by-sellerid.js <sellerId>
 * Finds the shop that currently references the provided sellerId.
 */

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

const sellerId = process.argv[2];
if (!sellerId) {
  console.error('Usage: node scripts/find-shop-by-sellerid.js <sellerId>');
  process.exit(1);
}

(async () => {
  try {
    const shop = await prisma.shops.findFirst({ where: { sellerId: String(sellerId) } });
    if (!shop) {
      console.log('No shop found with sellerId:', sellerId);
    } else {
      console.log('Shop found with sellerId:', sellerId);
      console.log('  id:', shop.id);
      console.log('  name:', shop.name);
      console.log('  keys:', Object.keys(shop));
    }
  } catch (err) {
    console.error('Error finding shop:', err);
  } finally {
    try { await prisma.$disconnect(); } catch (_) {}
    process.exit(0);
  }
})();
