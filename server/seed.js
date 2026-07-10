// Demo verisi yukler. Calistirma: npm run seed
// Tum demo hesaplarin sifresi: demo123
const bcrypt = require('bcryptjs');
const db = require('./db');

const already = db.prepare('SELECT COUNT(*) c FROM users').get().c;
if (already > 0) {
  console.log(`Veritabaninda zaten ${already} kullanici var, seed atlandi.`);
  console.log('Sifirdan seed icin data/sponsormatch.db dosyasini silin.');
  process.exit(0);
}

const hash = bcrypt.hashSync('demo123', 10);
const insUser = db.prepare('INSERT INTO users (email, password_hash, role, name) VALUES (?,?,?,?)');
const insOrg = db.prepare(`INSERT INTO organizer_profiles (user_id, org_name, org_type, city, description, website)
  VALUES (?,?,?,?,?,?)`);
const insSpo = db.prepare(`INSERT INTO sponsor_profiles
  (user_id, company_name, sectors, budget_min, budget_max, city, target_audience, description, website)
  VALUES (?,?,?,?,?,?,?,?,?)`);

// --- Organizatorler ---
const org1 = insUser.run('kulup@demo.com', hash, 'organizer', 'Ayse Yilmaz').lastInsertRowid;
insOrg.run(org1, 'ITU Bilisim Kulubu', 'university_club', 'Istanbul',
  'Istanbul Teknik Universitesi bunyesinde teknoloji etkinlikleri duzenleyen ogrenci kulubu.', 'https://bilisim.itu.edu.tr');

const org2 = insUser.run('festival@demo.com', hash, 'organizer', 'Mehmet Kaya').lastInsertRowid;
insOrg.run(org2, 'Anadolu Muzik Festivali', 'festival', 'Eskisehir',
  'Her yaz duzenlenen, genclere yonelik bagimsiz muzik festivali.', 'https://anadolufest.example.com');

// --- Sponsorlar ---
const spo1 = insUser.run('teknosponsor@demo.com', hash, 'sponsor', 'Elif Demir').lastInsertRowid;
insSpo.run(spo1, 'TeknoSoft A.S.', JSON.stringify(['teknoloji', 'girisimcilik']), 5000, 50000, 'Istanbul',
  'universite ogrencileri, yazilim gelistiriciler, 18-28 yas', 'Kurumsal yazilim cozumleri ureten, genc yeteneklere ulasmak isteyen teknoloji sirketi.', 'https://teknosoft.example.com');

const spo2 = insUser.run('icecek@demo.com', hash, 'sponsor', 'Can Ozturk').lastInsertRowid;
insSpo.run(spo2, 'FreshUp Icecek', JSON.stringify(['icecek', 'gida', 'eglence']), 10000, 100000, 'Eskisehir',
  'genc kitle, festival katilimcilari, ogrenciler', 'Enerji ve mesrubat markasi; festival ve genclik etkinliklerine sponsor olur.', 'https://freshup.example.com');

const spo3 = insUser.run('banka@demo.com', hash, 'sponsor', 'Zeynep Arslan').lastInsertRowid;
insSpo.run(spo3, 'GencFinans Bankasi', JSON.stringify(['finans', 'egitim', 'girisimcilik']), 20000, 200000, 'Ankara',
  'universite ogrencileri, genc profesyoneller', 'Ogrenci bankaciligi urunleriyle genc kitleye ulasmayi hedefleyen banka.', 'https://gencfinans.example.com');

// --- Etkinlikler + paketler ---
const insEvent = db.prepare(`INSERT INTO events
  (organizer_id, title, description, category, city, event_date, expected_attendance, audience, status)
  VALUES (?,?,?,?,?,?,?,?,?)`);
const insPkg = db.prepare('INSERT INTO packages (event_id, name, price, perks) VALUES (?,?,?,?)');

const ev1 = insEvent.run(org1, 'HackITU 2026',
  '48 saatlik yazilim gelistirme maratonu. 300+ ogrenci gelistirici, mentor oturumlari ve odul toreni.',
  'teknoloji', 'Istanbul', '2026-10-17', 350,
  'universite ogrencileri, yazilim gelistiriciler, 18-25 yas', 'published').lastInsertRowid;
