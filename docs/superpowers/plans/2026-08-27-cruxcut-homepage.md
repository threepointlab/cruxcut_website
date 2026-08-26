# CruxCut Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the root privacy redirect with a fast, US-English CruxCut product homepage that proves three share-ready results, converts visitors to the App Store, and exposes consistent GEO/SEO facts.

**Architecture:** Keep the existing static-asset Cloudflare Worker. Serve a semantic `index.html` at `/`, place homepage presentation and media under `assets/home/`, and use Node's built-in test runner for routing, content, discovery, and media-budget checks. No framework, build system, database, account flow, or client-rendered content is added.

**Tech Stack:** Cloudflare Workers static assets, HTML5, CSS, minimal vanilla JavaScript, Node.js `node:test`, FFmpeg/ffprobe, Wrangler.

**Spec:** `docs/superpowers/specs/2026-08-27-cruxcut-homepage-design.md`

## Global Constraints

- Canonical language is US English and the primary audience is a US iPhone-owning climber.
- Present exactly three user-visible results: `AI Follow-cam`, `Crux Highlights`, and `Route Stickers`.
- Move segmentation is an enabling detail inside Crux Highlights/editing, never a fourth feature heading.
- Hero headline is `Great sends deserve great videos.`
- Canonical product definition is `CruxCut is an AI climbing video editor for iPhone. It automatically follows the climber, finds crux-worthy moments, and turns the climbing path into a shareable sticker.`
- Main App Store URL is `https://apps.apple.com/app/apple-store/id6771268613?pt=127608181&ct=website_home&mt=8`.
- Brand colors are `#0D0F12`, `#F5F0E8`, `#BBBBBB`, and `#E74408`; `#FFD400` is optional and restrained.
- The current Cloudflare Worker and static-asset architecture remain in place; add no framework or package manager.
- `/privacy`, `/terms`, `/en/privacy`, `/en/terms`, `/guides`, admin routes, and fail-closed `/backlog*` behavior remain unchanged.
- Do not publish exact processing-time, revenue, traction, review, rating, or price claims.
- Do not claim that no data ever leaves the phone; say that video processing happens on iPhone and raw footage needs no processing-server upload.
- Core content must remain understandable and navigable with JavaScript disabled.
- PR creation is allowed; merge, production deployment, Cloudflare crawler-policy changes, App Store metadata changes, and public outreach remain approval-gated.

## File Map

- Modify `src/index.js` — serve the root homepage asset.
- Modify `tests/worker.test.mjs` — protect root and policy routing behavior.
- Replace `index.html` — semantic homepage, metadata, structured data, visible FAQ, and calls to action.
- Create `assets/home/home.css` — complete responsive visual system.
- Create `assets/home/home.js` — reduced-motion-safe media behavior only.
- Create `assets/home/cruxcut-mark.png` — copied current product mark.
- Create `assets/home/followcam-poster.jpg` — first meaningful preview hero proof.
- Create `assets/home/highlights-poster.jpg` — Crux Highlights fallback image.
- Create `assets/home/route-sticker-poster.jpg` — Route Stickers fallback image.
- Create `assets/home/followcam-proof.mp4` — synchronized raw/result hero loop.
- Create `assets/home/highlights-proof.mp4` — optimized current highlight tutorial/result proof.
- Create `assets/home/route-sticker-proof.mp4` — optimized route drawing proof.
- Create `assets/home/og.png` — dedicated social preview card.
- Create `tests/homepage-content.test.mjs` — metadata, copy, JSON-LD, FAQ parity, and asset-reference tests.
- Create `tests/homepage-media.test.mjs` — required media existence and size budgets.
- Create `tests/public-discovery.test.mjs` — `llms.txt`, sitemap, and internal-link tests.
- Create `llms.txt` — concise AI-readable product facts and canonical links.
- Modify `sitemap.xml` — add the canonical homepage and preserve public routes.
- Modify `guides/index.html` — point the wordmark home and retain the guide context.
- Modify `guides/how-to-film-and-edit-climbing-videos.html` — point the wordmark home and retain the Guides link.

---

### Task 1: Serve the homepage at the root

**Files:**
- Modify: `tests/worker.test.mjs`
- Modify: `src/index.js`

**Interfaces:**
- Consumes: existing `env.ASSETS.fetch(Request)` behavior.
- Produces: `GET /` returns the `/index.html` asset response with status 200; policy and guide routes keep their current interface.

- [ ] **Step 1: Add failing root and policy routing tests**

Append these tests to `tests/worker.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the focused test and prove the current redirect fails**

Run:

```bash
rtk node --test tests/worker.test.mjs
```

Expected: the root test fails because the current response is a 302 redirect to `/privacy`; existing guide tests and the policy test pass.

- [ ] **Step 3: Replace the root redirect with an asset response**

Replace the current root branch in `src/index.js` with:

```js
        if (url.pathname === "/") {
            return env.ASSETS.fetch(new Request(new URL("/index.html", url), request));
        }
