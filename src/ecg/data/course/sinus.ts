// Module 2 · Sinus rhythm and rate: the pilot of the full module format.
// Story → Watch → Learn the rule → Worked example → Guided practice → Checkpoint → Review.
// Every real-ECG answer comes from the clinically reviewed key in realEcgs.json.
import type { Course } from './types';

// Real ECGs used here. Left out on purpose (labels need a second look before teaching with them):
//   ptbxl-2238, ptbxl-16534, ptbxl-14062: labelled normal, but 53–55/min, which is sinus bradycardia by the < 60 rule
//   ptbxl-2522: labelled sinus arrhythmia, but its key says regular
const NORMAL = ['ptbxl-10492', 'ptbxl-1476', 'ptbxl-4439', 'ptbxl-6855', 'ptbxl-1899', 'ptbxl-3734', 'ptbxl-8042', 'ptbxl-18860', 'ptbxl-3760', 'ptbxl-5799'];
const BRADY = ['ptbxl-2400', 'ptbxl-8201', 'ptbxl-4808', 'ptbxl-11331', 'ptbxl-6165', 'chapman-JS25322', 'chapman-JS00033', 'chapman-JS00010'];
const TACHY = ['ptbxl-18888', 'ptbxl-8594', 'ptbxl-8099', 'ptbxl-12720', 'ptbxl-12182'];
const ARRH = ['ptbxl-14263', 'ptbxl-4719'];

export const SINUS: Course = {
  moduleId: 'sinus',
  story: {
    setting: 'Surgical ward, 2 a.m.',
    text: [
      'A 24-year-old man is six hours out of an appendicectomy. The monitor alarms at 118/min. The nurse calls you: "Doctor, is this SVT? Should I get adenosine?"',
      'He is pale, sweaty and in pain. His blood pressure is 104/66 and his urine output has been low since theatre.',
    ],
    question: 'Before anyone reaches for adenosine, what is the one thing you check on his ECG?',
    answer: 'Whether there is a P wave before every QRS, upright in lead II. If there is, this is sinus tachycardia: his heart is answering pain and a low circulating volume. Adenosine will not help; analgesia and fluids will. This module teaches you to make that call in under a minute.',
  },
  watch: {
    intro: 'Watch the sinus node set the pace. Open each of the three stations, slow the beat to 0.2×, and use the rate slider on Normal sinus rhythm.',
    look: [
      'The SA node (top left of the heart) fires first, and every P wave follows it.',
      'The P wave is upright in lead II and inverted in aVR. Tap those leads to follow them on the monitor.',
      'Drag the rate slider: the gap between beats changes, but the P–QRS–T sequence does not.',
      'At fast rates the T wave of one beat creeps toward the P of the next. That is why fast sinus rhythm can hide its P waves.',
    ],
  },
  rule: {
    sections: [
      { h: 'Four checks for sinus rhythm', body: [
        'A P wave before every QRS.',
        'A QRS after every P wave.',
        'P waves upright in I and II, and inverted in aVR: the impulse is starting high in the right atrium and travelling down and to the left.',
        'The same P shape and a constant PR interval (120–200 ms) from beat to beat.',
      ] },
      { h: 'Then name it by rate', body: [
        'Under 60/min: sinus bradycardia. 60–100/min: normal sinus rhythm. Over 100/min: sinus tachycardia.',
        'If the four checks pass but the R–R interval varies with breathing, it is sinus arrhythmia, usually a normal finding in young people.',
      ] },
      { h: 'Three ways to measure the rate', body: [
        'Regular rhythm: 300 ÷ the number of big squares between two R waves (1 big square = 200 ms at 25 mm/s). Three big squares = 100/min, four = 75/min, five = 60/min.',
        'Regular, more precise: 1500 ÷ the number of small squares between two R waves (1 small square = 40 ms).',
        'Irregular rhythm: count the QRS complexes on the 10-second rhythm strip and multiply by 6.',
      ] },
      { h: 'Rate is a clue, not a diagnosis', body: [
        'Sinus bradycardia: athletes and sleep (normal); beta-blockers, calcium-channel blockers, digoxin; hypothyroidism, hypothermia, raised intracranial pressure, inferior MI, sick sinus syndrome.',
        'Sinus tachycardia: pain, fever, anxiety, hypovolaemia, sepsis, anaemia, hypoxia, pulmonary embolism, thyrotoxicosis, drugs. Treat the cause, not the rate.',
      ] },
    ],
    compare: {
      title: 'Look-alikes to tell apart',
      cols: ['You see', 'Sinus', 'Look-alike'],
      rows: [
        ['Slow and regular', 'Sinus bradycardia: P before every QRS, PR 120–200 ms', 'Junctional rhythm: 40–60/min, P absent or inverted in II, PR under 120 ms'],
        ['Fast and regular', 'Sinus tachycardia: gradual onset, visible P waves, rate rarely above 220 minus age', 'SVT: sudden onset, often 150–250/min, no clear P waves. Flutter 2:1: about 150/min with saw-tooth waves in II, III, aVF'],
        ['Irregular', 'Sinus arrhythmia: the same P before every QRS, rate changes with breathing', 'Atrial fibrillation: no P waves, a wavy baseline, irregularly irregular'],
      ],
    },
  },
  worked: {
    ecg: 'ptbxl-441',
    steps: [
      { title: 'Go to the rhythm strip', text: 'Use the long lead II strip at the bottom. It shows 10 seconds, so it is the best place to judge rhythm and rate.' },
      { title: 'Is it regular?', text: 'Turn on the calipers and measure two or three R–R intervals. They match to within a small square, so the rhythm is regular.' },
      { title: 'Measure the rate', text: 'The R–R interval is about 700 ms, roughly 3.5 big squares. 300 ÷ 3.5 ≈ 86/min. Cross-check on the strip: about 14 QRS complexes in 10 seconds × 6 ≈ 84/min.' },
      { title: 'Find the P waves', text: 'Every QRS has a P wave in front of it, upright in II, and every P wave is followed by a QRS. In aVR the P is inverted.' },
      { title: 'Measure the PR interval', text: 'From the start of P to the start of QRS: about 150 ms (just under 4 small squares), the same on every beat.' },
      { title: 'Say the answer', text: 'Sinus rhythm, rate 86/min, regular, PR 150 ms. Normal sinus rhythm. Say it in that order every time and you will never skip a step.' },
    ],
  },
  guided: [
    { ecg: 'ptbxl-2339', hint: 'Measure one R–R interval in lead II. How many big squares? Then use 300 ÷ squares.' },
    { ecg: 'ptbxl-12134', hint: 'At fast rates the P wave can sit on the end of the previous T wave. Look just before each QRS in II.' },
    { ecg: 'ptbxl-149', hint: 'The R–R intervals vary. Use the count-and-multiply method, then check whether every QRS still has the same P in front.' },
  ],
  pools: { sinus: [...NORMAL, ...BRADY, ...TACHY, ...ARRH], other: ['af', 'flutter', 'svt', 'junctional'], pre: 4, check: 10, checkOther: 3, pass: 8 },
  options: [['normal', 'Normal sinus rhythm'], ['sinus_brady', 'Sinus bradycardia'], ['sinus_tachy', 'Sinus tachycardia'], ['sinus_arrh', 'Sinus arrhythmia'], ['not_sinus', 'Not sinus rhythm']],
};
