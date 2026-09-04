export default {
    async fetch(request, env) {
        const url = new URL(request.url);

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