```

Do not change any other route in this task.

- [ ] **Step 4: Run the worker tests**

Run:

```bash
rtk node --test tests/worker.test.mjs
```

Expected: all worker tests pass, including root, policy, and guide coverage.

- [ ] **Step 5: Commit the routing change**

```bash
rtk git add src/index.js tests/worker.test.mjs
rtk git commit -m "feat: serve homepage from root"
```

---

### Task 2: Build the semantic static homepage and first meaningful preview

**Files:**
- Create: `tests/homepage-content.test.mjs`
- Replace: `index.html`
- Create: `assets/home/home.css`
- Create: `assets/home/cruxcut-mark.png`
- Create: `assets/home/followcam-poster.jpg`
- Create: `assets/home/highlights-poster.jpg`
- Create: `assets/home/route-sticker-poster.jpg`

**Interfaces:**
- Consumes: root route from Task 1; approved copy and brand values from the spec; source media under `/Users/sungmin/cruxcut_marketing`.
- Produces: a complete no-JavaScript homepage with stable section IDs `features`, `follow-cam`, `highlights`, `route-stickers`, `how-it-works`, `privacy`, and `faq`.

- [ ] **Step 1: Write the failing homepage contract test**

Create `tests/homepage-content.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the test and verify the redirect document fails the contract**

Run:

```bash
rtk node --test tests/homepage-content.test.mjs
```

Expected: metadata, feature, structured-data, and copy assertions fail against the current redirect-only `index.html`.

- [ ] **Step 3: Create the preview asset directory and copy the current brand mark**

Run:

```bash
rtk mkdir -p assets/home
rtk cp /Users/sungmin/cruxcut_marketing/public/brand/cruxcut-mark.png assets/home/cruxcut-mark.png
```

- [ ] **Step 4: Generate three real static proof images**

Generate a split Before/After hero poster from matching raw and tracked frames:

```bash
rtk ffmpeg -y -ss 8 -i /Users/sungmin/cruxcut_marketing/public/processed/dws_dynamic_raw_long.mp4 -ss 8 -i /Users/sungmin/cruxcut_marketing/public/processed/dws_dynamic_track_after_long.mp4 -filter_complex "[0:v]scale=640:720:force_original_aspect_ratio=decrease,pad=640:720:(ow-iw)/2:(oh-ih)/2:0x0D0F12[left];[1:v]scale=640:720:force_original_aspect_ratio=decrease,pad=640:720:(ow-iw)/2:(oh-ih)/2:0x0D0F12[right];[left][right]hstack=inputs=2[out]" -map "[out]" -frames:v 1 -update 1 -q:v 3 assets/home/followcam-poster.jpg
```

Generate the highlight and route fallback images:

```bash
rtk ffmpeg -y -ss 8 -i /Users/sungmin/cruxcut_marketing/renders/tutorial-save-highlights-en.mp4 -vf "scale=540:-2" -frames:v 1 -update 1 -q:v 3 assets/home/highlights-poster.jpg
rtk ffmpeg -y -ss 1.4 -i /Users/sungmin/cruxcut_marketing/public/processed/heart_sped.mp4 -vf "scale=540:-2" -frames:v 1 -update 1 -q:v 3 assets/home/route-sticker-poster.jpg
```

- [ ] **Step 5: Replace `index.html` with the exact semantic structure**

Use this head contract, including one JSON-LD graph and no social image until Task 3 generates it:

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>CruxCut — AI Climbing Video Editor for iPhone</title>
    <meta name="description" content="CruxCut is an AI climbing video editor for iPhone. Automatically follow the climber, find crux-worthy moments, and turn the climbing path into a shareable sticker.">
    <link rel="canonical" href="https://www.cruxcut.com/">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="CruxCut">
    <meta property="og:title" content="CruxCut — AI Climbing Video Editor for iPhone">
    <meta property="og:description" content="Turn raw climbing footage into a follow-cam edit, crux highlights, and a shareable route sticker.">
    <meta property="og:url" content="https://www.cruxcut.com/">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="CruxCut — AI Climbing Video Editor for iPhone">
    <meta name="twitter:description" content="Turn raw climbing footage into a follow-cam edit, crux highlights, and a shareable route sticker.">
    <meta name="theme-color" content="#0D0F12">
    <link rel="icon" href="/assets/home/cruxcut-mark.png">
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" crossorigin>
    <link rel="stylesheet" href="/assets/home/home.css">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://www.cruxcut.com/#organization",
          "name": "ThreePointLab",
          "url": "https://www.cruxcut.com/",
          "logo": "https://www.cruxcut.com/assets/home/cruxcut-mark.png"
        },
        {
          "@type": "SoftwareApplication",
          "@id": "https://www.cruxcut.com/#app",
          "name": "CruxCut",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "iOS 18.0 or later",
          "description": "CruxCut is an AI climbing video editor for iPhone. It automatically follows the climber, finds crux-worthy moments, and turns the climbing path into a shareable sticker.",
          "url": "https://www.cruxcut.com/",
          "downloadUrl": "https://apps.apple.com/app/apple-store/id6771268613?pt=127608181&ct=website_home&mt=8",
          "publisher": {"@id": "https://www.cruxcut.com/#organization"}
        },
        {
          "@type": "FAQPage",
          "@id": "https://www.cruxcut.com/#faq",
          "mainEntity": [
            {"@type":"Question","name":"What is CruxCut?","acceptedAnswer":{"@type":"Answer","text":"CruxCut is an AI climbing video editor for iPhone. It turns raw climbing footage into a follow-cam edit, crux highlights, and a shareable route sticker."}},
            {"@type":"Question","name":"Can CruxCut automatically follow a climber?","acceptedAnswer":{"@type":"Answer","text":"Yes. CruxCut detects the climber and applies automatic pan and zoom so a fixed wide shot feels closer to a follow-cam video."}},
            {"@type":"Question","name":"How does CruxCut create climbing highlights?","acceptedAnswer":{"@type":"Answer","text":"CruxCut analyzes movement in the climb to surface difficult and dynamic sections. Those sections can become a short clip or a highlight reel across multiple climbs."}},
            {"@type":"Question","name":"What is a route sticker?","acceptedAnswer":{"@type":"Answer","text":"A route sticker visualizes the path of the climb together with details such as grade and result, so the session can be shared like a workout record."}},
            {"@type":"Question","name":"Does CruxCut upload climbing videos to a server for AI processing?","acceptedAnswer":{"@type":"Answer","text":"No processing-server upload is required. CruxCut performs video analysis and editing on the user's iPhone."}},
            {"@type":"Question","name":"Which devices does CruxCut support?","acceptedAnswer":{"@type":"Answer","text":"CruxCut is available for iPhone and requires iOS 18 or later."}}
          ]
        }
      ]
    }
    </script>
