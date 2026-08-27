# CruxCut homepage design

**Date:** 2026-08-27<br>
**Issue:** TPL-243 — GEO/SEO 를 위한 cruxcut 홈페이지 세팅하기<br>
**Repository:** `threepointlab/cruxcut_website`<br>
**Status:** Approved direction; implementation pending

## Summary

Replace the current root redirect with an English, US-first product homepage for CruxCut. The page must make the product understandable in one viewport, prove the result with real climbing footage, convert qualified visitors to the App Store, and expose concise factual content that search engines and answer engines can quote.

The homepage presents one video producing three share-ready results:

1. AI Follow-cam
2. Crux Highlights
3. Route Stickers

Move-by-move segmentation is not a separate homepage feature. It is an enabling capability inside Crux Highlights and the optional editing flow.

## Source of truth

Product claims and positioning are grounded in:

- the final midterm presentation script in Google Drive: `소마 17기/서류/중간평가/중간발표 흐름/대본`;
- the current US App Store listing for `CruxCut: AI Climb Video Editor`;
- the shipped product behavior and approved CruxCut brand system;
- the existing published climbing-video guide in this repository.

The midterm script defines the three user-visible results as a follow-cam video, a crux-focused highlight clip, and a route-based workout sticker. The exact `22.4 seconds` processing result is benchmark context, not a universal product promise, so the homepage uses the durable phrase `in seconds` rather than a precise timing guarantee.

## Goals

- Make `https://www.cruxcut.com/` the primary product and conversion page.
- Explain CruxCut as an AI climbing video editor for iPhone in plain US English.
- Show real product output before asking for an install.
- Drive App Store visits with attributable campaign links.
- Give search engines and answer engines a clear, internally consistent product entity.
- Preserve the public policy, guide, admin, and protected backlog routes.
- Keep the site fast and useful without client-side JavaScript.

## Non-goals

- No account system, upload flow, web editor, pricing calculator, or CMS.
- No unsupported free-form per-move editing claim.
- No separate move-segmentation feature card.
- No publication of stale traction, revenue, or processing-speed numbers.
- No new Korean homepage in this slice; US English is the canonical homepage language.
- No redesign of the existing privacy and terms content.
- No autonomous merge or production deployment.

## Audience and conversion

The primary audience is a US-based boulderer or sport climber who films attempts on a tripod or with a phone, wants the climber to remain easy to follow, and wants a better clip without repeating a generic editor workflow.

The primary conversion is an App Store visit. The main CTA uses:

`https://apps.apple.com/app/apple-store/id6771268613?pt=127608181&ct=website_home&mt=8`

The secondary conversion is reading the practical climbing-video guide. There is no email capture or contact form.

## Messaging

### Hero

**Eyebrow:** `AI climbing video editor for iPhone`

**Headline:** `Great sends deserve great videos.`

**Supporting copy:**

`Pick a climbing video and get a follow-cam edit, crux highlights, and a shareable route sticker.`

**Primary CTA:** `Get CruxCut for iPhone`

**Secondary CTA:** `See how it works`

### Product definition

The first explicit definition in the document body is:

`CruxCut is an AI climbing video editor for iPhone. It automatically follows the climber, finds crux-worthy moments, and turns the climbing path into a shareable sticker.`

This sentence is reused consistently in metadata, structured data, `llms.txt`, and the visible introduction. Variants may shorten it but must not change the three-result model.

### Core results

#### AI Follow-cam

`Turn a fixed wide shot into a smooth follow-cam edit. CruxCut keeps the climber centered with automatic pan and zoom, whether the video came from a tripod or a handheld phone.`

#### Crux Highlights

`Find the hard, dynamic moments without scrubbing through every attempt. CruxCut uses the climb's movement to organize crux-worthy sections into short clips and multi-climb highlight reels.`

Move segmentation can be described only as part of how Crux Highlights organizes or lets a user refine footage. It is not presented as a fourth result.

#### Route Stickers

`Turn the climbing path, grade, and result into a visual workout sticker that is easy to add to a video or share on social media.`

#### On-device trust statement

`Video processing happens on your iPhone. Your raw climbing footage does not need to be uploaded to a processing server.`

This wording is deliberately narrower than a blanket `no data leaves your phone` claim because app analytics and account data have separate privacy disclosures.

## Information architecture

The homepage is one continuous page with the following order:

1. **Sticky header** — wordmark, Features, How it works, Guides, App Store CTA.
2. **Hero** — product definition, two CTAs, and real Before/After follow-cam proof.
3. **Three-result overview** — one concise sentence introducing the three outputs.
4. **AI Follow-cam proof** — synchronized original/result media and supporting copy.
5. **Crux Highlights proof** — short dynamic-move or highlight-reel media and supporting copy.
6. **Route Stickers proof** — the route drawing/result without Instagram interface chrome.
7. **How it works** — `Pick a video → On-device AI edits it → Tweak or share`.
8. **On-device trust block** — privacy and availability benefits, with a link to `/privacy`.
9. **FAQ** — direct answers to high-intent product and climbing-video questions.
10. **Guide card** — link to `/guides/how-to-film-and-edit-climbing-videos`.
11. **Final App Store CTA**.
12. **Footer** — `/guides`, `/privacy`, and `/terms`.

