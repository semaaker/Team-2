# SponsorMatch

## Hızlı Başlangıç: Serveri Başlatma ve Siteyi Kullanma

### 1. Gereksinim

Bilgisayarınızda **Node.js** kurulu olmalı (v18 veya üzeri önerilir). Kurulu değilse
[nodejs.org](https://nodejs.org) adresinden LTS sürümünü indirip kurun.
Kontrol için terminalde: `node --version`

### 2. Serveri başlatma

Proje klasöründe bir terminal açın (VS Code'da `` Ctrl+` ``) ve sırayla şu komutları çalıştırın:

```bash
npm install     # bağımlılıkları yükler (sadece ilk kurulumda gerekir)
npm run seed    # demo verisini (hesaplar, etkinlikler) veritabanına yükler (sadece ilk kurulumda)
npm start       # serveri başlatır
```

Terminalde server'ın çalıştığına dair mesajı gördükten sonra tarayıcıda şu adresi açın:

👉 **http://localhost:3000**

Serveri durdurmak için terminalde `Ctrl+C` tuşlayın. Sonraki kullanımlarda sadece `npm start` yeterlidir.

> Geliştirme yaparken `npm start` yerine `npm run dev` kullanabilirsiniz; kodda değişiklik
> yaptığınızda server otomatik yeniden başlar.

### 3. Siteyi kullanma

1. Açılan sayfada **Giriş Yap**'a tıklayın ve aşağıdaki demo hesaplardan biriyle girin
   (veya **Kayıt Ol** ile kendi hesabınızı oluşturun — kayıt sırasında *Organizatör* ya da *Sponsor* rolü seçilir).
2. **Organizatör** olarak: etkinlik ve sponsorluk paketleri oluşturun, "Eşleşmeler" ekranından
   size önerilen sponsorları görün ve davet gönderin.
3. **Sponsor** olarak: profilinizi (sektör, bütçe, şehir) doldurun, önerilen etkinlikleri
   inceleyin ve paketlere başvurun.
4. Bir teklif kabul edildiğinde iki taraf arasında otomatik olarak **mesajlaşma** açılır.

**Demo hesaplar** (şifre: `demo123`):

| Rol | E-posta |
|---|---|
| Organizatör | kulup@demo.com, festival@demo.com |
| Sponsor | teknosponsor@demo.com, icecek@demo.com, banka@demo.com |

## Mimari

- **Backend:** Node.js + Express REST API, JWT kimlik doğrulama (bcrypt şifre hash'i), rol bazlı yetkilendirme (`organizer` / `sponsor`)
- **Veritabanı:** SQLite (better-sqlite3, WAL modu) — `data/sponsormatch.db`, şema `server/db.js` içinde otomatik oluşur
- **Frontend:** Bağımlılıksız vanilla-JS SPA (hash router), Express tarafından `public/` klasöründen servis edilir

```
server/
  index.js              Express app + statik sunum + SPA fallback
  db.js                 SQLite şeması ve bağlantı
  util.js               JWT üretimi, requireAuth / requireRole middleware
  seed.js               Demo verisi
  services/matching.js  Eşleştirme motoru (AI entegrasyon noktaları işaretli)
  routes/
    auth.js             POST /api/auth/register|login, GET /api/auth/me
    profiles.js         GET|PUT /api/profiles/me, GET /api/profiles/:id
    events.js           Etkinlik + sponsorluk paketi CRUD
    matches.js          GET /api/matches (iki yönlü, skorlu öneriler)
    offers.js           Teklif akışı: başvuru/davet → kabul/red/geri çekme
    messages.js         Konuşmalar ve mesajlar (okundu takibi ile)
    stats.js            Rol bazlı dashboard istatistikleri
public/                 SPA (index.html, app.js, styles.css)
```

## Temel Akışlar

1. **Eşleştirme:** Sponsor → puanlanmış etkinlik önerileri; Organizatör → etkinlik başına puanlanmış sponsor önerileri. Skor = sektör/kategori uyumu (%40) + bütçe uyumu (%25) + şehir (%15) + hedef kitle benzerliği (%20), her öneri gerekçeleriyle döner.
2. **Teklif:** Sponsor bir pakete başvurur **veya** organizatör eşleşme ekranından sponsoru davet eder. Karşı taraf kabul/reddeder; teklifi oluşturan geri çekebilir.
3. **Mesajlaşma:** Kabul edilen teklif otomatik olarak güvenli bir konuşma açar; okunmamış sayaçları ve okundu işaretleme mevcuttur.

## Placeholder / Genişleme Noktaları

Kod içinde `>>> AI PLACEHOLDER <<<` ve `PLACEHOLDER` yorumlarıyla işaretlidir:

- **AI eşleştirme** (`server/services/matching.js`): Kural tabanlı skor, embedding benzerliği ve LLM gerekçe üretimiyle güçlendirilecek şekilde tasarlandı; kural tabanlı taban her zaman fallback olarak kalır.
- **Gerçek zamanlı mesajlaşma** (`server/routes/messages.js`): Şu an 5 sn'lik HTTP polling; API sözleşmesi değişmeden WebSocket/socket.io katmanı eklenebilir.
- **JWT secret** (`server/util.js`): Üretimde `JWT_SECRET` ortam değişkeninden verilmelidir.