</head>
```

Use the following body content and IDs. Keep every FAQ answer byte-for-byte consistent with JSON-LD:

```html
<body>
<a class="skip-link" href="#main-content">Skip to content</a>
<header class="site-header">
  <nav class="nav container" aria-label="Primary navigation">
    <a class="wordmark" href="/" aria-label="CruxCut home">cruxcut<span>.</span></a>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#how-it-works">How it works</a>
      <a href="/guides">Guides</a>
      <a class="button button-small" href="https://apps.apple.com/app/apple-store/id6771268613?pt=127608181&amp;ct=website_home&amp;mt=8">Get the app</a>
    </div>
  </nav>
</header>
<main id="main-content">
  <section class="hero container" aria-labelledby="hero-title">
    <div class="hero-copy">
      <p class="eyebrow">AI climbing video editor for iPhone</p>
      <h1 id="hero-title">Great sends deserve great videos.</h1>
      <p class="hero-dek">Pick a climbing video and get a follow-cam edit, crux highlights, and a shareable route sticker.</p>
      <div class="hero-actions">
        <a class="button" href="https://apps.apple.com/app/apple-store/id6771268613?pt=127608181&amp;ct=website_home&amp;mt=8">Get CruxCut for iPhone</a>
        <a class="text-link" href="#how-it-works">See how it works</a>
      </div>
      <p class="platform-note">Made for iPhone · Requires iOS 18 or later</p>
    </div>
    <figure class="hero-proof">
      <div class="proof-labels" aria-hidden="true"><span>Original</span><span>CruxCut</span></div>
      <img src="/assets/home/followcam-poster.jpg" width="1280" height="720" alt="A fixed wide climbing video beside CruxCut's tighter follow-cam result">
      <figcaption>One climb, reframed around the climber.</figcaption>
    </figure>
  </section>

  <section id="features" class="results-intro container" aria-labelledby="results-title">
    <p class="eyebrow">One video. Three results.</p>
    <h2 id="results-title">From raw attempt to something worth sharing.</h2>
    <p>CruxCut is an AI climbing video editor for iPhone. It automatically follows the climber, finds crux-worthy moments, and turns the climbing path into a shareable sticker.</p>
  </section>

  <section class="features container" aria-label="CruxCut results">
    <article id="follow-cam" class="feature feature-wide">
      <div class="feature-copy"><p class="feature-number">01</p><h2 class="feature-title">AI Follow-cam</h2><p>Turn a fixed wide shot into a smooth follow-cam edit. CruxCut keeps the climber centered with automatic pan and zoom, whether the video came from a tripod or a handheld phone.</p></div>
      <img src="/assets/home/followcam-poster.jpg" width="1280" height="720" alt="Original climbing footage compared with the automatic follow-cam edit">
    </article>
    <article id="highlights" class="feature">
      <div class="feature-copy"><p class="feature-number">02</p><h2 class="feature-title">Crux Highlights</h2><p>Find the hard, dynamic moments without scrubbing through every attempt. CruxCut uses the climb's movement to organize crux-worthy sections into short clips and multi-climb highlight reels.</p></div>
      <img src="/assets/home/highlights-poster.jpg" width="540" height="960" alt="CruxCut highlight sharing flow on iPhone">
    </article>
    <article id="route-stickers" class="feature">
      <div class="feature-copy"><p class="feature-number">03</p><h2 class="feature-title">Route Stickers</h2><p>Turn the climbing path, grade, and result into a visual workout sticker that is easy to add to a video or share on social media.</p></div>
      <img src="/assets/home/route-sticker-poster.jpg" width="540" height="960" alt="A climbing path drawn as a shareable heart-shaped route sticker">
    </article>
  </section>

  <section id="how-it-works" class="how container" aria-labelledby="how-title">
    <p class="eyebrow">How it works</p><h2 id="how-title">Choose once. Share three ways.</h2>
    <ol class="steps"><li><span>1</span><strong>Pick a video</strong><p>Choose a climbing attempt from your iPhone.</p></li><li><span>2</span><strong>Let on-device AI edit it</strong><p>CruxCut follows the climber and finds the moments that matter.</p></li><li><span>3</span><strong>Tweak or share</strong><p>Adjust the result when you want, then export the clip or sticker.</p></li></ol>
  </section>

  <section id="privacy" class="trust container" aria-labelledby="privacy-title">
    <div><p class="eyebrow">On-device by design</p><h2 id="privacy-title">Your climbing footage stays yours.</h2></div>
    <div><p>Video processing happens on your iPhone. Your raw climbing footage does not need to be uploaded to a processing server.</p><a class="text-link" href="/privacy">Read the privacy policy</a></div>
  </section>

  <section id="faq" class="faq container" aria-labelledby="faq-title">
    <p class="eyebrow">Questions, answered</p><h2 id="faq-title">About CruxCut</h2>
    <div class="faq-list">
      <details class="faq-item" data-faq-question="What is CruxCut?"><summary>What is CruxCut?</summary><p>CruxCut is an AI climbing video editor for iPhone. It turns raw climbing footage into a follow-cam edit, crux highlights, and a shareable route sticker.</p></details>
      <details class="faq-item" data-faq-question="Can CruxCut automatically follow a climber?"><summary>Can CruxCut automatically follow a climber?</summary><p>Yes. CruxCut detects the climber and applies automatic pan and zoom so a fixed wide shot feels closer to a follow-cam video.</p></details>
      <details class="faq-item" data-faq-question="How does CruxCut create climbing highlights?"><summary>How does CruxCut create climbing highlights?</summary><p>CruxCut analyzes movement in the climb to surface difficult and dynamic sections. Those sections can become a short clip or a highlight reel across multiple climbs.</p></details>
      <details class="faq-item" data-faq-question="What is a route sticker?"><summary>What is a route sticker?</summary><p>A route sticker visualizes the path of the climb together with details such as grade and result, so the session can be shared like a workout record.</p></details>
      <details class="faq-item" data-faq-question="Does CruxCut upload climbing videos to a server for AI processing?"><summary>Does CruxCut upload climbing videos to a server for AI processing?</summary><p>No processing-server upload is required. CruxCut performs video analysis and editing on the user's iPhone.</p></details>
      <details class="faq-item" data-faq-question="Which devices does CruxCut support?"><summary>Which devices does CruxCut support?</summary><p>CruxCut is available for iPhone and requires iOS 18 or later.</p></details>
    </div>
  </section>

  <aside class="guide-card container" aria-labelledby="guide-title"><p class="eyebrow">Climbing video guide</p><h2 id="guide-title">Film the full climb. Let the edit follow.</h2><p>Learn camera placement, framing, and a simple workflow for better climbing footage.</p><a class="text-link" href="/guides/how-to-film-and-edit-climbing-videos">Read the filming and editing guide</a></aside>
  <section class="final-cta container" aria-labelledby="cta-title"><img src="/assets/home/cruxcut-mark.png" width="1168" height="1160" alt=""><div><h2 id="cta-title">Your next send is already worth watching.</h2><a class="button" href="https://apps.apple.com/app/apple-store/id6771268613?pt=127608181&amp;ct=website_home&amp;mt=8">Get CruxCut for iPhone</a></div></section>
