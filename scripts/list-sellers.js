#!/usr/bin/env node
/*
 * scripts/list-sellers.js
 * Usage: node scripts/list-sellers.js [limit]
 * Prints seller id, email and name to help pick a DEFAULT_SELLER_ID for dev use.
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

const limit = Number(process.argv[2] || 50);

(async () => {
  try {
    const sellers = await prisma.sellers.findMany({ take: limit, select: { id: true, email: true, name: true } });
    if (!sellers || sellers.length === 0) {
      console.log('No sellers found');
      process.exit(0);
    }
    console.log('Sellers (id, email, name):');
    sellers.forEach(s => console.log(`  ${s.id} | ${s.email} | ${s.name || ''}`));
  } catch (err) {
    console.error('Error listing sellers:', err);
  } finally {
    try { await prisma.$disconnect(); } catch (_) {}
    process.exit(0);
  }
})();