The homepage wordmark links to `/`. Guide pages should also link their wordmark back to `/`, while retaining an explicit Guides link.

## FAQ content

Visible FAQ copy and `FAQPage` structured data must match exactly. Initial questions:

1. **What is CruxCut?**<br>
   CruxCut is an AI climbing video editor for iPhone. It turns raw climbing footage into a follow-cam edit, crux highlights, and a shareable route sticker.

2. **Can CruxCut automatically follow a climber?**<br>
   Yes. CruxCut detects the climber and applies automatic pan and zoom so a fixed wide shot feels closer to a follow-cam video.

3. **How does CruxCut create climbing highlights?**<br>
   CruxCut analyzes movement in the climb to surface difficult and dynamic sections. Those sections can become a short clip or a highlight reel across multiple climbs.

4. **What is a route sticker?**<br>
   A route sticker visualizes the path of the climb together with details such as grade and result, so the session can be shared like a workout record.

5. **Does CruxCut upload climbing videos to a server for AI processing?**<br>
   No processing-server upload is required. CruxCut performs video analysis and editing on the user's iPhone.

6. **Which devices does CruxCut support?**<br>
   CruxCut is available for iPhone and requires iOS 18 or later.

## Visual direction

- Dark-first canvas: `#0D0F12`.
- Warm primary text: `#F5F0E8`; muted text: `#BBBBBB`.
- Brand accent and CTA: `#E74408`.
- Optional highlight accent: `#FFD400`, used sparingly.
- Wordmark: lowercase `cruxcut.` with the final period in brand orange.
- Typography: Pretendard when locally hosted; system sans fallback.
- Large editorial type, restrained borders, generous negative space, and real product media.
- No generic stock imagery, invented UI screenshots, cool-tone secondary palette, or decorative model-authored SVG illustration.

The page should feel like a climbing-film product, not a generic software dashboard. Motion comes from product footage and small interface transitions, not continuous decorative animation.

## Media plan

Existing marketing assets are source material, not files referenced across repositories at runtime. Approved source candidates are copied and transformed into web-specific assets during implementation.

- **Follow-cam:** use matching raw and tracked clips based on `dws_dynamic_raw_long.mp4` and `dws_dynamic_track_after_long.mp4` to produce one synchronized 6–8 second Before/After proof loop.
- **Crux Highlights:** select a short real dynamic-move or highlight-reel excerpt after verifying that it represents current product output.
- **Route Stickers:** use the actual route drawing/result from `heart_sped.mp4`; do not use the Instagram admin screenshot as the product demonstration.
- **Brand mark:** use the current transparent `cruxcut-mark.png`.
- **Social preview:** create a dedicated landscape `og.png` that uses the approved brand system and the exact homepage title or product definition.

Media requirements:

- muted, inline, `playsinline`, and looped only where motion materially proves a feature;
- meaningful poster image for every video;
- no autoplay when `prefers-reduced-motion: reduce` is active;
- below-fold media uses lazy loading or deferred sources;
- no audio track;
- hero proof target size at or below 5 MB, with each secondary clip materially smaller;
- text beside every visual communicates the same information without requiring video playback.

## GEO and SEO

### Crawlable content

All product definitions, features, FAQ answers, and links are present in server-delivered HTML. JavaScript may enhance navigation or media controls but cannot be required to understand the page.

### Metadata

- Canonical: `https://www.cruxcut.com/`
- Title: `CruxCut — AI Climbing Video Editor for iPhone`
- Description: a concise version of the approved three-result product definition.
- Open Graph and X metadata use the same entity name and claim set.
- The social image is referenced through an absolute `https://www.cruxcut.com/...` URL.

### Structured data

Use a single JSON-LD graph containing:

- `Organization` for ThreePointLab/CruxCut identity and logo;
- `SoftwareApplication` with `applicationCategory: MultimediaApplication`, iPhone/iOS operating-system information, App Store URL, and the approved description;
- `FAQPage` whose questions and answers exactly match visible content.

Do not add ratings, review counts, prices, awards, or unsupported feature claims to structured data.

### AI-readable summary

Add `/llms.txt` with:

- the canonical product definition;
- the three results;
- the on-device processing statement;
- platform and minimum OS;
- canonical homepage, App Store, guide, privacy, and terms links.

`llms.txt` is supplementary. The visible semantic HTML remains the authority.

### Internal linking and sitemap

- Add the homepage canonical URL to `sitemap.xml` with the highest site-relative priority.
- Preserve the guide and policy URLs.
- Link homepage → guide and guide → homepage.
- Keep each page's canonical URL self-referential.

