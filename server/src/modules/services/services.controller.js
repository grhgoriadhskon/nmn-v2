import * as svc from './services.service.js';
import { getDb } from '../../db/index.js';

export function list(req, res, next) {
  try {
    const proId = req.params.proId || req.query.pro_id;
    if (!proId) return res.status(400).json({ error: 'pro_id is required' });
    res.json({ services: svc.getServicesByPro(proId) });
  } catch (err) { next(err); }
}

export function create(req, res, next) {
  try {
    const { name, description, duration_min, price } = req.body;
    if (!name || !duration_min || !price) {
      return res.status(400).json({ error: 'name, duration_min and price are required' });
    }

    // proId comes from the authenticated pro's profile
    const pro = getDb()
      .prepare('SELECT id FROM professionals WHERE user_id = ?')
      .get(req.user.id);
    if (!pro) return res.status(403).json({ error: 'Pro profile not found' });

    const service = svc.createService(pro.id, { name, description, duration_min, price });
    res.status(201).json({ service });
  } catch (err) { next(err); }
}

export function update(req, res, next) {
  try {
    const pro = getDb()
      .prepare('SELECT id FROM professionals WHERE user_id = ?')
      .get(req.user.id);
    if (!pro) return res.status(403).json({ error: 'Pro profile not found' });

    const service = svc.updateService(req.params.id, pro.id, req.body);
    res.json({ service });
  } catch (err) { next(err); }
}

export function remove(req, res, next) {
  try {
    const pro = getDb()
      .prepare('SELECT id FROM professionals WHERE user_id = ?')
      .get(req.user.id);
    if (!pro) return res.status(403).json({ error: 'Pro profile not found' });

    svc.deleteService(req.params.id, pro.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
}
