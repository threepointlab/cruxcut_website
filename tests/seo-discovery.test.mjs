import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
import worker from "../src/index.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const ldBlocks = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

test("Korean homepage FAQ JSON-LD matches the visible FAQ text exactly", async () => {
    const html = await read("../ko/index.html");
    const visible = [...html.matchAll(/<summary>([^<]+)<\/summary><p>([^<]+)<\/p>/g)].map((m) => [m[1], m[2]]);
    const faq = ldBlocks(html).flatMap((b) => b["@graph"] ?? [b]).find((n) => n["@type"] === "FAQPage");
    assert.deepEqual(faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]), visible);
    assert.match(html, /<meta property="og:url" content="https:\/\/www\.cruxcut\.com\/ko\/">/);
});

test("every public page uses one Organization entity and the CruxCut brand spelling", async () => {
    for (const path of ["../guides/index.html", "../guides/how-to-film-and-edit-climbing-videos.html", "../guides/automatic-climbing-highlights.html", "../guides/climbing-video-editor-comparison.html", "../about.html"]) {
        const html = await read(path);
        assert.doesNotMatch(html, /<title>[^<]*cruxcut[^<]*<\/title>/, `${path} title uses lowercase brand`);
        assert.doesNotMatch(html, /"@type": ?"Organization", ?"name"/, `${path} redeclares Organization`);
        assert.ok(ldBlocks(html).length >= 1, `${path} has no JSON-LD`);
    }
});

test("sitemap lists bilingual home alternates and legal pages", async () => {
    const sitemap = await read("../sitemap.xml");
    assert.match(sitemap, /hreflang="ko" href="https:\/\/www\.cruxcut\.com\/ko\/"/);
    assert.match(sitemap, /<loc>https:\/\/www\.cruxcut\.com\/en\/privacy<\/loc>/);
    assert.match(sitemap, /<loc>https:\/\/www\.cruxcut\.com\/guides\/climbing-video-editor-comparison<\/loc>/);
});

test("IndexNow key file is served from the site root", async () => {
    const script = await read("../scripts/indexnow.mjs");
    const key = script.match(/const KEY = "([0-9a-f]{32})"/)[1];
    assert.equal(await read(`../${key}.txt`), key);
});

test("internal tools are marked noindex while public pages are not", async () => {
    const env = {ASSETS: {fetch: async () => new Response("ok", {headers: {"Content-Type": "text/html"}})}};
    for (const path of ["/admin", "/admin/", "/mindmap", "/loading"]) {
        const res = await worker.fetch(new Request(`https://www.cruxcut.com${path}`), env);
        assert.equal(res.headers.get("X-Robots-Tag"), "noindex, nofollow", path);
    }
    for (const path of ["/", "/ko/", "/guides", "/about"]) {
        const res = await worker.fetch(new Request(`https://www.cruxcut.com${path}`), env);
        assert.equal(res.headers.get("X-Robots-Tag"), null, path);
    }
});
