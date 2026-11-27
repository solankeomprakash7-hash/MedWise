#!/usr/bin/env bash
# One-shot setup for the reels workspace (Linux / cloud container). Re-run in any fresh session.
set -e
cd "$(dirname "$0")"
command -v ffmpeg >/dev/null || { sudo apt-get update && sudo apt-get install -y ffmpeg; }
command -v node   >/dev/null || { echo "Install Node.js 20+ first"; exit 1; }
[ -d .venv ] || python3 -m venv .venv
.venv/bin/pip install -q -r requirements.txt
npm install --silent
mkdir -p raw references exports assets work
echo "ffmpeg  $(ffmpeg -version | head -1 | cut -d' ' -f3)"
echo "node    $(node -v)"
echo "whisper $(.venv/bin/python -c 'import faster_whisper;print(faster_whisper.__version__)')"
echo "puppeteer $(node -p "require('puppeteer/package.json').version")"
