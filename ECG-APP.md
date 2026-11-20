# MedWise ECG (self-study product)

The ECG product lives at `/ecg` (entry `ecg.html`, code in `src/ecg/`). The sepsis tool at `/` is unchanged.

## What is in this first slice (Phase 1)

| Area | Where |
| --- | --- |
| Level 3 Emergencies and Level 4 Advanced (6 units each) with 39 model ECGs (VT, VF, torsades, STEMIs and equivalents, blocks, K⁺) | `src/ecg/data/modelEcgs.json`, `public/ecg/model/` |
| Emergency mode: 30 s per ECG, choose action and diagnosis | `pages/Emergency.tsx` |
| Exam mode: timed paper, half ECG identification, half theory, marked at the end | `pages/Exam.tsx` |
| Placement test (12 questions, 8 on real ECGs) sets the start level | `src/ecg/data/placement.ts`, `pages/Placement.tsx` |
| Learning path: all four levels written (24 units) | `src/ecg/data/curriculum.ts`, `pages/Learn.tsx`, `pages/UnitPage.tsx` |
| Interactive lab embedded in each unit | `public/ecg-lab.html?embed=1#<pattern or wave-X>` |
| Real-ECG read drill (9 graded steps, calipers) | `components/Drill.tsx`, `components/EcgViewer.tsx` |
| Spaced repetition (Leitner boxes 0/1/3/7/21/45 days) and today's ECG with streak | `lib/logic.ts`, `pages/Practice.tsx` |
| Progress: Firestore `users/{uid}/ecg/progress`; guests in browser storage, merged at sign-in | `lib/progress.ts` |
| Plans: free / student / pro, gating and Razorpay checkout | `pages/Upgrade.tsx`, `netlify/functions/ecg-*.ts` |

Real ECGs: 216 records from PTB-XL and Chapman–Shaoxing (CC BY 4.0) in `public/ecg/real/`, with draft answer keys in
`src/ecg/data/realEcgs.json` (rate, PR, QRS, QT and axis from PTB-XL+ machine measurements; rhythm, findings and next step
from the dataset labels). Keys are generated as drafts; the launch set of 216 was clinically reviewed on 2026-11-20 (`draft: false`, `reviewed` date). New ECGs added later start as drafts again. Scripts: `content/ecg-library/tools/`.

## To switch things on

1. **Firestore rules**: deploy `firestore.rules` to the project's database (`firebase deploy --only firestore:rules`, or paste
   them in the Firebase console). Without them, signed-in progress falls back to the device and the app says so.
2. **Payments** (Netlify → Site settings → Environment variables), then redeploy:
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` from the Razorpay dashboard (start with test keys)
   - `FIREBASE_SERVICE_ACCOUNT`: the Firebase service-account JSON on one line

   Until these are set, the Upgrade buttons explain that payments are not switched on yet.
3. **Authorised domain**: add the Netlify domain under Firebase Authentication → Settings → Authorised domains (needed for Google sign-in).

## Plan limits (set in `lib/logic.ts`)

- Free: first 3 units of Level 1, 5 real-ECG reads a week, daily ECG, placement test, a 3-ECG emergency sample and a 5-question exam sample.
- Student: Levels 1–2, unlimited reads, full 20-question exam papers.
- Pro: everything, including Level 3 and full 10-ECG emergency rounds.

Model ECGs are drawn by the lab's heart model (`content/ecg-library` has no script for them; they are rendered from `public/ecg-lab.html` with `ECG.build`) and are labelled as teaching models in the app.
