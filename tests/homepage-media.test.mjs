import assert from "node:assert/strict";
import {stat} from "node:fs/promises";
import test from "node:test";

const budgets = new Map([
    ["../assets/home/followcam-proof.mp4", 5_000_000],
    ["../assets/home/highlights-proof.mp4", 4_000_000],
    ["../assets/home/route-sticker-proof.mp4", 2_000_000],
    ["../assets/home/followcam-poster.jpg", 700_000],
    ["../assets/home/highlights-poster.jpg", 700_000],
    ["../assets/home/route-sticker-poster.jpg", 700_000],
    ["../assets/home/og.png", 2_500_000],
]);

test("ships every homepage media asset inside its byte budget", async () => {
    for (const [relativePath, maximumBytes] of budgets) {
        const metadata = await stat(new URL(relativePath, import.meta.url));
        assert.ok(
            metadata.size <= maximumBytes,
            `${relativePath} is ${metadata.size} bytes; limit is ${maximumBytes}`,
        );
    }
});
