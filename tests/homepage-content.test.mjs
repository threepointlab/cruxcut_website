import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

const appStoreUrl =
    "https://apps.apple.com/app/apple-store/id6771268613?pt=127608181&amp;ct=website_home&amp;mt=8";

const jsonLdBlocks = [...html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
)].map((match) => JSON.parse(match[1]));

test("publishes canonical US-English homepage metadata", () => {
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<title>CruxCut — AI Climbing Video Editor for iPhone<\/title>/);
    assert.match(html, /<link rel="canonical" href="https:\/\/www\.cruxcut\.com\/">/);
    assert.match(html, /<meta name="description" content="CruxCut is an AI climbing video editor for iPhone\./);
    assert.match(html, /<meta property="og:title" content="CruxCut — AI Climbing Video Editor for iPhone">/);
});

test("presents exactly the approved three results", () => {
    const resultHeadings = [...html.matchAll(
        /<h2 class="feature-title">([^<]+)<\/h2>/g,
    )].map((match) => match[1]);

    assert.deepEqual(resultHeadings, [
        "AI Follow-cam",
        "Crux Highlights",
        "Route Stickers",
    ]);
    assert.doesNotMatch(
        html,
        /<h[1-6][^>]*>\s*Move-by-move segmentation\s*<\/h[1-6]>/i,
    );
});

test("uses the approved App Store campaign URL", () => {
    assert.match(html, new RegExp(appStoreUrl.replace(/[?&]/g, "\\$&")));
});

test("publishes parseable application and FAQ structured data", () => {
    assert.equal(jsonLdBlocks.length, 1);
    const graph = jsonLdBlocks[0]["@graph"];
    assert.ok(graph.some((item) => item["@type"] === "Organization"));
    assert.ok(graph.some((item) => item["@type"] === "SoftwareApplication"));

    const faq = graph.find((item) => item["@type"] === "FAQPage");
    const visibleQuestions = [...html.matchAll(
        /<details class="faq-item" data-faq-question="([^"]+)">/g,
    )].map((match) => match[1]);
    const visibleAnswers = [...html.matchAll(
        /<details class="faq-item"[^>]*><summary>[^<]+<\/summary><p>([^<]+)<\/p><\/details>/g,
    )].map((match) => match[1]);
    assert.deepEqual(
        faq.mainEntity.map((item) => item.name),
        visibleQuestions,
    );
    assert.deepEqual(
        faq.mainEntity.map((item) => item.acceptedAnswer.text),
        visibleAnswers,
    );
});

test("keeps product information available without JavaScript", () => {
    assert.match(html, /Great sends deserve great videos\./);
    assert.match(html, /Video processing happens on your iPhone\./);
    assert.match(html, /href="\/privacy"/);
    assert.match(html, /href="\/guides\/how-to-film-and-edit-climbing-videos"/);
});
