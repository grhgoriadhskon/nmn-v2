import { getDb } from '../../db/index.js';

export function getAllPros() {
  return getDb().prepare(`
    SELECT p.*, u.name, u.email
    FROM professionals p
    JOIN users u ON u.id = p.user_id
    WHERE p.is_active = 1
  `).all();
}

export function getProById(id) {
  return getDb().prepare(`
    SELECT p.*, u.name, u.email
    FROM professionals p
    JOIN users u ON u.id = p.user_id
    WHERE p.id = ?
  `).get(id);
}

export function getProByUserId(userId) {
  return getDb()
    .prepare('SELECT * FROM professionals WHERE user_id = ?')
    .get(userId);
}

export function createPro(userId, fields = {}) {
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO professionals (user_id, bio, avatar_url, address, city, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(userId, fields.bio || null, fields.avatar_url || null, fields.address || null, fields.city || null, fields.lat || null, fields.lng || null);
  return getProById(result.lastInsertRowid);
}

export function updatePro(id, fields) {
  const allowed = ['bio', 'avatar_url', 'address', 'city', 'lat', 'lng', 'is_active'];
  const updates = Object.entries(fields).filter(([k]) => allowed.includes(k)).map(([k]) => `${k} = ?`);
  const values  = Object.entries(fields).filter(([k]) => allowed.includes(k)).map(([, v]) => v);
  if (!updates.length) return getProById(id);
  getDb().prepare(`UPDATE professionals SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...values, id);
  return getProById(id);
}

// Working hours

export function getWorkingHours(proId) {
  return getDb()
    .prepare('SELECT * FROM working_hours WHERE pro_id = ? ORDER BY day')
    .all(proId);
}

export function setWorkingHours(proId, hours) {
  // hours = [{ day: 1, start_time: '09:00', end_time: '17:00' }, ...]
  const db = getDb();
  const upsert = db.prepare(`
    INSERT INTO working_hours (pro_id, day, start_time, end_time)
    VALUES (?, ?, ?, ?)
    ON CONFLICT (pro_id, day) DO UPDATE SET start_time = excluded.start_time, end_time = excluded.end_time
  `);
  const deleteDay = db.prepare('DELETE FROM working_hours WHERE pro_id = ? AND day = ?');

  const run = db.transaction(() => {
    for (const h of hours) {
      if (h.closed) {
        deleteDay.run(proId, h.day);
      } else {
        upsert.run(proId, h.day, h.start_time, h.end_time);
      }
    }
  });
  run();

  return getWorkingHours(proId);
}
