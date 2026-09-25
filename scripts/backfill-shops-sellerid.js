#!/usr/bin/env node
/*
 * scripts/backfill-shops-sellerid.js
 * Usage: node scripts/backfill-shops-sellerid.js <sellerId> <comma-separated-shop-ids>
 * Example: node scripts/backfill-shops-sellerid.js 693512894c648ecbe5198e10 6902696797522ee67b3e7538,69228d290d82042873af65ec
 *
 * This script will ONLY set `sellerId` on shops where `sellerId` is currently null.
 * It will not overwrite existing sellerId values.
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
const idsArg = process.argv[3];
if (!sellerId || !idsArg) {
  console.error('Usage: node scripts/backfill-shops-sellerid.js <sellerId> <comma-separated-shop-ids>');
  process.exit(1);
}

const ids = idsArg.split(',').map(s => String(s).trim()).filter(Boolean);
if (ids.length === 0) {
  console.error('No valid shop ids provided');
  process.exit(1);
}

(async () => {
  try {
    for (const id of ids) {
      const shop = await prisma.shops.findUnique({ where: { id: String(id) } });
      if (!shop) {
        console.log('Shop not found, skipping:', id);
        continue;
      }
      if (shop.sellerId) {
        console.log('Shop already has sellerId, skipping:', id, 'sellerId:', shop.sellerId);
        continue;
      }
      try {
        const updated = await prisma.shops.update({ where: { id: String(id) }, data: { sellerId: String(sellerId) } });
        console.log('Updated shop', id, '-> sellerId', updated.sellerId);
      } catch (updateErr) {
        console.error('Failed to update shop', id, updateErr);
      }
    }
  } catch (err) {
    console.error('Error during backfill:', err);
  } finally {
    try { await prisma.$disconnect(); } catch (_) {}
    process.exit(0);
  }
})();
