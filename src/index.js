const PLAY_PACKAGE = "com.threepointlab.cruxcut";
const PLAY_URL = `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE}`;
const STATUS_TTL = 120;

// Public Play HTML is not a stable release API. Only explicit install evidence opens the gate.
export function inspectPlayListing(html, finalUrl, releaseVerified = false) {
    let url;
    try { url = new URL(finalUrl); } catch { return false; }
    if (url.hostname !== "play.google.com" || url.pathname !== "/store/apps/details" || url.searchParams.get("id") !== PLAY_PACKAGE) return false;
    const blocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const apps = blocks.flatMap(([, text]) => {
        try { const data = JSON.parse(text); return Array.isArray(data) ? data : data["@graph"] || [data]; } catch { return []; }
    });
    const canonical = [...html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/gi)].some(([, value]) => {
        try { const u = new URL(value.replace(/&amp;/g, "&")); return u.hostname === "play.google.com" && u.pathname === "/store/apps/details" && u.searchParams.get("id") === PLAY_PACKAGE; } catch { return false; }
    });
    const identified = apps.some(app => app["@type"] === "SoftwareApplication" && /^CruxCut(?:\s|$)/i.test(app.name || "") && (canonical || (app.url || app["@id"] || "").includes(`/store/apps/details?id=${PLAY_PACKAGE}`)));
    if (!identified || /pre[-\s]?register|pre[-\s]?registration|coming soon/i.test(html.replace(/<script\b[\s\S]*?<\/script>/gi, ""))) return false;
    const installButton = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)].some(([, attrs, text]) => {
        if (/\bdisabled\b|aria-disabled=["']true["']/i.test(attrs)) return false;
        return /^\s*Install\s*$/i.test(text.replace(/<[^>]*>/g, "")) || /aria-label=["']Install["']/i.test(attrs);
    });
    return identified && (installButton || releaseVerified);
}

export async function probePlayAvailability(lang, env = {}, fetcher = fetch) {
    const region = lang === "ko" ? "KR" : "US";
    try {
        const response = await fetcher(`${PLAY_URL}&hl=en&gl=${region}`, {headers: {"Accept-Language": "en-US,en;q=0.9"}, signal: AbortSignal.timeout(5000)});
        if (!response.ok) return {available: false, reason: "not_available", region};
        const available = inspectPlayListing(await response.text(), response.url, env.PLAY_RELEASE_VERIFIED === "true");
        return {available, reason: available ? "verified_listing" : "unconfirmed", region};
    } catch { return {available: false, reason: "probe_failed", region}; }
}

async function playStatus(request, env) {
    const url = new URL(request.url);
    const lang = url.searchParams.get("lang") === "ko" ? "ko" : "en";
    const key = new Request(new URL(`/api/play-availability?lang=${lang}`, url));
    const cache = typeof caches !== "undefined" ? caches.default : null;
    const cached = cache ? await cache.match(key).catch(() => null) : null;
    if (cached) { try { return await cached.json(); } catch { /* Ignore corrupt cache entries. */ } }
    const status = await probePlayAvailability(lang, env);
    if (cache) await cache.put(key, Response.json(status, {headers: {"Cache-Control": `public, max-age=${STATUS_TTL}`}})).catch(() => {});
    return status;
}

function comingSoonPage(ko) {
    return `<!doctype html><html lang="${ko ? "ko" : "en"}"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${ko ? "Android 출시 준비 중" : "Android coming soon"} · CruxCut</title><link rel="stylesheet" href="/assets/home/home.css?v=play-entry-1"><main class="android-fallback section-shell"><p class="eyebrow">CruxCut · Android</p><h1>${ko ? "Android 버전은 곧 만나요" : "Android is coming soon"}</h1><p>${ko ? "Google Play 출시를 준비 중이에요. Discord에서 업데이트 소식을 확인하세요." : "We’re getting ready for Google Play. Follow updates in Discord."}</p><a class="button community-button" href="https://discord.gg/phFRhaWCU5">${ko ? "Discord 참여하기" : "Join the Discord"}</a><p><a href="${ko ? "/ko/" : "/"}">${ko ? "홈으로 돌아가기" : "Back to home"}</a></p></main></html>`;
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === "/api/play-availability" || url.pathname === "/download/android") {
            if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", {status:405, headers:{Allow:"GET, HEAD"}});
            const status = await playStatus(request, env);
            if (url.pathname === "/api/play-availability") return Response.json({...status, url: status.available ? PLAY_URL : null}, {headers:{"Cache-Control":"no-store"}});
            if (status.available) return new Response(null, {status:302, headers:{Location:PLAY_URL, "Cache-Control":"no-store"}});
            return new Response(comingSoonPage(url.searchParams.get("lang") === "ko"), {headers:{"Content-Type":"text/html; charset=utf-8", "Cache-Control":"no-store"}});
        }

        if (url.pathname === "/") {
            return env.ASSETS.fetch(request);
        }

        if (url.pathname === "/ko" || url.pathname === "/ko/") {
            return env.ASSETS.fetch(new Request(new URL("/ko/", url), request));
        }

        if (url.pathname === "/en") {
            return Response.redirect(new URL("/en/privacy", url), 302);
        }

        if (url.pathname === "/privacy") {
            return env.ASSETS.fetch(request);
        }

        if (url.pathname === "/terms") {
            return env.ASSETS.fetch(request);
        }

        if (url.pathname === "/en/privacy") {
            return env.ASSETS.fetch(request);
        }

        if (url.pathname === "/en/terms") {
            return env.ASSETS.fetch(request);
        }

        if (url.pathname === "/loading") {
            return env.ASSETS.fetch(request);
        }

        if (url.pathname === "/guides" || url.pathname === "/guides/") {
            return env.ASSETS.fetch(new Request(new URL("/guides/", url), request));
        }

        const climbingVideoGuide = "/guides/how-to-film-and-edit-climbing-videos";
        if (url.pathname === `${climbingVideoGuide}.html`) {
            return Response.redirect(new URL(climbingVideoGuide, url), 301);
        }

        if (url.pathname === climbingVideoGuide) {
            return env.ASSETS.fetch(request);
        }

        const highlightsGuide = "/guides/automatic-climbing-highlights";
        if (url.pathname === `${highlightsGuide}.html`) {
            return Response.redirect(new URL(highlightsGuide, url), 301);
        }

        if (url.pathname === highlightsGuide) {
            return env.ASSETS.fetch(request);
        }

        const comparisonGuide = "/guides/climbing-video-editor-comparison";
        if (url.pathname === `${comparisonGuide}.html`) {
            return Response.redirect(new URL(comparisonGuide, url), 301);
        }

        if (url.pathname === comparisonGuide) {
            return env.ASSETS.fetch(request);
        }

        if (url.pathname === "/admin" || url.pathname === "/admin/") {
            return env.ASSETS.fetch(new Request(new URL("/admin/", url), request));
        }

        if (url.pathname === "/mindmap" || url.pathname === "/admin/mindmap") {
            return env.ASSETS.fetch(new Request(new URL("/admin/mindmap", url), request));
        }

        return env.ASSETS.fetch(request);
    },
};
