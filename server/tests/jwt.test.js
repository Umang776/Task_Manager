import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';

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

  it('verifyToken throws on malformed token', async () => {
    const { verifyToken } = await import('../utils/jwt.js');
    assert.throws(() => verifyToken('not-a-valid-jwt'), Error);
  });

  it('verifyToken rejects token signed with another secret', async () => {
    const { signToken, verifyToken } = await import('../utils/jwt.js');
    const other = jwt.sign({ id: 'x' }, 'different-secret-at-least-32-chars-long!!', { expiresIn: '1h' });
    assert.throws(() => verifyToken(other), Error);
  });
});
