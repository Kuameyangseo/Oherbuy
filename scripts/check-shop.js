#!/usr/bin/env node
/*
 * scripts/check-shop.js
 * Usage: node scripts/check-shop.js <shopId>
 * Queries Prisma directly using the project's Prisma client to print a shop record (id, sellerId, keys).
 */

// Require the project's prisma client. This file is placed at repo root so adjust the path accordingly.
// Try to use the compiled project prisma client when available, otherwise instantiate a PrismaClient directly.
let prisma;
try {
  // Prefer the project's client if it's been compiled to JS under packages/libs/prisma
  const projectPrisma = require('../packages/libs/prisma');
  prisma = projectPrisma && projectPrisma.default ? projectPrisma.default : projectPrisma;
} catch (e) {
  // Fall back to creating a new PrismaClient from @prisma/client so the script runs without TS build step
  try {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  } catch (err) {
    console.error('Unable to require prisma client. Ensure @prisma/client is installed or build the project.');
    console.error(err);
    process.exit(2);
  }
}

const id = process.argv[2];
if (!id) {
  console.error('Usage: node scripts/check-shop.js <shopId>');
  process.exit(1);
}

(async () => {
  try {
    const shop = await prisma.shops.findUnique({ where: { id: String(id) } });
    if (!shop) {
      console.log('Shop NOT found for id:', id);
      process.exit(0);
    }
    console.log('Shop found:');
    console.log('  id:', shop.id);
    console.log('  sellerId:', shop.sellerId ?? null);
    console.log('  keys:', Object.keys(shop));
    // for deeper inspection uncomment below
    // console.dir(shop, { depth: null });
  } catch (err) {
    console.error('Error querying shop:', err);
    process.exit(3);
  } finally {
    // ensure process exits (Prisma may keep open handles)
    try { await prisma.$disconnect(); } catch (_) {}
    process.exit(0);
  }
})();
