import { Router } from 'express';
import { getDb } from '../../db/index.js';

const router = Router();

// Only available when ALLOW_DEV=1
router.use((req, res, next) => {
  if (process.env.ALLOW_DEV !== '1') return res.status(404).json({ error: 'Not found' });
  next();
});

// Fix missing pro profiles for all pro users
router.post('/fix-pro-profiles', (req, res) => {
  const db = getDb();
  const pros = db.prepare("SELECT id FROM users WHERE role = 'pro'").all();
  let created = 0;
  for (const u of pros) {
    const existing = db.prepare('SELECT id FROM professionals WHERE user_id = ?').get(u.id);
    if (!existing) {
      db.prepare('INSERT INTO professionals (user_id) VALUES (?)').run(u.id);
      created++;
    }
  }
  res.json({ ok: true, created, total: pros.length });
});

export default router;
