import { ROLES } from '../utils/constants.js';

export function requireAdmin(req, res, next) {
  if (req.user?.role !== ROLES.ADMIN) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
}
