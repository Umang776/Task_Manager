import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { createApp } from '../app.js';

describe('auth HTTP validation (no database)', () => {
  let app;

  before(() => {
    app = createApp();
  });

  it('signup fails when admin uses non-workspace email', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      accountType: 'admin',
      name: 'Edge Case',
      email: 'someone@gmail.com',
      password: 'secret12',
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Validation failed');
    assert.ok(Array.isArray(res.body.errors));
  });

  it('signup fails when accountType missing', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Edge Case',
      email: 'someone@gmail.com',
      password: 'secret12',
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('signup fails when password too short', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      accountType: 'member',
      name: 'Edge Case',
      email: 'someone@gmail.com',
      password: '12345',
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('signup fails when name missing', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      accountType: 'member',
      email: 'someone@gmail.com',
      password: 'secret12',
    });
    assert.strictEqual(res.status, 400);
  });

  it('login fails when admin path uses gmail', async () => {
    const res = await request(app).post('/api/auth/login').send({
      accountType: 'admin',
      email: 'user@gmail.com',
      password: 'anything',
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('login fails when accountType missing', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'user@gmail.com',
      password: 'secret',
    });
    assert.strictEqual(res.status, 400);
  });

  it('login fails member path when email format invalid', async () => {
    const res = await request(app).post('/api/auth/login').send({
      accountType: 'member',
      email: 'not-an-email',
      password: 'secret',
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('login fails when password empty', async () => {
    const res = await request(app).post('/api/auth/login').send({
      accountType: 'member',
      email: 'user@gmail.com',
      password: '',
    });
    assert.strictEqual(res.status, 400);
  });

  it('logout succeeds without auth', async () => {
    const res = await request(app).post('/api/auth/logout').send({});
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });
});
