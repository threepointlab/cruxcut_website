import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

for (const [file, title, label] of [
  ['../index.html', 'Help shape what comes next', 'Join the Discord'],
  ['../ko/index.html', '다음 변화를 함께 만들어요', 'Discord 참여하기'],
]) {
  test(`${file} exposes a secondary community entry before downloads`, async () => {
    const html = await readFile(new URL(file, import.meta.url), 'utf8');
    assert.match(html, /class="community-nav-link" href="#community"/);
    assert.ok(html.includes(`<h2 id="community-title">${title}</h2>`));
    assert.ok(html.indexOf('id="community"') < html.indexOf('class="final-cta"'));
    assert.match(html, new RegExp(`class="button community-button" href="https://discord.gg/phFRhaWCU5" target="_blank" rel="noopener noreferrer">${label}`));
    assert.equal((html.match(/href="https:\/\/discord.gg\/phFRhaWCU5"/g) || []).length, 4);
    assert.match(html, /<footer[\s\S]*href="https:\/\/discord.gg\/phFRhaWCU5"/);
  });
}

test('community copy invites feedback without a delivery promise', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('Vote on October ideas, suggest features, report bugs, and see what ships.'));
});
