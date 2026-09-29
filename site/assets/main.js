// Zazou e-ticaret demosu — tüm durum tarayıcıda (localStorage). Sunucu yok, hiçbir veri gönderilmez.
import PRODUCTS from '../../data/products.json';
import STORE from '../../data/store.json';
import reelsMp4 from './video/zazou-reels-1080x1920.mp4?url';
import reelsWebm from './video/zazou-reels-1080x1920.webm?url';
import reelsPoster from './video/reels-poster.webp?url';

const IMG = import.meta.glob('./img/urun/*-600.webp', { eager: true, query: '?url', import: 'default' });
const imgUrl = (file) => IMG[`./img/urun/${file}-600.webp`];
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ph = (s) => esc(s).replace(/\[([^\]]+)\]/g, '<span class="ph">[$1]</span>');
const bySlug = Object.fromEntries(PRODUCTS.map((p) => [p.slug, p]));
const colName = (slug) => STORE.collections.find((c) => c.slug === slug)?.name ?? slug;
const money = (n) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: STORE.currency }).format(n);

// ---------- depolama (hata durumunda sessizce bellekte çalışır) ----------
const mem = {};
const load = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return k in mem ? mem[k] : d; } };
const save = (k, v) => { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const K = { cart: 'zazou-cart', meta: 'zazou-cart-meta', fav: 'zazou-fav', orders: 'zazou-orders', cards: 'zazou-kartlar', cookie: 'zazou-cookie' };

// ---------- sepet ----------
const cart = {
  items: () => load(K.cart, []).filter((i) => bySlug[i.slug]),
  set(items) { save(K.cart, items); renderCartViews(); },
  add(slug, variants, qty) {
    const key = slug + '|' + Object.values(variants).join('/');
    const items = cart.items();
    const hit = items.find((i) => i.key === key);
    if (hit) hit.qty = Math.min(10, hit.qty + qty); else items.push({ key, slug, variants, qty });
    cart.set(items);
  },
  qty(key, q) { cart.set(cart.items().map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(10, q)) } : i))); },
  remove(key) { cart.set(cart.items().filter((i) => i.key !== key)); },
  count: () => cart.items().reduce((a, i) => a + i.qty, 0),
  meta: () => load(K.meta, { gift: false, note: '', code: '' }),
  setMeta(m) { save(K.meta, { ...cart.meta(), ...m }); renderCartViews(); },
};

function totals() {
  const items = cart.items(), meta = cart.meta(), C = STORE.cart;
  const priced = items.every((i) => typeof bySlug[i.slug].price === 'number');
  const sub = priced ? items.reduce((a, i) => a + bySlug[i.slug].price * i.qty, 0) : null;
  const pct = meta.code && C.discountCodes[meta.code] ? C.discountCodes[meta.code] : 0;
  const disc = pct && sub !== null ? sub * pct / 100 : null;
  const gift = meta.gift ? (typeof C.giftWrapFee === 'number' ? C.giftWrapFee : null) : 0;
  let progress, freeShip = false;
  if (sub !== null && typeof C.freeShippingThreshold === 'number') { progress = Math.min(1, sub / C.freeShippingThreshold); freeShip = progress >= 1; }
  else { progress = Math.min(1, cart.count() / C.demoProgressItems); freeShip = progress >= 1; }
  const ship = freeShip ? 0 : (typeof C.shippingFee === 'number' ? C.shippingFee : null);
  const total = [sub, disc === null && pct ? null : -(disc || 0), gift, ship].some((v) => v === null) ? null : sub - (disc || 0) + gift + ship;
  return { items, sub, pct, disc, gift, meta, ship, freeShip, progress, total, priced };
}

