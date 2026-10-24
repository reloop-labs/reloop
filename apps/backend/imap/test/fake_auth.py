"""Stand-in for the domain service's /v1/smtp-auth, for CI and local tests.

    FAKE_AUTH_KEY=rl_ci_key FAKE_AUTH_ORG=org_ci FAKE_AUTH_EMAIL=ci@ci.reloop.sh python3 test/fake_auth.py

Accepts FAKE_AUTH_KEY for FAKE_AUTH_EMAIL only (like a key scoped to one
address); everything else gets 401.
"""
import json, os
from http.server import BaseHTTPRequestHandler, HTTPServer

KEY, ORG = os.environ["FAKE_AUTH_KEY"], os.environ["FAKE_AUTH_ORG"]
EMAIL = os.environ["FAKE_AUTH_EMAIL"].lower()
PORT = int(os.environ.get("FAKE_AUTH_PORT", "8011"))


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("content-length") or 0)
        body = json.loads(self.rfile.read(length) or b"{}")
        ok = (self.path == "/api/domain/v1/smtp-auth"
              and self.headers.get("x-api-key") == KEY
              and body.get("email", "").lower() == EMAIL)
        self.send_response(200 if ok else 401)
        self.send_header("content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"ok": True, "organizationId": ORG} if ok else {"message": "Unauthorized"}).encode())

    def log_message(self, *args):
        pass


HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
