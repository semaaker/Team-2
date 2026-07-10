// Etkinlik ve sponsorluk paketi API'leri
const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../util');

const router = express.Router();

const eventWithMeta = `
  SELECT e.*, u.name AS organizer_name, op.org_name, op.org_type
  FROM events e
  JOIN users u ON u.id = e.organizer_id
  LEFT JOIN organizer_profiles op ON op.user_id = e.organizer_id`;

function attachPackages(event) {
  event.packages = db.prepare('SELECT * FROM packages WHERE event_id = ? ORDER BY price').all(event.id);
  return event;
}

// GET /api/events — yayindaki etkinlikler; ?category= &city= &q= filtreleri
router.get('/', requireAuth, (req, res) => {
  const { category, city, q } = req.query;
  let sql = eventWithMeta + ` WHERE e.status = 'published'`;
  const params = [];
  if (category) { sql += ' AND e.category = ?'; params.push(category); }
  if (city) { sql += ' AND e.city LIKE ?'; params.push(`%${city}%`); }
  if (q) { sql += ' AND (e.title LIKE ? OR e.description LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
  sql += ' ORDER BY e.event_date';
  res.json({ events: db.prepare(sql).all(...params).map(attachPackages) });
});

// GET /api/events/mine — organizatorun kendi etkinlikleri (tum durumlar)
router.get('/mine', requireAuth, requireRole('organizer'), (req, res) => {
  const rows = db.prepare(eventWithMeta + ' WHERE e.organizer_id = ? ORDER BY e.created_at DESC').all(req.user.id);
  res.json({ events: rows.map(attachPackages) });
});

// GET /api/events/:id
router.get('/:id', requireAuth, (req, res) => {
  const event = db.prepare(eventWithMeta + ' WHERE e.id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Etkinlik bulunamadi' });
  res.json({ event: attachPackages(event) });
});

// POST /api/events — organizator etkinlik olusturur
router.post('/', requireAuth, requireRole('organizer'), (req, res) => {
  const b = req.body || {};
  if (!b.title) return res.status(400).json({ error: 'title zorunludur' });
  const info = db.prepare(`INSERT INTO events
    (organizer_id, title, description, category, city, event_date, expected_attendance, audience, status)
    VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(req.user.id, b.title, b.description || '', b.category || 'other', b.city || '',
         b.event_date || '', b.expected_attendance | 0, b.audience || '',
         ['draft', 'published'].includes(b.status) ? b.status : 'published');
  const eventId = info.lastInsertRowid;

  // Paketler istekle birlikte gelebilir: [{name, price, perks}]
  if (Array.isArray(b.packages)) {
    const ins = db.prepare('INSERT INTO packages (event_id, name, price, perks) VALUES (?,?,?,?)');
    for (const p of b.packages) {
      if (p && p.name) ins.run(eventId, p.name, p.price | 0, p.perks || '');
    }
  }
  const event = db.prepare(eventWithMeta + ' WHERE e.id = ?').get(eventId);
  res.status(201).json({ event: attachPackages(event) });
});

// PUT /api/events/:id — sadece sahibi
router.put('/:id', requireAuth, requireRole('organizer'), (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Etkinlik bulunamadi' });
  if (event.organizer_id !== req.user.id) return res.status(403).json({ error: 'Bu etkinlik size ait degil' });

  const b = req.body || {};
  db.prepare(`UPDATE events SET
    title = ?, description = ?, category = ?, city = ?, event_date = ?,
    expected_attendance = ?, audience = ?, status = ?
    WHERE id = ?`)
    .run(b.title ?? event.title, b.description ?? event.description, b.category ?? event.category,
         b.city ?? event.city, b.event_date ?? event.event_date,
         b.expected_attendance ?? event.expected_attendance, b.audience ?? event.audience,
         ['draft','published','completed','cancelled'].includes(b.status) ? b.status : event.status,
         event.id);

  if (Array.isArray(b.packages)) {
    db.prepare('DELETE FROM packages WHERE event_id = ?').run(event.id);
    const ins = db.prepare('INSERT INTO packages (event_id, name, price, perks) VALUES (?,?,?,?)');
    for (const p of b.packages) {
      if (p && p.name) ins.run(event.id, p.name, p.price | 0, p.perks || '');
    }
  }
  const updated = db.prepare(eventWithMeta + ' WHERE e.id = ?').get(event.id);
  res.json({ event: attachPackages(updated) });
});

// DELETE /api/events/:id — sadece sahibi
router.delete('/:id', requireAuth, requireRole('organizer'), (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Etkinlik bulunamadi' });
  if (event.organizer_id !== req.user.id) return res.status(403).json({ error: 'Bu etkinlik size ait degil' });
  db.prepare('DELETE FROM events WHERE id = ?').run(event.id);
  res.json({ ok: true });
});

module.exports = router;
