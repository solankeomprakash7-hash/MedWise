#!/usr/bin/env bash
# Reinstall the Reel Studio Starter Pack in a fresh session.
# The pack is licensed and never committed: upload the zip again, then run:
#   reels/install-starter-pack.sh /path/to/Reel-Studio-Starter-Pack.zip
set -e
ZIP="$1"; [ -f "$ZIP" ] || { echo "usage: $0 <starter-pack.zip>"; exit 1; }
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; DEST="$ROOT/ai-video-editor"
[ -e "$DEST" ] && { echo "$DEST already exists"; exit 1; }
TMP="$(mktemp -d)"; unzip -q "$ZIP" -d "$TMP"
mv "$TMP/AI Video Editor" "$DEST"; rm -rf "$TMP" "$DEST/tools/__pycache__"
printf '# Licensed pack: never commit or upload\n*\n' > "$DEST/.gitignore"
printf -- '- In this cloud workspace, run Python as `.venv/bin/python` (it has faster-whisper). Not `python`/`python3`.\n' >> "$DEST/notes.md"
cd "$DEST"
python3 -m venv .venv && .venv/bin/pip install -q -r "$ROOT/reels/requirements.txt"
npm install --silent
node engine/render.js examples/reel.json --stills
echo "Starter pack ready in $DEST"
