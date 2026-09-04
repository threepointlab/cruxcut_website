import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const koreanHtml = await readFile(new URL("../ko/index.html", import.meta.url), "utf8");

const appStoreUrl =
    "https://apps.apple.com/app/apple-store/id6771268613?pt=127608181&amp;ct=website_home&amp;mt=8";

const jsonLdBlocks = [...html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
)].map((match) => JSON.parse(match[1]));

test("publishes canonical US-English homepage metadata", () => {
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<title>CruxCut — AI Follow-Cam Editor for Climbers<\/title>/);
    assert.match(html, /<link rel="canonical" href="https:\/\/www\.cruxcut\.com\/">/);
    assert.match(html, /<meta name="description" content="Turn static climbing footage into a smooth AI follow-cam\./);
    assert.match(html, /<meta property="og:title" content="CruxCut — AI Follow-Cam Editor for Climbers">/);
});

test("presents exactly the approved three results", () => {
    assert.match(html, /id="follow-cam"/);
    assert.match(html, /id="highlights-title" class="feature-title">Crux Highlights<\/h2>/);
    assert.match(html, /id="route-title" class="feature-title">Route Stickers<\/h2>/);
    assert.doesNotMatch(
        html,
        /<h[1-6][^>]*>\s*Move-by-move segmentation\s*<\/h[1-6]>/i,
    );
});

test("uses the approved App Store campaign URL", () => {
    assert.match(html, new RegExp(appStoreUrl.replace(/[?&]/g, "\\$&")));
});

test("publishes a Korean homepage with the same product story", () => {
    assert.match(koreanHtml, /<html lang="ko">/);
    assert.match(koreanHtml, /클라이머를 위한<br>영상 편집/);
    assert.match(koreanHtml, /어떤 촬영 환경에서도/);
    assert.match(koreanHtml, /data-climb-carousel/);
    assert.match(html, /hreflang="ko" href="https:\/\/www\.cruxcut\.com\/ko\/"/);
});

test("keeps the English homepage aligned with the Korean source copy", () => {
    const englishFaqCount = (html.match(/<details class="faq-item"/g) || []).length;
    const koreanFaqCount = (koreanHtml.match(/<details class="faq-item"/g) || []).length;

    assert.equal(englishFaqCount, koreanFaqCount);
    assert.match(html, /Video editing<br>for climbers/);
    assert.match(html, /More features/);
    assert.match(html, /What if the AI loses track of the climber\?/);
    assert.match(html, /Everything runs on-device, keeping your videos completely private\./);
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
    assert.match(html, /Great sends deserve great footage\./);
    assert.match(html, /Your footage never leaves your iPhone\./);
    assert.match(html, /href="\/privacy"/);
    assert.doesNotMatch(html, /Questions, answered/);
    assert.doesNotMatch(html, /class="guide-card/);
});

test("publishes the absolute social preview metadata", () => {
    assert.match(
        html,
        /<meta property="og:image" content="https:\/\/www\.cruxcut\.com\/assets\/home\/og\.png">/,
    );
    assert.match(
        html,
        /<meta name="twitter:image" content="https:\/\/www\.cruxcut\.com\/assets\/home\/og\.png">/,
    );
});

test("describes the current follow-cam and highlight proof media", () => {
    assert.match(
        html,
        /aria-label="CruxCut detecting and following a lead climber"/,
    );
    assert.match(
        html,
        /aria-label="CruxCut highlight sharing flow on iPhone"/,
    );
});