function totalsHTML(t) {
  const C = STORE.cart;
  const row = (l, v, cls = '') => `<div class="t-row ${cls}"><span>${l}</span><span>${v}</span></div>`;
  return `<div class="totals">
    ${row('Ara toplam', t.sub !== null ? money(t.sub) : ph('[ARA TOPLAM]'))}
    ${t.pct ? row(`İndirim (${esc(t.meta.code)})`, `−%${t.pct}${t.disc !== null ? ' · −' + money(t.disc) : ''}`, 'disc') : ''}
    ${t.meta.gift ? row('Hediye paketi', t.gift !== null ? money(t.gift) : ph(C.giftWrapLabel)) : ''}
    ${row('Kargo', t.freeShip ? 'Ücretsiz' : (t.ship !== null ? money(t.ship) : ph(C.shippingFeeLabel)))}
    ${row('Toplam', t.total !== null ? money(t.total) : ph('[TOPLAM]'), 'grand')}
  </div>`;
}

function progressHTML(t) {
  const pctTxt = Math.round(t.progress * 100);
  return `<div class="ship-progress">
    <p>${t.freeShip ? '<strong>Ücretsiz kargo kazandın!</strong>' : `${ph(STORE.cart.freeShippingLabel)} üzeri kargo ücretsiz. ${t.priced && typeof STORE.cart.freeShippingThreshold === 'number' ? '' : ph('[KALAN TUTAR]') + ' kaldı.'}`}</p>
    <div class="bar" role="progressbar" aria-label="Ücretsiz kargoya ilerleme" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pctTxt}"><span style="width:${pctTxt}%"></span></div>
    ${t.priced && typeof STORE.cart.freeShippingThreshold === 'number' ? '' : `<p class="help">Demo: fiyatlar girilene kadar çubuk ürün adedine göre ilerler (${STORE.cart.demoProgressItems} ürün = ücretsiz).</p>`}
  </div>`;
}

const variantText = (v) => Object.entries(v).map(([k, val]) => `${esc(k)}: ${esc(val)}`).join(' · ');

function lineHTML(i, mode) {
  const p = bySlug[i.slug];
  const controls = mode === 'mini' ? `<span class="muted">Adet: ${i.qty}</span>` : `
    <div class="qty sm" role="group" aria-label="${esc(p.name)} adedi">
      <button type="button" data-line-qty="-1" data-key="${esc(i.key)}" aria-label="Azalt">−</button>
      <output aria-live="polite">${i.qty}</output>
      <button type="button" data-line-qty="1" data-key="${esc(i.key)}" aria-label="Artır">+</button>
    </div>
    <button type="button" class="linklike" data-line-remove data-key="${esc(i.key)}">Sil<span class="sr-only"> ${esc(p.name)}</span></button>`;
  return `<li class="line">
    <img src="${imgUrl(p.images[0].file)}" width="72" height="72" alt="">
    <div class="line-info"><a href="urun-${p.slug}.html"><strong>${esc(p.name)}</strong></a><span class="muted">${variantText(i.variants)}</span><span class="price">${ph(p.priceLabel)}</span><div class="line-ctrl">${controls}</div></div>
  </li>`;
}

function renderCartViews() {
  const t = totals();
  const n = cart.count();
  $$('[data-cart-count]').forEach((b) => { b.textContent = n; b.hidden = !n; });
  $$('[data-cart-open]').forEach((b) => b.setAttribute('aria-label', `Sepeti aç (${n} ürün)`));
  $$('[data-needs-items]').forEach((a) => { if (n) a.removeAttribute('aria-disabled'); else a.setAttribute('aria-disabled', 'true'); a.classList.toggle('is-disabled', !n); });
  $$('[data-cart-view]').forEach((el) => {
    const mode = el.dataset.cartView;
    if (!t.items.length) {
      el.innerHTML = `<div class="empty-cart"><p class="zelie">Sepetin boş… pas encore.</p><p><a class="btn alt" href="magaza.html">Mağazaya göz at</a></p></div>`;
      return;
    }
    el.innerHTML = `${mode !== 'mini' ? progressHTML(t) : ''}<ul class="lines">${t.items.map((i) => lineHTML(i, mode)).join('')}</ul>${mode === 'drawer' ? totalsHTML(t) : ''}`;
  });
  $$('[data-totals]').forEach((el) => { el.innerHTML = t.items.length ? totalsHTML(t) : ''; });
}

