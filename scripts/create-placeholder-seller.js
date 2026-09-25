#!/usr/bin/env node
/*
 * scripts/create-placeholder-seller.js
 * Usage: node scripts/create-placeholder-seller.js [email-prefix]
 * Creates a minimal placeholder seller and prints the new id.
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

const prefix = process.argv[2] ? String(process.argv[2]).replace(/[^a-z0-9-_]/gi, '') : 'recovered';
const crypto = require('crypto');

(async () => {
  try {
    const random = crypto.randomBytes(6).toString('hex');
    const email = `${prefix}-${random}@example.local`;
    const seller = await prisma.sellers.create({ data: {
      email,
      name: `Recovered Seller ${random}`,
      country: 'NG',
      password: crypto.randomBytes(12).toString('hex'),
      phone_number: '0000000000',
      stripeId: ''
    } });
    console.log('Created placeholder seller:', seller.id);
    console.log('  email:', seller.email);
  } catch (err) {
    console.error('Error creating placeholder seller:', err);
  } finally {
    try { await prisma.$disconnect(); } catch (_) {}
    process.exit(0);
  }
})();
