export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // 팀 전용 게이팅: /backlog* 는 Basic Auth 필요.
        // 비밀번호는 Worker 시크릿 BACKLOG_PASSWORD 로 설정. 미설정 시 기본 잠금(fail-closed).
        if (url.pathname === "/backlog" || url.pathname.startsWith("/backlog/")) {
            const pass = env.BACKLOG_PASSWORD;
            const header = request.headers.get("Authorization") || "";
            let ok = false;
            if (pass && header.startsWith("Basic ")) {
                try {
                    const decoded = atob(header.slice(6));
                    ok = decoded.slice(decoded.indexOf(":") + 1) === pass;
                } catch (e) {
                    ok = false;
                }
            }
            if (!ok) {
                return new Response("Backlog: 인증이 필요합니다.", {
                    status: 401,
                    headers: { "WWW-Authenticate": 'Basic realm="cruxcut-backlog"' },
                });
            }
        }

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