document.addEventListener('click', (e) => {
  const q = e.target.closest('[data-line-qty]');
  if (q) { const it = cart.items().find((i) => i.key === q.dataset.key); if (it) cart.qty(it.key, it.qty + Number(q.dataset.lineQty)); return; }
  const r = e.target.closest('[data-line-remove]');
  if (r) { cart.remove(r.dataset.key); announce('Ürün sepetten çıkarıldı.'); return; }
  const na = e.target.closest('[data-needs-items][aria-disabled="true"]');
  if (na) { e.preventDefault(); announce('Sepetin boş.'); }
});

// ekran okuyucu duyurusu
const live = document.createElement('p');
live.className = 'sr-only'; live.setAttribute('aria-live', 'polite'); document.body.append(live);
function announce(msg) { live.textContent = ''; setTimeout(() => { live.textContent = msg; }, 30); }

// ---------- sepet çekmecesi ----------
const drawer = $('#cart-drawer'), backdrop = $('.drawer-backdrop');
let lastFocus = null;
function openDrawer() {
  lastFocus = document.activeElement;
  drawer.hidden = false; backdrop.hidden = false;
  requestAnimationFrame(() => { drawer.classList.add('open'); backdrop.classList.add('open'); });
  document.body.classList.add('no-scroll');
  drawer.focus();
}
function closeDrawer() {
  drawer.classList.remove('open'); backdrop.classList.remove('open');
  document.body.classList.remove('no-scroll');
  setTimeout(() => { drawer.hidden = true; backdrop.hidden = true; }, 200);
  lastFocus?.focus();
}
$$('[data-cart-open]').forEach((b) => b.addEventListener('click', openDrawer));
$$('[data-cart-close]').forEach((b) => b.addEventListener('click', closeDrawer));
drawer.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDrawer();
  if (e.key === 'Tab') {
    const f = $$('a[href],button:not([disabled]),input,select,textarea', drawer).filter((x) => x.offsetParent);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
  }
});

// ---------- menü ----------
const toggle = $('.nav-toggle'), nav = $('#site-nav');
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open)); nav.classList.toggle('open', !open);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav?.classList.contains('open')) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
});

// ---------- favoriler ----------
const favs = () => load(K.fav, []);
function renderFavs() {
  const f = favs();
  $$('[data-fav]').forEach((b) => {
    const on = f.includes(b.dataset.fav);
    b.setAttribute('aria-pressed', String(on));
    const name = bySlug[b.dataset.fav]?.name ?? '';
    b.setAttribute('aria-label', on ? `${name} favorilerden çıkar` : `${name} favorilere ekle`);
  });
  $$('[data-fav-count]').forEach((b) => { b.textContent = f.length; b.hidden = !f.length; });
  const list = $('[data-fav-list]');
  if (list) {
    $$('.product-tile', list).forEach((t) => { t.hidden = !f.includes(t.dataset.product); });
    $('[data-fav-empty]').hidden = !!f.length;
  }
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-fav]'); if (!b) return;
  e.preventDefault();
  const s = b.dataset.fav, f = favs();
  const on = !f.includes(s);
  save(K.fav, on ? [...f, s] : f.filter((x) => x !== s));
  renderFavs(); announce(on ? 'Favorilere eklendi.' : 'Favorilerden çıkarıldı.');
});

