import assert from "node:assert/strict";
import {readFile, stat} from "node:fs/promises";
import test from "node:test";

const read = (p) => readFile(new URL(p, import.meta.url), "utf8");
const source = await read("../src/index.js");
const {default: worker} = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const base = "https://www.cruxcut.com";
const post = (body) => new Request(base + "/api/attribution-event", {method: "POST", headers: {Origin: base, "Content-Type": "application/json"}, body: JSON.stringify(body)});
const v2 = {v: 2, event: "pageview", source: "instagram", campaign: "bio", method: "utm", page: "home_en", target: "none", placement: "none", exp: "home_v2", arm: "b", platform: "ios"};

test("v2 events carry experiment arm and platform in a stable schema", async () => {
    const points = []; const env = {WEB_ANALYTICS: {writeDataPoint: (p) => points.push(p)}};
    const ok = [v2, {...v2, event: "click", target: "appstore", placement: "zoom"}, {...v2, event: "click", target: "googleplay", placement: "sticky"},
        {...v2, event: "cta_view", placement: "hero"}, {...v2, event: "scroll", placement: "d50"}, {...v2, exp: "none", arm: "none", page: "guides", platform: "other"}];
    for (const body of ok) assert.equal((await worker.fetch(post(body), env)).status, 204, JSON.stringify(body));
    assert.deepEqual(points[0], {indexes: ["web_v2"], blobs: ["v2", "pageview", "instagram", "utm", "bio", "home_en", "none", "none", "home_v2", "b", "ios"], doubles: [1]});
    const bad = [{...v2, arm: "c"}, {...v2, exp: "none"}, {...v2, platform: "iphone15"}, {...v2, event: "scroll", placement: "d33"}, {...v2, event: "cta_view", target: "appstore", placement: "hero"},
        {...v2, event: "click", target: "appstore", placement: "d50"}, {...v2, visitor: "123"}, {v: 1, ...Object.fromEntries(Object.entries(v2).filter(([k]) => !["v", "exp", "arm", "platform"].includes(k))), event: "scroll", placement: "d50"}];
    for (const body of bad) assert.equal((await worker.fetch(post(body), env)).status, 400, JSON.stringify(body));
    assert.equal(points.length, ok.length);
});

test("homepages assign a stable 50/50 arm before paint without identifiers", async () => {
    for (const file of ["../index.html", "../ko/index.html"]) {
        const html = await read(file);
        const head = html.slice(0, html.indexOf("</head>"));
        assert.match(head, /cruxcut_exp_home_v2/);
        assert.match(head, /Math\.random\(\)<0\.5\?'a':'b'/);
        assert.match(head, /bot\|crawl\|spider/);
        assert.ok(head.indexOf("exp.css") < head.indexOf("cruxcut_exp_home_v2"));
        assert.doesNotMatch(head, /document\.cookie/);
        // Control markup stays crawlable outside templates; B content lives only in inert templates.
        const control = html.replace(/<template>[\s\S]*?<\/template>/g, "");
        assert.match(control, /<h1 id="hero-title">/);
        assert.doesNotMatch(control, /id="auto-zoom"/);
        assert.match(html, /<template><section id="auto-zoom"/);
        assert.equal((html.match(/<template>/g) || []).length, (html.match(/__ccMount\(document\.currentScript\)/g) || []).length);
        for (const group of ["hero", "final"]) assert.match(control, new RegExp(`data-cta-group="${group}"`));
        assert.match(html, /<script defer src="\/assets\/home\/exp\.js\?v=[^"]+"><\/script>/);
    }
});

test("auto-zoom demo assets ship within budget", async () => {
    for (const [p, max] of [["../assets/home/autozoom-app.jpg", 200_000]]) {
        assert.ok((await stat(new URL(p, import.meta.url))).size <= max, p);
    }
});

test("browser client sends v2 payloads with arm/platform and explicit placements", async () => {
    const {runInNewContext} = await import("node:vm"); const core = await import("../assets/home/attribution-core.mjs");
    const script = (await read("../assets/home/attribution.js")).replace("import('/assets/home/attribution-core.mjs')", "Promise.resolve(core)");
    const requests = []; let listener;
    const anchor = {href: "https://apps.apple.com/app/id1?pt=1&mt=8", closest: (sel) => sel === "[data-cta-placement]" ? {dataset: {ctaPlacement: "zoom"}} : null};
    const sandbox = {core, URL, Promise, JSON, Date, Set, navigator: {}, window: {}, location: {href: base + "/", origin: base, pathname: "/"},
        document: {referrer: "", documentElement: {dataset: {exp: "b", platform: "android"}}, querySelectorAll: () => [anchor], addEventListener: (type, fn) => { listener = fn; }},
        sessionStorage: {getItem: () => null, setItem() {}}, fetch: (url, init) => { requests.push(JSON.parse(init.body)); return Promise.resolve(); }};
    runInNewContext(script, sandbox); await new Promise((r) => setImmediate(r));
    listener({target: {closest: () => anchor}});
    assert.deepEqual([requests[0].v, requests[0].exp, requests[0].arm, requests[0].platform], [2, "home_v2", "b", "android"]);
    assert.deepEqual([requests[1].event, requests[1].target, requests[1].placement], ["click", "appstore", "zoom"]);
});

test("auto-zoom demo streams a light CDN file and warms it before it is on screen", async () => {
    for (const file of ["../index.html", "../ko/index.html"]) {
        const html = await read(file);
        assert.match(html, /<source src="https:\/\/cdn\.cruxcut\.com\/video\/home\/autozoom-app-v\d+\.mp4" type="video\/mp4">/);
        assert.match(html, /<link rel="preconnect" href="https:\/\/cdn\.cruxcut\.com">/);
    }
    const js = await read("../assets/home/exp.js");
    assert.match(js, /rootMargin: "1200px 0px"/);
});

test("behaviour analytics adapter stays inert without a key and maps the shared events", async () => {
    const src = await read("../assets/home/analytics.js");
    for (const file of ["../index.html", "../ko/index.html"]) {
        const html = await read(file);
        assert.match(html, /<meta name="cruxcut-amplitude-key" content="">/);
        assert.match(html, /<script defer src="\/assets\/home\/analytics\.js\?v=\d+"><\/script>/);
    }
    const {runInNewContext} = await import("node:vm");
    let appended = 0;
    const doc = (key) => ({querySelector: () => ({content: key}), head: {appendChild: () => { appended++; }}, createElement: () => ({}), documentElement: {lang: "en", dataset: {}}});
    runInNewContext(src, {document: doc(""), navigator: {}, window: {addEventListener() {}}});
    assert.equal(appended, 0);
    runInNewContext(src, {document: doc("k"), navigator: {globalPrivacyControl: true}, window: {addEventListener() {}}});
    assert.equal(appended, 0);
    runInNewContext(src, {document: doc("k"), navigator: {}, window: {addEventListener() {}}});
    assert.equal(appended, 1);
    assert.match(src, /ipAddress: false/);
    for (const name of ["Web Page Viewed", "Web Store Clicked", "Web CTA Viewed", "Web Scroll Depth"]) assert.ok(src.includes(name));
});
