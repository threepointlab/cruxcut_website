import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/index.js", import.meta.url), "utf8");
const config = await readFile(new URL("../wrangler.toml", import.meta.url), "utf8");
const workerUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const {default: worker} = await import(workerUrl);
const publicAssetPaths = new Set([
    "/",
    "/ko/",
    "/privacy",
    "/terms",
    "/guides/",
    "/guides/how-to-film-and-edit-climbing-videos",
    "/guides/automatic-climbing-highlights",
    "/guides/climbing-video-editor-comparison",
]);

const env = {
    ASSETS: {
        fetch: async (request) => {
            const pathname = new URL(request.url).pathname;
            return new Response(pathname, {
                status: publicAssetPaths.has(pathname) ? 200 : 404,
            });
        },
    },
};

test("serves the climbing video guide from its canonical path", async () => {
    const response = await worker.fetch(
        new Request("https://www.cruxcut.com/guides/how-to-film-and-edit-climbing-videos"),
        env,
    );

    assert.equal(response.status, 200);
    assert.equal(await response.text(), "/guides/how-to-film-and-edit-climbing-videos");
});

test("redirects the guide html filename to its canonical path", async () => {
    const response = await worker.fetch(
        new Request("https://www.cruxcut.com/guides/how-to-film-and-edit-climbing-videos.html"),
        env,
    );

    assert.equal(response.status, 301);
    assert.equal(
        response.headers.get("location"),
        "https://www.cruxcut.com/guides/how-to-film-and-edit-climbing-videos",
    );
});

test("serves the automatic climbing highlights guide from its canonical path", async () => {
    const guide = "/guides/automatic-climbing-highlights";
    const response = await worker.fetch(
        new Request(`https://www.cruxcut.com${guide}`),
        env,
    );

    assert.equal(response.status, 200);
    assert.equal(await response.text(), guide);
});

test("redirects the highlights guide html filename to its canonical path", async () => {
    const guide = "/guides/automatic-climbing-highlights";
    const response = await worker.fetch(
        new Request(`https://www.cruxcut.com${guide}.html`),
        env,
    );

    assert.equal(response.status, 301);
    assert.equal(response.headers.get("location"), `https://www.cruxcut.com${guide}`);
});

test("serves and canonicalizes the climbing video editor comparison", async () => {
    const guide = "/guides/climbing-video-editor-comparison";
    const response = await worker.fetch(
        new Request(`https://www.cruxcut.com${guide}`),
        env,
    );
    const redirect = await worker.fetch(
        new Request(`https://www.cruxcut.com${guide}.html`),
        env,
    );

    assert.equal(response.status, 200);
    assert.equal(await response.text(), guide);
    assert.equal(redirect.status, 301);
    assert.equal(redirect.headers.get("location"), `https://www.cruxcut.com${guide}`);
});

test("serves the public guides index", async () => {
    const response = await worker.fetch(
        new Request("https://www.cruxcut.com/guides"),
        env,
    );

    assert.equal(response.status, 200);
    assert.equal(await response.text(), "/guides/");
});

test("serves the product homepage from the root", async () => {
    const response = await worker.fetch(
        new Request("https://www.cruxcut.com/"),
        env,
    );

    assert.equal(response.status, 200);
    assert.equal(await response.text(), "/");
});

test("serves the Korean product homepage", async () => {
    const response = await worker.fetch(
        new Request("https://www.cruxcut.com/ko/"),
        env,
    );

    assert.equal(response.status, 200);
    assert.equal(await response.text(), "/ko/");
});

test("keeps the canonical privacy and terms routes", async () => {
    const privacy = await worker.fetch(
        new Request("https://www.cruxcut.com/privacy"),
        env,
    );
    const terms = await worker.fetch(
        new Request("https://www.cruxcut.com/terms"),
        env,
    );

    assert.equal(await privacy.text(), "/privacy");
    assert.equal(await terms.text(), "/terms");
});

test("does not expose the removed backlog", async () => {
    for (const pathname of ["/backlog", "/backlog/", "/backlog/data/raw/probe.txt"]) {
        const response = await worker.fetch(
            new Request(`https://www.cruxcut.com${pathname}`),
            env,
        );

        assert.equal(response.status, 404, pathname);
        assert.equal(response.headers.get("www-authenticate"), null, pathname);
    }
});

test("keeps automatic HTML canonicalization", () => {
    assert.match(config, /binding\s*=\s*"ASSETS"/);
    assert.match(config, /html_handling\s*=\s*"auto-trailing-slash"/);
});
