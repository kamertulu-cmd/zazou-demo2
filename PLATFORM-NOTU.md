# Platform notu: demodan gerçek mağazaya

*Bilgiler 29 Eylül 2026'da, çoğunlukla platformların resmi sayfalarından kontrol edildi. Fiyatlar kampanyalarla sık değişir; karar vermeden önce satış ekipleriyle yazılı teklif alın. Emin olunamayan noktalar* **(doğrulanmadı)** *ya da* **(belirsiz)** *diye işaretlendi.*

## Kısa sonuç

- **Bu tasarımı birebir taşımak** en kolay **Shopify** (Liquid tema: tam HTML/CSS/JS) ve **ikas** (Next.js/React ile özel tema) üzerinde. WooCommerce'te sınır yok ama sunucu, güvenlik ve güncellemeler bizde. **Ticimax** yalnızca CSS/script erişimi veriyor; **IdeaSoft**'ta kod düzeyinde tema erişimi belgelenmemiş, özel tasarım ücretli hizmet.
- **Türkiye'de satış** (iyzico/PayTR, Türk kargo firmaları, e-Fatura) yerli platformlarda (ikas, IdeaSoft, Ticimax) hazır geliyor; Shopify ve WooCommerce'te uygulama/eklentiyle.
- **İleride Portekiz/AB:** Shopify Payments ve Stripe Türkiye'deki şirketleri kabul etmiyor, Portekiz'deki şirketleri kabul ediyor. AB'de şirket kurulduğunda Shopify'ın çoklu pazar (Markets) özellikleri tam açılıyor. ikas'ın ayrı bir AB paketi var.
- Makul yol haritası: **Türkiye için ikas** (tasarım + yerel entegrasyonlar), AB şirketi kurulunca **Shopify'ı yeniden değerlendirmek**. Ya da baştan Shopify + Türk uygulamaları; bu durumda her satışta ek işlem ücreti var (aşağıda).

## Karşılaştırma

| | ikas | Ticimax | IdeaSoft | Shopify | WooCommerce |
|---|---|---|---|---|---|
| **Aylık maliyet** (yıllık ödeme ÷ 12) | Start ücretsiz (%3,99 sanal POS). Lift ₺3.329/ay, Scale ₺5.823/ay, Scale Plus ₺11.199/ay (+KDV, yıllık faturalanır) | Advantage ₺3.833/ay (₺46.000/yıl), Premier ₺69.000/yıl, Advance ₺99.000/yıl; KDV durumu **(belirsiz)** | Starter ₺3.325/ay (₺39.900/yıl), Booster ₺5.825/ay, Master ₺99.900/yıl, Master+ ₺134.900/yıl (KDV dahil) | Basic $29/ay (yıllık) · $39 (aylık); Grow $79 · $105; Advanced $299 · $399 | Eklenti ücretsiz; hosting, tema ve ücretli eklentiler ayrıca **(tutar kontrol edilmedi)** |
| **Satış komisyonu** | Kendi POS'unu bağlarsan ek ücret yok; ikas sanal POS ₺75.000'e kadar %0, sonrası %3,59'dan | Belirtilmemiş | Yok (SSS) | Shopify Payments TR'de yok → üçüncü taraf ödeme ile %2 (Basic) / %1 (Grow) / %0,6 (Advanced) ek ücret | Yok (ödeme kuruluşunun oranı) |
| **Türk ödeme altyapıları** | iyzico, PayTR, Paratika, Moka United, Tami, Hoppa hazır; Param listede yok | Tüm banka POS'ları, Masterpass, kapıda ödeme; iyzico/PayTR/Param yalnızca üçüncü taraf kaynakta **(doğrulanmadı)** | Tüm bankalar, iyzico, iPara, PayU, ParamPOS, Hepsipay hazır | iyzico resmî uygulama; PayTR vb. üçüncü taraf uygulamalar | iyzico resmî eklenti (puanı düşük: 1,7/5), PayTR resmî eklenti |
| **Kargo entegrasyonu** | Yurtiçi, Aras, MNG, UPS, DHL, HepsiJET, Kolay Gelsin, ikas Kargo | "Kargo entegrasyonları" (firmalar resmî sayfada listelenmemiş) | Yurtiçi, Aras, MNG, PTT, Sürat, Sendeo, UPS, DHL eCommerce ve diğerleri (çoğu uygulama mağazasından) | Uygulamalarla (ör. Kargo Entegratör, Yengeç) | Eklentilerle **(doğrulanmadı)** |
| **e-Fatura / e-Arşiv** | Paraşüt, Logo, Sovos, QNB eSolutions, Mikro, Nebim | Pakete dahil entegrasyon (entegratörler yalnızca üçüncü taraf kaynakta) | BirFatura, Nilvera, EDM, Uyumsoft, Paraşüt, Logo, Innova, Dev Dönüşüm | Uygulamalarla (ör. Pax, Fatura Entegratör; Paraşüt/Logo bağlayıcıları) | Eklentilerle (ör. Paraşüt e-Fatura eklentisi) |
| **Tema: bu tasarım taşınır mı?** | **Evet.** Görsel editör + Next.js/TypeScript ile özel tema; özel tema kodlama fiyat sayfasında Scale Plus ve üstünde listeli **(plan sınırı belirsiz)** | **Kısmen.** CSS ve script erişimi; özel tasarım ücretli ek hizmet, premium tema ~₺17.000–34.500 | **Kısmen.** Flex temalarda font/renk/bölüm ayarı; kod erişimi belgelenmemiş; "Konsept Tasarım" ücretli hizmet (fiyat yok) | **Evet, en esnek.** Liquid şablonları, tam HTML/CSS/JS, kendi font ve görsellerimiz | **Evet, sınırsız.** PHP/HTML/CSS; bakım bizde |
| **Çoklu dil / AB'ye satış** | Scale ve üstünde sınırsız dil, ülke, para birimi; ayrı AB ürünü (€25–199/ay, KDV ifadesi **belirsiz**); AB KDV tek durak (OSS) desteği **(doğrulanmadı)** | Ayrı e-ihracat paketleri (ülke bazında dil/para birimi), fiyat teklifle; OSS **(doğrulanmadı)** | Çoklu dil ve para birimi yalnızca Master+; OSS **(doğrulanmadı)** | **En güçlü.** Shopify Markets: yerel para birimi, dil, alan adı; tam çoklu para birimi için Shopify Payments → AB (ör. Portekiz) şirketi gerekli | Eklentilerle; Stripe ve AB ödeme yöntemleri AB şirketiyle |

