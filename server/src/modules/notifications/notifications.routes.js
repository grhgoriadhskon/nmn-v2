import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => res.json({ notifications: [], total: 0 }));

export default router;
