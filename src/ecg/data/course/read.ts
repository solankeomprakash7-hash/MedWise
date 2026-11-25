// Module 7 · Systematic read drill. The skill: read an unnamed real 12-lead in nine steps, every time, in the same order.
// Its pool is filled in index.ts from the curated real ECGs of Modules 1–5, so doubtful labels stay out here too.
import type { Course } from './types';

export const READ: Course = {
  moduleId: 'read',
  mode: 'read',
  story: {
    setting: 'Night shift, 3 a.m.',
    text: [
      'You are handed a stack of six ECGs to sign. The third one is from a 70-year-old man admitted with a fall. You spot atrial fibrillation straight away, write "AF, rate controlled", and move on.',
      'At the morning handover the cardiology registrar picks it up: the QRS is 150 ms. It is AF with a new left bundle branch block, and nobody has asked why he fell.',
    ],
    question: 'What went wrong, and what habit prevents it?',
    answer: 'Finding the first abnormality and stopping. It is called satisfaction of search, and it catches experienced doctors as well as students. The defence is to read every ECG in the same order, all nine steps, even when the answer seems obvious at step two. This module trains that habit until it is automatic, and shows you which step you get wrong most often.',
  },
  watch: {
    intro: 'Try the systematic read in the lab first. Read the unnamed tracing in nine steps, use the calipers, and look at your step-by-step marks.',
    look: [
      'Read in the same order every time: rate, rhythm, axis, PR, QRS, QT, ST–T and extras, diagnosis, next step.',
      'Use the calipers for every interval. Guessing by eye is the commonest source of error.',
      'After each read, look at the step you got wrong, not only the diagnosis.',
    ],
  },
  rule: {
    sections: [
      { h: 'The nine steps', body: [
        '1 Rate: 300 ÷ big squares if regular; QRS count on the 10-second strip × 6 if irregular.',
        '2 Rhythm: regular or not, then where it starts (a P before every QRS? a QRS after every P?).',
        '3 Axis: leads I and aVF. Both positive: normal. I positive, aVF negative: check II (positive means normal, negative means left). I negative, aVF positive: right.',
        '4 PR: 120–200 ms. Long, short, or not fixed?',
        '5 QRS: under 120 ms. If broad, why: bundle branch block, pre-excitation, pacing or a ventricular rhythm?',
        '6 QT: correct it for rate (QTc). Long, especially over 500 ms?',
        '7 ST segments, T waves and extras: compare the ST at the J point with the PR baseline lead by lead, group changes by territory, then look for Q waves, U waves, voltage and delta waves.',
        '8 Diagnosis: put steps 1–7 together. Rhythm and conduction first, then the territory of any ST change, then chamber clues.',
        '9 Next step: what does this ECG oblige you to do in the next ten minutes?',
      ] },
      { h: 'Habits that make it stick', body: [
        'Say the read out loud, in order, as one sentence: "Sinus rhythm, 66 a minute, normal axis, PR 252, QRS 104, QTc 440, no ST–T change: first-degree AV block, routine."',
        'Look at the patient details last, so they do not steer what you see.',
        'Compare with an old ECG whenever there is one. "New" changes the next step more than any single finding.',
      ] },
    ],
    compare: {
      title: 'Traps the nine steps protect you from',
      cols: ['Trap', 'Example', 'Which step catches it'],
      rows: [
        ['Stopping at the first finding', 'AF spotted, broad QRS missed', 'Step 5: measure the QRS on every ECG'],
        ['Trusting the machine', '"Normal ECG" with a QTc of 500 ms', 'Step 6: measure the QT yourself'],
        ['Rate without rhythm', 'Rate 150 called sinus tachycardia, but it is flutter 2:1', 'Step 2: find a P before every QRS'],
      ],
    },
  },
  worked: {
    ecg: 'ptbxl-14332',
    steps: [
      { title: '1 Rate', text: 'Regular. About 4.5 big squares between R waves: 300 ÷ 4.5 ≈ 66/min.' },
      { title: '2 Rhythm', text: 'A P wave before every QRS and a QRS after every P, upright in II: sinus rhythm.' },
      { title: '3 Axis', text: 'Lead I positive, aVF positive: normal axis (the key gives +72°).' },
      { title: '4 PR', text: 'About 250 ms, over six small squares, and the same on every beat. Long.' },
      { title: '5 QRS', text: 'About 104 ms: under three small squares. Narrow.' },
      { title: '6 QT', text: 'About 420 ms. QTc = 420 ÷ √0.91 ≈ 440 ms. Normal.' },
      { title: '7 ST–T and extras', text: 'No ST elevation or depression, no T inversion beyond what is normal, no pathological Q waves.' },
      { title: '8 Diagnosis', text: 'Sinus rhythm with first-degree AV block.' },
      { title: '9 Next step', text: 'No emergency. Review AV-nodal drugs (beta-blockers, calcium-channel blockers, digoxin) and compare with an old ECG.' },
    ],
  },
  guided: [
    { ecg: 'ptbxl-2400', hint: 'Start with the rate on the rhythm strip, then check for a P wave in front of every QRS before you go any further.' },
    { ecg: 'ptbxl-12056', hint: 'At step 2, measure three R–R intervals. If they all differ and you cannot find P waves, say so in steps 2, 4 and 7.' },
  ],
  pools: { sinus: [], other: [], pre: 3, check: 6, checkOther: 0, pass: 5 },
  fields: [],
  question: '',
  answer: {},
  options: [['read', 'Full read']],
};
