import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("publishes an indexable US-English climbing video editor comparison", async () => {
    const html = await read("../guides/climbing-video-editor-comparison.html");

    assert.match(html, /<html lang="en">/);
    assert.match(html, /<title>Best Climbing Video Editors for iPhone: Honest Comparison · cruxcut<\/title>/);
    assert.match(html, /<link rel="canonical" href="https:\/\/www\.cruxcut\.com\/guides\/climbing-video-editor-comparison">/);
    assert.match(html, /<h1>Best Climbing Video Editors for iPhone: Honest Comparison<\/h1>/);
    for (const product of ["CruxCut", "BoulderCam", "CapCut", "Splice"]) {
        assert.match(html, new RegExp(`<strong>${product}</strong>`));
    }
});

test("keeps the comparison evidence-based and explicit about tradeoffs", async () => {
    const html = await read("../guides/climbing-video-editor-comparison.html");

    assert.match(html, /official product pages and help centers/i);
    assert.match(html, /Climbing-specific automation/i);
    assert.match(html, /General-purpose editor/i);
    assert.match(html, /No single editor is best for every climber/i);
    assert.doesNotMatch(html, /market share|#1 climbing app|best-rated/i);
});

test("publishes structured article and visible FAQ facts", async () => {
    const html = await read("../guides/climbing-video-editor-comparison.html");
    const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

    assert.ok(match);
    const graph = JSON.parse(match[1])["@graph"];
    assert.ok(graph.some((item) => item["@type"] === "Article"));

    const faq = graph.find((item) => item["@type"] === "FAQPage");
    const visibleQuestions = [...html.matchAll(
        /<details class="faq-item" data-faq-question="([^"]+)">/g,
    )].map((item) => item[1]);
    const visibleAnswers = [...html.matchAll(
        /<details class="faq-item"[^>]*><summary>[^<]+<\/summary><p>([^<]+)<\/p><\/details>/g,
    )].map((item) => item[1]);

    assert.deepEqual(faq.mainEntity.map((item) => item.name), visibleQuestions);
    assert.deepEqual(
        faq.mainEntity.map((item) => item.acceptedAnswer.text),
        visibleAnswers,
    );
});

test("links the comparison from every public discovery surface", async () => {
    const path = "/guides/climbing-video-editor-comparison";
    const [guides, sitemap, llms] = await Promise.all([
        read("../guides/index.html"),
        read("../sitemap.xml"),
        read("../llms.txt"),
    ]);

    assert.match(guides, new RegExp(`href="${path}"`));
    assert.match(sitemap, new RegExp(`<loc>https:\/\/www\\.cruxcut\\.com${path}<\/loc>`));
    assert.match(llms, new RegExp(`https:\/\/www\\.cruxcut\\.com${path}`));
});