</main>
<footer class="footer container"><a class="wordmark" href="/">cruxcut<span>.</span></a><nav aria-label="Footer navigation"><a href="/guides">Guides</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav><p>© 2026 ThreePointLab</p></footer>
</body>
</html>
```

- [ ] **Step 6: Create the complete responsive stylesheet**

Create `assets/home/home.css` using these exact tokens and layout contracts:

```css
:root{--bg:#0D0F12;--surface:#161A1F;--surface-2:#20252C;--text:#F5F0E8;--muted:#BBBBBB;--brand:#E74408;--line:rgba(245,240,232,.14);--max:1180px;--radius:28px;color-scheme:dark}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font-family:"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,"Segoe UI",sans-serif;line-height:1.55}img,video{display:block;max-width:100%}a{color:inherit}.container{width:min(var(--max),calc(100% - 40px));margin-inline:auto}.skip-link{position:fixed;left:16px;top:-80px;z-index:100;padding:12px 16px;background:var(--text);color:var(--bg);border-radius:10px}.skip-link:focus{top:16px}.site-header{position:sticky;top:0;z-index:20;border-bottom:1px solid var(--line);background:rgba(13,15,18,.88);backdrop-filter:blur(18px)}.nav{min-height:72px;display:flex;align-items:center;justify-content:space-between;gap:24px}.wordmark{font-size:25px;font-weight:800;letter-spacing:-.04em;text-decoration:none}.wordmark span{color:var(--brand)}.nav-links,.hero-actions,.footer nav{display:flex;align-items:center;gap:24px}.nav-links>a:not(.button),.footer a{color:var(--muted);text-decoration:none}.button{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 24px;border-radius:999px;background:var(--brand);color:#fff;font-weight:750;text-decoration:none;box-shadow:0 10px 32px rgba(231,68,8,.25)}.button-small{min-height:40px;padding-inline:18px}.text-link{font-weight:700;text-underline-offset:5px}.hero{min-height:calc(100vh - 72px);display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);align-items:center;gap:64px;padding-block:72px}.eyebrow{margin:0 0 16px;color:var(--brand);font-size:13px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}.hero h1{max-width:760px;margin:0;font-size:clamp(52px,7.2vw,104px);line-height:.94;letter-spacing:-.065em}.hero-dek{max-width:640px;margin:28px 0;font-size:clamp(20px,2.2vw,28px);line-height:1.35;color:var(--muted)}.platform-note{margin-top:18px;color:var(--muted);font-size:14px}.hero-proof,.feature{margin:0;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);overflow:hidden}.hero-proof{position:relative;padding:14px}.hero-proof img,.hero-proof video{width:100%;border-radius:18px;background:#08090b}.hero-proof figcaption{padding:12px 6px 2px;color:var(--muted);font-size:14px}.proof-labels{position:absolute;inset:26px 26px auto;z-index:2;display:flex;justify-content:space-between;font-size:12px;font-weight:800;text-transform:uppercase}.proof-labels span{padding:7px 10px;border:1px solid var(--line);border-radius:999px;background:rgba(13,15,18,.76)}.results-intro{padding-block:120px 56px;max-width:900px;text-align:center}.results-intro h2,.how h2,.faq>h2{margin:0;font-size:clamp(40px,5vw,72px);line-height:1;letter-spacing:-.05em}.results-intro>p:last-child{max-width:780px;margin:28px auto 0;color:var(--muted);font-size:20px}.features{display:grid;grid-template-columns:1fr 1fr;gap:24px}.feature{display:flex;flex-direction:column}.feature-wide{grid-column:1/-1;display:grid;grid-template-columns:.75fr 1.25fr}.feature-copy{padding:clamp(28px,4vw,56px)}.feature-number{color:var(--brand);font-weight:800}.feature-title{margin:0 0 18px;font-size:clamp(34px,4vw,56px);line-height:1;letter-spacing:-.045em}.feature-copy p:last-child{color:var(--muted);font-size:18px}.feature>img,.feature>video{width:100%;height:100%;max-height:680px;object-fit:cover;background:#08090b}.feature:not(.feature-wide)>img,.feature:not(.feature-wide)>video{aspect-ratio:9/12;object-position:center top}.how,.faq{padding-block:140px}.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin:48px 0 0;padding:0;list-style:none}.steps li{padding:30px;border:1px solid var(--line);border-radius:22px;background:var(--surface)}.steps span{display:grid;width:34px;height:34px;place-items:center;margin-bottom:48px;border-radius:50%;background:var(--brand);font-weight:800}.steps strong{display:block;font-size:22px}.steps p{color:var(--muted)}.trust{display:grid;grid-template-columns:1fr 1fr;gap:64px;padding:72px;border:1px solid rgba(231,68,8,.4);border-radius:var(--radius);background:linear-gradient(135deg,rgba(231,68,8,.15),rgba(22,26,31,.7))}.trust h2,.guide-card h2,.final-cta h2{margin:0;font-size:clamp(36px,4.8vw,64px);line-height:1;letter-spacing:-.05em}.trust>div:last-child{font-size:20px;color:var(--muted)}.faq-list{margin-top:48px;border-top:1px solid var(--line)}.faq-item{border-bottom:1px solid var(--line)}.faq-item summary{padding:26px 4px;cursor:pointer;font-size:20px;font-weight:700}.faq-item p{max-width:760px;margin:0;padding:0 4px 28px;color:var(--muted)}.guide-card{padding:64px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface)}.guide-card>p:not(.eyebrow){max-width:680px;color:var(--muted);font-size:18px}.final-cta{display:grid;grid-template-columns:180px 1fr;align-items:center;gap:48px;padding-block:140px}.final-cta img{width:180px}.final-cta .button{margin-top:28px}.footer{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:32px;padding-block:32px;border-top:1px solid var(--line);color:var(--muted)}.footer p{margin:0;font-size:13px}a:focus-visible,summary:focus-visible{outline:3px solid #fff;outline-offset:4px}
@media(max-width:900px){.nav-links>a:not(.button){display:none}.hero{grid-template-columns:1fr;min-height:auto;padding-block:64px}.feature-wide{display:flex}.features{grid-template-columns:1fr}.feature-wide{grid-column:auto}.steps{grid-template-columns:1fr}.trust{grid-template-columns:1fr;padding:40px}.footer{grid-template-columns:1fr}.footer nav{flex-wrap:wrap}.final-cta{grid-template-columns:100px 1fr}.final-cta img{width:100px}}
@media(max-width:600px){.container{width:min(100% - 28px,var(--max))}.nav{min-height:64px}.button-small{padding-inline:14px}.hero h1{font-size:clamp(48px,16vw,72px)}.hero-actions{align-items:flex-start;flex-direction:column}.features{gap:16px}.feature-copy{padding:28px}.how,.faq{padding-block:96px}.guide-card{padding:32px}.final-cta{grid-template-columns:1fr;padding-block:96px}.final-cta img{width:84px}.footer nav{gap:18px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
```

- [ ] **Step 7: Run content tests and start the first meaningful preview**

Run:

```bash
rtk node --test tests/homepage-content.test.mjs tests/worker.test.mjs
```

Expected: all tests pass.

Start the existing Worker preview in a retained session:

```bash
rtk npx wrangler dev --local --port 8787
```

Make one request to `http://localhost:8787/`; require HTTP 200 and no blocking Worker error. Open that exact URL once in Codex as the first meaningful preview. Do not perform screenshots, DOM inspection, or visual QA unless the user explicitly requests browser testing.

- [ ] **Step 8: Commit the semantic homepage slice**

```bash
rtk git add index.html assets/home/home.css assets/home/cruxcut-mark.png assets/home/followcam-poster.jpg assets/home/highlights-poster.jpg assets/home/route-sticker-poster.jpg tests/homepage-content.test.mjs
rtk git commit -m "feat: add CruxCut product homepage"
```

---

### Task 3: Add optimized motion proof and the social preview

**Files:**
- Create: `tests/homepage-media.test.mjs`
- Create: `assets/home/followcam-proof.mp4`
- Create: `assets/home/highlights-proof.mp4`
- Create: `assets/home/route-sticker-proof.mp4`
- Create: `assets/home/home.js`
- Create: `assets/home/og.png`
- Modify: `index.html`

**Interfaces:**
- Consumes: static poster layout from Task 2 and source media at the exact marketing paths below.
- Produces: three muted proof videos with static fallbacks, reduced-motion behavior, and a valid 1200×630 social card.

- [ ] **Step 1: Write the failing media budget test**

Create `tests/homepage-media.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the test and verify the missing videos and social card fail**

Run:

```bash
rtk node --test tests/homepage-media.test.mjs
```

Expected: failure on the first missing motion asset.

- [ ] **Step 3: Produce the synchronized Follow-cam proof video**

Run:

```bash
rtk ffmpeg -y -ss 4 -t 8 -i /Users/sungmin/cruxcut_marketing/public/processed/dws_dynamic_raw_long.mp4 -ss 4 -t 8 -i /Users/sungmin/cruxcut_marketing/public/processed/dws_dynamic_track_after_long.mp4 -filter_complex "[0:v]scale=640:720:force_original_aspect_ratio=decrease,pad=640:720:(ow-iw)/2:(oh-ih)/2:0x0D0F12[left];[1:v]scale=640:720:force_original_aspect_ratio=decrease,pad=640:720:(ow-iw)/2:(oh-ih)/2:0x0D0F12[right];[left][right]hstack=inputs=2[out]" -map "[out]" -an -c:v libx264 -crf 24 -preset medium -movflags +faststart -pix_fmt yuv420p assets/home/followcam-proof.mp4
```

- [ ] **Step 4: Produce highlight and route proof videos**

Run:

```bash
rtk ffmpeg -y -ss 2 -t 10 -i /Users/sungmin/cruxcut_marketing/renders/tutorial-save-highlights-en.mp4 -vf "scale=540:-2" -an -c:v libx264 -crf 25 -preset medium -movflags +faststart -pix_fmt yuv420p assets/home/highlights-proof.mp4
rtk ffmpeg -y -i /Users/sungmin/cruxcut_marketing/public/processed/heart_sped.mp4 -vf "scale=540:-2" -an -c:v libx264 -crf 24 -preset medium -movflags +faststart -pix_fmt yuv420p assets/home/route-sticker-proof.mp4
```

Use `ffprobe` on all three outputs. Require exactly one H.264 video stream, no audio stream, 30 fps, durations of approximately 8 seconds, 10 seconds, and 2.73 seconds respectively, and the byte budgets declared in the test.

- [ ] **Step 5: Replace proof images with accessible videos that retain the posters**

Use this hero media element:

```html
<video data-autoplay autoplay muted loop playsinline preload="metadata" poster="/assets/home/followcam-poster.jpg" aria-label="Original climbing footage beside CruxCut's tighter follow-cam result">
  <source src="/assets/home/followcam-proof.mp4" type="video/mp4">
  <img src="/assets/home/followcam-poster.jpg" width="1280" height="720" alt="A fixed wide climbing video beside CruxCut's tighter follow-cam result">
</video>
```

Use this below-fold pattern for highlights and route stickers, changing file names and labels exactly:

```html
<video data-autoplay autoplay muted loop playsinline preload="none" poster="/assets/home/highlights-poster.jpg" aria-label="CruxCut highlight sharing flow on iPhone">
  <source src="/assets/home/highlights-proof.mp4" type="video/mp4">
  <img src="/assets/home/highlights-poster.jpg" width="540" height="960" alt="CruxCut highlight sharing flow on iPhone">
</video>
<video data-autoplay autoplay muted loop playsinline preload="none" poster="/assets/home/route-sticker-poster.jpg" aria-label="A climbing path becoming a shareable heart-shaped route sticker">
  <source src="/assets/home/route-sticker-proof.mp4" type="video/mp4">
  <img src="/assets/home/route-sticker-poster.jpg" width="540" height="960" alt="A climbing path becoming a shareable heart-shaped route sticker">
</video>
```

Add `<script defer src="/assets/home/home.js"></script>` immediately before `</body>`.

- [ ] **Step 6: Implement reduced-motion-safe playback**

Create `assets/home/home.js`:

```js
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const proofVideos = [...document.querySelectorAll("video[data-autoplay]")];

const syncPlaybackPreference = () => {
    for (const video of proofVideos) {
        if (reducedMotion.matches) {
            video.pause();
            video.removeAttribute("autoplay");
            continue;
        }

        video.setAttribute("autoplay", "");
        video.play().catch(() => {
            video.controls = true;
        });
    }
};

syncPlaybackPreference();
reducedMotion.addEventListener("change", syncPlaybackPreference);
```

- [ ] **Step 7: Generate the required social card after the first preview**

Dispatch exactly one image-generation subagent with no repository ownership. Give it this complete assignment:

```text
Create one 1200x630 landscape Open Graph card for the CruxCut homepage. Exact visible text: "Great sends deserve great videos." and "cruxcut." Do not add any other words. Use a near-black #0D0F12 background, warm off-white typography, and #E74408 orange as the only strong accent. Include one cinematic but realistic indoor bouldering scene framed like a before-to-follow-cam transformation, with the climber clearly visible and no invented app interface. Keep text large and legible at thumbnail size. Make one imagegen request, save the result outside the cruxcut_website checkout, and return only the image path. Do not invoke Sites skills, call Sites tools, edit site source, initialize a site, or spawn another agent.
```

Inspect the result for exact text and brand fit. If the text is incorrect or illegible, request one correction only. Copy the accepted image to `assets/home/og.png` and ensure it is exactly 1200×630; resize without changing content when necessary.

- [ ] **Step 8: Add absolute Open Graph and X image metadata**

Add these tags beside the existing social metadata:

```html
<meta property="og:image" content="https://www.cruxcut.com/assets/home/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Great sends deserve great videos — CruxCut">
<meta name="twitter:image" content="https://www.cruxcut.com/assets/home/og.png">
<meta name="twitter:image:alt" content="Great sends deserve great videos — CruxCut">
```

Append this regression test to `tests/homepage-content.test.mjs`:

```js
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
```

- [ ] **Step 9: Run media and homepage tests**

Run:

```bash
rtk node --test tests/homepage-media.test.mjs tests/homepage-content.test.mjs tests/worker.test.mjs
```

Expected: all tests pass. Reload the already-open preview tab through normal hot reload; do not open a second site tab.

- [ ] **Step 10: Commit motion proof and social metadata**

```bash
rtk git add index.html assets/home/home.js assets/home/followcam-proof.mp4 assets/home/highlights-proof.mp4 assets/home/route-sticker-proof.mp4 assets/home/og.png tests/homepage-media.test.mjs
rtk git commit -m "feat: add homepage product proof"
```

---

### Task 4: Publish the discovery surfaces and internal-link graph

**Files:**
- Create: `tests/public-discovery.test.mjs`
- Create: `llms.txt`
- Modify: `sitemap.xml`
- Modify: `guides/index.html`
- Modify: `guides/how-to-film-and-edit-climbing-videos.html`

**Interfaces:**
- Consumes: canonical homepage definition and URLs from Task 2.
- Produces: consistent AI-readable facts, sitemap coverage, and bidirectional homepage/guide links.

- [ ] **Step 1: Write the failing discovery test**

Create `tests/public-discovery.test.mjs`:

```js
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("publishes canonical product facts in llms.txt", async () => {
    const text = await read("../llms.txt");
    assert.match(text, /^# CruxCut$/m);
    assert.match(text, /AI climbing video editor for iPhone/);
    assert.match(text, /AI Follow-cam/);
    assert.match(text, /Crux Highlights/);
    assert.match(text, /Route Stickers/);
    assert.match(text, /https:\/\/www\.cruxcut\.com\/privacy/);
});

test("includes the homepage and guide in sitemap.xml", async () => {
    const sitemap = await read("../sitemap.xml");
    assert.match(sitemap, /<loc>https:\/\/www\.cruxcut\.com\/<\/loc>/);
    assert.match(sitemap, /<loc>https:\/\/www\.cruxcut\.com\/guides\/how-to-film-and-edit-climbing-videos<\/loc>/);
});

test("links guide wordmarks back to the homepage", async () => {
    for (const path of [
        "../guides/index.html",
        "../guides/how-to-film-and-edit-climbing-videos.html",
    ]) {
        const html = await read(path);
        assert.match(html, /class="wordmark" href="\/"/);
    }
});
```

- [ ] **Step 2: Run the discovery test and prove the files and links are missing**

Run:

```bash
rtk node --test tests/public-discovery.test.mjs
```

Expected: failure because `llms.txt` does not exist and guide wordmarks still target `/guides`.

- [ ] **Step 3: Create `llms.txt` with the approved durable facts**

Create this exact file:

```text
# CruxCut

CruxCut is an AI climbing video editor for iPhone. It automatically follows the climber, finds crux-worthy moments, and turns the climbing path into a shareable sticker.

## What CruxCut makes

- AI Follow-cam: turns fixed wide climbing footage into a tighter edit that follows the climber with automatic pan and zoom.
- Crux Highlights: surfaces difficult and dynamic sections as short clips or multi-climb highlight reels.
- Route Stickers: visualizes the climbing path with details such as grade and result for sharing as a workout record.

## Processing and availability

Video analysis and editing happen on the user's iPhone. Raw climbing footage does not need to be uploaded to a processing server. CruxCut requires iOS 18 or later.

## Official links

- Website: https://www.cruxcut.com/
- App Store: https://apps.apple.com/app/apple-store/id6771268613
- Climbing video guide: https://www.cruxcut.com/guides/how-to-film-and-edit-climbing-videos
- Privacy: https://www.cruxcut.com/privacy
- Terms: https://www.cruxcut.com/terms
```

- [ ] **Step 4: Update the sitemap without dropping existing URLs**

Add this entry immediately after the opening `<urlset>` tag and keep every existing entry:

```xml
  <url>
    <loc>https://www.cruxcut.com/</loc>
    <lastmod>2026-08-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
```

- [ ] **Step 5: Point both guide wordmarks to the homepage**

In both guide files, change only the wordmark anchor from:

```html
<a class="wordmark" href="/guides">
```

to:

```html
<a class="wordmark" href="/">
```

Keep the explicit Guides navigation and guide index links unchanged.

- [ ] **Step 6: Run discovery and regression tests**

Run:

```bash
rtk node --test tests/public-discovery.test.mjs tests/homepage-content.test.mjs tests/worker.test.mjs
```

Expected: all tests pass.

- [ ] **Step 7: Commit discovery surfaces**

```bash
rtk git add llms.txt sitemap.xml guides/index.html guides/how-to-film-and-edit-climbing-videos.html tests/public-discovery.test.mjs
rtk git commit -m "feat: add homepage discovery surfaces"
```

---

### Task 5: Complete accessibility, media, and Cloudflare validation

**Files:**
- Modify when a failing check requires it: `index.html`
- Modify when a failing check requires it: `assets/home/home.css`
- Modify when a failing check requires it: `assets/home/home.js`
- Modify when a failing check requires it: focused test file covering that failure

**Interfaces:**
- Consumes: complete homepage, media, and discovery surfaces from Tasks 1–4.
- Produces: a clean branch that passes focused tests, the full test suite, media inspection, and Wrangler dry run.

- [ ] **Step 1: Run every Node test together**

Run:

```bash
rtk node --test tests/*.test.mjs
```

Expected: all tests pass with no skipped test.

- [ ] **Step 2: Validate media streams and dimensions**

Run `ffprobe` for each homepage MP4:

```bash
rtk ffprobe -v error -show_entries format=duration,size -show_entries stream=index,codec_name,codec_type,width,height,r_frame_rate -of json assets/home/followcam-proof.mp4
rtk ffprobe -v error -show_entries format=duration,size -show_entries stream=index,codec_name,codec_type,width,height,r_frame_rate -of json assets/home/highlights-proof.mp4
rtk ffprobe -v error -show_entries format=duration,size -show_entries stream=index,codec_name,codec_type,width,height,r_frame_rate -of json assets/home/route-sticker-proof.mp4
```

Expected: one H.264 video stream per file, no audio stream, even-numbered dimensions, 30 fps, and the declared byte budgets.

- [ ] **Step 3: Run the Cloudflare asset build dry run**

Run:

```bash
rtk npx wrangler deploy --dry-run
```

Expected: Wrangler resolves `src/index.js`, includes the static asset directory, and exits successfully without publishing.

- [ ] **Step 4: Verify the local route matrix against the retained preview server**

Use ordinary HTTP requests against the exact Wrangler URL and require:

```text
/                                                    200
/privacy                                             200
/terms                                               200
/guides                                              200
/guides/how-to-film-and-edit-climbing-videos         200
/llms.txt                                            200
/sitemap.xml                                         200
/backlog                                             401 without credentials
```

Verify the homepage response contains the canonical title, App Store campaign URL, and all three feature headings. Verify the policy and guide responses still contain their existing titles.

- [ ] **Step 5: Perform scoped source review and repair only evidenced failures**

Run:

```bash
rtk git diff origin/main...HEAD --check
rtk git status --short --branch
rtk git diff --stat origin/main...HEAD
```

Require no whitespace errors, no untracked generated files, no changes outside the file map, and no accidental edits to policy copy, admin, or backlog content. If a check fails, add a focused failing test when practical, make the smallest repair, rerun the affected check, and commit the repair with a message naming the corrected behavior.

- [ ] **Step 6: Commit a validation repair only when code changed**

Stage explicit paths touched by the repair and use:

```bash
rtk git commit -m "fix: complete homepage validation"
```

Skip this commit when Task 5 required no source change.

---

### Task 6: Review, push, and prepare the approval-gated PR

**Files:**
- No planned source edits.
- Read: complete `origin/main...HEAD` diff.

**Interfaces:**
- Consumes: verified branch from Task 5.
- Produces: a reviewable draft PR and a concise TPL-243 progress update; no merge or production deployment.

- [ ] **Step 1: Run verification immediately before completion claims**

Use the `superpowers:verification-before-completion` skill. Re-run:

```bash
rtk node --test tests/*.test.mjs
rtk npx wrangler deploy --dry-run
rtk git diff origin/main...HEAD --check
rtk git status --short --branch
```

Record exact pass counts, Wrangler asset count, branch name, and commit SHA.

- [ ] **Step 2: Request a code review of the complete branch**

Use the `superpowers:requesting-code-review` skill against `origin/main...HEAD`. Resolve only findings supported by the diff and spec, rerun the directly affected tests, then rerun the full verification set.

- [ ] **Step 3: Push the branch without merging**

Run:

```bash
rtk git push -u origin codex/tpl-243-cruxcut-homepage
```

Expected: the remote branch is created and production remains unchanged.

- [ ] **Step 4: Create a draft pull request**

Create a draft PR with title:

```text
Build the CruxCut product homepage
```

Use this body structure with actual verification counts inserted from Step 1:

```markdown
## Summary
- replace the root privacy redirect with a US-English CruxCut product homepage
- present AI Follow-cam, Crux Highlights, and Route Stickers with real product proof
- add consistent structured data, `llms.txt`, sitemap coverage, and homepage/guide links

## Verification
- Node tests: all committed test cases passed locally; exact count is recorded in the PR comment
- Wrangler dry run: completed successfully; exact asset count is recorded in the PR comment
- Media: H.264, no audio, within committed byte budgets

## Publication gate
Draft only. Merge and Cloudflare production publication require explicit approval.
```

- [ ] **Step 5: Update TPL-243 without marking it Done**

Add a Linear comment of at most five lines containing the draft PR URL, the three result names, test status, and the explicit merge/deployment approval gate. Keep TPL-243 `In Progress` until production verification is complete.

- [ ] **Step 6: Hand off for merge and publication approval**

Report the draft PR URL, local preview state, exact verification results, and the remaining production-only checks. Do not merge the PR, publish to Cloudflare, edit crawler controls, or mark TPL-243 Done until the user explicitly approves those actions.
