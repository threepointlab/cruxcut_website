export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === "/") {
            return Response.redirect(new URL("/privacy", url), 302);
        }

        if (url.pathname === "/en") {
            return Response.redirect(new URL("/en/privacy", url), 302);
        }

        if (url.pathname === "/privacy") {
            return env.ASSETS.fetch(new Request(new URL("/privacy.html", url), request));
        }

        if (url.pathname === "/en/privacy") {
            return env.ASSETS.fetch(new Request(new URL("/en/privacy.html", url), request));
        }

        if (url.pathname === "/loading") {
            return env.ASSETS.fetch(new Request(new URL("/loading.html", url), request));
        }

        if (url.pathname === "/admin" || url.pathname === "/admin/") {
            return env.ASSETS.fetch(new Request(new URL("/admin/index.html", url), request));
        }

        if (url.pathname === "/mindmap" || url.pathname === "/admin/mindmap") {
            return env.ASSETS.fetch(new Request(new URL("/admin/mindmap.html", url), request));
        }

        if (url.pathname === "/backlog" || url.pathname === "/backlog/") {
            return env.ASSETS.fetch(new Request(new URL("/backlog/index.html", url), request));
        }

        if (url.pathname === "/backlog/stories" || url.pathname === "/backlog/stories/") {
            return env.ASSETS.fetch(new Request(new URL("/backlog/stories.html", url), request));
        }

        return env.ASSETS.fetch(request);
    },
};
