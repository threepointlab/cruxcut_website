export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === "/") {
            return Response.redirect(new URL("/privacy", url), 302);
        }

        if (url.pathname === "/privacy") {
            return env.ASSETS.fetch(new Request(new URL("/privacy.html", url), request));
        }

        if (url.pathname === "/en/privacy") {
            return env.ASSETS.fetch(new Request(new URL("/en/privacy.html", url), request));
        }

        return env.ASSETS.fetch(request);
    },
};
