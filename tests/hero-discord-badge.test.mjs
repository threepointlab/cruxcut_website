import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
for(const file of ['../index.html','../ko/index.html'])test(`${file} keeps accessible branded Discord hero anchor and attribution hook`,async()=>{
 const html=await readFile(new URL(file,import.meta.url),'utf8');
 assert.match(html,/<a class="button hero-discord" href="https:\/\/discord.gg\/phFRhaWCU5" target="_blank" rel="noopener noreferrer"><img class="discord-mark"[^>]*alt="" aria-hidden="true"><span>(?:Join the Discord|Discord 참여하기)<\/span><\/a>/);
 assert.equal((html.match(/src="\/assets\/home\/attribution.js\?v=1"/g)||[]).length,1);
 assert.match(html,/home.css\?v=discord-badge-1/);
});
test('Discord uses black badge, white official mark and matching desktop/mobile heights',async()=>{
 const css=await readFile(new URL('../assets/home/home.css',import.meta.url),'utf8');
 assert.match(css,/\.hero-discord\{height:54px;min-height:54px;[^}]*border-radius:7px;background:#000;color:#fff/);
 assert.match(css,/\.hero-store-ctas \.hero-discord\{width:auto;height:40px;min-height:40px/);
 const svg=await readFile(new URL('../assets/home/discord-mark.svg',import.meta.url),'utf8');
 assert.match(svg,/viewBox="0 0 64 48"/);assert.match(svg,/fill="white"/);
 assert.doesNotMatch(svg,/<script|<foreignObject|(?:href|onload)=/i);
});
