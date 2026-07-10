// Sponsorluk teklifleri: sponsor basvurur veya organizator davet eder.
// Kabul edilen teklif otomatik olarak bir konusma (conversation) acar.
const express = require('express');
const db = require('../db');
const { requireAuth } = require('../util');

const router = express.Router();

const offerWithMeta = `
  SELECT o.*,
         e.title AS event_title, e.organizer_id,
         su.name AS sponsor_name, sp.company_name,
         ou.name AS organizer_name, op.org_name,
         p.name AS package_name, p.price AS package_price
  FROM offers o
  JOIN events e ON e.id = o.event_id
  JOIN users su ON su.id = o.sponsor_id
  LEFT JOIN sponsor_profiles sp ON sp.user_id = o.sponsor_id
  JOIN users ou ON ou.id = e.organizer_id
  LEFT JOIN organizer_profiles op ON op.user_id = e.organizer_id
  LEFT JOIN packages p ON p.id = o.package_id`;

// GET /api/offers — kullanicinin taraf oldugu teklifler
router.get('/', requireAuth, (req, res) => {
  const rows = req.user.role === 'sponsor'
    ? db.prepare(offerWithMeta + ' WHERE o.sponsor_id = ? ORDER BY o.created_at DESC').all(req.user.id)
    : db.prepare(offerWithMeta + ' WHERE e.organizer_id = ? ORDER BY o.created_at DESC').all(req.user.id);
  res.json({ offers: rows });
});

// POST /api/offers  { event_id, package_id?, sponsor_id?, message?, amount? }
// sponsor cagirirsa: kendi adina basvuru. organizator cagirirsa: sponsor_id'li davet.
router.post('/', requireAuth, (req, res) => {
  const b = req.body || {};
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(b.event_id);
  if (!event) return res.status(404).json({ error: 'Etkinlik bulunamadi' });

  let sponsorId, initiatedBy;
  if (req.user.role === 'sponsor') {
    sponsorId = req.user.id;
    initiatedBy = 'sponsor';
    if (event.status !== 'published') return res.status(400).json({ error: 'Etkinlik basvuruya acik degil' });
  } else {
    if (event.organizer_id !== req.user.id) return res.status(403).json({ error: 'Bu etkinlik size ait degil' });
    sponsorId = b.sponsor_id;
    initiatedBy = 'organizer';
    const sponsor = db.prepare(`SELECT id FROM users WHERE id = ? AND role = 'sponsor'`).get(sponsorId);
    if (!sponsor) return res.status(404).json({ error: 'Sponsor bulunamadi' });
  }

  // Ayni etkinlik + sponsor icin bekleyen teklif varsa tekrarlama.
  const dup = db.prepare(`SELECT id FROM offers WHERE event_id = ? AND sponsor_id = ? AND status = 'pending'`)
    .get(event.id, sponsorId);
  if (dup) return res.status(409).json({ error: 'Bu etkinlik icin zaten bekleyen bir teklif var' });

  let packageId = null, amount = b.amount | 0;
  if (b.package_id) {
    const pkg = db.prepare('SELECT * FROM packages WHERE id = ? AND event_id = ?').get(b.package_id, event.id);
    if (!pkg) return res.status(400).json({ error: 'Paket bu etkinlige ait degil' });
    packageId = pkg.id;
    if (!amount) amount = pkg.price;
  }

  const info = db.prepare(`INSERT INTO offers (event_id, package_id, sponsor_id, initiated_by, message, amount)
    VALUES (?,?,?,?,?,?)`)
    .run(event.id, packageId, sponsorId, initiatedBy, b.message || '', amount);
  const offer = db.prepare(offerWithMeta + ' WHERE o.id = ?').get(info.lastInsertRowid);
  res.status(201).json({ offer });
});

// PATCH /api/offers/:id  { status: accepted | rejected | withdrawn }
// Kurallar: karsi taraf kabul/red eder; teklifi baslatan geri cekebilir.
router.patch('/:id', requireAuth, (req, res) => {
  const offer = db.prepare(offerWithMeta + ' WHERE o.id = ?').get(req.params.id);
  if (!offer) return res.status(404).json({ error: 'Teklif bulunamadi' });
  if (offer.status !== 'pending') return res.status(400).json({ error: 'Teklif zaten sonuclanmis' });

  const { status } = req.body || {};
  if (!['accepted', 'rejected', 'withdrawn'].includes(status)) {
    return res.status(400).json({ error: 'status accepted, rejected veya withdrawn olmali' });
  }

  const isSponsor = req.user.id === offer.sponsor_id;
  const isOrganizer = req.user.id === offer.organizer_id;
  if (!isSponsor && !isOrganizer) return res.status(403).json({ error: 'Bu teklifin tarafi degilsiniz' });

  const initiatorIsMe = (offer.initiated_by === 'sponsor' && isSponsor) ||
                        (offer.initiated_by === 'organizer' && isOrganizer);
  if (status === 'withdrawn' && !initiatorIsMe) {
    return res.status(403).json({ error: 'Sadece teklifi olusturan geri cekebilir' });
  }
  if ((status === 'accepted' || status === 'rejected') && initiatorIsMe) {
    return res.status(403).json({ error: 'Kendi teklifinizi kabul/red edemezsiniz' });
  }

  db.prepare(`UPDATE offers SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, offer.id);

  // Kabul edilen teklif icin konusma ac (yoksa).
  let conversationId = null;
  if (status === 'accepted') {
    const existing = db.prepare(
      'SELECT id FROM conversations WHERE organizer_id = ? AND sponsor_id = ? AND event_id IS ?')
      .get(offer.organizer_id, offer.sponsor_id, offer.event_id);
    conversationId = existing
      ? existing.id
      : db.prepare('INSERT INTO conversations (organizer_id, sponsor_id, event_id) VALUES (?,?,?)')
          .run(offer.organizer_id, offer.sponsor_id, offer.event_id).lastInsertRowid;
  }

  const updated = db.prepare(offerWithMeta + ' WHERE o.id = ?').get(offer.id);
  res.json({ offer: updated, conversation_id: conversationId });
});

module.exports = router;
