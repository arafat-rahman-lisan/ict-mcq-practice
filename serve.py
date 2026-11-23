"""Start the static project locally; no extra Python packages required."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser

handler = partial(SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parent))
for port in range(8000, 8021):
    try:
        server = ThreadingHTTPServer(('127.0.0.1', port), handler)
        break
    except OSError:
        continue
else:
    raise SystemExit('No free port between 8000 and 8020. Close an older server and try again.')
url = f'http://127.0.0.1:{port}/'
print(f'ICT Practice: {url}\nKeep this window open. Press Ctrl+C to stop.')
webbrowser.open(url)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
