import assert from "node:assert/strict";
import {access, readFile} from "node:fs/promises";
import test from "node:test";
import {fileURLToPath} from "node:url";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("publishes an indexable US-English automatic highlights guide", async () => {
    const html = await read("../guides/automatic-climbing-highlights.html");

    assert.match(html, /<html lang="en">/);
    assert.match(html, /<title>How to Automatically Create Climbing Highlights on iPhone · cruxcut<\/title>/);
    assert.match(html, /<link rel="canonical" href="https:\/\/www\.cruxcut\.com\/guides\/automatic-climbing-highlights">/);
    assert.match(html, /<meta name="description" content="[^"]*climbing highlights[^"]*iPhone[^"]*">/i);
    assert.match(html, /<h1>How to Automatically Create Climbing Highlights on iPhone<\/h1>/);
});

test("shows product evidence and describes user-controlled highlight selection", async () => {
    const html = await read("../guides/automatic-climbing-highlights.html");
    const pageUrl = new URL("../guides/automatic-climbing-highlights.html", import.meta.url);
    const canonicalUrl = "https://www.cruxcut.com/guides/automatic-climbing-highlights";
    const poster = html.match(/<video[^>]*poster="([^"]+)"[^>]*>/)?.[1];
    const source = html.match(/<source src="([^"]+)" type="video\/mp4">/)?.[1];
    const fallback = html.match(/<img src="([^"]+)" width="540" height="960"/)?.[1];

    assert.ok(poster);
    assert.ok(source);
    assert.ok(fallback);
    for (const mediaUrl of [poster, source, fallback]) {
        await access(fileURLToPath(new URL(mediaUrl, pageUrl)));
    }
    assert.equal(new URL(poster, canonicalUrl).pathname, "/assets/home/highlights-poster.jpg");
    assert.equal(new URL(source, canonicalUrl).pathname, "/assets/home/highlights-proof.mp4");
    assert.equal(new URL(fallback, canonicalUrl).pathname, "/assets/home/highlights-poster.jpg");
    assert.match(html, /CruxCut analyzes video on your iPhone/i);
    assert.match(html, /you choose the moments/i);
    assert.doesNotMatch(html, /uploads? (?:your )?raw (?:climbing )?footage/i);
});

test("publishes structured article, video, and visible FAQ facts", async () => {
    const html = await read("../guides/automatic-climbing-highlights.html");
    const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

    assert.ok(match);
    const graph = JSON.parse(match[1])["@graph"];
    assert.ok(graph.some((item) => item["@type"] === "Article"));

    const video = graph.find((item) => item["@type"] === "VideoObject");
    assert.equal(video.contentUrl, "https://www.cruxcut.com/assets/home/highlights-proof.mp4");
    assert.equal(video.thumbnailUrl, "https://www.cruxcut.com/assets/home/highlights-poster.jpg");

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

test("links the highlights guide from every public discovery surface", async () => {
    const path = "/guides/automatic-climbing-highlights";
    const [homepage, guides, sitemap, llms] = await Promise.all([
        read("../index.html"),
        read("../guides/index.html"),
        read("../sitemap.xml"),
        read("../llms.txt"),
    ]);

    assert.match(homepage, new RegExp(`href="${path}"`));
    assert.match(guides, new RegExp(`href="${path}"`));
    assert.match(sitemap, new RegExp(`<loc>https:\/\/www\\.cruxcut\\.com${path}<\/loc>`));
    assert.match(llms, new RegExp(`https:\/\/www\\.cruxcut\\.com${path}`));
});
