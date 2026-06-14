import { getDb } from '../../db/index.js';

export function getServicesByPro(proId) {
  return getDb()
    .prepare('SELECT * FROM services WHERE pro_id = ? AND is_active = 1 ORDER BY name')
    .all(proId);
}

export function getServiceById(id) {
  return getDb().prepare('SELECT * FROM services WHERE id = ?').get(id);
}

export function createService(proId, { name, description, duration_min, price }) {
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO services (pro_id, name, description, duration_min, price) VALUES (?, ?, ?, ?, ?)'
  ).run(proId, name, description || null, duration_min, price);
  return getServiceById(result.lastInsertRowid);
}

export function updateService(id, proId, fields) {
  const allowed = ['name', 'description', 'duration_min', 'price', 'is_active'];
  const updates = Object.entries(fields)
    .filter(([k]) => allowed.includes(k))
    .map(([k]) => `${k} = ?`);
  const values = Object.entries(fields)
    .filter(([k]) => allowed.includes(k))
    .map(([, v]) => v);

  if (!updates.length) return getServiceById(id);

  getDb()
    .prepare(`UPDATE services SET ${updates.join(', ')} WHERE id = ? AND pro_id = ?`)
    .run(...values, id, proId);

  return getServiceById(id);
}

export function deleteService(id, proId) {
  getDb()
    .prepare('UPDATE services SET is_active = 0 WHERE id = ? AND pro_id = ?')
    .run(id, proId);
}
