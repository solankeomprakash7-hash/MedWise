# Reels workspace

Edits raw talking-head phone videos into vertical Instagram Reels.

## Setup (run first in every new session)
`./setup.sh` installs FFmpeg (if missing), faster-whisper (in `.venv/`) and Puppeteer (in `node_modules/`), then prints their versions.

## Folders
- `raw/`: raw takes, named `YYYY-MM-DD-topic.mov`
- `references/`: 3–5 outlier Reels (or screenshots) to study for style
- `assets/`: screenshots and product photos to show on screen
- `exports/`: finished Reels (`<name>-final.mp4`)
- `work/`: scratch (transcripts, frames, HTML graphics), never committed
- `tools/transcribe.py`: word-timed transcript → `work/<name>.words.json`
- `tools/capture.js`: HTML page → 1080×1920 PNG frames (page may define `window.seek(t)`)

## Workflow (never skip the approval steps)
1. Transcribe with `.venv/bin/python tools/transcribe.py raw/<file> --prompt "<names>"`.
2. Find pauses with `ffmpeg -af silencedetect=noise=-35dB:d=0.4`.
3. **Show the cut list and wait for OK.** Keep about 0.15 s of air around each cut, never cut inside a word, keep the better retake, and flag words Whisper wasn't sure of.
4. Build titles, captions and cards as HTML, capture one still per beat, and **wait for OK.**
5. Capture frames with Puppeteer and mix them with FFmpeg.
6. Self-check: contact sheet (a frame every 0.5 s), text on the face or in the safe zone, black or frozen frames, audio full length, size and fps.
7. Every note from the user becomes a rule in the style skill.

## Export spec
1080×1920, 30 fps constant, H.264 `yuv420p`, AAC, about −14 LUFS (`loudnorm=I=-14`).
Convert phone footage to constant 30 fps before cutting, so captions stay in sync.

## Safe zone (no text here)
Top 250 px · bottom 420 px · right 140 px of the lower half. Never put text on the speaker's face.
Never invent numbers. Write captions exactly as spoken, never translated.

## Style skill
Not created yet. Once references are in `references/`, build `.claude/skills/reel-style/SKILL.md` (guide Part 1, step 7).
