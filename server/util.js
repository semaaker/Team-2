// Kimlik dogrulama yardimcilari ve ortak middleware'ler
const jwt = require('jsonwebtoken');
const db = require('./db');

// Uretimde ortam degiskeninden gelmeli; demo icin sabit fallback yeterli.
const JWT_SECRET = process.env.JWT_SECRET || 'sponsormatch-dev-secret-change-me';
const TOKEN_TTL = '7d';

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

// Authorization: Bearer <token> dogrular, req.user'a kullaniciyi koyar.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Oturum gerekli' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, email, role, name, created_at FROM users WHERE id = ?').get(payload.id);
    if (!user) return res.status(401).json({ error: 'Kullanici bulunamadi' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Gecersiz veya suresi dolmus oturum' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) return res.status(403).json({ error: `Bu islem sadece ${role} rolu icindir` });
    next();
  };
}

// JSON metin alanlarini guvenli parse eder.
function parseJSON(text, fallback) {
  try { return JSON.parse(text); } catch { return fallback; }
}

module.exports = { signToken, requireAuth, requireRole, parseJSON };
