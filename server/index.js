// SponsorMatch API + statik frontend sunucusu
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/events', require('./routes/events'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api', require('./routes/messages'));   // /api/conversations...
app.use('/api/stats', require('./routes/stats'));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'sponsormatch' }));

// Frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// Bilinmeyen API yolu -> 404 JSON; digerleri SPA'ya duser
app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint bulunamadi' }));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));

// Merkezi hata yakalayici
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Sunucu hatasi' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SponsorMatch calisiyor: http://localhost:${PORT}`));
