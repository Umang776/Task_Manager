import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

describe('allowedEmail', () => {
  let prevDomain;

  beforeEach(() => {
    prevDomain = process.env.ALLOWED_EMAIL_DOMAIN;
    delete process.env.ALLOWED_EMAIL_DOMAIN;
  });

  afterEach(() => {
    if (prevDomain === undefined) delete process.env.ALLOWED_EMAIL_DOMAIN;
    else process.env.ALLOWED_EMAIL_DOMAIN = prevDomain;
  });

  it('getAllowedEmailDomain defaults to ethara.ai without leading @', async () => {
    const { getAllowedEmailDomain } = await import('../utils/allowedEmail.js');
    assert.strictEqual(getAllowedEmailDomain(), 'ethara.ai');
  });

  it('getAllowedEmailDomain strips leading @ from env', async () => {
    process.env.ALLOWED_EMAIL_DOMAIN = '@Example.COM';
    const { getAllowedEmailDomain } = await import('../utils/allowedEmail.js');
    assert.strictEqual(getAllowedEmailDomain(), 'example.com');
  });

  it('isAllowedEmail accepts normalized Ethara workspace addresses', async () => {
    const { isAllowedEmail } = await import('../utils/allowedEmail.js');
    assert.strictEqual(isAllowedEmail('user@ethara.ai'), true);
    assert.strictEqual(isAllowedEmail('  USER@ETHARA.AI  '), true);
  });

  it('isAllowedEmail rejects empty, non-string, and other domains', async () => {
    const { isAllowedEmail } = await import('../utils/allowedEmail.js');
    assert.strictEqual(isAllowedEmail(''), false);
    assert.strictEqual(isAllowedEmail(null), false);
    assert.strictEqual(isAllowedEmail(undefined), false);
    assert.strictEqual(isAllowedEmail('not-email'), false);
    assert.strictEqual(isAllowedEmail('x@gmail.com'), false);
    assert.strictEqual(isAllowedEmail('x@mail.ethara.ai'), false);
    assert.strictEqual(isAllowedEmail('x@fakeethara.ai'), false);
  });

  it('respects custom ALLOWED_EMAIL_DOMAIN', async () => {
    process.env.ALLOWED_EMAIL_DOMAIN = 'corp.test';
    const { isAllowedEmail, allowedEmailMessage } = await import('../utils/allowedEmail.js');
    assert.strictEqual(isAllowedEmail('a@corp.test'), true);
    assert.strictEqual(isAllowedEmail('a@ethara.ai'), false);
    assert.ok(allowedEmailMessage().includes('@corp.test'));
  });
});
