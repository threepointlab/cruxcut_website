import assert from "node:assert/strict";
import {readFile, readdir} from "node:fs/promises";
import test from "node:test";

const read = (p) => readFile(new URL(p, import.meta.url), "utf8");
const PLAY = "https://play.google.com/store/apps/details?id=com.threepointlab.cruxcut";
const source = await read("../src/index.js");
const {default: worker} = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

test("every guide offers both App Store and Google Play and no iOS-only CTA", async () => {
    const files = (await readdir(new URL("../guides/", import.meta.url))).filter((f) => f.endsWith(".html"));
    assert.ok(files.length >= 12);
    for (const f of files) {
        const html = await read(`../guides/${f}`);
        assert.ok(html.includes(`href="${PLAY}">Google Play</a>`), f);
        assert.match(html, /apps\.apple\.com[^"]*">App Store<\/a>/, f);
        assert.doesNotMatch(html, /Get the iOS app/, f);
    }
});

test("public product descriptions do not frame CruxCut as iPhone-only", async () => {
    for (const p of ["../index.html", "../ko/index.html", "../about.html", "../llms.txt", "../guides/how-to-film-and-edit-climbing-videos.html", "../guides/automatic-climbing-highlights.html"]) {
        const text = await read(p);
        assert.doesNotMatch(text, /AI (?:climbing )?video editor for iPhone(?! and Android)|iPhone용 AI|CruxCut<\/a> for iPhone<|analysis runs on the iPhone|happen on the user's iPhone|on your iPhone\./, p);
    }
    const llms = await read("../llms.txt");
    assert.match(llms, /not iOS-only/);
    assert.match(llms, /iPhone과 Android 모두/);
    const links = llms.match(/\]\(https:\/\/[^)]+\)/g) || [];
    assert.ok(links.length >= 20, `llms.txt markdown links: ${links.length}`);
});

test("homepage Android FAQ is visible and mirrored in FAQ schema", async () => {
    for (const [p, q] of [["../index.html", "Is CruxCut available for Android and iPhone?"], ["../ko/index.html", "Android와 iPhone에서 다운로드할 수 있나요?"]]) {
        const html = await read(p);
        const visible = html.match(new RegExp(`<summary>${q.replace(/[?]/g, "\\?")}</summary><p>([^<]+)</p>`))[1];
        assert.match(visible, /Android/);
        assert.ok(html.includes(`"text":"${visible}"`), p);
    }
});

test("worker adds security headers and serves a noindex 404 page", async () => {
    const env = {ASSETS: {fetch: async (r) => {
        const path = new URL(r.url).pathname;
        if (path === "/404") return new Response("<h1>Page not found</h1>", {status: 200, headers: {"Content-Type": "text/html"}});
        if (path === "/") return new Response("home", {status: 200, headers: {"Content-Type": "text/html"}});
        return new Response("nf", {status: 404});
    }}};
    const home = await worker.fetch(new Request("https://www.cruxcut.com/"), env);
    assert.equal(home.headers.get("Strict-Transport-Security"), "max-age=31536000");
    assert.equal(home.headers.get("X-Content-Type-Options"), "nosniff");
    assert.equal(home.headers.get("X-Frame-Options"), "SAMEORIGIN");
    assert.equal(home.headers.get("X-Robots-Tag"), null);
    const missing = await worker.fetch(new Request("https://www.cruxcut.com/no-such-page", {headers: {Accept: "text/html"}}), env);
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /Page not found/);
    assert.match(missing.headers.get("X-Robots-Tag"), /noindex/);
    const asset = await worker.fetch(new Request("https://www.cruxcut.com/missing.png", {headers: {Accept: "image/*"}}), env);
    assert.equal(asset.status, 404);
    assert.equal(await asset.text(), "nf");
    const direct = await worker.fetch(new Request("https://www.cruxcut.com/404"), env);
    assert.match(direct.headers.get("X-Robots-Tag"), /noindex/);
});

test("homepage HLS videos are served same-origin from R2", async () => {
    for (const p of ["../index.html", "../ko/index.html", "../assets/home/home.js"]) {
        const text = await read(p);
        assert.doesNotMatch(text, /workers\.dev\/hls/, p);
        assert.match(text, /src="\/hls\/[a-z0-9_-]+\/master\.m3u8"/, p);
    }
    const store = {"hls/lead/master.m3u8": "#EXTM3U", "hls/lead/segment-2-1.ts": "TS"};
    const MEDIA = {
        get: async (k) => (k in store ? {body: store[k], httpEtag: '"e"', size: store[k].length} : null),
        head: async (k) => (k in store ? {httpEtag: '"e"', size: store[k].length} : null),
    };
    const env = {MEDIA, ASSETS: {fetch: async () => new Response("nf", {status: 404})}};
    const m = await worker.fetch(new Request("https://www.cruxcut.com/hls/lead/master.m3u8"), env);
    assert.equal(m.status, 200);
    assert.equal(m.headers.get("Content-Type"), "application/vnd.apple.mpegurl");
    assert.equal(await m.text(), "#EXTM3U");
    const ts = await worker.fetch(new Request("https://www.cruxcut.com/hls/lead/segment-2-1.ts"), env);
    assert.equal(ts.headers.get("Content-Type"), "video/mp2t");
    assert.equal((await worker.fetch(new Request("https://www.cruxcut.com/hls/lead/nope.m3u8"), env)).status, 404);
    assert.equal((await worker.fetch(new Request("https://www.cruxcut.com/hls/../wrangler.toml"), env)).status, 404);
    assert.equal((await worker.fetch(new Request("https://www.cruxcut.com/hls/lead/master.m3u8", {method: "POST"}), env)).status, 405);
});
