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

/** Message when admin signup/login requires workspace domain email */
export function adminWorkspaceEmailMessage() {
  return `Admin accounts must use an email ending with @${getAllowedEmailDomain()}.`;
}

/** @deprecated prefer adminWorkspaceEmailMessage — kept for tests/messages */
export function allowedEmailMessage() {
  return adminWorkspaceEmailMessage();
}
