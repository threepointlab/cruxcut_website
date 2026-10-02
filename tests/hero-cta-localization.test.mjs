import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const css = await readFile(new URL('../assets/home/home.css', import.meta.url), 'utf8');
for (const [file, lang, suffix, discord, soon, storeAlt] of [
 ['../index.html','en','','Join the Discord','Coming soon','Download on the App Store'],
 ['../ko/index.html','ko','-ko','Discord 참여하기','출시 예정','App Store에서 다운로드하기'],
]) test(`${lang} hero uses real localized badge artwork, names and Android fallback`, async () => {
 const html = await readFile(new URL(file, import.meta.url), 'utf8');
 assert.ok(html.includes(`<html lang="${lang}">`));
 const hero = html.match(/<div class="hero-store-ctas">([\s\S]*?)<\/div>/)?.[1];
 assert.ok(hero, 'hero CTA group exists');
 assert.equal((hero.match(/<a\b/g) || []).length, 3);
 assert.ok(hero.includes(`src="/assets/home/download-on-app-store${suffix}.svg"`));
 assert.ok(hero.includes(`src="/assets/home/google-play-badge${suffix}.svg"`));
 assert.ok(hero.includes(`alt="${storeAlt}"`));
 assert.ok(hero.includes(`href="/download/android?lang=${lang}"`));
 assert.ok(hero.includes(`data-play-label>${soon}</span>`));
 assert.ok(hero.includes(`<span>${discord}</span>`));
 assert.ok(hero.includes('href="https://discord.gg/phFRhaWCU5"'));
 assert.ok(hero.includes('alt="" aria-hidden="true"'));
 assert.ok(html.includes('home.css?v=cta-type-1'));
});

test('preserves outlined, genuinely localized store artwork instead of replacing brand typefaces', async () => {
 const appEN = await readFile(new URL('../assets/home/download-on-app-store.svg', import.meta.url), 'utf8');
 const appKO = await readFile(new URL('../assets/home/download-on-app-store-ko.svg', import.meta.url), 'utf8');
 const playEN = await readFile(new URL('../assets/home/google-play-badge.svg', import.meta.url), 'utf8');
 const playKO = await readFile(new URL('../assets/home/google-play-badge-ko.svg', import.meta.url), 'utf8');
 assert.notEqual(appEN, appKO); assert.notEqual(playEN, playKO);
 assert.match(appEN, /App_Store_Badge_US-UK/); assert.match(appKO, /App_Store_Badge_KR/);
 for (const svg of [appEN,appKO,playEN,playKO]) {
  assert.match(svg, /<path\b/);
  assert.doesNotMatch(svg, /<text\b|<foreignObject\b/);
 }
});

test('keeps proportional store sizing and language-specific optical Discord sizes', () => {
 assert.match(css, /\.hero-store-ctas \.app-store-badge img\{height:54px;width:auto\}/);
 assert.match(css, /\.hero-store-ctas \.app-store-badge img\{height:40px;width:auto\}/);
 assert.match(css, /\.hero-discord\{[^}]*font-size:20px;font-weight:600/);
 assert.match(css, /\.hero-store-ctas \.hero-discord\{[^}]*font-size:15px/);
 const koSizes = [...css.matchAll(/html\[lang="ko"\] \.hero-discord\{font-size:(\d+)px\}/g)].map(m => Number(m[1]));
 assert.deepEqual(koSizes, [17,13]);
 assert.match(css, /white-space:nowrap/);
 assert.match(css, /font-family:"Pretendard Variable",Pretendard,-apple-system/);
});

test('coming-soon state has no accidental link underline while remaining in the real anchor', () => {
 assert.match(css, /\.hero-store-ctas \.app-store-badge\{margin:0!important;text-decoration:none\}/);
});