## Karar için sorulacaklar

1. İlk yıl yalnızca Türkiye mi? Portekiz şirketi ne zaman kurulacak? (Shopify/Stripe tarafını bu belirliyor.)
2. Tasarımı kim uygulayacak? ikas ya da Shopify'da bir geliştirici bu demoyu temaya çevirebilir; Ticimax/IdeaSoft'ta ya ücretli tasarım hizmeti ya da hazır temaya uyarlama gerekecek.
3. Muhasebeci hangi e-Fatura entegratörünü kullanıyor? (Paraşüt ve Logo neredeyse hepsinde var.)
4. Kargo: hangi firmayla anlaşılacak, anlaşmalı fiyat mı platformun kargo kredisi mi?
5. Kampanya (20 kartpostal, takas, ödül) için platformda "her siparişe kart" notu ya da ürün eklemek yeterli; çekilişli ödül olacaksa hukukçuya danışılmalı.

## Kaynaklar

**ikas**
- https://ikas.com/tr/e-ticaret-paketleri
- https://ikas.com/tr/e-ihracat-paketleri
- https://ikas.com/en/pricing
- https://ikas.com/tr/sanal-pos-entegrasyonlari
- https://ikas.com/tr/entegrasyonlar
- https://ikas.dev/docs/theme/getting-started/introduction

**Ticimax**
- https://www.ticimax.com/e-ticaret-paketleri/
- https://www.ticimax.com/e-ihracat-paketleri/
- https://www.arteliodijital.com/ticimax-entegrasyonlari-rehberi-pazaryeri-kargo-muhasebe-odeme (üçüncü taraf)

**IdeaSoft**
- https://www.ideasoft.com.tr/e-ticaret-paketleri/
- https://www.ideasoft.com.tr/ozellikler/entegrasyon-cozumleri/
- https://www.ideasoft.com.tr/konu/entegrasyonlar/
- https://www.ideasoft.com.tr/eticaret-cozum-merkezi/kargo-ve-lojistik-entegrasyonlari/
- https://www.ideasoft.com.tr/yardim/e-fatura-ve-e-arsiv-ile-fatura-kesme/
- https://www.ideasoft.com.tr/yardim/tema-secimi-yapmak/

**Shopify**
- https://www.shopify.com/pricing (ABD konumundan görüntülendi)
- https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries
- https://help.shopify.com/en/manual/international/pricing/currencies
- https://apps.shopify.com/iyzico-payment-app
- https://apps.shopify.com/gurmehub-yurtici-entegrasyonu
- https://apps.shopify.com/e-fatura-entegrasyonu-1
- https://apps.shopify.com/fatura-entegrator

**WooCommerce / Stripe**
- https://woocommerce.com/payments/
- https://wordpress.org/plugins/iyzico-woocommerce/
- https://wordpress.org/plugins/paytr-sanal-pos-woocommerce-iframe-api/
- https://www.gri.net/wordpress-eklentileri/parasut-woocommerce-e-fatura-entegrasyon-modulu
- https://stripe.com/global

*Bu not hukuki ya da mali tavsiye değildir; vergi (OSS, e-Fatura) ve şirket kuruluşu için mali müşavire danışın.*
