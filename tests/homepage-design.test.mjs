import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../assets/home/home.css", import.meta.url), "utf8");
const script = await readFile(new URL("../assets/home/home.js", import.meta.url), "utf8");

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const declarationsFor = (selector) => {
    const match = css.match(new RegExp(`${escapeRegExp(selector)}\\s*\\{([^}]*)\\}`));
    assert.ok(match, `missing CSS rule for ${selector}`);

    return Object.fromEntries(match[1]
        .split(";")
        .map((declaration) => declaration.trim())
        .filter(Boolean)
        .map((declaration) => {
            const separator = declaration.indexOf(":");
            return [
                declaration.slice(0, separator).trim(),
                declaration.slice(separator + 1).trim(),
            ];
        }));
};

const relativeLuminance = (hex) => {
    const channels = hex.match(/[0-9a-f]{2}/gi).map((channel) => {
        const value = Number.parseInt(channel, 16) / 255;
        return value <= 0.04045
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrastRatio = (first, second) => {
    const luminances = [relativeLuminance(first), relativeLuminance(second)];
    return (Math.max(...luminances) + 0.05) / (Math.min(...luminances) + 0.05);
};

test("uses one bilingual UI font while preserving the logo treatment", () => {
    assert.match(
        css,
        /body :not\(\.wordmark,[^}]+\)\{\s*font-family:"Pretendard Variable"/,
    );
    assert.match(css, /\.wordmark\{font-style:italic\}/);
});

test("holds the completed after frame before revealing the next scene", () => {
    assert.match(script, /--problem-compare-progress[^\n]+smoothstep\(0\.42, 0\.68, progress\)/);
    assert.match(script, /--problem-fill[^\n]+smoothstep\(0\.8, 0\.92, progress\)/);
    assert.match(script, /progress < 0\.96/);
});

test("keeps portrait product proofs fully visible", () => {
    const portraitProof = declarationsFor(".portrait-proof video");

    assert.equal(portraitProof["object-fit"], "contain");
    assert.equal(portraitProof["object-position"], "center");
});

test("keeps the final decorative mark proportional", () => {
    const finalMark = declarationsFor(".trust>img");

    assert.equal(finalMark.height, "auto");
    assert.equal(finalMark["aspect-ratio"], "1/1");
});

test("keeps normal-size CTA text above the AA contrast threshold", () => {
    assert.ok(contrastRatio("#141414", "#e74408") >= 4.5);
    assert.match(css, /\.button\{color:#141414\}/);
});

test("gives every autoplay proof an explicit playback control", () => {
    const videoIds = [...html.matchAll(/<video\b[^>]*\bid="([^"]+)"[^>]*\bdata-autoplay\b/g)]
        .map((match) => match[1]);
    const controlledIds = [...html.matchAll(
        /<button\b[^>]*\bdata-video-toggle="([^"]+)"[^>]*\baria-controls="([^"]+)"[^>]*>/g,
    )].map((match) => {
        assert.equal(match[1], match[2]);
        return match[1];
    });

    assert.ok(videoIds.every((id) => controlledIds.includes(id)));
    assert.ok(controlledIds.includes("workflow-proof-video"));
    assert.equal(videoIds.length, 2);
    assert.equal(controlledIds.length, 3);
});

test("playback controls pause and resume their proof", async () => {
    const listeners = new Map();
    const video = {
        id: "proof-video",
        paused: true,
        attributes: new Set(),
        addEventListener(name, listener) {
            listeners.set(`video:${name}`, listener);
        },
        pause() {
            this.paused = true;
            listeners.get("video:pause")?.();
        },
        play() {
            this.paused = false;
            listeners.get("video:play")?.();
            return Promise.resolve();
        },
        removeAttribute(name) {
            this.attributes.delete(name);
        },
        setAttribute(name) {
            this.attributes.add(name);
        },
    };
    const button = {
        dataset: {videoToggle: video.id},
        textContent: "",
        attributes: new Map(),
        addEventListener(name, listener) {
            listeners.set(`button:${name}`, listener);
        },
        setAttribute(name, value) {
            this.attributes.set(name, value);
        },
    };
    const reducedMotion = {
        matches: false,
        addEventListener(name, listener) {
            listeners.set(`motion:${name}`, listener);
        },
    };

    vm.runInNewContext(script, {
        document: {
            getElementById: (id) => id === video.id ? video : null,
            querySelectorAll: (selector) => selector === "video[data-autoplay]"
                ? [video]
                : [button],
        },
        window: {matchMedia: () => reducedMotion},
    });
    await Promise.resolve();

    assert.equal(video.paused, false);
    assert.equal(button.textContent, "Pause");
    assert.equal(button.attributes.get("aria-label"), "Pause video");

    listeners.get("button:click")();
    assert.equal(video.paused, true);
    assert.equal(button.textContent, "Play");

    await listeners.get("button:click")();
    assert.equal(video.paused, false);
    assert.equal(button.textContent, "Pause");

    reducedMotion.matches = true;
    listeners.get("motion:change")();
    assert.equal(video.paused, true);
    assert.equal(button.textContent, "Play");
});

test("reveals the route sticker only after its heart path finishes drawing", async () => {
    const listeners = new Map();
    const visibleClasses = new Set();
    const video = {
        id: "route-sticker-proof-video",
        paused: true,
        currentTime: 0,
        dataset: {stickerRevealAt: "2.6"},
        attributes: new Set(),
        addEventListener(name, listener) {
            listeners.set(`video:${name}`, listener);
        },
        pause() {
            this.paused = true;
            listeners.get("video:pause")?.();
        },
        play() {
            this.paused = false;
            listeners.get("video:play")?.();
            return Promise.resolve();
        },
        removeAttribute(name) {
            this.attributes.delete(name);
        },
        setAttribute(name) {
            this.attributes.add(name);
        },
    };
    const button = {
        dataset: {videoToggle: video.id},
        textContent: "",
        attributes: new Map(),
        addEventListener() {},
        setAttribute(name, value) {
            this.attributes.set(name, value);
        },
    };
    const overlay = {
        dataset: {stickerOverlayFor: video.id},
        classList: {
            toggle(name, force) {
                if (force) {
                    visibleClasses.add(name);
                    return;
                }
                visibleClasses.delete(name);
            },
        },
    };
    const reducedMotion = {matches: false, addEventListener() {}};

    vm.runInNewContext(script, {
        document: {
            getElementById: (id) => id === video.id ? video : null,
            querySelectorAll: (selector) => {
                if (selector === "video[data-autoplay]") return [video];
                if (selector === "[data-video-toggle]") return [button];
                if (selector === "[data-sticker-overlay-for]") return [overlay];
                return [];
            },
        },
        window: {matchMedia: () => reducedMotion},
    });
    await Promise.resolve();

    assert.equal(visibleClasses.has("is-visible"), false);

    video.currentTime = 2.6;
    listeners.get("video:timeupdate")();
    assert.equal(visibleClasses.has("is-visible"), true);

    video.currentTime = 0.1;
    listeners.get("video:timeupdate")();
    assert.equal(visibleClasses.has("is-visible"), false);
});