// ---------- çerez bildirimi ----------
const cookieBar = $('.cookie');
if (cookieBar) {
  if (!load(K.cookie, null)) cookieBar.hidden = false;
  $$('[data-cookie]', cookieBar).forEach((b) => b.addEventListener('click', () => { save(K.cookie, { choice: b.dataset.cookie, at: new Date().toISOString() }); cookieBar.hidden = true; }));
  $$('[data-cookie-settings]').forEach((b) => b.addEventListener('click', () => { cookieBar.hidden = false; $('button', cookieBar).focus(); }));
}

// ---------- hero videosu ----------
const video = $('.hero video');
if (video) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (matchMedia('(max-width: 699px) and (orientation: portrait)').matches) {
    video.poster = reelsPoster;
    video.innerHTML = `<source src="${reelsWebm}" type="video/webm"><source src="${reelsMp4}" type="video/mp4">`;
    video.load();
  }
  const btn = $('.hero-ctrl');
  const setLabel = () => { btn.textContent = video.paused ? '▶ Oynat' : '❚❚ Durdur'; btn.setAttribute('aria-label', video.paused ? 'Videoyu oynat' : 'Videoyu durdur'); };
  if (reduce) { video.removeAttribute('autoplay'); video.pause(); } else video.play().catch(() => {});
  btn.addEventListener('click', () => (video.paused ? video.play() : video.pause()));
  video.addEventListener('play', setLabel); video.addEventListener('pause', setLabel); setLabel();
}

// ---------- e-bülten / haber ver / sahte giriş ----------
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
$('[data-newsletter]')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.currentTarget, inp = f.email, err = $('.error', f), ok = $('.notice', f);
  if (!emailOk(inp.value.trim())) { err.textContent = 'Geçerli bir e-posta adresi yaz.'; err.hidden = false; inp.setAttribute('aria-invalid', 'true'); inp.focus(); return; }
  err.hidden = true; inp.removeAttribute('aria-invalid'); inp.value = '';
  ok.hidden = false; ok.textContent = 'Teşekkürler! Z.’nin ilk mektubu yolda. (Demo — adres kaydedilmedi.)';
});
$('[data-restock]')?.addEventListener('click', (e) => {
  const box = e.target.closest('.restock'), inp = $('input', box), ok = $('.notice', box);
  ok.hidden = false;
  ok.textContent = emailOk(inp.value.trim()) ? 'Teşekkürler! Stoğa girince haber vereceğiz. (Demo — adres kaydedilmedi.)' : 'Geçerli bir e-posta adresi yaz.';
});
$$('[data-fake-auth]').forEach((f) => f.addEventListener('submit', (e) => {
  e.preventDefault(); const ok = $('.notice', f); ok.hidden = false;
  ok.textContent = 'Demo — gerçek hesap yok; giriş veya kayıt yapılmadı, bilgi saklanmadı.';
  $$('input[type=password]', f).forEach((i) => { i.value = ''; });
}));

// ---------- ürün sayfası ----------
const pp = $('[data-product-page]');
if (pp) {
  const slug = pp.dataset.productPage;
  $$('[data-thumb]', pp).forEach((b) => b.addEventListener('click', () => {
    $$('[data-slide]', pp).forEach((s) => { s.hidden = s.dataset.slide !== b.dataset.thumb; });
    $$('[data-thumb]', pp).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  }));
  const form = $('[data-buy-form]', pp), qty = form.qty;
  $$('[data-qty]', form).forEach((b) => b.addEventListener('click', () => { qty.value = Math.max(1, Math.min(10, (+qty.value || 1) + Number(b.dataset.qty))); }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (bySlug[slug].stock !== 'in_stock') return;
    const variants = {};
    $$('input[type=radio]:checked', form).forEach((r) => { variants[r.dataset.vname] = r.value; });
    cart.add(slug, variants, Math.max(1, Math.min(10, +qty.value || 1)));
    announce(`${bySlug[slug].name} sepete eklendi.`);
    openDrawer();
  });
}

