const DEFAULT_DOMAIN = 'ethara.ai';

export function getAllowedEmailDomain() {
  return (process.env.ALLOWED_EMAIL_DOMAIN || DEFAULT_DOMAIN).toLowerCase().replace(/^@/, '');
}

export function isAllowedEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  const domain = getAllowedEmailDomain();
  return normalized.endsWith(`@${domain}`);
}

export function allowedEmailMessage() {
  return `Only @${getAllowedEmailDomain()} email addresses can sign in.`;
}
