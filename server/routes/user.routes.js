import { Router } from 'express';
import { listUsers } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = Router();

router.use(protect, requireAdmin);
router.get('/', listUsers);

export default router;
