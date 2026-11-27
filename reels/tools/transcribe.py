"""Word-timed transcript with faster-whisper.

Usage: .venv/bin/python tools/transcribe.py <video-or-audio> [--model small] [--lang en] [--prompt "names to spell"]
Writes work/<name>.words.json (every word with start/end) and work/<name>.txt
"""
import argparse, json, pathlib
from faster_whisper import WhisperModel

ap = argparse.ArgumentParser()
ap.add_argument("src")
ap.add_argument("--model", default="small")
ap.add_argument("--lang", default=None)
ap.add_argument("--prompt", default=None, help="names/brand words to spell right")
a = ap.parse_args()

model = WhisperModel(a.model, device="cpu", compute_type="int8")
segments, info = model.transcribe(a.src, language=a.lang, word_timestamps=True,
                                  initial_prompt=a.prompt, vad_filter=True)
words, lines = [], []
for s in segments:
    lines.append(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}")
    for w in s.words or []:
        words.append({"word": w.word.strip(), "start": round(w.start, 3),
                      "end": round(w.end, 3), "prob": round(w.probability, 3)})

out = pathlib.Path(__file__).resolve().parent.parent / "work"
out.mkdir(exist_ok=True)
stem = pathlib.Path(a.src).stem
(out / f"{stem}.words.json").write_text(json.dumps(
    {"language": info.language, "duration": info.duration, "words": words}, indent=1))
(out / f"{stem}.txt").write_text("\n".join(lines) + "\n")
print("\n".join(lines))
print(f"\n{len(words)} words · language {info.language} · {info.duration:.1f}s -> work/{stem}.words.json")
