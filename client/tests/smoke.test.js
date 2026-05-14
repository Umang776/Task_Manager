import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { test } from 'node:test';
import assert from 'node:assert';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('client package.json is valid', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.strictEqual(pkg.name, 'client');
  assert.ok(pkg.scripts.test);
});
