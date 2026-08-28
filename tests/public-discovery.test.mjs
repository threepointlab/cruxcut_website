import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("publishes canonical product facts in llms.txt", async () => {
    const text = await read("../llms.txt");
    assert.match(text, /^# CruxCut$/m);
    assert.match(text, /AI climbing video editor for iPhone/);
    assert.match(text, /AI Follow-cam/);
    assert.match(text, /Crux Highlights/);
    assert.match(text, /Route Stickers/);
    assert.match(text, /https:\/\/www\.cruxcut\.com\/privacy/);
});

test("includes the homepage and guide in sitemap.xml", async () => {
    const sitemap = await read("../sitemap.xml");
    assert.match(sitemap, /<loc>https:\/\/www\.cruxcut\.com\/<\/loc>/);
    assert.match(sitemap, /<loc>https:\/\/www\.cruxcut\.com\/guides\/how-to-film-and-edit-climbing-videos<\/loc>/);
    assert.match(sitemap, /<loc>https:\/\/www\.cruxcut\.com\/guides\/automatic-climbing-highlights<\/loc>/);
});

test("links guide wordmarks back to the homepage", async () => {
    for (const path of [
        "../guides/index.html",
        "../guides/how-to-film-and-edit-climbing-videos.html",
        "../guides/automatic-climbing-highlights.html",
    ]) {
        const html = await read(path);
        assert.match(html, /class="wordmark" href="\/"/);
    }
});
