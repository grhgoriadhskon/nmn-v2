import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import * as controller from './pros.controller.js';

const router = Router();

router.get('/',                  controller.list);
router.get('/me',                requireAuth, requireRole('pro'), controller.getMyProfile);
router.patch('/me',              requireAuth, requireRole('pro'), controller.updateMyProfile);
router.get('/me/working-hours',  requireAuth, requireRole('pro'), controller.getMyWorkingHours);
router.put('/me/working-hours',  requireAuth, requireRole('pro'), controller.setWorkingHours);
router.get('/:id',               controller.get);
router.get('/:id/working-hours', controller.getWorkingHours);

export default router;
