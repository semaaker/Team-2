// Uygulama ici mesajlasma.
// Su an HTTP polling ile calisir (frontend birkac saniyede bir GET atar).
// >>> PLACEHOLDER: gercek zamanli iletisim icin ws/socket.io entegrasyonu.
// Express sunucusuna bir WebSocket katmani eklenip yeni mesajlar
// conversation kanallarina publish edilebilir; API sozlesmesi degismez.
const express = require('express');
const db = require('../db');
const { requireAuth } = require('../util');

const router = express.Router();

function conversationForUser(convId, userId) {
  return db.prepare(`
    SELECT c.*, e.title AS event_title,
           ou.name AS organizer_name, su.name AS sponsor_name
    FROM conversations c
    LEFT JOIN events e ON e.id = c.event_id
    JOIN users ou ON ou.id = c.organizer_id
    JOIN users su ON su.id = c.sponsor_id
    WHERE c.id = ? AND (c.organizer_id = ? OR c.sponsor_id = ?)`)
    .get(convId, userId, userId);
}

// GET /api/conversations — kullanicinin konusmalari + son mesaj + okunmamis sayisi
router.get('/conversations', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT c.*, e.title AS event_title,
           ou.name AS organizer_name, su.name AS sponsor_name,
           (SELECT body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) AS last_message,
           (SELECT created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) AS last_message_at,
           (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != ? AND m.read_at IS NULL) AS unread_count
    FROM conversations c
    LEFT JOIN events e ON e.id = c.event_id
    JOIN users ou ON ou.id = c.organizer_id
    JOIN users su ON su.id = c.sponsor_id
    WHERE c.organizer_id = ? OR c.sponsor_id = ?
    ORDER BY COALESCE(last_message_at, c.created_at) DESC`)
    .all(req.user.id, req.user.id, req.user.id);
  res.json({ conversations: rows });
});

// POST /api/conversations  { peer_id, event_id? } — dogrudan konusma baslat
router.post('/conversations', requireAuth, (req, res) => {
  const { peer_id, event_id } = req.body || {};
  const peer = db.prepare('SELECT id, role FROM users WHERE id = ?').get(peer_id);
  if (!peer) return res.status(404).json({ error: 'Kullanici bulunamadi' });
  if (peer.role === req.user.role) return res.status(400).json({ error: 'Konusma organizator ile sponsor arasinda olmali' });

  const organizerId = req.user.role === 'organizer' ? req.user.id : peer.id;
  const sponsorId = req.user.role === 'sponsor' ? req.user.id : peer.id;
  const evId = event_id || null;

  const existing = db.prepare(
    'SELECT id FROM conversations WHERE organizer_id = ? AND sponsor_id = ? AND event_id IS ?')
    .get(organizerId, sponsorId, evId);
  const id = existing
    ? existing.id
    : db.prepare('INSERT INTO conversations (organizer_id, sponsor_id, event_id) VALUES (?,?,?)')
        .run(organizerId, sponsorId, evId).lastInsertRowid;
  res.status(existing ? 200 : 201).json({ conversation: conversationForUser(id, req.user.id) });
});

// GET /api/conversations/:id/messages — mesajlari getirir, gelenleri okundu isaretler
router.get('/conversations/:id/messages', requireAuth, (req, res) => {
  const conv = conversationForUser(req.params.id, req.user.id);
  if (!conv) return res.status(404).json({ error: 'Konusma bulunamadi' });

  db.prepare(`UPDATE messages SET read_at = datetime('now')
    WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL`)
    .run(conv.id, req.user.id);

  const messages = db.prepare(`
    SELECT m.*, u.name AS sender_name FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.conversation_id = ? ORDER BY m.id`).all(conv.id);
  res.json({ conversation: conv, messages });
});

// POST /api/conversations/:id/messages  { body }
router.post('/conversations/:id/messages', requireAuth, (req, res) => {
  const conv = conversationForUser(req.params.id, req.user.id);
  if (!conv) return res.status(404).json({ error: 'Konusma bulunamadi' });
  const body = (req.body && req.body.body || '').trim();
  if (!body) return res.status(400).json({ error: 'Mesaj bos olamaz' });

  const info = db.prepare('INSERT INTO messages (conversation_id, sender_id, body) VALUES (?,?,?)')
    .run(conv.id, req.user.id, body);
  const message = db.prepare(`
    SELECT m.*, u.name AS sender_name FROM messages m
    JOIN users u ON u.id = m.sender_id WHERE m.id = ?`).get(info.lastInsertRowid);
  res.status(201).json({ message });
});

module.exports = router;
