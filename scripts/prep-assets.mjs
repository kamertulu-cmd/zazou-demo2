// Stage-1 çıktılarından site görsellerini üretir (WebP) — bir kez çalıştırılır.
import sharp from 'sharp';
import fs from 'node:fs';
const OUT = '/home/claude/zazou/out', A = 'site/assets';
const urun = fs.readdirSync(`${OUT}/urunler/png`);
for (const f of urun) {
  const n = f.replace('.png', '');
  for (const w of [600, 1200]) await sharp(`${OUT}/urunler/png/${f}`).resize(w).webp({ quality: 86 }).toFile(`${A}/img/urun/${n}-${w}.webp`);
}
for (const f of fs.readdirSync(`${OUT}/bannerlar`)) {
  const n = f.replace('.png', '');
  const w = n.startsWith('hero') ? 1920 : 1600;
  await sharp(`${OUT}/bannerlar/${f}`).webp({ quality: 86 }).toFile(`${A}/img/banner/${n}.webp`);
  await sharp(`${OUT}/bannerlar/${f}`).resize(Math.round(w / 2)).webp({ quality: 84 }).toFile(`${A}/img/banner/${n}-sm.webp`);
}
// kart ön yüzleri: yalnızca 01–18 (19 ve 20 asla siteye girmez)
for (let i = 1; i <= 18; i++) {
  const nn = String(i).padStart(2, '0');
  await sharp(`/home/claude/src/cards/p-${nn}.png`).resize(480).webp({ quality: 82 }).toFile(`${A}/img/kart/kart-${nn}-sm.webp`);
}
for (let i = 1; i <= 3; i++) {
  const nn = String(i).padStart(2, '0');
  await sharp(`/home/claude/src/cards/hi-${nn}.png`).resize(1100).webp({ quality: 86 }).toFile(`${A}/img/kart/kart-${nn}.webp`);
}
await sharp(`${OUT}/teaser/1-somewhere-post-1080x1350.png`).resize(540).webp({ quality: 84 }).toFile(`${A}/img/teaser/teaser-1.webp`);
await sharp(`${OUT}/bannerlar/hero-1920x800.png`).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 85 }).toFile(`${A}/img/og-image.jpg`);
for (const f of ['zazou-hero-1920x800.mp4', 'zazou-hero-1920x800.webm', 'zazou-reels-1080x1920.mp4', 'zazou-reels-1080x1920.webm']) fs.copyFileSync(`${OUT}/video/${f}`, `${A}/video/${f}`);
await sharp(`${OUT}/video/zazou-hero-poster-1920x800.png`).webp({ quality: 85 }).toFile(`${A}/video/hero-poster.webp`);
await sharp(`${OUT}/video/zazou-reels-poster-1080x1920.jpg`).resize(720).webp({ quality: 82 }).toFile(`${A}/video/reels-poster.webp`);
for (const f of fs.readdirSync('/home/claude/zazou/fonts')) if (!f.includes('italic') && !f.includes('500')) fs.copyFileSync(`/home/claude/zazou/fonts/${f}`, `${A}/fonts/${f}`);
console.log('assets ok');
