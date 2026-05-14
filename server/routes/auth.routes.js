import { Router } from 'express';
import { signup, login, me } from '../controllers/auth.controller.js';
import { signupRules, loginRules } from '../validations/auth.validation.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/signup', signupRules, validate, signup);
router.post('/login', loginRules, validate, login);
router.get('/me', protect, me);

export default router;
