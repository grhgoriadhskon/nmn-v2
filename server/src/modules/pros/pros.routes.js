import { Router } from 'express';

const router = Router();

// GET /api/pros — list active professionals
router.get('/', (req, res) => res.json({ pros: [] }));

export default router;
