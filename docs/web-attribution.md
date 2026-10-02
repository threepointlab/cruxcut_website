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
