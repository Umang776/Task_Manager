import { Router } from 'express';
import {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import {
  createProjectRules,
  updateProjectRules,
  projectIdParam,
} from '../validations/project.validation.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.get('/', listProjects);
router.get('/:id', projectIdParam, validate, getProject);

router.post('/', requireAdmin, createProjectRules, validate, createProject);
router.put('/:id', requireAdmin, updateProjectRules, validate, updateProject);
router.delete('/:id', requireAdmin, projectIdParam, validate, deleteProject);

export default router;
