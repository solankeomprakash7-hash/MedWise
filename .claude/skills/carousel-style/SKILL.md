---
name: carousel-style
description: MedWise (@medwisee) house style for animated Instagram carousels — colours, type, layout, motion rules and the HTML-to-MP4 render pipeline. Use whenever building or editing a MedWise carousel, so every post matches.
---

# MedWise carousel style

Reference build: `content/carousel-amr/slides.html` (the "Koi Aur Dawai?" AMR carousel). Start new carousels by copying it.

## Look
- Every slide 1080 × 1350 (4:5). Text stays at least 110 px inside the left/right edges and 120 px from the top; footer sits 70 px from the bottom.
- Background: ward-navy radial gradient (`#262a55` → `#1a1c49` → `#11122f`) with a faint 54 px grid and a soft vignette.
- Text: white `#ffffff`; secondary text mist `#c9cce3`; labels and sources muted `#8e92b8`.
- **One accent colour, chart-gold `#e2a946`, on one word per headline.** Nothing else in a headline is coloured.
- Data colours live only inside visuals: red `#d9442f` = resistance/harm, teal `#18ab97` = the monitor trace and "still works".
- Paper cards (`#fbfaf6`, navy ink) for documents: reports, tokens, prescriptions. Handwriting only on prescriptions (Homemade Apple), always tagged RECREATION.
- Fonts: Chivo 900 for headlines (100–156 px, tracking −0.035em), Chivo 400/700 for body (≥ 40 px), Chivo Mono for kickers, sources and footer (≥ 26 px). Font files are in `content/carousel-amr/fonts/`.
- Footer on every slide: `@medwisee` bottom-left, `n/N` bottom-right.

## Copy
- 8–10 slides, one idea per slide, headline under 8 words, ≤ 25 words under it.
- Slide 1 is the hook. Slide 2 must stand alone as a second cover. Second-to-last is the screenshot-able recap. The last slide asks for one comment keyword.
- Never invent numbers; every statistic carries its source line on the slide. Illustrative people are tagged "Illustrative story".

## Motion
- Every slide moves, and the motion acts out that slide's point (stamps re-slam, a timer counts down, a bar falls).
- **Frame 0 is finished**: headline and hero are on screen from the first frame (it is the grid thumbnail).
- Every animation loops on 7 s (or a divisor: 3.5, 1.75, 0.875 s) and ends exactly where it started.

## Render
```bash
NODE_PATH=$(npm root -g) node .claude/skills/carousel-style/scripts/capture.js <slides.html> <outdir> <framesdir> 1,2,...,9 30 7
```
It steps every CSS animation in headless Chromium for one loop (from t=7 s, when all animations are running), writes `<outdir>/01.mp4 …` at 1080×1350, 30 fps with a silent audio track (Instagram accepts it from desktop), and `01.png …` first-frame stills. Pass `yes` as the 7th argument for stills only. Then build a contact sheet of the PNGs and look at every slide before sending.
