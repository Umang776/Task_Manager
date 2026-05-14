import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AUTH_COOKIE_NAME } from '../utils/authCookie.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.[AUTH_COOKIE_NAME];
  const authHeader = req.headers.authorization;
  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
});
