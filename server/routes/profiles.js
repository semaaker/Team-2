// Profil goruntuleme ve guncelleme (organizator + sponsor)
const express = require('express');
const db = require('../db');
const { requireAuth, parseJSON } = require('../util');

const router = express.Router();

function getProfile(user) {
  if (user.role === 'organizer') {
    return db.prepare('SELECT * FROM organizer_profiles WHERE user_id = ?').get(user.id);
  }
  const p = db.prepare('SELECT * FROM sponsor_profiles WHERE user_id = ?').get(user.id);
  if (p) p.sectors = parseJSON(p.sectors, []);
  return p;
}

// GET /api/profiles/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user, profile: getProfile(req.user) });
});

// PUT /api/profiles/me — role gore alanlar
router.put('/me', requireAuth, (req, res) => {
  const b = req.body || {};
  if (req.user.role === 'organizer') {
    db.prepare(`UPDATE organizer_profiles
      SET org_name = ?, org_type = ?, city = ?, description = ?, website = ?
      WHERE user_id = ?`)
      .run(b.org_name || '', b.org_type || 'other', b.city || '', b.description || '', b.website || '', req.user.id);
  } else {
    const sectors = Array.isArray(b.sectors) ? b.sectors : [];
    db.prepare(`UPDATE sponsor_profiles
      SET company_name = ?, sectors = ?, budget_min = ?, budget_max = ?, city = ?, target_audience = ?, description = ?, website = ?
      WHERE user_id = ?`)
      .run(b.company_name || '', JSON.stringify(sectors), b.budget_min | 0, b.budget_max | 0,
           b.city || '', b.target_audience || '', b.description || '', b.website || '', req.user.id);
  }
  res.json({ user: req.user, profile: getProfile(req.user) });
});

// GET /api/profiles/:userId — baska bir kullanicinin herkese acik profili
router.get('/:userId', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, email, role, name, created_at FROM users WHERE id = ?').get(req.params.userId);
  if (!user) return res.status(404).json({ error: 'Kullanici bulunamadi' });
  res.json({ user, profile: getProfile(user) });
});

module.exports = router;
