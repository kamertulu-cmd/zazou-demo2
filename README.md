# Zazou — Somewhere by the Sea · e-ticaret demosu

Zazou mum markası için hazırlanmış **tıklanabilir e-ticaret demosu**. Alışveriş akışı baştan sona çalışır görünür (ürün → sepet → ödeme adımları → sipariş onayı), ama **gerçek ödeme alınmaz, gerçek sipariş oluşmaz**. Sunucu yoktur; sepet, favoriler, demo siparişler ve kart defteri yalnızca tarayıcının `localStorage`'ında tutulur.

**Canlı demo:** https://kamertulu-cmd.github.io/zazou-demo2/
(İlk, sade sürüm: https://kamertulu-cmd.github.io/zazou-demo/)

## Sayfalar

| Bölüm | Dosyalar |
|---|---|
| Ana sayfa: duyuru şeridi, hero video, marka girişi, koleksiyonlar, öne çıkanlar, kartpostal oyunu, e-bülten (demo), Instagram | `index.html` |
| Mağaza (tüm ürünler; koleksiyon + koku ailesi filtresi, sıralama) | `magaza.html` |
| Koleksiyonlar + 7 koleksiyon sayfası (banner, ürün ızgarası, filtre, sıralama) | `koleksiyonlar.html`, `koleksiyon-*.html` |
| Ürün sayfası ×6: galeri, varyant, adet, sepete ekle, stok ("Tükendi — gelince haber ver" örneği Kaleido Votive'de), koku notaları, ölçü/gramaj/süre, kartpostal notu, mum güvenliği, kargo-iade özeti, öneriler | `urun-*.html` |
| Arama (ürün adı + koleksiyon, istemci tarafı) | `arama.html` |
| Sepet çekmecesi (her sayfada) + sepet sayfası: adet, silme, ücretsiz kargo çubuğu, hediye paketi, sipariş notu, indirim kodu | `sepet.html` |
| Ödeme: iletişim → teslimat (81 il / 973 ilçe) → kargo → ödeme (kart alanları kapalı) + onay kutuları | `odeme.html` |
| Sipariş onayı (demo no, özet, Z.'den not) | `siparis-onay.html` |
| Hesabım (görsel giriş/kayıt, Siparişlerim, Kartpostal koleksiyonum), Favoriler | `hesabim.html`, `favoriler.html` |
| Z. kim? (yalnızca kart 01–03), 20 Kartpostal, Hakkımızda, İletişim + SSS | `z-kim.html`, `kartpostallar.html`, `hakkimizda.html`, `iletisim.html` |
| Yasal şablonlar (içerik hukukçu tarafından doldurulacak) | `mesafeli-satis-sozlesmesi.html`, `on-bilgilendirme-formu.html`, `iade-ve-cayma.html`, `kvkk-aydinlatma-metni.html`, `cerez-politikasi.html`, `gizlilik-politikasi.html`, `kargo-ve-teslimat.html` |

Kartpostal 19 ve 20'nin ne metni ne ön yüzü sitede yer alır.

## Demo davranışları

- **İndirim kodu:** `ZAZOU10` → %10.
- **Ödeme:** kart alanları devre dışı; kart bilgisi istenmez, kaydedilmez, gönderilmez. "Siparişi tamamla" yalnızca tarayıcıda bir demo sipariş kaydı oluşturur (ürünler, kargo seçimi, kod). **Ad, adres, e-posta ve telefon saklanmaz.**
- **Kart defteri:** her demo sipariş koleksiyona rastgele bir kart (01–18) ekler.
- **Ücretsiz kargo çubuğu:** fiyatlar girilene kadar ürün adedine göre ilerler (`data/store.json` → `cart.demoProgressItems`). Fiyatlar ve eşik girildiğinde gerçek tutara göre hesaplanır.
- **Fiyat sıralaması:** fiyatlar `null` olduğu sürece öne çıkanlar sırasını kullanır ve bunu sayfada belirtir.
- Giriş/kayıt, e-bülten ve "gelince haber ver" formları hiçbir veri saklamaz.
- Çerez bildirimi: "Sadece gerekli" / "Kabul et". Sitede analitik veya reklam çerezi yoktur.

## Yer tutucular

| Yer tutucu | Nerede değiştirilir |
|---|---|
| `[FİYAT]` | `data/products.json` → `price` (sayı, TL) ve `priceLabel` |
| `[ÖLÇÜ]`, `[GRAMAJ]`, `[SÜRE]` | `data/products.json` → `specs.size`, `specs.weight`, `specs.burnTime` |
| `[SKU]` | `data/products.json` → `sku` |
| `[TEST SONUCU]` | Kaleido Votive → `note` (cam filmin ısı testi) |
| `[KARGO ÜCRETİ]`, `[TUTAR]` (ücretsiz kargo eşiği), `[HEDİYE PAKETİ ÜCRETİ]` | `data/store.json` → `cart.shippingFee`, `cart.freeShippingThreshold`, `cart.giftWrapFee` |
| `[KARGO FİRMASI]`, `[SÜRE] iş günü`, `[HIZLI KARGO ÜCRETİ]` | `data/store.json` → `shippingOptions` |
| `[ŞİRKET UNVANI]`, `[ADRES]`, `[MERSİS/VERGİ NO]` | `data/store.json` → `company` |
| `[E-POSTA ADRESİ]` | `data/store.json` → `email`, `emailLabel` |
| `[İSİM BEKLİYOR]` | Kibrit kutuları koleksiyon adı → `data/store.json` → `collections` |
| `[HUKUKÇU TARAFINDAN DOLDURULACAK]`, `[TARİH]` | Yasal sayfalar → `scripts/build-pages.mjs` (`LEGAL_SECTIONS`) |
| `[ÖDEME ALTYAPISI]`, `[ÖDEME LOGOSU]`, `[KARGO LOGOSU]` | Ödeme adımı ve alt bilgi |
| `[HAZIRLIK SÜRESİ]`, `[SIKLIK]`, `[KALAN TUTAR]`, `[ARA TOPLAM]`, `[TOPLAM]` | Ürün/SSS metinleri, e-bülten, sepet (fiyatlar girilince tutarlar otomatik hesaplanır) |

Koku notaları ve varyantlar öneridir.

## Ürün JSON yapısı (`data/products.json`)

Tüm ürünler tek dosyada; ileride Shopify/ikas gibi bir platforma CSV ya da API ile aktarmak için düz tutuldu.

```json
{
  "id": "ZZ-001",              // demo iç kimlik
  "sku": "[SKU]",               // stok kodu
  "slug": "cha-cha-stripe",     // URL: urun-<slug>.html
  "name": "Cha Cha Stripe",
  "collection": "xmas-cha-cha", // data/store.json → collections[].slug
  "postcard": "09",             // bağlı kartpostal
  "newRank": 1,                 // "En yeni" sıralaması (1 = en yeni)
  "price": null,                // sayı (TL); null → priceLabel gösterilir
  "compareAtPrice": null,       // indirimli ürünlerde eski fiyat
  "currency": "TRY",
  "priceLabel": "[FİYAT]",
  "stock": "in_stock",          // ya da "out_of_stock"
  "scentFamily": "Baharatlı",   // filtre
  "scentNotes": "Portakal kabuğu, tarçın, şeker kamışı",
  "short": "Kart üzerindeki kısa açıklama",
  "description": "Zélie'nin ağzından 2 cümle",
  "variants": [{ "name": "Renk", "options": ["Pembe-beyaz", "Turkuaz-beyaz"] }],
  "specs": { "size": "[ÖLÇÜ]", "weight": "[GRAMAJ]", "burnTime": "[SÜRE]" },
  "images": [
    { "file": "cha-cha-stripe", "alt": "…" },              // site/assets/img/urun/<file>-600|1200.webp
    { "file": "cha-cha-stripe-kullanimda", "alt": "…" }
  ],
  "note": "isteğe bağlı not"
}
```

Mağaza ayarları (koleksiyonlar, kargo seçenekleri, indirim kodları, şirket bilgisi) `data/store.json`'da, il/ilçe listesi `data/il-ilce.json`'da (kaynak: [turkey-neighbourhoods](https://www.npmjs.com/package/turkey-neighbourhoods), MIT).

## Yerelde çalıştırma

Node.js 20+ gerekir.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # dist/ klasörüne üretim çıktısı
npm run preview   # dist/ çıktısını önizle
```

Sayfalar `scripts/build-pages.mjs` tarafından `data/*.json` verilerinden `site/*.html` olarak üretilir; `site/*.html` dosyalarını elle düzenlemeyin. Etkileşimler `site/assets/main.js`, stiller `site/assets/style.css` içinde.

## Yayın ve arama motorları

`main` dalına her push, `.github/workflows/deploy.yml` ile GitHub Pages'e yayınlanır. Göreli yollar (`base: './'`) sayesinde site `/zazou-demo2/` alt dizininde çalışır.

Her sayfada `<meta name="robots" content="noindex, nofollow">` var; `robots.txt` tüm tarayıcıları engelliyor. Not: GitHub Pages proje sitelerinde `robots.txt` alt dizinde durduğu için arama motorları onu okumaz; asıl koruma `noindex` etiketidir.

Platform seçimi için bkz. [PLATFORM-NOTU.md](PLATFORM-NOTU.md).

## Görseller

Ürün illüstrasyonları, banner'lar ve hero videosu kodla üretilmiş düz vektör çizimlerdir (gradyan, stok fotoğraf, yapay zekâ ile üretilmiş yüz yok). Kartpostal ön yüzleri markanın kendi tasarımlarıdır. Karakterler ve olaylar kurgudur.
