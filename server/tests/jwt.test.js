import { describe, it, before } from 'node:test';
import assert from 'node:assert';

describe('jwt', () => {
  before(() => {
    process.env.JWT_SECRET = 'a'.repeat(64);
  });

  it('signToken and verifyToken round-trip', async () => {
    const { signToken, verifyToken } = await import('../utils/jwt.js');
    const token = signToken({ id: '507f1f77bcf86cd799439011', role: 'member' });
    const decoded = verifyToken(token);
    assert.strictEqual(decoded.id, '507f1f77bcf86cd799439011');
    assert.strictEqual(decoded.role, 'member');
  });
});
