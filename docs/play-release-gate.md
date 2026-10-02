# Google Play release gate

Package: `com.threepointlab.cruxcut`. All homepage Play anchors use
`/download/android?lang=en|ko`; JS checks `/api/play-availability` before navigating.
The server route is also the no-JS / modifier-click fallback. Worker routing is
explicit in `wrangler.toml` (`run_worker_first`).

The Worker probes the public English Play listing with US (EN) or KR (KO) region,
5-second timeout, and caches the result internally for at most 120 seconds.
Client responses are `no-store`. A HTTP 200 alone never opens the gate: require
exact package/final Play URL, CruxCut SoftwareApplication identity with matching
canonical/app URL, and an enabled Install button. Pre-registration, wrong app,
ambiguous markup, missing listing and network errors keep coming-soon behavior.

## Limits and smallest manual release switch

Google's public HTML is not a supported release-status API. Markup can change,
public listings can lag, and installability varies by country/device/account.
The automatic check is conservative, not infallible. The current exact public
US listing was Not Found when inspected during implementation.

If a genuine production release is publicly installable but Google's Install
markup is no longer recognizable, verify the exact public package and actual
installation (not merely pre-registration or a test track) in US and KR, then
set Worker variable `PLAY_RELEASE_VERIFIED = "true"` via release configuration.
This bypasses only the brittle Install-button test, not package identity,
pre-registration checks or network failure. Remove it to restore strict mode.
If structured identity itself changes, update and re-test the parser; do not
blindly force an outbound. No new secret or console access is required by this gate.

## Review and deployment

1. Review local preview, diff and EN/KO desktop/mobile coming-soon dialog.
2. Run `PATH=/opt/homebrew/bin:$PATH node --test tests/*.test.mjs`.
3. After explicit parent/user production approval, use the existing Cloudflare
   deployment workflow (`wrangler deploy`) with `wrangler.toml`; do not deploy
   assets-only, since the Worker owns gate routes.
4. Check deployed `/api/play-availability?lang=en` and `?lang=ko`, both no-JS
   `/download/android` variants, all four homepage Play CTAs and keyboard dialog.
5. When production is released, verify actual public installation, wait up to
   120 seconds for cache expiry and confirm the gate returns available. If it
   remains closed, use the constrained release switch only after verification.

No push, merge or deployment was performed during implementation.
