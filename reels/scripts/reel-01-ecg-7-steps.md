# Reel 1: Read any ECG in 7 steps

Week 1, teaching. It introduces the order MedWise teaches and mentions the app once, at the end.
55 to 60 s spoken (about 165 words) · Style S12 Whiteboard Diagram · Accent teal #18AB97
Example ECG: `assets/ecg/ptbxl-441.png`, a real 12-lead with a reviewed answer key: sinus 86/min, axis +65°, PR 150 ms, QRS 90 ms, QT 368 ms (QTc about 441 ms), normal.
Teleprompter-only version (no tables, ready to paste into an app): `reel-01-teleprompter.txt`

## How to deliver it

- Talk the way you would to one intern standing next to you on rounds. You're explaining, so drop the presenter voice.
- The hook is the only part to say slightly faster. Everything after it is calm and sure.
- A `/` is a short breath. `[pause]` is a full second of silence, which the edit will tighten.
- Hold up fingers for each step number. It gives the editor a natural cut point and viewers a sense of progress.
- If you trip on a line, stop, wait one second and say the whole line again. The cut list keeps the better take.

## Script

| # | Time | Say | Delivery | On screen |
|---|---|---|---|---|
| Hook | 0–5 s | 3 a.m. in casualty. / Someone hands you an ECG: / "Doctor, just check this once." [pause] And your mind goes blank. | Lean in a little. Say "blank" quietly, almost a confession. | Title: *3 a.m.* Your mind goes **blank** |
| Bridge | 5–7 s | Here's the order I follow / every time. | Sit back, relaxed. This is the promise. | Caption only |
| 1 | 7–13 s | One. Rate. / 300, divided by the big boxes between two R waves. / Three and a half boxes here, / so about 86. | Show 1 finger. Slow down on the numbers. | Real ECG, R–R gap boxed in teal · counter → 86/min |
| 2 | 13–18 s | Two. Rhythm. / Regular, with a P wave before every QRS? / That's sinus. | Small nod on "That's sinus." | Two ticks appear: Regular ✓ P before QRS ✓ → Sinus |
| 3 | 18–22 s | Three. Axis. / Lead I up, aVF up. / Normal. Move on. | "Move on" with a small hand flick. Viewers like hearing they can skip the overthinking. | Lead I ↑ + aVF ↑ = Normal axis, or the vector wheel from `heart-normal.mp4` |
| 4 | 22–29 s | Four. Intervals. / PR, three to five small boxes. / QRS, under three. / Then correct the QT for rate. / This one's 441. Fine. | Count on your fingers for PR and QRS. | Chips appear one by one: PR 150 ms ✓ · QRS 90 ms ✓ · QTc 441 ms ✓ |
| 5 | 29–35 s | Five. ST segments and T waves. / Go lead by lead. [pause] This is where MIs get missed. | The most serious line in the Reel. Look straight into the lens and slow right down. | `heart-stemi-inferior.mp4`: the heart with the inferior wall injured |
| 6 | 35–38 s | Six. Name it. / This one? / A normal ECG. | Light, almost a smile. Release after step 5. | Bigword: NORMAL ECG |
| 7 | 38–44 s | Seven. The one everyone skips. / What do you do next? / Because that's the first thing your senior will ask. | Point at the camera on "you". | `10-practice-steps-full.png` scrolling down to "What do you do next?" |
| App | 44–49 s | I've built MedWise ECG around this exact order, / on real ECGs. / It's launching soon. | Plain and proud. No sales voice. | MedWise logo + "Launching soon" |
| CTA | 49–55 s | Like this, / share it with your batch, / and follow / if you never want to go blank on an ECG again. | Warm. "Go blank" calls back to the hook. | CTA card held to the last frame |

## Two other hooks to test later

Keep the rest of the script the same and swap only the first 7 seconds. After two or three Reels you'll see which kind of opening holds your audience.

- **Viva:** "Your examiner slides an ECG across the table and says, 'Go on, read it.' [pause] Where do you even start? Here."
- **Mistake:** "Most interns read an ECG by staring at it and hoping something jumps out. Here's the order that actually works."

## What to record

- Vertical, 1080p, 30 fps, camera at eye level.
- Window light on your face, clip-on mic, fan off.
- Keep the top half of the frame plain. S12 puts the graphics above your head.
- One continuous take is fine.
- Upload it to `ai-video-editor/raw/` as `2026-11-xx-ecg-7-steps.mp4`.

## Start prompt (paste after uploading)

```
Edit this video. Use my video-edit skill.
Raw file: raw/2026-11-xx-ecg-7-steps.mp4
Style: S12, accent teal from brand.md
Topic: Read any ECG in 7 steps
Visuals: follow reels/scripts/reel-01-ecg-7-steps.md (assets/ecg/ptbxl-441.png, assets/app/…)
CTA: from brand.md
Show me the cut list first. Don't render anything yet.
```

## Instagram caption

> The order I read every ECG in: rate, rhythm, axis, intervals, ST and T waves, diagnosis, and then what you'll actually do for the patient.
> Save it for your next casualty posting.
>
> MedWise ECG, a self-study course built on real 12-leads, is launching soon. Follow so you don't miss it.
>
> ECG: PTB-XL (PhysioNet), CC BY 4.0. For education only.
> #ECG #ECGinterpretation #MBBS #MedicalStudents #NEETPG #Intern #Cardiology #MedWise

## Facts used

- Rate = 300 ÷ big boxes between R waves (regular rhythm). PR 120–200 ms (3–5 small boxes). QRS under 120 ms (under 3 small boxes). QTc normal under 450 ms in men and 460 ms in women, as in the MedWise curriculum.
- Example values come from the reviewed answer key for `ptbxl-441`. 300 ÷ 86 is 3.5 big boxes. QTc = 368 ÷ √(60/86), about 441 ms.
