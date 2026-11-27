# Reel 1 · "Read any ECG in 7 steps"

**Goal:** week 1, teaching. Builds trust and introduces the MedWise reading order. The app is mentioned once, softly, at the end.
**Length:** about 45 s · **Style:** S12 Whiteboard Diagram · **Accent:** teal #18AB97
**Example ECG:** `assets/ecg/ptbxl-441.png`, a real 12-lead, reviewed answer key: sinus 86/min, axis +65°, PR 150 ms, QRS 90 ms, QT 368 ms (QTc ≈ 441 ms), normal.

Speak naturally. This is a guide, not lines to memorise. If you fumble, pause one second and repeat the whole sentence; the edit keeps the better take.

---

## Script (Hinglish; Hindi and Marathi words in English letters)

| # | Time | You say | On screen (the engine builds it) |
|---|---|---|---|
| 1 | 0–4 s | **"ECG haath mein aaya… aur dimaag blank? Bas ye 7 steps yaad rakho."** | Title: *Never go* **blank** *on an ECG again* |
| 2 | 4–9 s | "Step one, **rate**. Regular hai toh 300 divided by big boxes between two R's. Yahan three and a half boxes, matlab around **86**." | Real ECG, R–R gap highlighted · counter → **86/min** |
| 3 | 9–14 s | "Step two, **rhythm**. Regular hai? Har QRS se pehle P wave hai? Toh **sinus**." | List: ✓ Regular ✓ P before every QRS → *Sinus* |
| 4 | 14–19 s | "Step three, **axis**. Lead I positive, aVF positive: **normal axis**. Done." | Axis graphic: lead I ↑ + aVF ↑ = normal (+65°); or the heart-vector wheel from `heart-normal.mp4` |
| 5 | 19–26 s | "Step four, **intervals**. PR three se five small boxes, QRS three se kam, aur QTc check karo." | Three chips: PR 150 ms ✓ · QRS 90 ms ✓ · QTc 441 ms ✓ |
| 6 | 26–31 s | "Step five, the most important: **ST segment aur T waves**. Elevation, depression, inversion, sab dekho." | `assets/app/heart-stemi-inferior.mp4`: the heart with the injured wall |
| 7 | 31–35 s | "Step six, **diagnosis**: sab jod do. Ye ECG? Completely **normal**." | Bigword: **NORMAL ECG** |
| 8 | 35–39 s | "Aur step seven, jo sab bhool jaate hain: **next step**. Patient ke liye ab kya karna hai?" | `assets/app/10-practice-steps-full.png`: the 9-step drill, scrolling to "What do you do next?" |
| 9 | 39–45 s | "Isi order mein main **MedWise ECG** pe real ECGs ke saath sikhata hoon. Launching soon. **Like, share and follow** if you never want to go blank while reading an ECG." | CTA card held to the end + MedWise logo |

**Optional Marathi touch:** open with *"ECG haatat aala aani dokyat kahich nahi?"* if your audience is mostly Maharashtra. The captions follow whatever you say.

---

## What to record
- Vertical, 1080p, 30 fps, eye level. Window light on your face, clip-on mic, fan off.
- Keep the upper half of the frame plain (style S12 puts graphics above your face).
- One take of the whole thing is fine. Pause, then redo any line you didn't like.
- Name the file `2026-11-xx-ecg-7-steps.mp4` and upload it to `ai-video-editor/raw/`.

## Start prompt (after uploading)
```
Edit this video. Use my video-edit skill.
Raw file: raw/2026-11-xx-ecg-7-steps.mp4
Style: S12, accent teal from brand.md
Topic: Read any ECG in 7 steps
Visuals: follow reels/scripts/reel-01-ecg-7-steps.md (assets/ecg/ptbxl-441.png, assets/app/…)
CTA: from brand.md
Show me the cut list first. Don't render anything yet.
```

## Caption for Instagram
> Har ECG, same 7 steps: rate → rhythm → axis → intervals → ST–T → diagnosis → next step. Save this for your next ward posting. 🫀
> MedWise ECG, a self-study ECG course on real 12-leads, is launching soon.
> ECG: PTB-XL (PhysioNet), CC BY 4.0. For education only.
> #ECG #ECGinterpretation #MBBS #MedicalStudents #NEETPG #Intern #Cardiology #MedWise

## Facts used (all checkable)
- Rate 300 ÷ big boxes; PR 120–200 ms (3–5 small boxes); QRS < 120 ms (< 3 small boxes); QTc normal < 450 ms (men), < 460 ms (women), per the MedWise curriculum.
- Example values come from the reviewed answer key for `ptbxl-441`. QTc = 368 ÷ √(60/86) ≈ 441 ms.
