import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import * as controller from './services.controller.js';

const router = Router();

router.get('/',                       controller.list);
router.get('/pro/:proId',             controller.list);
router.post('/',   requireAuth, requireRole('pro', 'admin'), controller.create);
router.patch('/:id', requireAuth, requireRole('pro', 'admin'), controller.update);
router.delete('/:id', requireAuth, requireRole('pro', 'admin'), controller.remove);

export default router;
