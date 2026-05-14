import { Router } from 'express';
import { signup, login, me, logout } from '../controllers/auth.controller.js';
import { signupRules, loginRules } from '../validations/auth.validation.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/signup', authLimiter, signupRules, validate, signup);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/logout', logout);
router.get('/me', protect, me);

export default router;
