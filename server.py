"""Open admin dashboard and request API for the trusted-LAN competition demo."""

from __future__ import annotations

import json
import socket
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "roadrescue-requests.json"
MAX_BODY = 2_000_000


def read_requests():
    try:
        items = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        return items if isinstance(items, list) else []
    except (OSError, json.JSONDecodeError):
        return []


def write_requests(items):
    temporary = DATA_FILE.with_suffix(".tmp")
    temporary.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(DATA_FILE)


class RoadRescueHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, status, value, extra_headers=None):
        body = json.dumps(value, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        for name, value in (extra_headers or {}).items():
            self.send_header(name, value)
        self.end_headers()
        self.wfile.write(body)

    def read_body(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length < 1 or length > MAX_BODY:
            raise ValueError("Request body is empty or too large")
        return json.loads(self.rfile.read(length))

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/roadrescue-requests.json":
            return self.send_json(404, {"error": "Not found"})
        if path == "/api/requests":
            return self.send_json(200, read_requests())
        if path.startswith("/api/requests/"):
            reference = unquote(path.rsplit("/", 1)[-1])
            item = next((row for row in read_requests() if row.get("reference") == reference), None)
            if not item:
                return self.send_json(404, {"error": "Not found"})
            # Public tracking returns progress details only, never contact or incident data.
            progress = {key: item.get(key) for key in ("reference", "service", "area", "landmark", "status", "createdAt")}
            return self.send_json(200, progress)
        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path != "/api/requests":
            return self.send_json(404, {"error": "Not found"})
        try:
            item = self.read_body()
            required = ("reference", "name", "phone", "service", "area", "landmark", "details")
            if not isinstance(item, dict) or any(not item.get(key) for key in required):
                return self.send_json(400, {"error": "Missing request fields"})
            items = read_requests()
            if any(row.get("reference") == item["reference"] for row in items):
                return self.send_json(409, {"error": "Reference already exists"})
            items.append(item)
            write_requests(items)
            return self.send_json(201, {"ok": True})
        except (ValueError, json.JSONDecodeError) as error:
            return self.send_json(400, {"error": str(error)})
        except OSError as error:
            return self.send_json(500, {"error": str(error)})

    def do_PATCH(self):
        reference = unquote(urlparse(self.path).path.rsplit("/", 1)[-1])
        try:
            changes = self.read_body()
            if not isinstance(changes, dict) or changes.get("status") not in {
                "Received ", "Reviewing ", "Help arranged ", "Completed ", "Cancelled ",
                "Received (demo)", "Reviewing (demo)", "Help arranged (demo)", "Completed (demo)", "Cancelled (demo)"
            }:
                return self.send_json(400, {"error": "Invalid status"})
            items = read_requests()
            item = next((row for row in items if row.get("reference") == reference), None)
            if not item:
                return self.send_json(404, {"error": "Not found"})
            item["status"] = changes["status"]
            write_requests(items)
            return self.send_json(200, {"ok": True})
        except (ValueError, json.JSONDecodeError) as error:
            return self.send_json(400, {"error": str(error)})
        except OSError as error:
            return self.send_json(500, {"error": str(error)})

    def do_DELETE(self):
        reference = unquote(urlparse(self.path).path.rsplit("/", 1)[-1])
        items = read_requests()
        remaining = [row for row in items if row.get("reference") != reference]
        if len(remaining) == len(items):
            return self.send_json(404, {"error": "Not found"})
        try:
            write_requests(remaining)
            return self.send_json(200, {"ok": True})
        except OSError as error:
            return self.send_json(500, {"error": str(error)})

    def log_message(self, format, *args):
        print("%s - %s" % (self.address_string(), format % args))


def main():
    server = ThreadingHTTPServer(("0.0.0.0", 8000), RoadRescueHandler)
    try:
        probe = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            probe.connect(("8.8.8.8", 80))
            lan_ip = probe.getsockname()[0]
        except OSError:
            lan_ip = "<laptop-ip>"
        finally:
            probe.close()
        print("RoadRescue demo server is running. Keep this window open.")
        print("On this laptop: http://localhost:8000/admin.html")
        print(f"On phones using the same Wi-Fi: http://{lan_ip}:8000/")
        print("Press Ctrl+C to stop the server.")
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nRoadRescue demo server stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
