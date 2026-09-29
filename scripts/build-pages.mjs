// site/ altındaki HTML sayfalarını data/*.json verilerinden üretir.
import fs from 'node:fs';
import { CARDS } from './cards.mjs';

const PRODUCTS = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));
const STORE = JSON.parse(fs.readFileSync('data/store.json', 'utf8'));
const COLS = STORE.collections;
const colName = (slug) => COLS.find((c) => c.slug === slug)?.name ?? slug;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ph = (s) => String(s).replace(/\[([^\]]+)\]/g, '<span class="ph">[$1]</span>');
const HUK = '<p class="legal-ph"><span class="ph">[HUKUKÇU TARAFINDAN DOLDURULACAK]</span></p>';

// ---------- ikonlar ----------
const I = {
  search: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.8 4.5 7.2 4.5c2 0 3.5 1.1 4.8 2.8 1.3-1.7 2.8-2.8 4.8-2.8 3.4 0 5.6 3.1 4.4 6.6-1.7 4.8-9.2 9.4-9.2 9.4z" fill="var(--heart-fill,none)" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="8.5" r="4" fill="none" stroke="currentColor" stroke-width="2.3"/><path d="M4 21c.8-4.2 4-6.5 8-6.5s7.2 2.3 8 6.5" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/></svg>',
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 8h14l-1.2 12.5H6.2z" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/><path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8" fill="none" stroke="currentColor" stroke-width="2.3"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
};

const NAV = [
  ['magaza.html', 'Mağaza'], ['koleksiyonlar.html', 'Koleksiyonlar'], ['z-kim.html', 'Z. kim?'],
  ['kartpostallar.html', '20 Kartpostal'], ['hakkimizda.html', 'Hakkımızda'], ['iletisim.html', 'İletişim'],
];
const LEGAL = [
  ['mesafeli-satis-sozlesmesi.html', 'Mesafeli satış sözleşmesi'], ['on-bilgilendirme-formu.html', 'Ön bilgilendirme formu'],
  ['iade-ve-cayma.html', 'İade ve cayma hakkı'], ['kvkk-aydinlatma-metni.html', 'KVKK aydınlatma metni'],
  ['cerez-politikasi.html', 'Çerez politikası'], ['gizlilik-politikasi.html', 'Gizlilik politikası'], ['kargo-ve-teslimat.html', 'Kargo ve teslimat'],
];

