import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { createApp } from '../app.js';

describe('createApp', () => {
  let app;

  before(() => {
    app = createApp();
  });

  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.ok, true);
  });

  it('GET /api/unknown returns 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    assert.strictEqual(res.status, 404);
  });
});
