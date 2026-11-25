// Module 1 · Waves and intervals. The skill: measure PR, QRS and QT on a real ECG and say which one is abnormal.
import type { Course } from './types';

// Real ECGs used here, chosen so that one finding is clearly the main one on each (a broad QRS also lengthens the QT; see the rule). Left out on purpose:
//   ptbxl-3734 (normal, but PR 112 ms is short), ptbxl-3760 (normal, but PR 202 ms), ptbxl-13906 (first-degree block, no PR in key),
//   ptbxl-11614, ptbxl-1123, ptbxl-1156 (bundle branch block with PR over 200 ms too),
//   ptbxl-320 (long QT with PR 210 ms too), ptbxl-260 (labelled long QT, but QTc ≈ 469 ms by Bazett).
const NORMAL = ['ptbxl-10492', 'ptbxl-1476', 'ptbxl-4439', 'ptbxl-1899', 'ptbxl-8042', 'ptbxl-18860', 'ptbxl-5799', 'ptbxl-441'];
const LONG_PR = ['ptbxl-4780', 'ptbxl-14332', 'ptbxl-9108'];
const WIDE = ['ptbxl-4051', 'ptbxl-9324', 'ptbxl-10359', 'ptbxl-2034', 'ptbxl-11474', 'ptbxl-8868', 'ptbxl-4415', 'ptbxl-14181'];
const LONG_QT = ['ptbxl-13838', 'ptbxl-9894'];

export const WAVES: Course = {
  moduleId: 'waves',
  story: {
    setting: 'Medicine ward, evening round',
    text: [
      'A 68-year-old woman with pneumonia was started on azithromycin this morning. She is vomiting, so ondansetron has been written up as well. Her potassium is 3.2.',
      'The nurse hands you her ECG: "The machine says normal. Can I give the next doses?"',
    ],
    question: 'What do you measure before you sign, and why might the machine be wrong?',
    answer: 'The QT, corrected for heart rate (QTc). Azithromycin, ondansetron and a low potassium all lengthen it, and a long QTc can tip into torsades de pointes. Machines often misplace the end of the T wave, especially when a U wave follows it, so measure it yourself in lead II or V5. This module teaches you to measure PR, QRS and QT on real ECGs in a minute.',
  },
  watch: {
    intro: 'Watch one beat being written, letter by letter. Start with "A beat, letter by letter", then open each wave. Slow it down and use the step buttons.',
    look: [
      'P: the atria depolarise. It is small because the atria are thin.',
      'The flat PR segment: the impulse is crossing the AV node, but too little tissue is involved to draw anything.',
      'QRS: the ventricles depolarise through the fast Purkinje network, which is why it is narrow.',
      'ST and T: the plateau, then repolarisation. Watch how the T points the same way as the QRS.',
    ],
  },
  rule: {
    sections: [
      { h: 'The grid', body: [
        'At 25 mm/s, one small square is 40 ms and one big square (five small) is 200 ms.',
        'At 10 mm/mV, one small square is 0.1 mV in height. Check the calibration pulse first: it should be two big squares tall.',
      ] },
      { h: 'Normal limits to know by heart', body: [
        'P wave: under 120 ms wide and under 2.5 mm tall in lead II.',
        'PR interval: from the start of P to the start of QRS, 120–200 ms (3–5 small squares). Over 200 ms is first-degree AV block.',
        'QRS: under 120 ms (3 small squares). 120 ms or more is broad: bundle branch block, a ventricular rhythm or pre-excitation.',
        'QT: from the start of QRS to the end of T. Correct it for rate: QTc = QT ÷ √RR (RR in seconds). Normal is under 450 ms in men and 460 ms in women; over 500 ms is a high risk of torsades.',
      ] },
      { h: 'Where to measure', body: [
        'PR: lead II, where the P wave is clearest.',
        'QRS: the lead where it is widest, often V1–V3. Measure from the first deflection to the last.',
        'QT: lead II or V5. Draw a line down the steepest slope of the T wave; where it meets the baseline is the end of T (the tangent method). Leave out a separate U wave.',
      ] },
      { h: 'A quick QT check', body: [
        'If the QT is less than half the R–R interval, it is probably normal. If it is more than half, calculate the QTc.',
        'Bazett over-corrects at fast rates and under-corrects at slow ones. Above about 100/min, treat a borderline QTc with caution.',
        'A broad QRS makes the QT long too, because the QT includes the QRS. When the QRS is 120 ms or more, name the broad QRS as the main finding; judging repolarisation then needs a corrected method (such as the JT interval) and is beyond this module.',
      ] },
    ],
    compare: {
      title: 'Look-alikes to tell apart',
      cols: ['You see', 'This module', 'Look-alike'],
      rows: [
        ['A long PR', 'First-degree AV block: long but fixed, and every P conducts', 'Mobitz I: the PR lengthens beat by beat until a P is dropped. Complete block: the PR changes every beat because P and QRS are unrelated'],
        ['A broad QRS', 'Bundle branch block: sinus P waves before every broad QRS', 'Ventricular rhythm: no related P waves. Pre-excitation (WPW): a short PR and a slurred upstroke (delta wave)'],
        ['A long QT', 'Prolonged repolarisation: the T ends late', 'A U wave fused to the T (low potassium): measure to the end of T, not the end of U'],
      ],
    },
  },
  worked: {
    ecg: 'ptbxl-11916',
    steps: [
      { title: 'Check the grid and the rate', text: 'The calibration pulse is two big squares tall, so 10 mm = 1 mV. The rhythm is regular at about 96/min, so the R–R interval is about 625 ms (just over three big squares).' },
      { title: 'PR in lead II', text: 'From the start of the P wave to the first deflection of the QRS: about 148 ms, just under four small squares. Normal.' },
      { title: 'QRS at its widest', text: 'From the first to the last deflection: about 82 ms, two small squares. Narrow and normal.' },
      { title: 'QT in lead II or V5', text: 'From the start of the QRS to the end of the T (tangent method): about 384 ms. On its own that looks normal.' },
      { title: 'Correct for rate', text: 'QTc = 384 ÷ √0.625 = 384 ÷ 0.79 ≈ 486 ms. That is long. The half-the-R–R check warns you too: 384 ms is well over half of 625 ms.' },
      { title: 'Say the answer', text: 'PR 148 ms, QRS 82 ms, QT 384 ms, QTc about 486 ms: a prolonged QTc. Next: review QT-prolonging drugs and check potassium and magnesium.' },
    ],
  },
  guided: [
    { ecg: 'ptbxl-6855', hint: 'Each small square is 40 ms. Count squares from the start of P to the start of QRS in lead II, then from the start of QRS to the end of T.' },
    { ecg: 'ptbxl-9657', hint: 'Look at the gap between the P wave and the QRS. Is it more than one big square (200 ms)?' },
    { ecg: 'ptbxl-5504', hint: 'Find the lead where the QRS looks widest (try V1 to V3). Is it more than three small squares?' },
  ],
  pools: { sinus: [...NORMAL, ...LONG_PR, ...WIDE, ...LONG_QT], other: [], pre: 4, check: 10, checkOther: 0, pass: 8 },
  fields: ['pr', 'qrs', 'qt'],
  question: 'What is the main abnormality?',
  answer: { normal: 'none', avb1: 'long_pr', rbbb: 'wide_qrs', lbbb: 'wide_qrs', longqt: 'long_qt' },
  options: [['none', 'None: all intervals normal'], ['long_pr', 'Long PR (over 200 ms)'], ['wide_qrs', 'Broad QRS (120 ms or more)'], ['long_qt', 'Long QTc']],
};
