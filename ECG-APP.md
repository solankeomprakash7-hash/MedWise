# MedWise ECG (self-study product)

Site layout: the MedWise landing page is the static `public/index.html` at `/`; the sepsis tool is at `/app` (`app.html`); MedWise ECG is at `/ecg` (entry `ecg.html`, code in `src/ecg/`). Built bundles go to `/_app` because `public/assets` holds the landing page's kit.

## What is in this first slice (Phase 1)

| Area | Where |
| --- | --- |
| Level 3 Emergencies and Level 4 Advanced (6 units each) with 39 model ECGs (VT, VF, torsades, STEMIs and equivalents, blocks, K⁺) | `src/ecg/data/modelEcgs.json`, `public/ecg/model/` |
| Emergency mode: 30 s per ECG, choose action and diagnosis | `pages/Emergency.tsx` |
| Exam mode: timed paper, half ECG identification, half theory, marked at the end | `pages/Exam.tsx` |
| Placement test (12 questions, 8 on real ECGs) sets the start level | `src/ecg/data/placement.ts`, `pages/Placement.tsx` |
| Learning path: all four levels written (24 units) | `src/ecg/data/curriculum.ts`, `pages/Learn.tsx`, `pages/UnitPage.tsx` |
| Interactive lab embedded in each unit | `public/ecg-lab.html?embed=1#<pattern or wave-X>` |
| Lab as 12 modules (2 Free, 5 Student, 5 Pro) with per-module progress and locked previews | `src/ecg/data/labModules.ts`, `pages/Lab.tsx`, `pages/LabModule.tsx` (`#/lab`, `#/lab/<id>`) |
| Plans, prices and the comparison table (shared by Upgrade, Lab and locked screens) | `src/ecg/data/plans.ts` |
| Real-ECG read drill (9 graded steps, calipers) | `components/Drill.tsx`, `components/EcgViewer.tsx` |
| Spaced repetition (Leitner boxes 0/1/3/7/21/45 days) and today's ECG with streak | `lib/logic.ts`, `pages/Practice.tsx` |
| Progress: Firestore `users/{uid}/ecg/progress`; guests in browser storage, merged at sign-in | `lib/progress.ts` |
| Plans: free / student / pro, gating and Razorpay checkout | `pages/Upgrade.tsx`, `netlify/functions/ecg-*.ts` |

Real ECGs: 216 records from PTB-XL and Chapman–Shaoxing (CC BY 4.0) in `public/ecg/real/`, with draft answer keys in
`src/ecg/data/realEcgs.json` (rate, PR, QRS, QT and axis from PTB-XL+ machine measurements; rhythm, findings and next step
from the dataset labels). Keys are generated as drafts; the launch set of 216 was clinically reviewed on 2026-11-20 (`draft: false`, `reviewed` date). New ECGs added later start as drafts again. Scripts: `content/ecg-library/tools/`.

## To switch things on

0. **Business details**: fill in `src/ecg/data/business.ts` (legal name, support email, phone, address). They appear on the Terms, Privacy, Refunds, Delivery and Contact pages (`#/legal/...`), which Razorpay checks before activating live payments.

1. **Firestore rules**: deploy `firestore.rules` to the project's database (`firebase deploy --only firestore:rules`, or paste
   them in the Firebase console). Without them, signed-in progress falls back to the device and the app says so.
2. **Payments** (Netlify → Site settings → Environment variables), then redeploy:
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` from the Razorpay dashboard (start with test keys)
   - `FIREBASE_SERVICE_ACCOUNT`: the Firebase service-account JSON on one line

   Until these are set, the Upgrade buttons explain that payments are not switched on yet.
3. **Authorised domain**: add the Netlify domain under Firebase Authentication → Settings → Authorised domains (needed for Google sign-in).

## Lab modules

Each module opens `ecg-lab.html?embed=1&module=<id>&tabs=<modes>&only=<pattern ids>&cases=<indexes>`: the lab shows only that
module's patterns and modes, and posts `{src:'medwise-lab', ev:'view'|'quiz'|'case'|'read'}` to the parent (same origin only).
`LabModule.tsx` turns these into `progress.lab[<module>]` (stations seen, quiz right/total, good reads, completion date) and can
send `{src:'medwise-app', cmd:'pattern'|'wave'|'case'|'mode'}` back to jump to a station. Completion rules are in `moduleStatus`.
Gating is in the browser, like the rest of the plan limits; the stand-alone `/ecg-lab.html` stays fully open.

## Plan limits (set in `lib/logic.ts`)

- Free: lab modules 1–2, first 3 units of Level 1, 5 real-ECG reads a week, daily ECG, placement test, a 3-ECG emergency sample and a 5-question exam sample.
- Student: lab modules 1–7, Levels 1–2, unlimited reads, full 20-question exam papers.
- Pro: everything, including all 12 lab modules (with the 18 lab cases), Level 3 and full 10-ECG emergency rounds.

Model ECGs are drawn by the lab's heart model (`content/ecg-library` has no script for them; they are rendered from `public/ecg-lab.html` with `ECG.build`) and are labelled as teaching models in the app.

## Install and offline

`public/ecg-manifest.webmanifest` and `public/ecg-sw.js` make the app installable on phones (Add to Home Screen, or the Install button on Home) and keep the app, lab and every ECG already viewed available offline. Bump the cache name in `ecg-sw.js` if its caching rules change.
