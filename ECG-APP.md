# MedWise ECG (self-study product)

The ECG product lives at `/ecg` (entry `ecg.html`, code in `src/ecg/`). The sepsis tool at `/` is unchanged.

## What is in this first slice (Phase 1)

| Area | Where |
| --- | --- |
| Placement test (12 questions, 8 on real ECGs) sets the start level | `src/ecg/data/placement.ts`, `pages/Placement.tsx` |
| Learning path: Levels 1–2 written (12 units), Levels 3–4 listed | `src/ecg/data/curriculum.ts`, `pages/Learn.tsx`, `pages/UnitPage.tsx` |
| Interactive lab embedded in each unit | `public/ecg-lab.html?embed=1#<pattern or wave-X>` |
| Real-ECG read drill (9 graded steps, calipers) | `components/Drill.tsx`, `components/EcgViewer.tsx` |
| Spaced repetition (Leitner boxes 0/1/3/7/21/45 days) and today's ECG with streak | `lib/logic.ts`, `pages/Practice.tsx` |
| Progress: Firestore `users/{uid}/ecg/progress`; guests in browser storage, merged at sign-in | `lib/progress.ts` |
| Plans: free / student / pro, gating and Razorpay checkout | `pages/Upgrade.tsx`, `netlify/functions/ecg-*.ts` |

Real ECGs: 216 records from PTB-XL and Chapman–Shaoxing (CC BY 4.0) in `public/ecg/real/`, with draft answer keys in
`src/ecg/data/realEcgs.json` (rate, PR, QRS, QT and axis from PTB-XL+ machine measurements; rhythm, findings and next step
from the dataset labels). Every key is marked `draft: true` until a doctor checks it. Scripts: `content/ecg-library/tools/`.

## To switch things on

1. **Firestore rules**: deploy `firestore.rules` to the project's database (`firebase deploy --only firestore:rules`, or paste
   them in the Firebase console). Without them, signed-in progress falls back to the device and the app says so.
2. **Payments** (Netlify → Site settings → Environment variables), then redeploy:
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` from the Razorpay dashboard (start with test keys)
   - `FIREBASE_SERVICE_ACCOUNT`: the Firebase service-account JSON on one line

   Until these are set, the Upgrade buttons explain that payments are not switched on yet.
3. **Authorised domain**: add the Netlify domain under Firebase Authentication → Settings → Authorised domains (needed for Google sign-in).

## Free plan limits

First 3 units of Level 1, 5 real-ECG reads a week, unlimited daily ECG and placement test. Set in `lib/logic.ts`.
