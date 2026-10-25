#!/usr/bin/env python3
"""Serve Orbit locally using only Python's standard library."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class GameHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description="Run the Orbit game server.")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    directory = Path(__file__).resolve().parent
    handler = partial(GameHandler, directory=str(directory))
    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    except OSError as error:
        parser.exit(1, f"Could not start server: {error}\nTry another port: python3 server.py --port 8001\n")
    print(f"Orbit is running at http://127.0.0.1:{server.server_port}", flush=True)
    print("Press Ctrl+C to stop.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
