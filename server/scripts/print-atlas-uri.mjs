#!/usr/bin/env node
/**
 * Prints a single-line MONGO_URI for MongoDB Atlas (SRV) with URL-encoded
 * username/password — use this so special characters in passwords do not break auth.
 *
 * PowerShell (repo root):
 *   $env:MONGO_PASS = "YOUR_DATABASE_USER_PASSWORD"
 *   npm run print:mongo-uri --prefix server
 *
 * Then copy the printed line into Railway → Variables → MONGO_URI (no quotes).
 *
 * Optional: MONGO_USER, MONGO_HOST, MONGO_DB env vars to override defaults.
 */
const user = process.env.MONGO_USER || 'leoumang007_db_user';
const pass = process.env.MONGO_PASS;
const host = process.env.MONGO_HOST || 'cluster0.e7agskl.mongodb.net';
const db = process.env.MONGO_DB || 'team-task-manager';

if (!pass) {
  console.error('Missing MONGO_PASS.');
  console.error('Example (PowerShell from repo root):');
  console.error('  $env:MONGO_PASS = "YOUR_ATLAS_DATABASE_USER_PASSWORD"');
  console.error('  npm run print:mongo-uri --prefix server');
  process.exit(1);
}

const uri = `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}/${db}?retryWrites=true&w=majority&authSource=admin&appName=Cluster0`;
console.log(uri);
