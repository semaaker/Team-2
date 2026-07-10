// Eslestirme API'si — role gore iki yonlu calisir:
//   sponsor    -> kendisine uygun etkinlikler
//   organizer  -> belirli bir etkinligine uygun sponsorlar (?event_id=)
const express = require('express');
const db = require('../db');
const { requireAuth, parseJSON } = require('../util');
const { scoreMatch } = require('../services/matching');

const router = express.Router();

function loadSponsorProfile(userId) {
  const p = db.prepare('SELECT * FROM sponsor_profiles WHERE user_id = ?').get(userId);
  if (p) p.sectors = parseJSON(p.sectors, []);
  return p;
}

function loadEventWithPackages(row) {
  row.packages = db.prepare('SELECT * FROM packages WHERE event_id = ?').all(row.id);
  return row;
}

// GET /api/matches
router.get('/', requireAuth, (req, res) => {
  if (req.user.role === 'sponsor') {
    const profile = loadSponsorProfile(req.user.id);
    if (!profile) return res.status(400).json({ error: 'Sponsor profili bulunamadi' });
    const events = db.prepare(`
      SELECT e.*, u.name AS organizer_name, op.org_name
      FROM events e
      JOIN users u ON u.id = e.organizer_id
      LEFT JOIN organizer_profiles op ON op.user_id = e.organizer_id
      WHERE e.status = 'published'`).all().map(loadEventWithPackages);

    const matches = events
      .map(e => ({ event: e, ...scoreMatch(e, profile) }))
      .sort((a, b) => b.score - a.score);
    return res.json({ role: 'sponsor', matches });
  }

  // Organizator: ?event_id= zorunlu — o etkinlik icin sponsor onerileri
  const eventId = req.query.event_id;
  if (!eventId) return res.status(400).json({ error: 'event_id parametresi gerekli' });
  const event = db.prepare('SELECT * FROM events WHERE id = ? AND organizer_id = ?').get(eventId, req.user.id);
  if (!event) return res.status(404).json({ error: 'Etkinlik bulunamadi veya size ait degil' });
  loadEventWithPackages(event);

  const sponsors = db.prepare(`
    SELECT sp.*, u.id AS user_id, u.name, u.email
    FROM sponsor_profiles sp JOIN users u ON u.id = sp.user_id`).all();

  const matches = sponsors
    .map(sp => {
      sp.sectors = parseJSON(sp.sectors, []);
      const result = scoreMatch(event, sp);
      return {
        sponsor: {
          user_id: sp.user_id, name: sp.name, company_name: sp.company_name,
          sectors: sp.sectors, city: sp.city, budget_min: sp.budget_min,
          budget_max: sp.budget_max, target_audience: sp.target_audience,
          description: sp.description, website: sp.website
        },
        ...result
      };
    })
    .sort((a, b) => b.score - a.score);
  res.json({ role: 'organizer', event_id: event.id, matches });
});

module.exports = router;