// ---------- listeleme: filtre ve sıralama ----------
const listing = $('[data-listing]');
if (listing) {
  const ctl = $('[data-listing-controls]');
  const tiles = $$('.product-tile', listing);
  const params = new URLSearchParams(location.search);
  if (ctl.collection && params.get('koleksiyon')) ctl.collection.value = params.get('koleksiyon');
  const apply = () => {
    const col = ctl.collection?.value || '', fam = ctl.family.value, sort = ctl.sort.value;
    const hasPrices = tiles.every((t) => t.dataset.price !== '');
    const val = (t) => ({ new: +t.dataset.new, 'price-asc': +t.dataset.price, 'price-desc': -t.dataset.price })[sort];
    const sorted = [...tiles].sort((a, b) => (sort === 'featured' || (sort.startsWith('price') && !hasPrices)) ? tiles.indexOf(a) - tiles.indexOf(b) : val(a) - val(b));
    sorted.forEach((t) => listing.append(t));
    let n = 0;
    tiles.forEach((t) => { const show = (!col || t.dataset.collection === col) && (!fam || t.dataset.family === fam); t.hidden = !show; n += show; });
    $('[data-sort-note]').hidden = !(sort.startsWith('price') && !hasPrices);
    $('[data-result-count]').textContent = `${n} ürün`;
    $('[data-empty]').hidden = n > 0;
  };
  ctl.addEventListener('change', apply);
  $('[data-clear-filters]')?.addEventListener('click', () => { ctl.reset(); apply(); });
  apply();
}

// ---------- arama ----------
const norm = (s) => s.toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');
const results = $('[data-search-results]');
if (results) {
  const q = new URLSearchParams(location.search).get('q') || '';
  const input = $('#q-page'); input.value = q;
  const run = (term) => {
    const t = norm(term.trim());
    let n = 0;
    $$('.product-tile', results).forEach((tile) => {
      const p = bySlug[tile.dataset.product];
      const hit = !t || norm(`${p.name} ${colName(p.collection)}`).includes(t);
      tile.hidden = !hit; n += hit;
    });
    $('[data-search-status]').textContent = t ? (n ? `“${term.trim()}” için ${n} sonuç` : `“${term.trim()}” için sonuç bulunamadı. Koleksiyon adıyla da arayabilirsin: Swirl, Kala, After Dark…`) : 'Tüm ürünler';
  };
  input.addEventListener('input', () => run(input.value));
  run(q);
}
const headQ = $('#q-head');
if (headQ && location.pathname.endsWith('arama.html')) headQ.value = new URLSearchParams(location.search).get('q') || '';

// ---------- sepet sayfası: hediye, not, indirim kodu ----------
const gift = $('[data-gift]');
if (gift) {
  const m = cart.meta();
  gift.checked = !!m.gift; $('[data-order-note]').value = m.note || '';
  gift.addEventListener('change', () => cart.setMeta({ gift: gift.checked }));
  $('[data-order-note]').addEventListener('input', (e) => save(K.meta, { ...cart.meta(), note: e.target.value }));
  const df = $('[data-discount-form]'), msg = $('#code-msg');
  if (m.code) { df.code.value = m.code; msg.textContent = `${m.code} uygulandı: %${STORE.cart.discountCodes[m.code]} indirim.`; }
  df.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = df.code.value.trim().toUpperCase();
    if (!code) { cart.setMeta({ code: '' }); msg.textContent = 'Kod kaldırıldı.'; return; }
    if (STORE.cart.discountCodes[code]) { cart.setMeta({ code }); msg.textContent = `${code} uygulandı: %${STORE.cart.discountCodes[code]} indirim.`; df.code.removeAttribute('aria-invalid'); }
    else { msg.textContent = 'Bu kod geçerli değil. (Demo kodu: ZAZOU10)'; df.code.setAttribute('aria-invalid', 'true'); }
  });
}

