"""Writes ai-video-editor/work/reel.json for the Axis Reel (cut timeline)."""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2] / "ai-video-editor"
words = json.loads((ROOT / "work/words-cut.json").read_text())
INK, ACC, RED = "#1A1C49", "var(--accent)", "#E5322D"

def qrs(up, color, label, sub=""):
    d = ("M0 100 L52 100 L60 112 L76 18 L92 132 L102 100 L160 100" if up else
         "M0 100 L52 100 L60 88 L76 182 L92 68 L102 100 L160 100")
    return (f'<div style="display:flex;flex-direction:column;align-items:center;gap:8px">'
            f'<svg viewBox="0 0 160 200" width="230" height="270"><line x1="0" y1="100" x2="160" y2="100" stroke="#C9CCD6" stroke-width="3" stroke-dasharray="6 6"/>'
            f'<path d="{d}" fill="none" stroke="{color}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/></svg>'
            f'<div style="font:800 54px Inter;color:{INK}">{label}</div>'
            f'<div style="font:600 34px Inter;color:{color}">{sub}</div></div>')

def board(inner, footer=""):
    f = f'<div style="margin-top:26px;font:900 66px Inter;color:{INK};letter-spacing:-1px">{footer}</div>' if footer else ""
    return (f'<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff">'
            f'<div style="display:flex;gap:70px;align-items:flex-end">{inner}</div>{f}</div>')

def fact(big, small):
    return (f'<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;background:#fff;text-align:center;padding:0 60px;box-sizing:border-box">'
            f'<div style="font:900 130px Inter;color:{INK};letter-spacing:-3px;line-height:1">{big}</div>'
            f'<div style="font:600 48px Inter;color:#18AB97;line-height:1.25">{small}</div></div>')

camera = (f'<div style="width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;gap:34px;padding:0 50px;box-sizing:border-box;background:#fff">'
  + "".join(f'<div style="display:flex;align-items:center;gap:30px"><div style="font:800 46px Inter;color:{INK};width:430px">{t}<div style="font:600 32px Inter;color:#6B6F80">{s}</div></div>'
            f'<svg viewBox="0 0 160 200" width="170" height="200"><line x1="0" y1="100" x2="160" y2="100" stroke="#C9CCD6" stroke-width="3" stroke-dasharray="6 6"/>'
            f'<path d="{d}" fill="none" stroke="{c}" stroke-width="9" stroke-linejoin="round"/></svg></div>'
            for t, s, d, c in [("📷 Current coming <b style=\'color:#18AB97\'>towards</b>", "the lead", "M0 100 L52 100 L60 112 L76 18 L92 132 L102 100 L160 100", "#18AB97"),
                               ("📷 Current going <b style=\'color:#E5322D\'>away</b>", "from the lead", "M0 100 L52 100 L60 88 L76 182 L92 68 L102 100 L160 100", "#E5322D")])
  + '</div>')

beats = [
 {"start": 0, "end": 5.8, "type": "title", "line1": "How to approach an ECG:", "line2": "The <b>Axis</b>", "at2": 0.4, "note": "hook + series"},
 {"start": 5.85, "end": 7.4, "type": "title", "line1": "Just ask:", "line2": "Where is the <b>current</b> going?", "at2": 5.95, "note": "the one question"},
 {"start": 7.5, "end": 12.9, "type": "image", "w": 940, "h": 600, "html": fact("Axis", "the direction the current spreads<br>through the ventricles"), "note": "definition"},
 {"start": 15.3, "end": 22.6, "type": "image", "w": 940, "h": 640, "html": camera, "note": "leads are cameras"},
 {"start": 23.4, "end": 31.6, "type": "image", "src": "assets/app/heart-crop.png", "w": 900, "h": 690, "fit": "cover", "note": "LV bigger: left and down"},
 {"start": 32.1, "end": 42.6, "type": "image", "src": "assets/app/wheel-crop.png", "w": 640, "h": 680, "fit": "contain", "note": "Lead I from the left, aVF from below"},
 {"start": 42.9, "end": 50.0, "type": "image", "w": 940, "h": 660, "html": board(qrs(True, "#18AB97", "Lead I", "upright") + qrs(True, "#18AB97", "aVF", "upright"), "✓ Normal axis"), "note": "normal"},
 {"start": 50.2, "end": 62.7, "type": "image", "w": 940, "h": 660, "html": board(qrs(True, "#18AB97", "Lead I", "upright") + qrs(False, RED, "aVF", "negative"), "Leaving = <span style='color:#18AB97'>LEFT</span>"), "note": "I up, aVF down: leaving"},
 {"start": 67.0, "end": 80.9, "type": "checklist", "title": "Check Lead II once", "items": [{"text": "Lead II upright → still normal", "at": 69.2}, {"text": "Lead II negative → left axis deviation", "at": 75.4}], "marker": "tick", "note": "lead II settles it"},
 {"start": 81.3, "end": 85.6, "type": "image", "w": 940, "h": 560, "html": fact("LAFB", "left anterior fascicular block"), "note": "common cause"},
 {"start": 85.9, "end": 99.9, "type": "image", "w": 940, "h": 660, "html": board(qrs(False, RED, "Lead I", "negative") + qrs(True, "#18AB97", "aVF", "upright"), "Reaching = <span style='color:#18AB97'>RIGHT</span>"), "note": "I down, aVF up: reaching"},
 {"start": 100.8, "end": 106.9, "type": "image", "w": 940, "h": 560, "html": fact("RV strain", "e.g. pulmonary embolism"), "note": "RAD cause"},
 {"start": 107.0, "end": 109.9, "type": "bigword", "text": "Both negative?", "full": True, "hideCaptions": False, "note": "section: extreme axis"},
 {"start": 110.3, "end": 114.6, "type": "image", "w": 940, "h": 660, "html": board(qrs(False, RED, "Lead I", "negative") + qrs(False, RED, "aVF", "negative"), "Up and to the right"), "note": "extreme axis"},
 {"start": 116.6, "end": 121.6, "type": "flow", "steps": [{"text": "Think VT", "at": 116.8}, {"text": "Or check the leads", "at": 119.2}], "note": "extreme causes"},
 {"start": 122.2, "end": 129.0, "type": "checklist", "title": "No table needed", "items": [{"text": "Leaving = Left", "at": 124.9}, {"text": "Reaching = Right", "at": 126.0}, {"text": "Lead II settles the doubt", "at": 127.5}], "marker": "tick", "note": "recap"},
 {"start": 129.1, "end": 133.65, "type": "cta", "text": "Like · Share · Follow", "sub": "Never go blank on an ECG again · MedWise ECG, launching soon", "pressAt": 130.0, "note": "CTA"},
]
reel = {
 "video": "work/2026-11-27-axis-aligned.mp4", "name": "2026-11-27-axis", "style": "S12",
 "brand": {"accent": "#18AB97", "accent-ink": "#1A1C49"}, "faceY": 0.55,
 "captions": {"words": [{"w": w["w"], "s": w["s"], "e": w["e"]} for w in words],
              "accent": ["current", "leaving.", "left.", "reaching", "right.", "II", "normal", "negative,", "upright,"]},
 "zooms": [{"start": 5.9, "end": 7.3, "scale": 1.08}, {"start": 61.6, "end": 62.7, "scale": 1.1}, {"start": 94.6, "end": 95.8, "scale": 1.1}, {"start": 130.3, "end": 132.6, "scale": 1.08}],
 "sfxDensity": "calm",
 "beats": beats,
}
(ROOT / "work/reel.json").write_text(json.dumps(reel, indent=1, ensure_ascii=False))
print("beats", len(beats))
