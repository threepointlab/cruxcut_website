# First-party web attribution (v1)

## Scope and interpretation
Public EN/KO home, guides, about, privacy/terms and Android fallback pages load attribution.js. Admin pages are excluded. One pageview is attempted per document load, not per unique visitor; clicks are outbound CTA intent, not confirmed installs or Discord joins. A blocked request, disabled JS, storage failure or stripped referrer can undercount. A browser reload is another pageview. No retries or visitor identifiers are created.

UTM tags have priority. Only a bounded utm_source and utm_campaign category survives; arbitrary source becomes other_campaign, arbitrary campaign becomes other. utm_medium is not recorded. Recognized sources: instagram, reddit, google, bing, duckduckgo, chatgpt, perplexity, claude, gemini, copilot; plus other_referral, direct_or_unknown, other_campaign. Methods distinguish utm/referrer/none. Known domains are matched on hostname equality or dot-delimited subdomain, never substring. Gemini is checked before Google. Empty referrer never implies AI. Unrecognized search country domains become other_referral, not guessed Google.

The current tab's sessionStorage contains only source/campaign/method and a 30-minute expiry. Internal navigation retains that context, including guides/locale switches. New explicit UTM or external referrer replaces it. No cookies, localStorage, IDs or cross-device stitching. If storage is blocked, attribution works on the current page but cannot persist internally. GPC/DNT suppress events and link attribution. Raw URLs, UTM strings, IP, UA, search queries are not written into Analytics Engine; ordinary hosting/network logs are separate from this dataset.

## CTA destinations
App Store ct is website_{source}_{campaign}, preserving pt and mt. Discord invite is unchanged and receives no identifiers. All four home Play anchors retain /download/android fallback. Only a verified live Play listing leads to the official store URL; its encoded referrer contains bounded utm_source, utm_campaign and utm_medium=website. The availability API still returns the exact canonical store URL. Failed/ambiguous probes keep the coming-soon dialog/server page. Ctrl/meta/new-tab and unsupported-dialog fallback use the server gate with bounded source/campaign query parameters.

## Endpoint and persistence
POST /api/attribution-event, same-origin Origin (or same-origin Referer if no Origin), JSON only, max 2048 bytes including streamed bodies. Unknown fields/categories rejected. Known bot UA and explicit Sec-GPC/DNT excluded before storage. No public GET statistics. Invalid input 400, bad origin 403, method 405, type 415, size 413, missing/write-failing binding 503, accepted write 204. It is not an authenticated anti-abuse service: non-browser clients can forge headers; counts are not fraud-proof.

wrangler.toml binds WEB_ANALYTICS to cruxcut_web_attribution via analytics_engine_datasets and adds the endpoint to run_worker_first. No paid upgrade is required or performed by this code.

Stable writeDataPoint schema:
- index1: web_v1 (fixed sampling key, no visitor identifier)
- blob1: v1; blob2: event; blob3: source; blob4: method; blob5: campaign; blob6: page bucket; blob7: target; blob8: placement
- double1: 1 (event count)

Private Cloudflare SQL count example (sampling-aware):
```sql
SELECT blob2 AS event, blob3 AS source, blob4 AS method,
       blob5 AS campaign, blob7 AS target, blob8 AS placement,
       SUM(_sample_interval * double1) AS events
FROM cruxcut_web_attribution
WHERE timestamp > NOW() - INTERVAL '7' DAY
GROUP BY event, source, method, campaign, target, placement
```
Do not expose a query API token or public stats endpoint. Retention duration is intentionally not promised here pending current official-doc verification.

## Exact link examples
- Instagram bio: https://www.cruxcut.com/?utm_source=instagram&utm_medium=social&utm_campaign=bio
- Instagram story: https://www.cruxcut.com/?utm_source=instagram&utm_medium=social&utm_campaign=story
- Reddit bio: https://www.cruxcut.com/?utm_source=reddit&utm_medium=social&utm_campaign=bio
- Korean Instagram bio: https://www.cruxcut.com/ko/?utm_source=instagram&utm_medium=social&utm_campaign=bio

Do not put usernames/emails/IDs into tracking URLs. These examples measure source category, not individual creator attribution.

