# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

MedWise has two products, each with its own primary user:

- **MedWise ECG course (/ecg):** medical students, interns and residents of any specialty, mainly in India, who want to learn to read an ECG from the basics on their own. They study in short sessions between duties and before exams, and they pay for it themselves.
- **MedWise decision support (/app):** practising ward and ICU doctors. They check a patient's findings against current guidelines at the bedside or on rounds, and need an answer they can act on and defend.

## Product Purpose

MedWise helps doctors make and learn clinical decisions that follow the evidence.

- The ECG course takes a learner from "what is a P wave" to reading emergency and advanced ECGs, through a placement test, four levels of short units, practice on real 12-lead ECGs, spaced review, a timed emergency mode and an exam mode. Success: the learner can read an unseen ECG in order (rate, rhythm, axis, intervals, ST–T, diagnosis, next step) and act on it correctly.
- Decision support turns a patient's findings into a guideline-based suggestion and shows the rule behind it. Live today: antibiotic plans for sepsis (empiric cover by source and MDR risk, then a day-3 review from the cultures). In development: hypertension, diabetes, pre-operative evaluation. Success: the doctor reaches the guideline-correct plan faster and can see why.

## Positioning

Every suggestion names the guideline it follows and shows the rule behind it; MedWise does not ask to be trusted blindly. The ECG course teaches on real, openly licensed 12-lead ECGs, graded step by step, paired with an animated heart model that shows why each wave looks the way it does.

## Operating Context

- ECG course: self-study, usually on a phone, in 10 to 15 minute units; exam preparation (university and PG entrance); a daily ECG and spaced review bring learners back. Installable as a web app (PWA) with offline use after the first visit.
- Decision support: used on rounds and in the ICU, per patient and per bed, revisited at review days (for example day 3 of antibiotics).
- One shared landing page at / introduces both products under the MedWise name.

## Capabilities and Constraints

- Stack: React 19 + Vite multi-page build (landing at /, decision support at /app, ECG course at /ecg), Tailwind v4, Firebase Auth and Firestore, Netlify hosting and functions.
- ECG course plans: Free (Level 1 starter units, 5 practice reads a week, sample emergency and exam rounds), Student and Pro, paid through Razorpay in INR; Pro unlocks Levels 3 and 4 and full emergency rounds.
- Progress syncs to the learner's account when signed in and is kept locally otherwise.
- The ECG answer keys were reviewed by the founder (a doctor) before launch.
- Certificates are deliberately out of scope for now.
- Open: support email, phone and registered address for the policy pages are not yet filled in.

## Brand Commitments

- Name: MedWise; the course is "MedWise ECG". Legal entity: MedWise Private Limited.
- Existing logo files in `public/brand/` (logo mark and wordmark).
- Voice: plain, clinical and exact; it names the guideline and gives the number, without hype.

## Evidence on Hand

- 216 real 12-lead ECGs from openly licensed datasets (PTB-XL, PTB-XL+, Chapman–Shaoxing, LUDB, MIMIC-IV-ECG), with attribution, in `public/ecg/real/`; 39 teaching-model ECGs from the in-house heart model in `public/ecg/model/`.
- Curriculum: 24 units across four levels and a 12-question placement test (`src/ecg/data/`).
- Guidelines named in the product: Surviving Sepsis Campaign, IDSA, 2017 ACC/AHA blood pressure categories, ADA Standards of Care, Revised Cardiac Risk Index.
- Absent, and not to be invented: testimonials, user or learner counts, institutional endorsements, outcome statistics, press.

## Product Principles

1. Cite the guideline. Every clinical suggestion or teaching claim names its source; nothing unsourced ships.
2. No fake proof. No invented testimonials, user counts, endorsements or results until real ones exist.
3. Show the reasoning. The rule behind a suggestion, or the step behind a diagnosis, is always one look away.
4. Real material first. Teach and demonstrate on real ECGs and real clinical scenarios; label models as models.
5. Built for the doctor's day. Short sessions for learners, fast answers for clinicians.
