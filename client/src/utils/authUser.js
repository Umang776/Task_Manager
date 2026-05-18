/**
 * Normalize API user payload so UI always gets id + role (Mongoose may expose _id).
 */
export function normalizeAuthUser(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = raw.id ?? raw._id;
  const role = String(raw.role ?? '').toLowerCase();
  return {
    id: id != null ? String(id) : '',
    name: raw.name ?? '',
    email: raw.email ?? '',
    role: role === 'admin' || role === 'member' ? role : '',
  };
}
