import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/index.js", import.meta.url), "utf8");
const workerUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const {default: worker} = await import(workerUrl);

const env = {
    ASSETS: {
        fetch: async (request) => new Response(new URL(request.url).pathname),
    },
};

test("serves the climbing video guide from its canonical path", async () => {
    const response = await worker.fetch(
        new Request("https://www.cruxcut.com/guides/how-to-film-and-edit-climbing-videos"),
        env,
    );

    assert.equal(response.status, 200);
    assert.equal(await response.text(), "/guides/how-to-film-and-edit-climbing-videos.html");
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

test("serves the public guides index", async () => {
    const response = await worker.fetch(
        new Request("https://www.cruxcut.com/guides"),
        env,
    );

    assert.equal(response.status, 200);
    assert.equal(await response.text(), "/guides/index.html");
});

test("serves the product homepage from the root", async () => {
    const response = await worker.fetch(
        new Request("https://www.cruxcut.com/"),
        env,
    );

    assert.equal(response.status, 200);
    assert.equal(await response.text(), "/index.html");
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

    assert.equal(await privacy.text(), "/privacy.html");
    assert.equal(await terms.text(), "/terms.html");
});