## Verification boundary
Node fixtures exercise hostile domains, AI/search, absent referrer, UTM priority/persistence/expiry, bounded store links, all click placements, bad origin, missing binding, bot/optout and PII rejection. Browser mocks/local binding writes prove integration only, not remote durable ingestion. Before claiming production persistence: deploy with approval, confirm binding in that deployment, make a real same-origin browser visit/click with a test source, wait for ingestion, query private Analytics Engine SQL and verify blob order/counts. Confirm no identifiers/full URL in rows, optout produces no row, and store redirect keeps its attribution. A 204 only confirms writeDataPoint accepted locally; Analytics Engine ingestion is asynchronous. Dataset creation alone does not prove any event exists.

Reserved `utm_campaign=qa` is supported for deployment verification. Exclude campaign qa from real performance reports (`AND blob5 != 'qa'`). It contains no individual identifier.

# v2 events and the home_v2 A/B test (2026-11-05)

## Assignment
EN/KO homepages run `home_v2`: arm `a` is the original page, arm `b` adds the hook hero, the auto zoom in/out section, platform-matched store CTAs, the direct sticky "Get the app" button and scroll/press motion (one bundled treatment; results cannot attribute lift to a single element). An inline head script assigns 50/50 with `Math.random()` and keeps only the arm letter in `localStorage["cruxcut_exp_home_v2"]` (no ID, no cookie). Known bot user agents and blocked storage get arm `a`. `?exp=a|b` forces and stores an arm for QA; `?platform=ios|android|desktop` previews the platform CTA. Arm B content lives in inert `<template>` elements, so crawlers and no-JS readers get arm A.

## Payload v2
`{v:2,event,source,campaign,method,page,target,placement,exp,arm,platform}`. v1 payloads remain accepted for cached clients.
- event: pageview | click | cta_view | scroll
- click placement: hero, nav, final, community, footer, dialog, sticky, zoom (explicit `data-cta-placement` wins over DOM ancestry)
- cta_view placement: hero, zoom, final (once per page load when 50% of the CTA group is visible)
- scroll placement: d25, d50, d75, d100 (once each per page load, home only)
- exp: none | home_v2; arm: none | a | b (both none or both set); platform: ios | android | desktop | other (coarse UA class)

Write schema: index1 `web_v2`; blob1 v2, blob2 event, blob3 source, blob4 method, blob5 campaign, blob6 page, blob7 target, blob8 placement, blob9 exp, blob10 arm, blob11 platform; double1 = 1.

## Readout (private Analytics Engine SQL, needs an Account Analytics read token)
```sql
SELECT blob10 AS arm, blob11 AS platform,
  SUM(IF(blob2 = 'pageview', _sample_interval * double1, 0)) AS pageviews,
  SUM(IF(blob2 = 'click' AND blob7 IN ('appstore','googleplay'), _sample_interval * double1, 0)) AS store_clicks,
  SUM(IF(blob2 = 'click' AND blob7 = 'appstore', _sample_interval * double1, 0)) AS appstore_clicks,
  SUM(IF(blob2 = 'click' AND blob7 = 'googleplay', _sample_interval * double1, 0)) AS play_clicks,
  SUM(IF(blob2 = 'scroll' AND blob8 = 'd50', _sample_interval * double1, 0)) AS reached_half
FROM cruxcut_web_attribution
WHERE index1 = 'web_v2' AND blob9 = 'home_v2' AND blob5 != 'qa' AND timestamp > toDateTime('2026-11-06 00:00:00')
GROUP BY arm, platform ORDER BY arm, platform
```
Primary metric: store_clicks / pageviews per arm (page-load based, not unique visitors; a click is store intent, not an install). Guardrails: d50 scroll reach, cta_view per placement. Compare arms only within the same period; treat small counts directionally.

## Optional vendors (2026-11-08)
`assets/home/analytics.js` mirrors the v2 events to Amplitude (web-only project, key in `<meta name="cruxcut-amplitude-key">`) and loads Microsoft Clarity (project id in `<meta name="cruxcut-clarity-id">`). Both are skipped under GPC/DNT; Amplitude IP tracking is disabled. The privacy policy (KO/EN) discloses the A/B localStorage letter, Amplitude and Clarity.