function layout({ file, title, desc, body, navKey = file, page = 'default', noindexOnly = false }) {
  const full = file === 'index.html' ? `Zazou · ${STORE.slogan}` : `${title} · Zazou`;
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#FF4F9A">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${STORE.baseUrl}og-image.jpg">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/shrikhand-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/style.css">
<script type="module" src="assets/main.js"></script>
</head>
<body data-page="${page}">
<a class="skip" href="#icerik">İçeriğe geç</a>
<div class="announce" role="region" aria-label="Duyuru">
  <p><span class="mini-card" aria-hidden="true"></span> Her siparişte bir Zazou kartpostalı <span class="sep" aria-hidden="true">·</span> <span class="ph-inv">[TUTAR]</span> üzeri ücretsiz kargo</p>
</div>
<div class="demo-bar" role="note"><b>DEMO</b> · gerçek ödeme alınmaz, sipariş oluşmaz · fiyatlar yer tutucudur</div>
<header class="site-head">
  <div class="wrap head-row">
    <button class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span class="bars" aria-hidden="true"></span><span class="sr-only">Menü</span></button>
    <a class="logo" href="index.html" aria-label="Zazou, ana sayfa">Zazou<small aria-hidden="true">Somewhere by the Sea</small></a>
    <nav id="site-nav" class="site-nav" aria-label="Ana menü">
      <ul>${NAV.map(([h, t]) => `<li><a href="${h}"${h === navKey ? ' aria-current="page"' : ''}>${t}</a></li>`).join('')}<li class="nav-extra"><a href="arama.html">Arama</a></li><li class="nav-extra"><a href="favoriler.html">Favoriler</a></li><li class="nav-extra"><a href="hesabim.html">Hesabım</a></li></ul>
    </nav>
    <div class="head-tools">
      <form class="head-search" action="arama.html" method="get" role="search">
        <label class="sr-only" for="q-head">Ürün ara</label>
        <input id="q-head" name="q" type="search" placeholder="Ara…" autocomplete="off">
        <button class="icon-btn" type="submit" aria-label="Ara">${I.search}</button>
      </form>
      <a class="icon-btn show-sm" href="arama.html" aria-label="Ara">${I.search}</a>
      <a class="icon-btn hide-sm" href="favoriler.html" aria-label="Favoriler">${I.heart}<span class="badge" data-fav-count hidden></span></a>
      <a class="icon-btn hide-sm" href="hesabim.html" aria-label="Hesabım">${I.user}</a>
      <button class="icon-btn" type="button" data-cart-open aria-controls="cart-drawer" aria-label="Sepeti aç">${I.bag}<span class="badge" data-cart-count hidden></span></button>
    </div>
  </div>
</header>
<main id="icerik">
${body}
</main>
${footer()}
${drawer()}
${cookie()}
</body>
</html>
`;
}

function footer() {
  return `<footer class="site-foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <p class="logo">Zazou<small>Somewhere by the Sea</small></p>
        <p>Renkli mumlar, deniz kenarında bir evden. Zor zamanda renkli kalmanın inadıyla.</p>
        <p><a href="${STORE.instagram}" rel="noopener">${STORE.instagramHandle}</a> · #ZazouKartları</p>
      </div>
      <nav aria-label="Mağaza"><h2 class="foot-h">Mağaza</h2><ul>${NAV.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}<li><a href="hesabim.html">Hesabım</a></li><li><a href="favoriler.html">Favoriler</a></li><li><a href="sepet.html">Sepet</a></li></ul></nav>
      <nav aria-label="Yasal"><h2 class="foot-h">Yasal</h2><ul>${LEGAL.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}<li><button type="button" class="linklike" data-cookie-settings>Çerez tercihleri</button></li></ul></nav>
    </div>
    <div class="foot-legal">
      <p>${ph(STORE.company.title)} · ${ph(STORE.company.address)} · ${ph(STORE.company.taxId)}</p>
      <ul class="logo-ph" aria-label="Ödeme ve kargo logoları için yer tutucular">
        <li>[ÖDEME LOGOSU]</li><li>[ÖDEME LOGOSU]</li><li>[ÖDEME LOGOSU]</li><li>[KARGO LOGOSU]</li><li>[KARGO LOGOSU]</li>
      </ul>
      <p class="fine">Bu site bir demodur: gerçek ödeme alınmaz, gerçek sipariş oluşmaz. Alan adı ileride ${STORE.domain} olacak. Karakterler ve olaylar kurgudur.</p>
    </div>
  </div>
  <div class="rainbow" aria-hidden="true"></div>
</footer>`;
}

function drawer() {
  return `<div class="drawer-backdrop" data-cart-close hidden></div>
<aside id="cart-drawer" class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" hidden tabindex="-1">
  <div class="drawer-head">
    <h2 id="drawer-title">Sepetin</h2>
    <button class="icon-btn" type="button" data-cart-close aria-label="Sepeti kapat">${I.close}</button>
  </div>
  <div class="drawer-body" data-cart-view="drawer"></div>
  <div class="drawer-foot">
    <a class="btn ghost block" href="sepet.html">Sepete git</a>
    <a class="btn block" href="odeme.html" data-needs-items>Ödemeye geç</a>
  </div>
</aside>`;
}

function cookie() {
  return `<div class="cookie" role="region" aria-label="Çerez bildirimi" hidden>
  <p>Bu demo yalnızca tarayıcında sepet, favori ve tercihlerini saklamak için yerel depolama kullanır. Analitik veya reklam çerezi yok. <a href="cerez-politikasi.html">Çerez politikası</a></p>
  <div class="cookie-btns"><button class="btn ghost" type="button" data-cookie="necessary">Sadece gerekli</button><button class="btn" type="button" data-cookie="all">Kabul et</button></div>
</div>`;
}

// ---------- parçalar ----------
const img = (file, alt, sizes, { lazy = true, cls = '' } = {}) =>
  `<img${cls ? ` class="${cls}"` : ''} src="assets/img/urun/${file}-600.webp" srcset="assets/img/urun/${file}-600.webp 600w, assets/img/urun/${file}-1200.webp 1200w" sizes="${sizes}" width="600" height="600" alt="${esc(alt)}"${lazy ? ' loading="lazy" decoding="async"' : ''}>`;

const favBtn = (p, cls = 'fav-btn') => `<button class="${cls}" type="button" data-fav="${p.slug}" aria-pressed="false" aria-label="${esc(p.name)} favorilere ekle">${I.heart}</button>`;

const productTile = (p) => `<article class="tile product-tile" data-product="${p.slug}" data-collection="${p.collection}" data-family="${esc(p.scentFamily)}" data-new="${p.newRank}" data-price="${p.price ?? ''}" data-name="${esc(p.name)}">
  <a class="tile-link" href="urun-${p.slug}.html">
    ${img(p.images[0].file, p.images[0].alt, '(min-width: 1200px) 380px, (min-width: 560px) 50vw, 100vw')}
    <div class="body"><span class="tag">${esc(colName(p.collection))}</span><h3>${esc(p.name)}</h3><p class="muted">${esc(p.short)}</p>
      <p class="price">${ph(p.priceLabel)}${p.stock === 'out_of_stock' ? ' <span class="stock-out">Tükendi</span>' : ''}</p></div>
  </a>
  ${favBtn(p)}
</article>`;

const colTile = (c) => `<a class="tile col-card" href="koleksiyon-${c.slug}.html">
  <img src="assets/img/banner/koleksiyon-${c.slug}-sm.webp" width="800" height="250" alt="" loading="lazy" decoding="async">
  <div class="body"><h3>${esc(c.name)}</h3><p>${esc(c.tagline)}</p></div>
</a>`;

const families = [...new Set(PRODUCTS.map((p) => p.scentFamily))].sort((a, b) => a.localeCompare(b, 'tr'));
const toolbar = (withCollection) => `<form class="toolbar" data-listing-controls aria-label="Sıralama ve filtre" onsubmit="return false">
  ${withCollection ? `<div class="field"><label for="f-col">Koleksiyon</label><select id="f-col" name="collection"><option value="">Tümü</option>${COLS.map((c) => `<option value="${c.slug}">${esc(c.name)}</option>`).join('')}</select></div>` : ''}
  <div class="field"><label for="f-fam">Koku ailesi</label><select id="f-fam" name="family"><option value="">Tümü</option>${families.map((f) => `<option>${esc(f)}</option>`).join('')}</select></div>
  <div class="field"><label for="f-sort">Sırala</label><select id="f-sort" name="sort"><option value="featured">Öne çıkanlar</option><option value="new">En yeni</option><option value="price-asc">Fiyat: artan</option><option value="price-desc">Fiyat: azalan</option></select></div>
  <p class="toolbar-note" data-sort-note hidden>Fiyatlar henüz girilmediği için fiyat sıralaması şimdilik öne çıkanlar sırasını kullanıyor.</p>
  <p class="count-line" aria-live="polite" data-result-count></p>
</form>`;

const pages = {};

// ---------- ANA SAYFA ----------
pages['index.html'] = layout({
  file: 'index.html', title: 'Ana sayfa', page: 'home',
  desc: 'Zazou: 80\'lerin sonu ve 90\'ların pop renklerinde mumlar. Somewhere by the Sea. (Demo mağaza)',
  body: `
<section class="hero" aria-label="Tanıtım videosu">
  <video autoplay muted loop playsinline preload="metadata" poster="assets/video/hero-poster.webp" aria-label="Animasyon: dalgalanan deniz, pencerede yanan bir mum, süzülerek gelen bir kartpostal ve Zazou, Somewhere by the Sea yazısı. Ses yok.">
    <source src="assets/video/zazou-hero-1920x800.webm" type="video/webm">
    <source src="assets/video/zazou-hero-1920x800.mp4" type="video/mp4">
  </video>
  <button class="hero-ctrl" type="button">❚❚ Durdur</button>
</section>
<div class="wrap hero-intro">
  <p class="eyebrow">Bonjour · Somewhere by the Sea</p>
  <h1>Paris gri kaldı.<br>Bu pencere hiç kararmadı.</h1>
  <p class="lead">Zazou, 1940'ların Paris'inde inatla renkli giyinen gençlerin adı. Bizim hikâyemizde ise bir kız: Z. Bir gece Paris'ten ayrıldı, denize sığındı ve mum yapmayı öğrendi. Bugün onun renkleri, onun kartpostalları ve onun mumları sana geliyor.</p>
  <p class="btn-row"><a class="btn" href="magaza.html">Alışverişe başla</a><a class="btn alt" href="z-kim.html">Z. kim?</a></p>
</div>
<section aria-labelledby="h-kol">
  <div class="wrap">
    <p class="eyebrow">Onun hayatından sahneler</p>
    <h2 id="h-kol">Koleksiyonlar</h2>
    <div class="grid g3" style="margin-top:20px">${COLS.map(colTile).join('')}</div>
  </div>
</section>
<section class="band-yellow" aria-labelledby="h-urun">
  <div class="wrap">
    <p class="eyebrow">İlk mumlar</p>
    <h2 id="h-urun">Öne çıkanlar</h2>
    <div class="grid g3" style="margin-top:20px">${PRODUCTS.map(productTile).join('')}</div>
    <p style="margin-top:28px"><a class="btn" href="magaza.html">Tüm ürünler</a></p>
  </div>
</section>
<section class="band-navy" aria-labelledby="h-oyun">
  <div class="wrap grid g2" style="align-items:center">
    <div>
      <p class="eyebrow" style="color:var(--yellow)">Kartpostal oyunu</p>
      <h2 id="h-oyun">Her pakette bir kartpostal</h2>
      <p>Z. elli yılı aşkın bir süre boyunca Paris'teki arkadaşı Colette'e kartpostal yazdı. Bugün o kartpostallardan 20 tanesi kaldı. Her Zazou siparişinden bunlardan biri çıkıyor; sıra yok, aynı kart tekrar gelebilir.</p>
      <p>Hepsini okuyan, Zazou'nun kim olduğunu ve neden Paris'e hiç dönmediğini öğrenecek. Eksik kartını #ZazouKartları etiketiyle takas edebilirsin.</p>
      <p><a class="btn alt" href="kartpostallar.html">Oyun nasıl işliyor?</a></p>
    </div>
    <div class="fan" aria-hidden="true">
      <img src="assets/img/kart/kart-02-sm.webp" width="480" height="341" alt="" loading="lazy">
      <img src="assets/img/kart/kart-01-sm.webp" width="480" height="341" alt="" loading="lazy">
      <img src="assets/img/kart/kart-03-sm.webp" width="480" height="341" alt="" loading="lazy">
    </div>
  </div>
</section>
<section aria-labelledby="h-bulten">
  <div class="wrap narrow">
    <div class="tile newsletter">
      <h2 id="h-bulten">Z.'den mektup al</h2>
      <p>Yeni kartlar, koleksiyonlar ve lansman haberleri. Ayda en fazla [SIKLIK] e-posta.</p>
      <form data-newsletter novalidate>
        <div class="field inline">
          <label for="nl-email">E-posta adresin</label>
          <input id="nl-email" name="email" type="email" autocomplete="email" required aria-describedby="nl-help nl-err">
          <button class="btn" type="submit">Abone ol</button>
        </div>
        <p id="nl-help" class="help">Demo: adresin hiçbir yere gönderilmez ve saklanmaz.</p>
        <p id="nl-err" class="error" hidden></p>
        <p class="notice" role="status" aria-live="polite" hidden></p>
      </form>
    </div>
  </div>
</section>
<section class="band-pink" aria-labelledby="h-ig">
  <div class="wrap grid g2" style="align-items:center">
    <div>
      <p class="eyebrow">Instagram</p>
      <h2 id="h-ig">Z.'den haber al</h2>
      <p class="lead">Yeni kartlar, takaslar ve lansman haberleri Instagram'da.</p>
      <p><a class="btn" href="${STORE.instagram}" rel="noopener">${STORE.instagramHandle}</a></p>
    </div>
    <img src="assets/img/teaser/teaser-1.webp" width="540" height="675" alt="Instagram gönderisi: gün batımı, deniz ve çizgili bir mumla 'Greetings from Somewhere by the Sea' yazısı." loading="lazy" class="ig-img">
  </div>
</section>`.replace('Ayda en fazla [SIKLIK] e-posta.', `Ayda en fazla ${ph('[SIKLIK]')} e-posta.`),
});

// ---------- MAĞAZA ----------
pages['magaza.html'] = layout({
  file: 'magaza.html', title: 'Mağaza', page: 'listing',
  desc: 'Zazou mumları: tüm ürünler, koleksiyon ve koku ailesine göre filtre.',
  body: `<div class="wrap page-top">
  <p class="eyebrow">Somewhere by the Sea</p>
  <h1>Mağaza</h1>
  <p class="lead">Z.'nin evinden altı mum. Koleksiyona ya da koku ailesine göre süz.</p>
  ${toolbar(true)}
</div>
<section style="padding-top:8px"><div class="wrap"><div class="grid g3" data-listing>${PRODUCTS.map(productTile).join('')}</div>
<p class="empty" data-empty hidden>Bu filtreyle eşleşen ürün yok. <button class="linklike" type="button" data-clear-filters>Filtreleri temizle</button></p></div></section>`,
});

pages['koleksiyonlar.html'] = layout({
  file: 'koleksiyonlar.html', title: 'Koleksiyonlar',
  desc: "Zazou koleksiyonları: X'mas Cha Cha, After Dark, Kaleido Club, Wobble, Swirl, Kala ve kibrit kutuları.",
  body: `<div class="wrap page-top">
  <p class="eyebrow">Somewhere by the Sea</p>
  <h1>Koleksiyonlar</h1>
  <p class="lead">Z.'nin evinden yedi sahne. Önce mumlarla başlıyoruz; zamanla şamdanlar, mum tepsileri ve ev için başka renkli şeyler gelecek.</p>
</div>
<section style="padding-top:20px"><div class="wrap grid g2">${COLS.map(colTile).join('')}</div></section>`,
});

for (const c of COLS) {
  const items = PRODUCTS.filter((p) => p.collection === c.slug);
  pages[`koleksiyon-${c.slug}.html`] = layout({
    file: `koleksiyon-${c.slug}.html`, navKey: 'koleksiyonlar.html', title: c.name, page: 'listing',
    desc: `${c.name}: ${c.tagline} Zazou koleksiyonu (demo).`,
    body: `<div class="col-banner"><img src="assets/img/banner/koleksiyon-${c.slug}.webp" srcset="assets/img/banner/koleksiyon-${c.slug}-sm.webp 800w, assets/img/banner/koleksiyon-${c.slug}.webp 1600w" sizes="100vw" width="1600" height="500" alt="${esc(c.bannerAlt)}"></div>
<div class="wrap">
  <nav class="crumbs" aria-label="Konum"><ol><li><a href="index.html">Ana sayfa</a></li><li><a href="koleksiyonlar.html">Koleksiyonlar</a></li><li aria-current="page">${esc(c.name)}</li></ol></nav>
  <h1 style="margin-top:14px">${esc(c.name)}</h1>
  <p class="lead">${ph(esc(c.desc))}</p>
  <p class="zelie">${esc(c.scene)}</p>
  ${items.length ? toolbar(false) : ''}
</div>
<section style="padding-top:8px"><div class="wrap">
  ${items.length ? `<div class="grid g3" data-listing>${items.map(productTile).join('')}</div><p class="empty" data-empty hidden>Bu filtreyle eşleşen ürün yok. <button class="linklike" type="button" data-clear-filters>Filtreleri temizle</button></p>`
    : `<div class="tile pad"><p class="zelie" style="margin:0 0 6px">Pas encore.</p><p style="margin:0">Bu koleksiyonun ürünleri yakında burada olacak.</p></div>`}
  <p style="margin-top:28px"><a href="koleksiyonlar.html">← Tüm koleksiyonlar</a></p>
</div></section>`,
  });
}

// ---------- ÜRÜN ----------
const SAFETY = [
  'Yanan mumu asla gözetimsiz bırakma.',
  'Her yakmadan önce fitili yaklaşık 5 mm olacak şekilde kısalt.',
  'Çocuklardan ve evcil hayvanlardan uzak tut.',
  'Perde, kitap gibi yanıcı eşyalardan ve cereyandan uzak, ısıya dayanıklı düz bir yüzeyde yak.',
  'Bir seferde 4 saatten uzun yakma; mum 1 cm kaldığında kullanmayı bırak.',
  'Kavanoz ve camlar yanarken ısınır; tamamen soğumadan dokunma, taşıma.',
];
for (const p of PRODUCTS) {
  const c = COLS.find((x) => x.slug === p.collection);
  const same = PRODUCTS.filter((x) => x.collection === p.collection && x.slug !== p.slug);
  const recs = (same.length ? same : PRODUCTS.filter((x) => x.slug !== p.slug)).slice(0, 3);
  const out = p.stock === 'out_of_stock';
  pages[`urun-${p.slug}.html`] = layout({
    file: `urun-${p.slug}.html`, navKey: 'magaza.html', title: p.name, page: 'product',
    desc: `${p.name} — ${c.name} koleksiyonundan bir Zazou mumu (demo).`,
    body: `<div class="wrap">
  <nav class="crumbs" aria-label="Konum"><ol><li><a href="index.html">Ana sayfa</a></li><li><a href="magaza.html">Mağaza</a></li><li><a href="koleksiyon-${c.slug}.html">${esc(c.name)}</a></li><li aria-current="page">${esc(p.name)}</li></ol></nav>
  <article class="product" data-product-page="${p.slug}">
    <div class="gallery">
      <div class="gallery-main">
        ${p.images.map((im, i) => `<figure data-slide="${i}"${i ? ' hidden' : ''}>${img(im.file, im.alt, '(min-width: 880px) 560px, 100vw', { lazy: i > 0 })}</figure>`).join('')}
      </div>
      <div class="thumbs" role="group" aria-label="Görseller">
        ${p.images.map((im, i) => `<button type="button" data-thumb="${i}" aria-pressed="${i === 0}" aria-label="Görsel ${i + 1}: ${i ? 'kullanımda' : 'ürün'}"><img src="assets/img/urun/${im.file}-600.webp" width="120" height="120" alt="" loading="lazy"></button>`).join('')}
      </div>
    </div>
    <div class="buy">
      <a class="tag" href="koleksiyon-${c.slug}.html">${esc(c.name)}</a>
      <h1 style="margin-top:10px">${esc(p.name)}</h1>
      <p class="price big">${ph(p.priceLabel)}</p>
      <p class="zelie">“${esc(p.description)}” <span class="sig">— Z.</span></p>
      <form class="buy-form" data-buy-form novalidate>
        ${p.variants.map((v, vi) => `<fieldset class="variant"><legend>${esc(v.name)}</legend>${v.options.map((o, oi) => `<label class="chip"><input type="radio" name="v${vi}" value="${esc(o)}" data-vname="${esc(v.name)}"${oi === 0 ? ' checked' : ''}><span>${esc(o)}</span></label>`).join('')}</fieldset>`).join('')}
        <div class="qty-row">
          <div class="qty" role="group" aria-label="Adet">
            <button type="button" data-qty="-1" aria-label="Adedi azalt">−</button>
            <input type="number" name="qty" value="1" min="1" max="10" inputmode="numeric" aria-label="Adet">
            <button type="button" data-qty="1" aria-label="Adedi artır">+</button>
          </div>
          ${favBtn(p, 'fav-btn inline')}
        </div>
        <p class="stock ${out ? 'is-out' : 'is-in'}">${out ? 'Tükendi' : 'Stokta'}</p>
        ${out
          ? `<div class="restock"><p><strong>Tükendi — gelince haber ver.</strong></p><div class="field inline"><label for="rs-email">E-posta adresin</label><input id="rs-email" type="email" autocomplete="email"><button class="btn alt" type="button" data-restock>Haber ver</button></div><p class="help">Demo: adres kaydedilmez.</p><p class="notice" role="status" aria-live="polite" hidden></p></div>`
          : `<button class="btn big block" type="submit">Sepete ekle</button>`}
      </form>
      <p class="card-note"><span class="mini-card" aria-hidden="true"></span> <span><strong>Bu ürünle gelen kartpostal: 1/20 şans.</strong> Paketinden 20 karttan biri çıkar. Bu mumun hikâyesi <a href="kartpostallar.html">N° ${p.postcard}</a>'da.</span></p>
      <details open><summary>Koku notaları</summary><p>${esc(p.scentNotes)} <span class="muted">(${esc(p.scentFamily)})</span></p></details>
      <details><summary>Ölçü, gramaj, yanma süresi</summary><dl class="specs"><dt>Ölçü</dt><dd>${ph(p.specs.size)}</dd><dt>Gramaj</dt><dd>${ph(p.specs.weight)}</dd><dt>Yanma süresi</dt><dd>${ph(p.specs.burnTime)}</dd><dt>Ürün kodu</dt><dd>${ph(p.sku)}</dd>${p.note ? `<dt>Not</dt><dd>${ph(esc(p.note))}</dd>` : ''}</dl></details>
      <details><summary>Mum güvenliği</summary><ul class="safety">${SAFETY.map((s) => `<li>${s}</li>`).join('')}</ul></details>
      <details><summary>Kargo ve iade</summary><p>Siparişler ${ph('[HAZIRLIK SÜRESİ]')} içinde kargoya verilir; ${ph('[TUTAR]')} üzeri kargo ücretsiz. İade ve cayma koşulları için <a href="iade-ve-cayma.html">İade ve cayma hakkı</a> sayfasına bak.</p></details>
    </div>
  </article>
</div>
<section class="band-yellow" aria-labelledby="h-oneri">
  <div class="wrap"><h2 id="h-oneri">${same.length ? `${esc(c.name)} koleksiyonundan` : 'Bunlar da hoşuna gidebilir'}</h2>
  ${same.length ? '' : `<p>${esc(c.name)} koleksiyonunun diğer ürünleri yakında.</p>`}
  <div class="grid g3" style="margin-top:16px">${recs.map(productTile).join('')}</div></div>
</section>`,
  });
}

// ---------- ARAMA ----------
pages['arama.html'] = layout({
  file: 'arama.html', title: 'Arama', page: 'search', navKey: '',
  desc: 'Zazou ürün araması.',
  body: `<div class="wrap page-top">
  <h1>Arama</h1>
  <form class="search-big" role="search" action="arama.html" method="get">
    <label for="q-page">Ürün adı ya da koleksiyon</label>
    <div class="field inline"><input id="q-page" name="q" type="search" autocomplete="off"><button class="btn" type="submit">Ara</button></div>
  </form>
  <p class="count-line" aria-live="polite" data-search-status></p>
</div>
<section style="padding-top:8px"><div class="wrap"><div class="grid g3" data-search-results>${PRODUCTS.map(productTile).join('')}</div></div></section>`,
});

// ---------- SEPET ----------
pages['sepet.html'] = layout({
  file: 'sepet.html', title: 'Sepet', page: 'cart', navKey: '',
  desc: 'Sepetin (demo).',
  body: `<div class="wrap page-top">
  <h1>Sepetin</h1>
  <div class="cart-layout">
    <div data-cart-view="page"></div>
    <aside class="summary tile pad" aria-labelledby="h-ozet">
      <h2 id="h-ozet" class="h3">Sipariş özeti</h2>
      <div class="field check"><input id="gift" type="checkbox" data-gift><label for="gift">Hediye paketi istiyorum <span class="muted">(${ph(STORE.cart.giftWrapLabel)})</span></label></div>
      <div class="field"><label for="note">Sipariş notu <span class="muted">(isteğe bağlı)</span></label><textarea id="note" rows="3" maxlength="300" data-order-note></textarea></div>
      <form class="field" data-discount-form novalidate>
        <label for="code">İndirim kodu</label>
        <div class="inline"><input id="code" name="code" autocomplete="off" aria-describedby="code-msg" style="text-transform:uppercase"><button class="btn ghost" type="submit">Uygula</button></div>
        <p id="code-msg" class="help" aria-live="polite">Demo kodu: ZAZOU10</p>
      </form>
      <div data-totals></div>
      <a class="btn big block" href="odeme.html" data-needs-items>Ödemeye geç</a>
      <p class="help" style="text-align:center">Demo — gerçek ödeme alınmaz.</p>
    </aside>
  </div>
</div>`,
});

// ---------- ÖDEME ----------
const ILLER = JSON.parse(fs.readFileSync('data/il-ilce.json', 'utf8')).map((x) => x.name).sort((a, b) => a.localeCompare(b, 'tr'));
pages['odeme.html'] = layout({
  file: 'odeme.html', title: 'Ödeme', page: 'checkout', navKey: '',
  desc: 'Ödeme (demo — gerçek ödeme alınmaz).',
  body: `<div class="wrap page-top">
  <h1>Ödeme</h1>
  <p class="demo-warn" role="note"><strong>DEMO — gerçek ödeme alınmaz.</strong> Bu formdaki bilgiler hiçbir yere gönderilmez ve kaydedilmez.</p>
  <div class="cart-layout">
    <form class="checkout" data-checkout novalidate>
      <ol class="steps-nav" aria-label="Ödeme adımları">
        <li data-step-tab="1" aria-current="step">İletişim</li><li data-step-tab="2">Teslimat</li><li data-step-tab="3">Kargo</li><li data-step-tab="4">Ödeme</li>
      </ol>

      <fieldset class="step" data-step="1">
        <legend><span class="step-no">1</span> İletişim</legend>
        <div class="field"><label for="c-email">E-posta</label><input id="c-email" name="email" type="email" autocomplete="email" required><p class="error" hidden></p></div>
        <div class="field"><label for="c-phone">Cep telefonu</label><input id="c-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required placeholder="05xx xxx xx xx"><p class="error" hidden></p></div>
        <button class="btn" type="button" data-next="2">Devam et</button>
      </fieldset>

      <fieldset class="step" data-step="2" disabled>
        <legend><span class="step-no">2</span> Teslimat adresi</legend>
        <div class="two">
          <div class="field"><label for="a-name">Ad</label><input id="a-name" name="firstName" autocomplete="given-name" required><p class="error" hidden></p></div>
          <div class="field"><label for="a-surname">Soyad</label><input id="a-surname" name="lastName" autocomplete="family-name" required><p class="error" hidden></p></div>
        </div>
        <div class="two">
          <div class="field"><label for="a-il">İl</label><select id="a-il" name="city" required autocomplete="address-level1"><option value="">İl seç</option>${ILLER.map((n) => `<option>${esc(n)}</option>`).join('')}</select><p class="error" hidden></p></div>
          <div class="field"><label for="a-ilce">İlçe</label><select id="a-ilce" name="district" required autocomplete="address-level2" disabled><option value="">Önce il seç</option></select><p class="error" hidden></p></div>
        </div>
        <div class="field"><label for="a-addr">Açık adres</label><textarea id="a-addr" name="address" rows="3" autocomplete="street-address" required></textarea><p class="error" hidden></p></div>
        <div class="field"><label for="a-zip">Posta kodu <span class="muted">(isteğe bağlı)</span></label><input id="a-zip" name="zip" autocomplete="postal-code" inputmode="numeric"></div>
        <div class="btn-row"><button class="btn ghost" type="button" data-prev="1">Geri</button><button class="btn" type="button" data-next="3">Devam et</button></div>
      </fieldset>

      <fieldset class="step" data-step="3" disabled>
        <legend><span class="step-no">3</span> Kargo seçimi</legend>
        ${STORE.shippingOptions.map((o, i) => `<label class="radio-card"><input type="radio" name="shipping" value="${o.id}"${i === 0 ? ' checked' : ''}><span><strong>${esc(o.name)}</strong> · ${ph(o.carrier)}<br><span class="muted">${ph(o.eta)} · ${ph(o.feeLabel)}</span></span></label>`).join('')}
        <div class="btn-row"><button class="btn ghost" type="button" data-prev="2">Geri</button><button class="btn" type="button" data-next="4">Devam et</button></div>
      </fieldset>

      <fieldset class="step" data-step="4" disabled>
        <legend><span class="step-no">4</span> Ödeme</legend>
        <div class="pay-demo">
          <p class="demo-stamp" role="note">DEMO — gerçek ödeme alınmaz</p>
          <p>Kart alanları bu demoda kapalı. Gerçek kart bilgisi istenmez, kaydedilmez, hiçbir yere gönderilmez. Canlı mağazada bu bölümü ödeme altyapısı (${ph('[ÖDEME ALTYAPISI]')}) sağlayacak.</p>
          <div class="field"><label for="p-name">Kart üzerindeki isim</label><input id="p-name" disabled placeholder="Demo — devre dışı"></div>
          <div class="field"><label for="p-num">Kart numarası</label><input id="p-num" disabled placeholder="Demo — devre dışı"></div>
          <div class="two"><div class="field"><label for="p-exp">Son kullanma</label><input id="p-exp" disabled placeholder="AA/YY"></div><div class="field"><label for="p-cvc">Güvenlik kodu</label><input id="p-cvc" disabled placeholder="•••"></div></div>
        </div>
        <div class="field check"><input id="ok-onbilgi" name="okPre" type="checkbox" required><label for="ok-onbilgi"><a href="on-bilgilendirme-formu.html" target="_blank" rel="noopener">Ön bilgilendirme formunu</a> okudum ve onaylıyorum.</label></div>
        <div class="field check"><input id="ok-mesafeli" name="okContract" type="checkbox" required><label for="ok-mesafeli"><a href="mesafeli-satis-sozlesmesi.html" target="_blank" rel="noopener">Mesafeli satış sözleşmesini</a> okudum ve onaylıyorum.</label></div>
        <p class="error" data-consent-error hidden>Devam etmek için iki onay kutusunu da işaretle.</p>
        <p class="help">Kişisel verilerin <a href="kvkk-aydinlatma-metni.html" target="_blank" rel="noopener">KVKK aydınlatma metni</a> kapsamında işlenir.</p>
        <div class="btn-row"><button class="btn ghost" type="button" data-prev="3">Geri</button><button class="btn big" type="submit">Siparişi tamamla (demo)</button></div>
      </fieldset>
    </form>
    <aside class="summary tile pad" aria-labelledby="h-ozet2">
      <h2 id="h-ozet2" class="h3">Sipariş özeti</h2>
      <div data-cart-view="mini"></div>
      <div data-totals></div>
    </aside>
  </div>
</div>`,
});

// ---------- SİPARİŞ ONAYI ----------
pages['siparis-onay.html'] = layout({
  file: 'siparis-onay.html', title: 'Sipariş onayı', page: 'confirm', navKey: '',
  desc: 'Sipariş onayı (demo).',
  body: `<div class="wrap page-top narrow" data-confirm>
  <p class="eyebrow">Demo sipariş</p>
  <h1>Merci!</h1>
  <p class="lead">Sipariş numaran: <strong data-order-no>—</strong> <span class="muted">(demo — gerçek sipariş oluşmadı)</span></p>
  <div class="letter">
    <p>Chère amie, cher ami,</p>
    <p>Siparişin elime ulaştı. Mumunu Mémé'nin öğrettiği gibi, ağır ateşte ve sabırla hazırlayacağım.</p>
    <p>Paketinde bir kartpostal seni bekliyor. Hangisi olduğunu ben de bilmiyorum; deniz karar veriyor.</p>
    <p>Bises,<br>Z.</p>
  </div>
  <h2 class="h3">Özet</h2>
  <div data-order-summary></div>
  <p class="btn-row"><a class="btn" href="hesabim.html#siparislerim">Siparişlerim</a><a class="btn alt" href="hesabim.html#kartlarim">Kartpostal koleksiyonum</a><a class="btn ghost" href="magaza.html">Alışverişe devam</a></p>
</div>`,
});

// ---------- HESABIM ----------
const cardGrid = () => `<ul class="cards20" aria-label="20 kartpostal">
  ${Array.from({ length: 20 }, (_, i) => {
    const n = i + 1, nn = String(n).padStart(2, '0'), rare = n >= 19;
    return rare
      ? `<li class="rare"><button type="button" data-n="${n}" disabled aria-label="Kart ${nn}, nadir kart, henüz açıklanmadı"><span class="sil" aria-hidden="true">N° ${nn}<small>nadir</small></span></button></li>`
      : `<li><button type="button" data-n="${n}" aria-pressed="false" aria-label="Kart ${nn}"><img src="assets/img/kart/kart-${nn}-sm.webp" width="480" height="341" alt="" loading="lazy" decoding="async"><span class="sil" aria-hidden="true">N° ${nn}<small>henüz yok</small></span></button></li>`;
  }).join('')}
</ul>`;

pages['hesabim.html'] = layout({
  file: 'hesabim.html', title: 'Hesabım', page: 'account', navKey: '',
  desc: 'Hesabım (demo).',
  body: `<div class="wrap page-top">
  <h1>Hesabım</h1>
  <p class="demo-warn" role="note"><strong>Demo:</strong> giriş ve kayıt ekranları yalnızca görsel; gerçek hesap oluşturulmaz, bilgi saklanmaz.</p>
  <div class="grid g2" style="margin-top:20px">
    <form class="tile pad" data-fake-auth novalidate aria-labelledby="h-giris">
      <h2 id="h-giris" class="h3">Giriş yap</h2>
      <div class="field"><label for="l-email">E-posta</label><input id="l-email" type="email" autocomplete="off"></div>
      <div class="field"><label for="l-pass">Şifre</label><input id="l-pass" type="password" autocomplete="off"></div>
      <button class="btn" type="submit">Giriş yap</button>
      <p class="notice" role="status" aria-live="polite" hidden></p>
    </form>
    <form class="tile pad" data-fake-auth novalidate aria-labelledby="h-kayit">
      <h2 id="h-kayit" class="h3">Kayıt ol</h2>
      <div class="field"><label for="r-name">Ad soyad</label><input id="r-name" autocomplete="off"></div>
      <div class="field"><label for="r-email">E-posta</label><input id="r-email" type="email" autocomplete="off"></div>
      <div class="field"><label for="r-pass">Şifre</label><input id="r-pass" type="password" autocomplete="off"></div>
      <div class="field check"><input id="r-kvkk" type="checkbox"><label for="r-kvkk"><a href="kvkk-aydinlatma-metni.html">KVKK aydınlatma metnini</a> okudum.</label></div>
      <button class="btn alt" type="submit">Kayıt ol</button>
      <p class="notice" role="status" aria-live="polite" hidden></p>
    </form>
  </div>
</div>
<section id="siparislerim" aria-labelledby="h-sip">
  <div class="wrap"><h2 id="h-sip">Siparişlerim</h2><p class="help">Bu tarayıcıda verdiğin demo siparişler. Adres ve iletişim bilgisi saklanmaz.</p><div data-orders></div></div>
</section>
<section id="kartlarim" class="band-yellow" aria-labelledby="h-kart">
  <div class="wrap"><h2 id="h-kart">Kartpostal koleksiyonum</h2>
  <p>Demo verisi: her demo sipariş koleksiyonuna rastgele bir kart ekler. Kartlara dokunarak da işaretleyebilirsin. <span class="count" aria-live="polite"></span></p>
  ${cardGrid()}
  <button class="btn ghost" type="button" data-reset>Sıfırla</button></div>
</section>`,
});

// ---------- FAVORİLER ----------
pages['favoriler.html'] = layout({
  file: 'favoriler.html', title: 'Favoriler', page: 'favorites', navKey: '',
  desc: 'Favori ürünlerin.',
  body: `<div class="wrap page-top"><h1>Favoriler</h1><p class="help">Favorilerin yalnızca bu tarayıcıda saklanır.</p></div>
<section style="padding-top:8px"><div class="wrap"><div class="grid g3" data-fav-list>${PRODUCTS.map(productTile).join('')}</div>
<div class="tile pad" data-fav-empty hidden><p class="zelie" style="margin:0 0 6px">Pas encore.</p><p style="margin:0">Henüz favorin yok. Ürünlerdeki kalbe dokunarak ekleyebilirsin. <a href="magaza.html">Mağazaya git</a></p></div></div></section>`,
});

// ---------- Z. KİM? ----------
const cardBack = (k) => `<article class="postcard" id="kart-${k.n}" aria-labelledby="kt-${k.n}">
  <div class="front"><img src="assets/img/kart/kart-${k.n}.webp" width="1100" height="780" alt="Kartpostal N° ${k.n} ön yüzü: ${esc(k.frontAlt)}" loading="lazy" decoding="async"></div>
  <div class="back">
    <div class="msg">
      <p class="card-meta" id="kt-${k.n}">Zazou ${k.n} / 20 · ${k.year}</p>
      ${k.text.map((t) => `<p>${esc(t)}</p>`).join('')}
    </div>
    <div class="side">
      <div class="stamp" aria-label="Pul: Zazou N° ${k.n}, Somewhere, ${k.year}"><b>Zazou</b>N° ${k.n}<br>SOMEWHERE<br>${k.year}</div>
      <div><div class="addr">Mlle Colette</div><div class="addr">Paris</div><p style="font-size:12px;margin:10px 0 0">zazoubythesea.com · @zazoubythesea</p></div>
    </div>
  </div>
</article>`;
const lockedColors = ['#00A99D', '#FF8A3D', '#7B4FE0', '#FF4F9A', '#1F7FD1', '#FFD23F'];
pages['z-kim.html'] = layout({
  file: 'z-kim.html', title: 'Z. kim?',
  desc: 'Z. imzalı kartpostallardan ilk üçü. Gerisi Zazou paketleriyle geliyor.',
  body: `<div class="wrap page-top">
  <p class="eyebrow">Paris, 1942 · Somewhere by the Sea</p>
  <h1>Z. kim?</h1>
  <p class="lead">Mektuplarının altına yalnızca “Z.” yazan bir kız. Aşağıda onun ilk üç kartpostalı var; geri kalanlar Zazou paketleriyle, birer birer geliyor.</p>
</div>
<section style="padding-top:24px" aria-label="Açık kartpostallar"><div class="wrap">${CARDS.filter((k) => k.open).map(cardBack).join('')}</div></section>
<section class="band-navy" aria-labelledby="h-kilit">
  <div class="wrap">
    <h2 id="h-kilit">Kartpostallar paketlerle geliyor</h2>
    <p>Kalan 17 kartpostal burada değil. Her Zazou siparişinde bir tane var; hepsini toplayan hikâyenin sonunu öğrenecek.</p>
    <div class="locked-grid" style="margin-top:22px">
      ${Array.from({ length: 17 }, (_, i) => { const n = String(i + 4).padStart(2, '0'); return `<div class="locked" style="--c:${lockedColors[i % 6]}"><span><b>N° ${n}</b>kilitli</span></div>`; }).join('')}
    </div>
    <p style="margin-top:26px"><a class="btn alt" href="kartpostallar.html">Kart oyununu gör</a></p>
  </div>
</section>`,
});

// ---------- 20 KARTPOSTAL ----------
pages['kartpostallar.html'] = layout({
  file: 'kartpostallar.html', title: '20 Kartpostal', page: 'cards',
  desc: 'Zazou kartpostal oyunu: her siparişte numaralı bir kart, 20 kart, #ZazouKartları ile takas.',
  body: `<div class="wrap page-top">
  <p class="eyebrow">#ZazouKartları</p>
  <h1>20 Kartpostal</h1>
  <p class="lead">Z.'nin Colette'e yazdığı kartpostallardan 20'si bugüne kaldı. Her biri hikâyeden bir parça; birlikte okununca Zazou'nun kim olduğu ortaya çıkıyor.</p>
</div>
<section style="padding-top:20px" aria-labelledby="h-nasil">
  <div class="wrap">
    <h2 id="h-nasil">Nasıl işliyor?</h2>
    <ol class="steps">
      <li><strong>Her siparişte bir kart.</strong> Her Zazou siparişinden numaralı bir kartpostal çıkar: Zazou 01'den Zazou 20'ye.</li>
      <li><strong>Sıra yok.</strong> Kartlar karışık gelir; hikâyeyi parça parça sen kurarsın. Birkaç kart nadirdir.</li>
      <li><strong>Aynı kart tekrar gelebilir.</strong> Bunu baştan söylüyoruz. Fazla kartını, eksik kartı olan biriyle takas et.</li>
      <li><strong>Takas için tek etiket.</strong> Kartını paylaşırken <strong>#ZazouKartları</strong> etiketini kullan; eşini böyle bulursun.</li>
    </ol>
  </div>
</section>
<section class="band-yellow" aria-labelledby="h-grid">
  <div class="wrap">
    <h2 id="h-grid">Kart defterim</h2>
    <p>Elindeki kartlara dokunup işaretle; toplananlar renkli görünür. <span class="count" aria-live="polite"></span></p>
    <p class="help">Bu işaretler yalnızca bu tarayıcıda saklanır; hiçbir yere gönderilmez.</p>
    ${cardGrid()}
    <button class="btn ghost" type="button" data-reset>Sıfırla</button>
  </div>
</section>
<section aria-labelledby="h-odul">
  <div class="wrap">
    <h2 id="h-odul">Ödül</h2>
    <p class="zelie">Yakında duyurulacak.</p>
    <p>Kampanyanın kuralları ve ödül bilgisi netleşince burada ve <a href="${STORE.instagram}" rel="noopener">${STORE.instagramHandle}</a> hesabında paylaşılacak.</p>
  </div>
</section>`,
});

// ---------- HAKKIMIZDA ----------
pages['hakkimizda.html'] = layout({
  file: 'hakkimizda.html', title: 'Hakkımızda',
  desc: "1940'ların zazou akımı ve Zazou markasının fikri.",
  body: `<div class="wrap page-top"><p class="eyebrow">Hakkımızda</p><h1>Zor zamanda renkli kalmak</h1></div>
<section style="padding-top:20px" aria-labelledby="h-tarih">
  <div class="wrap grid g2">
    <div>
      <h2 id="h-tarih">Zazou'lar kimdi?</h2>
      <p>Zazou, İkinci Dünya Savaşı sırasında Alman işgali altındaki Fransa'da, özellikle Paris'te ortaya çıkan bir gençlik akımıydı. Swing caza tutkundular; adlarının, dönemin swing şarkılarındaki “za-zou” diye giden nakaratlardan geldiği düşünülüyor. Johnny Hess'in “Je suis swing”i bu nakaratı Fransa'da çok yaygınlaştırdı.</p>
      <p>Erkekler dizlerine inen kocaman ceketler, dar paçalı pantolonlar ve kalın tabanlı ayakkabılar giydi; yanlarından şemsiyeyi eksik etmediler. Kadınlar kısa pileli etekler, çizgili çoraplar, tahta tabanlı ayakkabılar ve koyu güneş gözlükleriyle dolaştı. Buluşma yerleri Champs-Élysées'deki kafe terasları ve Saint-Michel Bulvarı çevresiydi.</p>
      <p>Karne, karartma ve sıkı bir ahlak düzeninin dayatıldığı yıllarda bu gösterişli, neşeli tarz bir meydan okuma sayıldı. 1942'den itibaren işbirlikçi gençlik grupları zazou'lara saldırdı, saçlarını zorla kesti; birçoğu gözaltına alındı ya da zorla çalıştırıldı. Yahudilere sarı yıldız takma zorunluluğu getirildiğinde, bazı Yahudi olmayan gençler dayanışma için üzerinde “Swing” ya da “Zazou” yazan yıldızlar taktı. Baskı arttıkça zazou'lar bodrum kulüplerine, gizli dans salonlarına çekildi.</p>
    </div>
    <div>
      <h2>Marka fikri</h2>
      <p>Zazou adını bir moda markasından değil, bu akımdan aldık. Özünde tek bir fikir var: gri bir zamanda bile renkli kalmak.</p>
      <p>Estetiğimiz 80'lerin sonu ve 90'ların pop kültüründen geliyor: canlı renkler, eğlenceli desenler, kaleydoskoplar, birbirine akan renkler, el çizimleri. Başlangıcımız mum; zamanla şamdan, mum tepsisi, vazo ve abajur gibi ürünlerle bir ev markasına dönüşmek istiyoruz.</p>
      <p>Nereden geldiğimizi açıkça söylemiyoruz. Sadece şu kadarı belli: <span class="hand" style="font-size:1.4em">Somewhere by the Sea.</span></p>
      <p>Hikâyemizdeki Z. ve kartpostalları kurgudur; arka plandaki tarih gerçektir.</p>
      <p><a class="btn" href="z-kim.html">Z.'nin kartpostalları</a></p>
    </div>
  </div>
</section>`,
});

// ---------- İLETİŞİM + SSS ----------
const FAQ = [
  ['Siparişim ne zaman kargoya verilir?', `Siparişler ${ph('[HAZIRLIK SÜRESİ]')} içinde hazırlanıp ${ph('[KARGO FİRMASI]')} ile gönderilir. Teslimat genellikle ${ph('[SÜRE]')} iş günü sürer. Ayrıntılar için <a href="kargo-ve-teslimat.html">Kargo ve teslimat</a>.`],
  ['İade edebilir miyim?', `İade ve cayma koşulları <a href="iade-ve-cayma.html">İade ve cayma hakkı</a> sayfasında yer alacak. ${ph('[HUKUKÇU TARAFINDAN DOLDURULACAK]')}`],
  ['Mumuma nasıl bakmalıyım?', 'İlk yakışta erimiş mum kenarlara ulaşana kadar yak; böylece mum tünel açmaz. Her yakmadan önce fitili yaklaşık 5 mm\'ye kısalt, bir seferde 4 saatten uzun yakma ve yanan mumu asla gözetimsiz bırakma. Mumu güneşten ve ısıdan uzak, serin bir yerde sakla.'],
  ['Kartpostallar nasıl geliyor?', 'Her siparişte 20 karttan biri paketine eklenir. Kartlar karışık gelir, aynı kart tekrar gelebilir ve birkaç kart nadirdir. Fazla kartlarını #ZazouKartları etiketiyle takas edebilirsin. <a href="kartpostallar.html">20 Kartpostal</a>'],
  ['Mağaza nerede?', 'Somewhere by the Sea. Şimdilik yalnızca online satış planlıyoruz.'],
];
pages['iletisim.html'] = layout({
  file: 'iletisim.html', title: 'İletişim',
  desc: 'Zazou ile iletişim ve sıkça sorulan sorular.',
  body: `<div class="wrap page-top">
  <p class="eyebrow">İletişim</p>
  <h1>Bonjour!</h1>
  <p class="lead">Bir sorun, bir takas hikâyen ya da Z.'ye bir notun mu var? Bize yaz.</p>
  <div class="grid g2" style="margin-top:22px">
    <div class="tile pad"><h2 class="h3">E-posta</h2><p><a class="btn" href="mailto:${STORE.email}">${ph(STORE.emailLabel)}</a></p><p class="help">Adres, alan adı alındıktan sonra netleşecek.</p></div>
    <div class="tile pad"><h2 class="h3">Instagram</h2><p><a class="btn alt" href="${STORE.instagram}" rel="noopener">${STORE.instagramHandle}</a></p><p class="help">Konum: Somewhere by the Sea.</p></div>
  </div>
</div>
<section aria-labelledby="h-sss"><div class="wrap narrow">
  <h2 id="h-sss">Sıkça sorulanlar</h2>
  <div class="faq">${FAQ.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
</div></section>`,
});

// ---------- YASAL ŞABLONLAR ----------
const LEGAL_SECTIONS = {
  'mesafeli-satis-sozlesmesi.html': ['Taraflar', 'Sözleşmenin konusu', 'Ürün, fiyat ve ödeme bilgileri', 'Teslimat', 'Cayma hakkı', 'Cayma hakkının kullanılamayacağı durumlar', 'Uyuşmazlıkların çözümü', 'Yürürlük'],
  'on-bilgilendirme-formu.html': ['Satıcı bilgileri', 'Ürünün temel nitelikleri', 'Toplam fiyat ve ödeme', 'Teslimat bilgileri', 'Cayma hakkı ve kullanım şekli', 'Şikâyet ve itiraz yolları'],
  'iade-ve-cayma.html': ['Cayma hakkı süresi', 'Cayma bildirimi nasıl yapılır', 'İade kargo süreci', 'Geri ödeme', 'İade edilemeyen ürünler', 'Hasarlı veya hatalı ürün'],
  'kvkk-aydinlatma-metni.html': ['Veri sorumlusu', 'İşlenen kişisel veriler', 'İşleme amaçları', 'Hukuki sebepler', 'Aktarım', 'Saklama süreleri', 'İlgili kişinin hakları', 'Başvuru yolu'],
  'cerez-politikasi.html': ['Çerez nedir', 'Kullanılan çerez ve depolama türleri', 'Tercihlerin yönetimi', 'Üçüncü taraf çerezleri'],
  'gizlilik-politikasi.html': ['Genel', 'Toplanan bilgiler', 'Bilgilerin kullanımı', 'Güvenlik', 'Üçüncü taraflar', 'İletişim'],
  'kargo-ve-teslimat.html': ['Hazırlık süresi', 'Kargo firmaları', 'Kargo ücreti ve ücretsiz kargo', 'Teslimat süresi', 'Hasarlı teslimat', 'Yurt dışı gönderim'],
};
for (const [file, title] of LEGAL) {
  const extra = file === 'cerez-politikasi.html'
    ? `<div class="tile pad demo-note"><p><strong>Bu demo sitede:</strong> analitik veya reklam çerezi yok. Sepet, favoriler, kart defteri, demo siparişler ve çerez tercihin yalnızca tarayıcının yerel depolamasında (localStorage) tutulur ve hiçbir sunucuya gönderilmez. <button type="button" class="linklike" data-cookie-settings>Çerez tercihlerini değiştir</button></p></div>` : '';
  pages[file] = layout({
    file, title, navKey: '', desc: `${title} (şablon).`,
    body: `<div class="wrap page-top narrow legal">
  <p class="eyebrow">Yasal · şablon</p>
  <h1>${title}</h1>
  <p class="demo-warn" role="note">Bu sayfa bir şablondur. Metin bir hukukçu tarafından hazırlanacaktır; aşağıdaki başlıklar yalnızca yapıyı gösterir.</p>
  <p>Son güncelleme: ${ph('[TARİH]')} · ${ph(STORE.company.title)}</p>
  ${extra}
  ${LEGAL_SECTIONS[file].map((h, i) => `<h2 class="h3">${i + 1}. ${h}</h2>${HUK}`).join('')}
</div>`,
  });
}

// ---------- 404 ----------
pages['404.html'] = layout({
  file: '404.html', title: 'Sayfa bulunamadı', desc: 'Sayfa bulunamadı.', navKey: '',
  body: `<div class="wrap page-top" style="padding-bottom:80px"><h1>Pas ici.</h1><p class="lead">Aradığın sayfa bu koyda değil.</p><p><a class="btn" href="index.html">Ana sayfaya dön</a></p></div>`,
});

fs.mkdirSync('site', { recursive: true });
for (const f of fs.readdirSync('site')) if (f.endsWith('.html')) fs.unlinkSync(`site/${f}`);
for (const [f, html] of Object.entries(pages)) fs.writeFileSync(`site/${f}`, html);
console.log(Object.keys(pages).length, 'sayfa üretildi');