// ---------- ödeme ----------
const co = $('[data-checkout]');
if (co) {
  if (!cart.items().length) {
    co.innerHTML = `<div class="tile pad"><p class="zelie">Sepetin boş… pas encore.</p><p>Ödeme adımlarını görmek için önce sepete bir ürün ekle.</p><p><a class="btn" href="magaza.html">Mağazaya git</a></p></div>`;
  } else {
    const steps = $$('[data-step]', co), tabs = $$('[data-step-tab]', co);
    const setErr = (el, msg) => {
      const e = el.closest('.field')?.querySelector('.error');
      if (msg) { el.setAttribute('aria-invalid', 'true'); if (e) { e.textContent = msg; e.hidden = false; e.id ||= el.id + '-err'; el.setAttribute('aria-describedby', e.id); } }
      else { el.removeAttribute('aria-invalid'); if (e) e.hidden = true; }
    };
    const check = (step) => {
      let first = null;
      $$('input[required],select[required],textarea[required]', step).forEach((el) => {
        if (el.type === 'checkbox') return;
        let msg = '';
        const v = el.value.trim();
        if (!v) msg = 'Bu alan zorunlu.';
        else if (el.type === 'email' && !emailOk(v)) msg = 'Geçerli bir e-posta adresi yaz.';
        else if (el.type === 'tel' && v.replace(/\D/g, '').length < 10) msg = 'Telefon numarası en az 10 haneli olmalı.';
        setErr(el, msg); if (msg && !first) first = el;
      });
      first?.focus();
      return !first;
    };
    const go = (n) => {
      steps.forEach((s) => { const on = s.dataset.step === String(n); s.disabled = !on; s.classList.toggle('active', on); s.classList.toggle('done', +s.dataset.step < n); });
      tabs.forEach((t) => { if (t.dataset.stepTab === String(n)) t.setAttribute('aria-current', 'step'); else t.removeAttribute('aria-current'); t.classList.toggle('done', +t.dataset.stepTab < n); });
      const s = steps[n - 1]; s.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      $('input:not([disabled]),select:not([disabled]),button', s)?.focus({ preventScroll: true });
    };
    $$('[data-next]', co).forEach((b) => b.addEventListener('click', () => { if (check(b.closest('[data-step]'))) go(+b.dataset.next); }));
    $$('[data-prev]', co).forEach((b) => b.addEventListener('click', () => go(+b.dataset.prev)));
    go(1);

    // il → ilçe
    const il = $('#a-il'), ilce = $('#a-ilce');
    import('../../data/il-ilce.json').then(({ default: data }) => {
      il.addEventListener('change', () => {
        const rec = data.find((x) => x.name === il.value);
        ilce.innerHTML = rec ? '<option value="">İlçe seç</option>' + [...rec.districts].sort((a, b) => a.localeCompare(b, 'tr')).map((d) => `<option>${esc(d)}</option>`).join('') : '<option value="">Önce il seç</option>';
        ilce.disabled = !rec;
      });
    });

    co.addEventListener('submit', (e) => {
      e.preventDefault();
      const a = $('#ok-onbilgi'), b = $('#ok-mesafeli'), err = $('[data-consent-error]');
      if (!a.checked || !b.checked) { err.hidden = false; (a.checked ? b : a).focus(); return; }
      err.hidden = true;
      const t = totals();
      const collected = load(K.cards, [1, 2, 3]);
      const pool = Array.from({ length: 18 }, (_, i) => i + 1).filter((n) => !collected.includes(n));
      const card = (pool.length ? pool : Array.from({ length: 18 }, (_, i) => i + 1))[Math.floor(Math.random() * (pool.length || 18))];
      const order = {
        no: 'ZZ-DEMO-' + String(Math.floor(10000 + Math.random() * 90000)),
        date: new Date().toISOString(),
        items: t.items.map((i) => ({ slug: i.slug, name: bySlug[i.slug].name, variants: i.variants, qty: i.qty })),
        shipping: co.shipping.value, code: t.meta.code || '', gift: !!t.meta.gift, card,
      }; // adres, iletişim ve kart bilgisi SAKLANMAZ
      save(K.orders, [order, ...load(K.orders, [])].slice(0, 20));
      save(K.cards, [...new Set([...collected, card])]);
      save(K.cart, []); save(K.meta, { gift: false, note: '', code: '' });
      location.href = 'siparis-onay.html?no=' + encodeURIComponent(order.no);
    });
  }
}

