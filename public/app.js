/* SponsorMatch SPA — hash tabanli yonlendirme, fetch tabanli API istemcisi */
(() => {
  const app = document.getElementById('app');
  const nav = document.getElementById('nav');
  let me = null;            // { id, email, role, name }
  let pollTimer = null;     // mesaj polling

  // ---------- yardimcilar ----------
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => new Intl.NumberFormat('tr-TR').format(n || 0) + ' ₺';

  function toast(msg, isError) {
    const el = document.createElement('div');
    el.className = 'toast' + (isError ? ' error' : '');
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  async function api(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    const token = localStorage.getItem('sm_token');
    if (token) headers.Authorization = 'Bearer ' + token;
    const res = await fetch('/api' + path, { ...opts, headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && me) { logout(); throw new Error('Oturum sona erdi'); }
    if (!res.ok) throw new Error(data.error || 'Bir hata olustu');
    return data;
  }

  function logout() {
    localStorage.removeItem('sm_token');
    me = null;
    location.hash = '#/auth';
  }

  const statusBadge = st => ({
    pending: '<span class="badge amber">Bekliyor</span>',
    accepted: '<span class="badge green">Kabul edildi</span>',
    rejected: '<span class="badge red">Reddedildi</span>',
    withdrawn: '<span class="badge">Geri çekildi</span>',
    published: '<span class="badge blue">Yayında</span>',
    draft: '<span class="badge">Taslak</span>',
    completed: '<span class="badge green">Tamamlandı</span>',
    cancelled: '<span class="badge red">İptal</span>'
  }[st] || esc(st));

  const CATEGORIES = ['teknoloji', 'muzik', 'spor', 'egitim', 'girisimcilik', 'sanat', 'other'];
  const catLabel = c => ({ teknoloji: 'Teknoloji', muzik: 'Müzik', spor: 'Spor', egitim: 'Eğitim',
    girisimcilik: 'Girişimcilik', sanat: 'Sanat', other: 'Diğer' }[c] || c);

  // ---------- nav ----------
  function renderNav() {
    if (!me) { nav.style.display = 'none'; return; }
    nav.style.display = 'flex';
    const links = [
      ['#/dashboard', 'Panel'],
      me.role === 'organizer' ? ['#/my-events', 'Etkinliklerim'] : ['#/events', 'Etkinlikler'],
      ['#/matches', 'Eşleşmeler'],
      ['#/offers', 'Teklifler'],
      ['#/messages', 'Mesajlar'],
      ['#/profile', 'Profil']
    ];
    const current = location.hash.split('?')[0];
    nav.innerHTML = `
      <a class="brand" href="#/dashboard">Sponsor<span>Match</span></a>
      ${links.map(([h, t]) => `<a class="navlink ${current === h ? 'active' : ''}" href="${h}">${t}</a>`).join('')}
      <div class="spacer"></div>
      <span class="muted">${esc(me.name)} · ${me.role === 'organizer' ? 'Organizatör' : 'Sponsor'}</span>
      <button class="secondary small" id="logoutBtn">Çıkış</button>`;
    nav.querySelector('#logoutBtn').onclick = logout;
  }

  // ---------- goruntuler ----------
  function viewAuth() {
    app.innerHTML = `
      <div class="auth-wrap">
        <div class="auth-hero">
          <div class="logo">Sponsor<span>Match</span></div>
          <p class="muted">Etkinlik organizatörleri ile sponsorları buluşturan platform</p>
        </div>
        <div class="card">
          <div class="tabs">
            <button id="tabLogin" class="active">Giriş</button>
            <button id="tabRegister">Kayıt Ol</button>
          </div>
          <form id="authForm">
            <div id="registerFields" style="display:none">
              <label>Ad Soyad</label><input name="name" placeholder="Ad Soyad">
              <label>Hesap Türü</label>
              <select name="role">
                <option value="organizer">Organizatör — etkinliğim için sponsor arıyorum</option>
                <option value="sponsor">Sponsor — etkinliklere sponsor olmak istiyorum</option>
              </select>
            </div>
            <label>E-posta</label><input name="email" type="email" required placeholder="ornek@mail.com">
            <label>Şifre</label><input name="password" type="password" required placeholder="••••••">
            <button style="width:100%;margin-top:18px" type="submit">Giriş Yap</button>
          </form>
          <p class="muted" style="margin-top:14px;font-size:12px">
            Demo hesaplar (şifre: <b>demo123</b>): kulup@demo.com · festival@demo.com ·
            teknosponsor@demo.com · icecek@demo.com · banka@demo.com
          </p>
        </div>
      </div>`;

    let mode = 'login';
    const tabL = document.getElementById('tabLogin'), tabR = document.getElementById('tabRegister');
    const regFields = document.getElementById('registerFields');
    const form = document.getElementById('authForm');
    const setMode = m => {
      mode = m;
      tabL.classList.toggle('active', m === 'login');
      tabR.classList.toggle('active', m === 'register');
      regFields.style.display = m === 'register' ? 'block' : 'none';
      form.querySelector('button[type=submit]').textContent = m === 'login' ? 'Giriş Yap' : 'Kayıt Ol';
    };
    tabL.onclick = () => setMode('login');
    tabR.onclick = () => setMode('register');

    form.onsubmit = async e => {
      e.preventDefault();
      const fd = new FormData(form);
      try {
        const data = mode === 'login'
          ? await api('/auth/login', { method: 'POST', body: { email: fd.get('email'), password: fd.get('password') } })
          : await api('/auth/register', { method: 'POST', body: {
              email: fd.get('email'), password: fd.get('password'),
              name: fd.get('name'), role: fd.get('role') } });
        localStorage.setItem('sm_token', data.token);
        me = data.user;
        location.hash = '#/dashboard';
      } catch (err) { toast(err.message, true); }
    };
  }

  async function viewDashboard() {
    const s = await api('/stats');
    const cards = me.role === 'organizer'
      ? [[s.events, 'Etkinliğim'], [s.published_events, 'Yayında'], [s.pending_offers, 'Bekleyen Teklif'],
         [s.accepted_offers, 'Kabul Edilen'], [s.unread_messages, 'Okunmamış Mesaj']]
      : [[s.open_events, 'Açık Etkinlik'], [s.my_offers, 'Başvurum'], [s.pending_offers, 'Bekleyen'],
         [s.accepted_offers, 'Kabul Edilen'], [s.unread_messages, 'Okunmamış Mesaj']];
    app.innerHTML = `
      <h1>Merhaba, ${esc(me.name)} 👋</h1>
      <p class="muted" style="margin-bottom:20px">${me.role === 'organizer'
        ? 'Etkinliklerini yönet, sana uygun sponsorları keşfet.'
        : 'Markana uygun etkinlikleri keşfet, sponsorluk tekliflerini yönet.'}</p>
      <div class="grid cols-4">
        ${cards.map(([n, l]) => `<div class="card stat"><div class="num">${n}</div><div class="lbl">${l}</div></div>`).join('')}
      </div>
      <div class="grid cols-2" style="margin-top:14px">
        <div class="card">
          <h3>🤝 Akıllı Eşleştirme</h3>
          <p class="muted" style="margin:8px 0 14px">${me.role === 'organizer'
            ? 'Etkinliğinin kategorisi, bütçesi ve kitlesine göre puanlanmış sponsor önerileri.'
            : 'Sektörüne, bütçene ve hedef kitlene göre puanlanmış etkinlik önerileri.'}</p>
          <a href="#/matches"><button>Eşleşmeleri Gör</button></a>
        </div>
        <div class="card">
          <h3>${me.role === 'organizer' ? '📅 Yeni Etkinlik' : '🔍 Etkinlikleri Keşfet'}</h3>
          <p class="muted" style="margin:8px 0 14px">${me.role === 'organizer'
            ? 'Etkinliğini ve sponsorluk paketlerini oluştur, sponsorların karşısına çık.'
            : 'Yayındaki tüm etkinliklere göz at, paketlere başvur.'}</p>
          <a href="${me.role === 'organizer' ? '#/event-new' : '#/events'}">
            <button class="secondary">${me.role === 'organizer' ? 'Etkinlik Oluştur' : 'Göz At'}</button></a>
        </div>
      </div>`;
  }

  function eventCard(e, actionsHtml = '') {
    return `<div class="card">
      <div class="row between">
        <div>
          <h3><a href="#/event/${e.id}">${esc(e.title)}</a></h3>
          <p class="muted" style="margin-top:4px">
            ${esc(e.org_name || e.organizer_name)} · ${catLabel(e.category)} · ${esc(e.city)} ·
            📅 ${esc(e.event_date)} · 👥 ${e.expected_attendance} kişi</p>
        </div>
        <div class="row">${statusBadge(e.status)}${actionsHtml}</div>
      </div>
      <p style="margin-top:10px;font-size:14px">${esc(e.description)}</p>
      ${e.packages && e.packages.length ? `<div class="row" style="margin-top:10px">
        ${e.packages.map(p => `<span class="badge blue">${esc(p.name)} · ${money(p.price)}</span>`).join('')}
      </div>` : ''}
    </div>`;
  }

  async function viewEvents() {
    app.innerHTML = `
      <div class="row between"><h1>Etkinlikler</h1></div>
      <div class="card row" style="margin-top:14px">
        <select id="fCat" style="max-width:180px">
          <option value="">Tüm kategoriler</option>
          ${CATEGORIES.map(c => `<option value="${c}">${catLabel(c)}</option>`).join('')}
        </select>
        <input id="fCity" placeholder="Şehir" style="max-width:160px">
        <input id="fQ" placeholder="Ara..." style="max-width:220px">
        <button class="secondary" id="fBtn">Filtrele</button>
      </div>
      <div id="list"><p class="muted">Yükleniyor…</p></div>`;
    const load = async () => {
      const q = new URLSearchParams();
      const cat = document.getElementById('fCat').value, city = document.getElementById('fCity').value,
            text = document.getElementById('fQ').value;
      if (cat) q.set('category', cat);
      if (city) q.set('city', city);
      if (text) q.set('q', text);
      const { events } = await api('/events?' + q.toString());
      document.getElementById('list').innerHTML = events.length
        ? events.map(e => eventCard(e)).join('')
        : '<div class="card muted">Kriterlere uyan etkinlik bulunamadı.</div>';
    };
    document.getElementById('fBtn').onclick = () => load().catch(e => toast(e.message, true));
    await load();
  }

  async function viewMyEvents() {
    const { events } = await api('/events/mine');
    app.innerHTML = `
      <div class="row between">
        <h1>Etkinliklerim</h1>
        <a href="#/event-new"><button>+ Yeni Etkinlik</button></a>
      </div>
      <div style="margin-top:14px">
        ${events.length ? events.map(e => eventCard(e,
          `<a href="#/event-edit/${e.id}"><button class="secondary small">Düzenle</button></a>`)).join('')
        : '<div class="card muted">Henüz etkinliğin yok. İlkini oluştur!</div>'}
      </div>`;
  }

  function packageRowHtml(p = {}) {
    return `<div class="pkg-row">
      <input class="pkgName" placeholder="Paket adı (örn. Altın)" value="${esc(p.name || '')}">
      <input class="pkgPrice" type="number" min="0" placeholder="Fiyat ₺" value="${p.price ?? ''}">
      <input class="pkgPerks" placeholder="İçerik (logo, stant, ...)" value="${esc(p.perks || '')}">
      <button type="button" class="danger small pkgDel">✕</button>
    </div>`;
  }

  async function viewEventForm(eventId) {
    let ev = { packages: [] };
    if (eventId) ev = (await api('/events/' + eventId)).event;
    app.innerHTML = `
      <h1>${eventId ? 'Etkinliği Düzenle' : 'Yeni Etkinlik'}</h1>
      <form id="evForm" class="card" style="margin-top:14px">
        <label>Başlık *</label><input name="title" required value="${esc(ev.title || '')}">
        <label>Açıklama</label><textarea name="description" rows="3">${esc(ev.description || '')}</textarea>
        <div class="grid cols-2">
          <div><label>Kategori</label><select name="category">
            ${CATEGORIES.map(c => `<option value="${c}" ${ev.category === c ? 'selected' : ''}>${catLabel(c)}</option>`).join('')}
          </select></div>
          <div><label>Şehir</label><input name="city" value="${esc(ev.city || '')}"></div>
          <div><label>Tarih</label><input name="event_date" type="date" value="${esc(ev.event_date || '')}"></div>
          <div><label>Beklenen Katılımcı</label><input name="expected_attendance" type="number" min="0" value="${ev.expected_attendance || ''}"></div>
        </div>
        <label>Hedef Kitle (eşleştirme için önemli)</label>
        <input name="audience" placeholder="örn. üniversite öğrencileri, 18-25 yaş" value="${esc(ev.audience || '')}">
        <label>Durum</label>
        <select name="status">
          <option value="published" ${ev.status === 'published' ? 'selected' : ''}>Yayında</option>
          <option value="draft" ${ev.status === 'draft' ? 'selected' : ''}>Taslak</option>
          ${eventId ? `<option value="completed" ${ev.status === 'completed' ? 'selected' : ''}>Tamamlandı</option>
          <option value="cancelled" ${ev.status === 'cancelled' ? 'selected' : ''}>İptal</option>` : ''}
        </select>
        <h3 style="margin-top:20px">Sponsorluk Paketleri</h3>
        <div id="pkgList" style="margin-top:10px">${(ev.packages || []).map(packageRowHtml).join('')}</div>
        <button type="button" class="secondary small" id="pkgAdd">+ Paket Ekle</button>
        <div class="row" style="margin-top:20px">
          <button type="submit">${eventId ? 'Kaydet' : 'Oluştur'}</button>
          ${eventId ? '<button type="button" class="danger" id="evDel">Sil</button>' : ''}
        </div>
      </form>`;

    const pkgList = document.getElementById('pkgList');
    document.getElementById('pkgAdd').onclick = () => pkgList.insertAdjacentHTML('beforeend', packageRowHtml());
    pkgList.addEventListener('click', e => {
      if (e.target.classList.contains('pkgDel')) e.target.closest('.pkg-row').remove();
    });
    if (document.getElementById('evDel')) document.getElementById('evDel').onclick = async () => {
      if (!confirm('Bu etkinlik silinsin mi?')) return;
      try { await api('/events/' + eventId, { method: 'DELETE' }); toast('Etkinlik silindi'); location.hash = '#/my-events'; }
      catch (err) { toast(err.message, true); }
    };
    document.getElementById('evForm').onsubmit = async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const packages = [...pkgList.querySelectorAll('.pkg-row')].map(r => ({
        name: r.querySelector('.pkgName').value.trim(),
        price: parseInt(r.querySelector('.pkgPrice').value, 10) || 0,
        perks: r.querySelector('.pkgPerks').value.trim()
      })).filter(p => p.name);
      const body = {
        title: fd.get('title'), description: fd.get('description'), category: fd.get('category'),
        city: fd.get('city'), event_date: fd.get('event_date'),
        expected_attendance: parseInt(fd.get('expected_attendance'), 10) || 0,
        audience: fd.get('audience'), status: fd.get('status'), packages
      };
      try {
        await api(eventId ? '/events/' + eventId : '/events', { method: eventId ? 'PUT' : 'POST', body });
        toast(eventId ? 'Kaydedildi' : 'Etkinlik oluşturuldu');
        location.hash = '#/my-events';
      } catch (err) { toast(err.message, true); }
    };
  }

  async function viewEventDetail(id) {
    const { event: e } = await api('/events/' + id);
    const isOwner = me.role === 'organizer' && e.organizer_id === me.id;
    app.innerHTML = `
      <div class="row between">
        <div><h1>${esc(e.title)}</h1>
          <p class="muted">${esc(e.org_name || e.organizer_name)} · ${catLabel(e.category)} ·
            ${esc(e.city)} · 📅 ${esc(e.event_date)} · 👥 ${e.expected_attendance} kişi</p></div>
        ${statusBadge(e.status)}
      </div>
      <div class="card" style="margin-top:14px">
        <p>${esc(e.description)}</p>
        ${e.audience ? `<p class="muted" style="margin-top:8px">🎯 Hedef kitle: ${esc(e.audience)}</p>` : ''}
      </div>
      <h2 style="margin-top:20px">Sponsorluk Paketleri</h2>
      <div class="grid cols-2">
        ${e.packages.length ? e.packages.map(p => `
          <div class="card">
            <div class="row between"><h3>${esc(p.name)}</h3><b>${money(p.price)}</b></div>
            <p class="muted" style="margin:8px 0 12px">${esc(p.perks)}</p>
            ${me.role === 'sponsor' && e.status === 'published'
              ? `<button class="applyBtn" data-pkg="${p.id}" data-price="${p.price}">Bu Pakete Başvur</button>` : ''}
          </div>`).join('')
        : '<div class="card muted">Paket tanımlanmamış.</div>'}
      </div>
      ${me.role === 'sponsor' && e.status === 'published' ? `
        <div class="card" style="margin-top:6px">
          <h3>Paketsiz / özel teklif</h3>
          <label>Mesajın</label><textarea id="offMsg" rows="2" placeholder="Teklifini kısaca anlat..."></textarea>
          <label>Teklif tutarı (₺)</label><input id="offAmt" type="number" min="0" style="max-width:200px">
          <button style="margin-top:12px" id="freeOffer">Teklif Gönder</button>
        </div>` : ''}
      ${isOwner ? `<div class="row" style="margin-top:16px">
        <a href="#/event-edit/${e.id}"><button class="secondary">Düzenle</button></a>
        <a href="#/matches?event_id=${e.id}"><button>Bu Etkinlik İçin Sponsor Önerileri</button></a>
      </div>` : ''}`;

    const sendOffer = async (packageId, amount, message) => {
      try {
        await api('/offers', { method: 'POST', body: { event_id: e.id, package_id: packageId, amount, message } });
        toast('Teklifin gönderildi ✔'); location.hash = '#/offers';
      } catch (err) { toast(err.message, true); }
    };
    app.querySelectorAll('.applyBtn').forEach(btn => btn.onclick = () =>
      sendOffer(parseInt(btn.dataset.pkg, 10), parseInt(btn.dataset.price, 10),
        'Paket başvurusu'));
    const freeBtn = document.getElementById('freeOffer');
    if (freeBtn) freeBtn.onclick = () => sendOffer(null,
      parseInt(document.getElementById('offAmt').value, 10) || 0,
      document.getElementById('offMsg').value.trim());
  }

  function scoreRing(score) {
    return `<div class="score-ring" style="--p:${score}"><div>%${score}</div></div>`;
  }

  async function viewMatches(params) {
    if (me.role === 'sponsor') {
      const { matches } = await api('/matches');
      app.innerHTML = `
        <h1>Sana Uygun Etkinlikler</h1>
        <p class="muted" style="margin-bottom:16px">Sektör, bütçe, şehir ve hedef kitle uyumuna göre puanlandı.
          Profilin ne kadar dolu olursa öneriler o kadar isabetli olur.</p>
        ${matches.map(m => `
          <div class="card row" style="gap:16px">
            ${scoreRing(m.score)}
            <div style="flex:1">
              <h3><a href="#/event/${m.event.id}">${esc(m.event.title)}</a></h3>
              <p class="muted" style="margin-top:2px">${esc(m.event.org_name || m.event.organizer_name)} ·
                ${catLabel(m.event.category)} · ${esc(m.event.city)} · 👥 ${m.event.expected_attendance}</p>
              <p class="muted" style="margin-top:6px;font-size:13px">💡 ${m.reasons.map(esc).join(' · ')}</p>
            </div>
            <a href="#/event/${m.event.id}"><button class="secondary small">İncele</button></a>
          </div>`).join('') || '<div class="card muted">Yayında etkinlik yok.</div>'}`;
      return;
    }
    // Organizator: etkinlik sec -> sponsor onerileri
    const { events } = await api('/events/mine');
    const eventId = params.get('event_id') || (events[0] && events[0].id);
    app.innerHTML = `
      <h1>Sponsor Önerileri</h1>
      <div class="card row" style="margin-top:14px">
        <label style="margin:0">Etkinlik:</label>
        <select id="evSel" style="max-width:340px">
          ${events.map(e => `<option value="${e.id}" ${e.id == eventId ? 'selected' : ''}>${esc(e.title)}</option>`).join('')}
        </select>
      </div>
      <div id="list"><p class="muted">Yükleniyor…</p></div>`;
    if (!events.length) {
      document.getElementById('list').innerHTML = '<div class="card muted">Önce bir etkinlik oluşturmalısın.</div>';
      return;
    }
    document.getElementById('evSel').onchange = e => { location.hash = '#/matches?event_id=' + e.target.value; };
    const { matches } = await api('/matches?event_id=' + eventId);
    document.getElementById('list').innerHTML = matches.map(m => `
      <div class="card row" style="gap:16px">
        ${scoreRing(m.score)}
        <div style="flex:1">
          <h3>${esc(m.sponsor.company_name || m.sponsor.name)}</h3>
          <p class="muted" style="margin-top:2px">${esc(m.sponsor.city)} ·
            Sektörler: ${m.sponsor.sectors.map(esc).join(', ') || '—'} ·
            Bütçe: ${money(m.sponsor.budget_min)} – ${money(m.sponsor.budget_max)}</p>
          <p class="muted" style="margin-top:6px;font-size:13px">💡 ${m.reasons.map(esc).join(' · ')}</p>
        </div>
        <button class="small inviteBtn" data-sponsor="${m.sponsor.user_id}">Davet Et</button>
      </div>`).join('') || '<div class="card muted">Kayıtlı sponsor bulunamadı.</div>';
    document.querySelectorAll('.inviteBtn').forEach(btn => btn.onclick = async () => {
      try {
        await api('/offers', { method: 'POST', body: {
          event_id: parseInt(eventId, 10), sponsor_id: parseInt(btn.dataset.sponsor, 10),
          message: 'Etkinliğimize sponsor olmanızı isteriz!' } });
        toast('Davet gönderildi ✔');
      } catch (err) { toast(err.message, true); }
    });
  }

  async function viewOffers() {
    const { offers } = await api('/offers');
    const canRespond = o => o.status === 'pending' &&
      ((me.role === 'organizer' && o.initiated_by === 'sponsor') ||
       (me.role === 'sponsor' && o.initiated_by === 'organizer'));
    const canWithdraw = o => o.status === 'pending' &&
      ((me.role === 'sponsor' && o.initiated_by === 'sponsor') ||
       (me.role === 'organizer' && o.initiated_by === 'organizer'));
    app.innerHTML = `
      <h1>Teklifler</h1>
      <p class="muted" style="margin-bottom:16px">Kabul edilen teklifler otomatik olarak mesajlaşma başlatır.</p>
      ${offers.map(o => `
        <div class="card">
          <div class="row between">
            <div>
              <h3><a href="#/event/${o.event_id}">${esc(o.event_title)}</a></h3>
              <p class="muted" style="margin-top:4px">
                ${me.role === 'organizer'
                  ? `Sponsor: <b>${esc(o.company_name || o.sponsor_name)}</b>`
                  : `Organizatör: <b>${esc(o.org_name || o.organizer_name)}</b>`}
                · ${o.package_name ? esc(o.package_name) + ' paketi' : 'Özel teklif'}
                · ${money(o.amount)}
                · ${o.initiated_by === 'sponsor' ? 'Sponsor başvurusu' : 'Organizatör daveti'}</p>
              ${o.message ? `<p style="margin-top:8px;font-size:14px">"${esc(o.message)}"</p>` : ''}
            </div>
            <div class="row">
              ${statusBadge(o.status)}
              ${canRespond(o) ? `
                <button class="success small actBtn" data-id="${o.id}" data-st="accepted">Kabul</button>
                <button class="danger small actBtn" data-id="${o.id}" data-st="rejected">Reddet</button>` : ''}
              ${canWithdraw(o) ? `<button class="secondary small actBtn" data-id="${o.id}" data-st="withdrawn">Geri Çek</button>` : ''}
            </div>
          </div>
        </div>`).join('') || '<div class="card muted">Henüz teklif yok.</div>'}`;
    document.querySelectorAll('.actBtn').forEach(btn => btn.onclick = async () => {
      try {
        const data = await api('/offers/' + btn.dataset.id, { method: 'PATCH', body: { status: btn.dataset.st } });
        if (btn.dataset.st === 'accepted' && data.conversation_id) {
          toast('Teklif kabul edildi, mesajlaşma açıldı 🎉');
          location.hash = '#/messages?c=' + data.conversation_id;
        } else { toast('Güncellendi'); viewOffers(); }
      } catch (err) { toast(err.message, true); }
    });
  }

  async function viewMessages(params) {
    const { conversations } = await api('/conversations');
    const activeId = parseInt(params.get('c'), 10) || (conversations[0] && conversations[0].id);
    app.innerHTML = `
      <h1>Mesajlar</h1>
      <div class="chat-layout" style="margin-top:14px">
        <div class="card" style="overflow-y:auto;max-height:560px">
          ${conversations.map(c => `
            <div class="conv-item ${c.id === activeId ? 'active' : ''}" data-id="${c.id}">
              <div class="row between">
                <b style="font-size:14px">${esc(me.role === 'organizer' ? c.sponsor_name : c.organizer_name)}</b>
                ${c.unread_count ? `<span class="badge blue">${c.unread_count}</span>` : ''}
              </div>
              ${c.event_title ? `<div class="muted" style="font-size:12px">📅 ${esc(c.event_title)}</div>` : ''}
              <div class="muted" style="font-size:12px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                ${esc(c.last_message || 'Henüz mesaj yok')}</div>
            </div>`).join('') || '<p class="muted">Henüz konuşma yok. Bir teklif kabul edildiğinde burada görünür.</p>'}
        </div>
        <div class="card chat-box" id="chatBox">
          ${activeId ? '<p class="muted">Yükleniyor…</p>' : '<p class="muted">Bir konuşma seç.</p>'}
        </div>
      </div>`;

    document.querySelectorAll('.conv-item').forEach(el => el.onclick = () => {
      location.hash = '#/messages?c=' + el.dataset.id;
    });
    if (!activeId) return;

    const chatBox = document.getElementById('chatBox');
    const loadMessages = async (scroll) => {
      const { conversation, messages } = await api(`/conversations/${activeId}/messages`);
      const peer = me.role === 'organizer' ? conversation.sponsor_name : conversation.organizer_name;
      chatBox.innerHTML = `
        <div class="row between" style="border-bottom:1px solid var(--border);padding-bottom:10px">
          <b>${esc(peer)}</b>
          ${conversation.event_title ? `<span class="muted" style="font-size:13px">📅 ${esc(conversation.event_title)}</span>` : ''}
        </div>
        <div class="chat-messages" id="msgList">
          ${messages.map(m => `
            <div class="bubble ${m.sender_id === me.id ? 'mine' : 'theirs'}">
              ${esc(m.body)}
              <div class="meta">${esc(m.created_at)}</div>
            </div>`).join('') || '<p class="muted">İlk mesajı sen gönder 👇</p>'}
        </div>
        <form class="chat-input" id="msgForm">
          <input id="msgInput" placeholder="Mesaj yaz..." autocomplete="off">
          <button type="submit">Gönder</button>
        </form>`;
      if (scroll) {
        const list = document.getElementById('msgList');
        list.scrollTop = list.scrollHeight;
      }
      document.getElementById('msgForm').onsubmit = async e => {
        e.preventDefault();
        const input = document.getElementById('msgInput');
        const body = input.value.trim();
        if (!body) return;
        input.value = '';
        try { await api(`/conversations/${activeId}/messages`, { method: 'POST', body: { body } }); await loadMessages(true); }
        catch (err) { toast(err.message, true); }
      };
    };
    await loadMessages(true);
    // Polling — PLACEHOLDER: WebSocket entegre edildiginde kaldirilacak.
    pollTimer = setInterval(async () => {
      const input = document.getElementById('msgInput');
      const typing = input && input.value.length > 0;
      if (!typing) await loadMessages(false).catch(() => {});
    }, 5000);
  }

  async function viewProfile() {
    const { profile } = await api('/profiles/me');
    if (me.role === 'organizer') {
      app.innerHTML = `
        <h1>Organizatör Profili</h1>
        <form id="pf" class="card" style="margin-top:14px;max-width:560px">
          <label>Organizasyon Adı</label><input name="org_name" value="${esc(profile.org_name)}">
          <label>Tür</label>
          <select name="org_type">
            ${[['university_club','Üniversite Kulübü'],['festival','Festival'],['academic','Akademik Komite'],['ngo','STK'],['other','Diğer']]
              .map(([v,l]) => `<option value="${v}" ${profile.org_type===v?'selected':''}>${l}</option>`).join('')}
          </select>
          <label>Şehir</label><input name="city" value="${esc(profile.city)}">
          <label>Açıklama</label><textarea name="description" rows="3">${esc(profile.description)}</textarea>
          <label>Web sitesi</label><input name="website" value="${esc(profile.website)}">
          <button style="margin-top:16px">Kaydet</button>
        </form>`;
    } else {
      app.innerHTML = `
        <h1>Sponsor Profili</h1>
        <p class="muted">Bu bilgiler eşleştirme puanını doğrudan etkiler.</p>
        <form id="pf" class="card" style="margin-top:14px;max-width:560px">
          <label>Şirket Adı</label><input name="company_name" value="${esc(profile.company_name)}">
          <label>Sektörler (virgülle ayır)</label>
          <input name="sectors" value="${esc((profile.sectors||[]).join(', '))}" placeholder="teknoloji, egitim, finans">
          <div class="grid cols-2">
            <div><label>Bütçe Alt Sınır (₺)</label><input name="budget_min" type="number" min="0" value="${profile.budget_min}"></div>
            <div><label>Bütçe Üst Sınır (₺)</label><input name="budget_max" type="number" min="0" value="${profile.budget_max}"></div>
          </div>
          <label>Şehir</label><input name="city" value="${esc(profile.city)}">
          <label>Hedef Kitle</label>
          <input name="target_audience" value="${esc(profile.target_audience)}" placeholder="üniversite öğrencileri, 18-25 yaş">
          <label>Açıklama</label><textarea name="description" rows="3">${esc(profile.description)}</textarea>
          <label>Web sitesi</label><input name="website" value="${esc(profile.website)}">
          <button style="margin-top:16px">Kaydet</button>
        </form>`;
    }
    document.getElementById('pf').onsubmit = async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = Object.fromEntries(fd.entries());
      if (me.role === 'sponsor') {
        body.sectors = String(body.sectors || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        body.budget_min = parseInt(body.budget_min, 10) || 0;
        body.budget_max = parseInt(body.budget_max, 10) || 0;
      }
      try { await api('/profiles/me', { method: 'PUT', body }); toast('Profil kaydedildi ✔'); }
      catch (err) { toast(err.message, true); }
    };
  }

  // ---------- yonlendirici ----------
  const routes = {
    '/auth': viewAuth,
    '/dashboard': viewDashboard,
    '/events': viewEvents,
    '/my-events': viewMyEvents,
    '/event-new': () => viewEventForm(null),
    '/matches': viewMatches,
    '/offers': viewOffers,
    '/messages': viewMessages,
    '/profile': viewProfile
  };

  async function router() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    const hash = location.hash.slice(1) || '/dashboard';
    const [path, query] = hash.split('?');
    const params = new URLSearchParams(query || '');

    if (!me && path !== '/auth') { location.hash = '#/auth'; return; }
    if (me && path === '/auth') { location.hash = '#/dashboard'; return; }
    renderNav();

    try {
      if (path.startsWith('/event/')) return await viewEventDetail(path.split('/')[2]);
      if (path.startsWith('/event-edit/')) return await viewEventForm(path.split('/')[2]);
      const view = routes[path] || viewDashboard;
      await view(params);
    } catch (err) {
      app.innerHTML = `<div class="card" style="border-color:var(--red)">
        <h3>Hata</h3><p class="muted">${esc(err.message)}</p></div>`;
    }
  }

  window.addEventListener('hashchange', router);

  // ---------- baslangic ----------
  (async () => {
    const token = localStorage.getItem('sm_token');
    if (token) {
      try { me = (await api('/auth/me')).user; }
      catch { localStorage.removeItem('sm_token'); }
    }
    if (!location.hash) location.hash = me ? '#/dashboard' : '#/auth';
    router();
  })();
})();
