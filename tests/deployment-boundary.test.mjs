import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const assetsIgnore = await readFile(new URL("../.assetsignore", import.meta.url), "utf8");
const gitIgnore = await readFile(new URL("../.gitignore", import.meta.url), "utf8");

test("keeps deleted backlog paths outside future asset uploads", () => {
    assert.match(assetsIgnore, /^backlog\/$/m);
    assert.doesNotMatch(gitIgnore, /^backlog(?:\/|$)/m);
});
