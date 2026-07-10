// Kayit / giris / mevcut kullanici
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { signToken, requireAuth } = require('../util');

const router = express.Router();

// POST /api/auth/register  { email, password, name, role }
router.post('/register', (req, res) => {
  const { email, password, name, role } = req.body || {};
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'email, password, name ve role zorunludur' });
  }
  if (!['organizer', 'sponsor'].includes(role)) {
    return res.status(400).json({ error: 'role "organizer" veya "sponsor" olmali' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Sifre en az 6 karakter olmali' });
  }
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ error: 'Bu e-posta zaten kayitli' });

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (email, password_hash, role, name) VALUES (?,?,?,?)')
    .run(email, hash, role, name);
  const userId = info.lastInsertRowid;

  // Role gore bos profil olustur; kullanici sonradan doldurur.
  if (role === 'organizer') {
    db.prepare('INSERT INTO organizer_profiles (user_id, org_name) VALUES (?, ?)').run(userId, name);
  } else {
    db.prepare('INSERT INTO sponsor_profiles (user_id, company_name) VALUES (?, ?)').run(userId, name);
  }

  const user = db.prepare('SELECT id, email, role, name FROM users WHERE id = ?').get(userId);
  res.status(201).json({ token: signToken(user), user });
});

// POST /api/auth/login  { email, password }
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email ve password zorunludur' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'E-posta veya sifre hatali' });
  }
  const safe = { id: user.id, email: user.email, role: user.role, name: user.name };
  res.json({ token: signToken(safe), user: safe });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