// ---------- sipariş özeti ----------
const orderSummary = (o) => `<ul class="lines">${o.items.map((i) => { const p = bySlug[i.slug]; return `<li class="line"><img src="${imgUrl(p.images[0].file)}" width="72" height="72" alt=""><div class="line-info"><strong>${esc(i.name)}</strong><span class="muted">${variantText(i.variants)}</span><span class="muted">Adet: ${i.qty} · ${ph(p.priceLabel)}</span></div></li>`; }).join('')}</ul>
  <dl class="specs"><dt>Tarih</dt><dd>${new Date(o.date).toLocaleString('tr-TR')}</dd><dt>Kargo</dt><dd>${esc(STORE.shippingOptions.find((s) => s.id === o.shipping)?.name ?? '')}</dd>${o.code ? `<dt>İndirim</dt><dd>${esc(o.code)} (−%${STORE.cart.discountCodes[o.code]})</dd>` : ''}${o.gift ? '<dt>Hediye paketi</dt><dd>Evet</dd>' : ''}<dt>Toplam</dt><dd>${ph('[TOPLAM]')}</dd></dl>`;

const conf = $('[data-confirm]');
if (conf) {
  const no = new URLSearchParams(location.search).get('no');
  const o = load(K.orders, []).find((x) => x.no === no);
  if (o) { $('[data-order-no]').textContent = o.no; $('[data-order-summary]').innerHTML = orderSummary(o) + '<p class="help">Demo: kart defterine bir kartpostal eklendi. Hangisi olduğunu Kartpostal koleksiyonum’da görebilirsin.</p>'; }
  else $('[data-order-summary]').innerHTML = '<p>Bu tarayıcıda böyle bir demo sipariş bulunamadı.</p>';
}
const ordersEl = $('[data-orders]');
if (ordersEl) {
  const os = load(K.orders, []);
  ordersEl.innerHTML = os.length ? os.map((o) => `<details class="tile pad order"><summary><strong>${esc(o.no)}</strong> · ${new Date(o.date).toLocaleDateString('tr-TR')} · ${o.items.reduce((a, i) => a + i.qty, 0)} ürün · <span class="tag light">Demo</span></summary>${orderSummary(o)}</details>`).join('')
    : '<div class="tile pad"><p style="margin:0">Henüz demo siparişin yok. <a href="magaza.html">Bir ürün seçip</a> ödeme adımlarını dene.</p></div>';
}

// ---------- kart defteri ----------
const grid = $('.cards20');
if (grid) {
  let got = load(K.cards, null);
  if (!Array.isArray(got)) got = [1, 2, 3];
  const count = $('.count');
  const sync = () => {
    $$('button[data-n]', grid).forEach((b) => { if (!b.disabled) b.setAttribute('aria-pressed', String(got.includes(+b.dataset.n))); });
    if (count) count.textContent = `${got.filter((n) => n <= 18).length} / 20 kart toplandı`;
    save(K.cards, got);
  };
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-n]'); if (!b || b.disabled) return;
    const n = +b.dataset.n; got = got.includes(n) ? got.filter((x) => x !== n) : [...got, n]; sync();
  });
  $('[data-reset]')?.addEventListener('click', () => { got = [1, 2, 3]; sync(); });
  sync();
}

// başka sekmede değişirse güncelle
addEventListener('storage', () => { renderCartViews(); renderFavs(); });
renderCartViews();
renderFavs();
