import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../utils/constants.js';
import { logActivity } from '../services/activity.service.js';
import { attachAuthCookie, clearAuthCookie } from '../utils/authCookie.js';

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, accountType } = req.body;

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const role = accountType === 'admin' ? ROLES.ADMIN : ROLES.MEMBER;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  await logActivity({
    userId: user._id,
    action: 'USER_SIGNUP',
    entityType: 'User',
    entityId: user._id,
    metadata: { email: user.email },
  });

  const token = signToken({ id: user._id.toString(), role: user.role });
  attachAuthCookie(res, token);

  res.status(201).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, accountType } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (accountType === 'admin' && user.role !== ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Not an admin account. Sign in as a member instead.',
    });
  }
  if (accountType === 'member' && user.role !== ROLES.MEMBER) {
    return res.status(403).json({
      success: false,
      message: 'Admin accounts must use Admin sign-in.',
    });
  }

  const token = signToken({ id: user._id.toString(), role: user.role });
  attachAuthCookie(res, token);

  await logActivity({
    userId: user._id,
    action: 'USER_LOGIN',
    entityType: 'User',
    entityId: user._id,
  });

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export function logout(_req, res) {
  clearAuthCookie(res);
  res.json({ success: true });
}

export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});
