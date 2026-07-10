// Dashboard ozet istatistikleri (role gore)
const express = require('express');
const db = require('../db');
const { requireAuth } = require('../util');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const uid = req.user.id;
  if (req.user.role === 'organizer') {
    return res.json({
      role: 'organizer',
      events: db.prepare('SELECT COUNT(*) c FROM events WHERE organizer_id = ?').get(uid).c,
      published_events: db.prepare(`SELECT COUNT(*) c FROM events WHERE organizer_id = ? AND status = 'published'`).get(uid).c,
      pending_offers: db.prepare(`SELECT COUNT(*) c FROM offers o JOIN events e ON e.id = o.event_id
        WHERE e.organizer_id = ? AND o.status = 'pending'`).get(uid).c,
      accepted_offers: db.prepare(`SELECT COUNT(*) c FROM offers o JOIN events e ON e.id = o.event_id
        WHERE e.organizer_id = ? AND o.status = 'accepted'`).get(uid).c,
      unread_messages: db.prepare(`SELECT COUNT(*) c FROM messages m JOIN conversations c2 ON c2.id = m.conversation_id
        WHERE (c2.organizer_id = ?) AND m.sender_id != ? AND m.read_at IS NULL`).get(uid, uid).c
    });
  }
  res.json({
    role: 'sponsor',
    open_events: db.prepare(`SELECT COUNT(*) c FROM events WHERE status = 'published'`).get().c,
    my_offers: db.prepare('SELECT COUNT(*) c FROM offers WHERE sponsor_id = ?').get(uid).c,
    pending_offers: db.prepare(`SELECT COUNT(*) c FROM offers WHERE sponsor_id = ? AND status = 'pending'`).get(uid).c,
    accepted_offers: db.prepare(`SELECT COUNT(*) c FROM offers WHERE sponsor_id = ? AND status = 'accepted'`).get(uid).c,
    unread_messages: db.prepare(`SELECT COUNT(*) c FROM messages m JOIN conversations c2 ON c2.id = m.conversation_id
      WHERE (c2.sponsor_id = ?) AND m.sender_id != ? AND m.read_at IS NULL`).get(uid, uid).c
  });
});

module.exports = router;