### Crawler controls

Cloudflare-managed robots and AI Crawl Control settings are external to the repository. Before calling the GEO work complete, verify that approved search and answer-engine crawlers are allowed and that live `robots.txt` does not contradict the intended policy.

## Technical design

The site remains a static-asset Cloudflare Worker. No framework migration or package system is introduced.

### Files

- `index.html` — semantic homepage content and structured data.
- `assets/home/home.css` — homepage styles and responsive behavior.
- `assets/home/home.js` — only minimal progressive enhancement when needed.
- `assets/home/*` — optimized video, poster, logo, font, and social assets.
- `llms.txt` — concise AI-readable product facts.
- `sitemap.xml` — updated public URL inventory.
- `src/index.js` — serve `/index.html` at `/` instead of redirecting to `/privacy`.
- `tests/worker.test.mjs` — homepage routing and existing-route regression coverage.
- focused static-content tests — metadata, JSON-LD, FAQ parity, link targets, and sitemap entries.

### Routing

- `/` → `/index.html` asset response with status 200.
- `/privacy` → existing `/privacy.html`.
- `/terms` → existing `/terms.html`.
- `/en/privacy` and `/en/terms` remain unchanged.
- `/guides` and the canonical guide route remain unchanged.
- `/backlog*` retains fail-closed Basic Auth.
- Admin and other existing routes remain unchanged.

No compatibility redirect from `/` to `/privacy` remains. Direct visits to `/privacy.html` may continue to resolve through static assets; the canonical policy URL remains `/privacy`.

### Interaction and fallback behavior

- Anchor navigation works without JavaScript.
- FAQ uses native semantic controls or fully visible content.
- A failed or unsupported video displays its poster and adjacent explanatory text.
- A failed font load falls back to the system sans stack without layout breakage.
- CTA links remain ordinary anchors so they work with scripts disabled.
- Focus states, keyboard navigation, color contrast, and touch target sizes are first-class requirements.

## Attribution and measurement

Homepage App Store links use `ct=website_home`. Feature-specific CTAs may use a stable suffix only if the additional segmentation is immediately useful; the default is one campaign code to avoid fragmenting low-volume attribution.

No new analytics SDK, cookie banner, fingerprinting, or contact-data collection is introduced in this work.

## Validation

### Automated

- Worker test proves `/` serves `/index.html` with status 200 and does not redirect.
- Existing guide route, canonical redirect, and protected route tests remain green.
- Static test parses every JSON-LD block as JSON.
- Static test confirms visible FAQ questions and structured FAQ questions stay in sync.
- Static test checks canonical metadata, App Store campaign link, required internal links, and sitemap entries.
- Cloudflare Worker dry run completes and includes the intended assets.
- Media inspection confirms expected codec, dimensions, duration, lack of audio, and agreed size ceilings.

### Preview

- Open the first meaningful local homepage preview after the hero and one representative feature are coherent and compile successfully.
- Continue implementation from the same preview session.
- Check desktop and mobile layout, reduced-motion behavior, keyboard access, media fallbacks, and horizontal overflow before delivery.

### Pre-publication

- Review copy against the final presentation script and current App Store listing.
- Confirm no exact timing, stale metric, or unsupported editing claim appears.
- Confirm `/privacy`, `/terms`, `/guides`, the guide article, and protected backlog behavior are unchanged.
- Prepare a PR with screenshots or preview evidence and a concise verification summary.

### Post-publication

After explicit merge/deployment approval:

- verify the homepage, canonical tags, media, CTA, policy pages, guide, sitemap, and `llms.txt` on `www.cruxcut.com`;
- verify Cloudflare deployment success;
- fetch live pages with normal and approved crawler user agents;
- confirm `robots.txt` and Cloudflare AI Crawl Control match the approved allow policy;
- update TPL-243 with the production result and evidence before moving it to Done.

## Delivery gates

Implementation, local preview, tests, branch commits, and PR preparation are authorized by the homepage request and approved design.

The following remain approval-gated:

- PR merge;
- production publication through the Cloudflare-connected repository;
- changes to external Cloudflare crawler settings;
- any public outreach, post, message, or App Store metadata change.

## Acceptance criteria

- `https://www.cruxcut.com/` is represented in the branch as an English product homepage, not a privacy redirect.
- The first viewport says what CruxCut is, shows real product proof, and offers an App Store CTA.
- Exactly three user-visible results are presented: AI Follow-cam, Crux Highlights, and Route Stickers.
- Move segmentation is absorbed into the Crux Highlights/editing explanation rather than presented as a fourth feature.
- On-device processing is explained accurately and linked to the privacy policy.
- Homepage metadata, structured data, sitemap, internal links, and `llms.txt` use a consistent product definition.
- Policy, guide, admin, and protected backlog routes retain their existing behavior.
- Relevant automated checks and Cloudflare dry run pass.
- A reviewable PR is ready, while merge and public deployment remain pending explicit approval.
