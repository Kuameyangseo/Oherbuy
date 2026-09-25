#!/usr/bin/env node
/*
 * scripts/recreate-missing-shops.js
 * Usage:
 *   node scripts/recreate-missing-shops.js <id1,id2,...>
 *   or provide no args to read missing ids from `scripts/audit-missing-shops.js` output
 *
 * This script will create minimal placeholder `shops` records for the specified ids
 * if they do not already exist. It does NOT set `sellerId`. Use with care.
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

const idsArg = process.argv[2];
if (!idsArg) {
  console.error('Usage: node scripts/recreate-missing-shops.js <comma-separated-shop-ids>');
  process.exit(1);
}

const ids = idsArg.split(',').map(s => String(s).trim()).filter(Boolean);
if (ids.length === 0) {
  console.error('No valid ids provided');
  process.exit(1);
}

(async () => {
  try {
    const crypto = require('crypto');
    for (const id of ids) {
      const exists = await prisma.shops.findUnique({ where: { id: String(id) } });
      if (exists) {
        console.log('Shop already exists:', id);
        continue;
      }

      console.log('Creating placeholder shop for id:', id);
      try {
        const created = await prisma.shops.create({ data: {
          id: String(id),
          name: `Recovered Shop ${String(id).slice(-6)}`,
          bio: 'Recovered placeholder shop',
          category: 'unknown',
          avatarId: null,
          coverBanner: null,
          address: '',
          opening_hours: null,
          website: null,
          socialLinks: [],
          ratings: 0
        } });
        console.log('Created shop:', created.id);
      } catch (createErr) {
        // If unique constraint on sellerId prevents creating multiple shops without sellerId,
        // create a placeholder seller and attach it to the new shop to satisfy the unique index.
        try {
          const isP2002 = createErr && createErr.code === 'P2002';
          if (isP2002) {
            const random = crypto.randomBytes(6).toString('hex');
            const placeholderEmail = `recovered-${String(id).slice(-6)}+${random}@example.local`;
            console.log('Unique constraint prevented creating shop without sellerId. Creating placeholder seller:', placeholderEmail);
            const newSeller = await prisma.sellers.create({ data: {
              email: placeholderEmail,
              name: `Recovered Seller ${String(id).slice(-6)}`,
              country: 'NG',
              password: crypto.randomBytes(12).toString('hex'),
              phone_number: '0000000000',
              stripeId: ''
            } });
            // now create the shop with sellerId set
            const created2 = await prisma.shops.create({ data: {
              id: String(id),
              name: `Recovered Shop ${String(id).slice(-6)}`,
              bio: 'Recovered placeholder shop',
              category: 'unknown',
              avatarId: null,
              coverBanner: null,
              address: '',
              opening_hours: null,
              website: null,
              socialLinks: [],
              ratings: 0,
              sellerId: String(newSeller.id)
            } });
            console.log('Created shop with placeholder seller:', created2.id, 'sellerId:', newSeller.id);
          } else {
            console.error('Failed to create shop for id', id, createErr);
          }
        } catch (secondaryErr) {
          console.error('Failed to create placeholder seller/shop for id', id, secondaryErr);
        }
      }
    }
  } catch (err) {
    console.error('Error recreating shops:', err);
  } finally {
    try { await prisma.$disconnect(); } catch (_) {}
    process.exit(0);
  }
})();