insPkg.run(ev1, 'Bronz', 7500, 'Logo (web + afis), stant alani');
insPkg.run(ev1, 'Gumus', 20000, 'Bronz + acilis konusmasi, odul takdimi');
insPkg.run(ev1, 'Altin', 45000, 'Gumus + ana sponsor unvani, ozel workshop oturumu');

const ev2 = insEvent.run(org1, 'Girisimcilik Zirvesi',
  'Ogrenci girisimcileri yatirimcilarla bulusturan tam gunluk zirve; panel ve demo day.',
  'girisimcilik', 'Istanbul', '2026-11-21', 500,
  'girisimci ogrenciler, genc profesyoneller, yatirimcilar', 'published').lastInsertRowid;
insPkg.run(ev2, 'Destekci', 10000, 'Logo ve sosyal medya tesekkuru');
insPkg.run(ev2, 'Ana Sponsor', 60000, 'Sahne adi hakki, panelde konusmaci koltugu, stant');

const ev3 = insEvent.run(org2, 'Anadolu Fest 2026',
  '3 gunluk acik hava muzik festivali. 20+ sanatci, 15.000 katilimci beklentisi.',
  'muzik', 'Eskisehir', '2026-08-14', 15000,
  'genc kitle, festival katilimcilari, 18-30 yas, ogrenciler', 'published').lastInsertRowid;
insPkg.run(ev3, 'Alan Sponsoru', 25000, 'Festival alaninda marka standi ve sampling hakki');
insPkg.run(ev3, 'Sahne Sponsoru', 90000, 'Ikinci sahnenin isim hakki + tum gorsellerde logo');

// Taslak etkinlik (sadece sahibi gorur)
insEvent.run(org2, 'Kis Konserleri Serisi',
  'Planlama asamasinda: kapali mekan konser serisi.', 'muzik', 'Eskisehir', '2026-12-05', 800,
  'genc kitle, muzikseverler', 'draft');

// --- Ornek teklif akisi: FreshUp -> Anadolu Fest (kabul edilmis, konusma acik) ---
const insOffer = db.prepare(`INSERT INTO offers (event_id, package_id, sponsor_id, initiated_by, message, amount, status)
  VALUES (?,?,?,?,?,?,?)`);
const pkgAlan = db.prepare(`SELECT id, price FROM packages WHERE event_id = ? AND name = 'Alan Sponsoru'`).get(ev3);
insOffer.run(ev3, pkgAlan.id, spo2, 'sponsor',
  'Festival alaninda sampling standi kurmak istiyoruz, gecen yilki isbirligimiz cok verimliydi.',
  pkgAlan.price, 'accepted');
const conv = db.prepare('INSERT INTO conversations (organizer_id, sponsor_id, event_id) VALUES (?,?,?)')
  .run(org2, spo2, ev3).lastInsertRowid;
const insMsg = db.prepare('INSERT INTO messages (conversation_id, sender_id, body) VALUES (?,?,?)');
insMsg.run(conv, spo2, 'Merhaba! Teklifimiz kabul edilmis, cok sevindik. Stant yerlesimi icin plani paylasabilir misiniz?');
insMsg.run(conv, org2, 'Merhaba, hos geldiniz! Yerlesim krokisini bu hafta icinde iletiyorum.');

// Bekleyen teklif: TeknoSoft -> HackITU (Gumus paket)
const pkgGumus = db.prepare(`SELECT id, price FROM packages WHERE event_id = ? AND name = 'Gumus'`).get(ev1);
insOffer.run(ev1, pkgGumus.id, spo1, 'sponsor',
  'Hackathon katilimcilarina staj programimizi tanitmak istiyoruz.', pkgGumus.price, 'pending');

console.log('Seed tamamlandi. Demo hesaplar (sifre: demo123):');
console.log('  Organizator: kulup@demo.com, festival@demo.com');
console.log('  Sponsor    : teknosponsor@demo.com, icecek@demo.com, banka@demo.com');
