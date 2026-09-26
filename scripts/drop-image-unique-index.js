#!/usr/bin/env node
/*
  Drop legacy unique indexes on images collection that block multiple null entries.
  Usage:
    node scripts/drop-image-unique-index.js --dry-run
    node scripts/drop-image-unique-index.js --apply

  Requires env var MONGO_URI
*/
const { MongoClient } = require('mongodb');

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const dryRun = args.includes('--dry-run') || !apply;

  const uri = process.env.MONGO_URI || process.env.DATABASE_URL;
  if (!uri) {
    console.error('MONGO_URI or DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const dbName = (new URL(uri)).pathname.replace(/^\//, '') || 'test';
    const db = client.db(dbName);
    const coll = db.collection('images');

    const indexes = await coll.indexes();
    console.log('Found indexes on images collection:');
    indexes.forEach((ix) => console.log(' -', ix.name, JSON.stringify(ix.key)));

    const targets = ['images_userId_key', 'images_shopId_key'];
    for (const name of targets) {
      const found = indexes.find((i) => i.name === name);
      if (found) {
        console.log(`Index ${name} exists and would be dropped.`);
        if (apply) {
          await coll.dropIndex(name);
          console.log(`Dropped index ${name}`);
        }
      } else {
        console.log(`Index ${name} not present.`);
      }
    }

    if (dryRun) console.log('\nDry-run mode: no changes applied. Run with --apply to drop indexes.');
  } catch (err) {
    console.error('Error while checking/dropping indexes:', err);
    process.exit(2);
  } finally {
    await client.close();
  }
}

main();
