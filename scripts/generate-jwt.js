#!/usr/bin/env node
/**
 * scripts/generate-jwt.js
 * Usage: node scripts/generate-jwt.js <id> [--role=user|seller] [--expires=3600]
 * Signs a JWT using process.env.ACCESS_TOKEN_SECRET. Prints the token.
 */
const jwt = require('jsonwebtoken');

const argv = process.argv.slice(2);
if (argv.length === 0) {
  console.error('Usage: node scripts/generate-jwt.js <id> [--role=user|seller] [--expires=3600]');
  process.exit(1);
}

const id = argv[0];
let role = 'user';
let expires = '7d';
for (let i = 1; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--role=')) role = a.split('=')[1];
  if (a.startsWith('--expires=')) expires = a.split('=')[1];
}

const secret = process.env.ACCESS_TOKEN_SECRET;
if (!secret) {
  console.error('ACCESS_TOKEN_SECRET is not set in environment. Set it before running this script.');
  process.exit(2);
}

const payload = { id: String(id), role: role === 'seller' ? 'seller' : 'user' };
const token = jwt.sign(payload, secret, { expiresIn: expires });
console.log(token);
