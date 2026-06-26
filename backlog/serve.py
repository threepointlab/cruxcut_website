#!/usr/bin/env python3
"""로컬 편집 서버. `python3 serve.py` 실행 후 http://localhost:8787 접속.
- GET: 파일 서빙 (index.html 등)
- POST /api/update: 한 티켓을 backlog.json에 저장 → ICE 재계산 → build.py 리빌드
"""
import json
import os
import subprocess
import pathlib
from http.server import HTTPServer, SimpleHTTPRequestHandler

ROOT = pathlib.Path(__file__).parent
DATA = ROOT / "data" / "backlog.json"
PORT = 8787


def recompute_ice(idea):
    if idea.get("type") == "feature":
        pi = idea.get("personaImpact") or {}
        c, e = idea.get("confidence"), idea.get("ease")
        if pi and c is not None and e is not None:
            idea["iceScore"] = max(pi.values()) * c * e
    return idea


class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path not in ("/api/update", "/api/delete"):
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", 0))
        try:
            body = json.loads(self.rfile.read(length) or b"{}")
            d = json.loads(DATA.read_text(encoding="utf-8"))
            ideas = d["ideas"]
            idx = next((k for k, x in enumerate(ideas) if x["id"] == body.get("id")), None)
            if idx is None:
                self.send_error(404, "unknown id")
                return
            if self.path == "/api/delete":
                removed = ideas.pop(idx)
                result = {"ok": True, "deleted": removed["id"]}
            elif "full" in body:
                full = body["full"]
                full["id"] = ideas[idx]["id"]  # id는 보존
                ideas[idx] = recompute_ice(full)
                result = {"ok": True, "idea": ideas[idx]}
            else:
                ideas[idx].update(body.get("patch", {}))
                recompute_ice(ideas[idx])
                result = {"ok": True, "idea": ideas[idx]}
            DATA.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
            subprocess.run(["python3", "build.py"], cwd=ROOT, check=False)
            self._json(result)
        except Exception as exc:  # noqa: BLE001
            self.send_error(400, str(exc))

    def _json(self, obj):
        out = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(out)))
        self.end_headers()
        self.wfile.write(out)

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    os.chdir(ROOT)
    print(f"편집 서버 실행 중 → http://localhost:{PORT}  (Ctrl+C로 종료)")
    HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
