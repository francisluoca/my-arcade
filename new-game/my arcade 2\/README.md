# Orbit — Ball Battle

Start the local server from this folder:

```sh
python3 server.py
```

Open http://127.0.0.1:8000 for the title screen. Press Ctrl+C in the terminal to stop the server.

To use a different port:

```sh
python3 server.py --port 8001
```

Requires Python 3 and no additional packages. The server is available on this computer only. It serves the game files; battles remain single-player and progress stays in this browser's local storage. HTTP and file-based URLs have separate browser storage, so progress from directly opening `game.html` will not automatically appear on the server URL. Keep using the same hostname and port to access your saved progress.
