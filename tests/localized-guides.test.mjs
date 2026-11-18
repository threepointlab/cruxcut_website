import assert from "node:assert/strict";
import {readFile, readdir} from "node:fs/promises";
import test from "node:test";

const ORIGIN = "https://www.cruxcut.com";
const LANGS = ["ko", "ja", "es", "zh-Hans"];
const read = path => readFile(new URL("../" + path, import.meta.url), "utf8");
const slugs = (await readdir(new URL("../guides/", import.meta.url))).filter(f => f.endsWith(".html")).map(f => f.slice(0, -5));
const sitemap = await read("sitemap.xml");
const enUrl = s => ORIGIN + "/guides" + (s === "index" ? "" : "/" + s);
const locUrl = (L, s) => ORIGIN + "/" + L + "/guides/" + (s === "index" ? "" : s);

test("every English guide has a localized page in each supported app language", async () => {
    for (const L of LANGS) for (const s of slugs) {
        const html = await read(`${L}/guides/${s}.html`);
        assert.match(html, new RegExp(`<html lang="${L}"`), `${L}/${s} lang`);
        assert.ok(html.includes(`<link rel="canonical" href="${locUrl(L, s)}">`), `${L}/${s} canonical`);
        assert.ok(html.includes(`<meta property="og:url" content="${locUrl(L, s)}">`), `${L}/${s} og:url`);
    }
});

test("hreflang sets are reciprocal on English and localized pages and in the sitemap", async () => {
    for (const s of slugs) {
        const expected = [["en", enUrl(s)], ...LANGS.map(L => [L, locUrl(L, s)]), ["x-default", enUrl(s)]];
        for (const page of [`guides/${s}.html`, ...LANGS.map(L => `${L}/guides/${s}.html`)]) {
            const html = await read(page);
            for (const [lang, href] of expected) assert.ok(html.includes(`<link rel="alternate" hreflang="${lang}" href="${href}">`), `${page} hreflang ${lang}`);
        }
        for (const url of [enUrl(s), ...LANGS.map(L => locUrl(L, s))]) {
            const block = sitemap.match(new RegExp(`<url>\\s*<loc>${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</loc>[\\s\\S]*?</url>`));
            assert.ok(block, `sitemap has ${url}`);
            for (const [lang, href] of expected) assert.ok(block[0].includes(`hreflang="${lang}" href="${href}"`), `sitemap ${url} -> ${lang}`);
        }
    }
});

test("localized guides link to localized guides, parse as JSON-LD, and keep store links", async () => {
    for (const L of LANGS) for (const s of slugs) {
        const html = await read(`${L}/guides/${s}.html`);
        assert.doesNotMatch(html.replace(/<span data-i18n-switcher>[\s\S]*?<\/span>/, ""), /href="\/guides[\/"]/, `${L}/${s} has an unlocalized internal guide link`);
        const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
        assert.ok(ld, `${L}/${s} JSON-LD`);
        const parsed = JSON.parse(ld[1]);
        assert.ok(ld[1].includes(`"inLanguage":"${L}"`) || !ld[1].includes("inLanguage"), `${L}/${s} inLanguage`);
        assert.ok(!ld[1].includes(`"${enUrl(s)}"`), `${L}/${s} JSON-LD still points at English URL`);
        assert.ok(parsed["@graph"] || parsed["@type"]);
        assert.match(html, /play\.google\.com\/store\/apps\/details\?id=com\.threepointlab\.cruxcut|apps\.apple\.com/);
        assert.doesNotMatch(html, /<!--CRUXCUT_STYLE-->/);
        assert.match(html, /<style>/);
    }
});

test("guide visits on localized paths are bucketed as guides", async () => {
    const {pageBucket} = await import("../assets/home/attribution-core.mjs");
    for (const L of LANGS) assert.equal(pageBucket(`/${L}/guides/some-guide`), "guides");
    assert.equal(pageBucket("/ko/"), "home_ko");
});
