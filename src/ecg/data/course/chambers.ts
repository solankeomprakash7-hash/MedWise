// Module 6 · Chamber enlargement. The skill: spot LVH, left and right atrial enlargement against a normal ECG.
// Uses 12 ECGs added on 2026-11-25 that still wait for clinical review (draft: true), so the lesson is shown only in
// the reviewer preview until they are signed off (see PREVIEW in lib/logic.ts and index.ts).
import type { Course } from './types';

// Chosen with the textbook criteria checked on the PTB-XL+ measurements, not the label alone:
//   LVH: S V1 + R V5/V6 ≥ 3.5 mV, P under 120 ms (so the atrial answer is not also true)
//   LAE: P in II ≥ 120 ms or a terminal negative P in V1 ≥ 0.1 mV and ≥ 40 ms
//   RAE: P in II ≥ 0.25 mV
// Left out on purpose: ptbxl-10590 (LVH label, Sokolow–Lyon 29 mm), ptbxl-9089 (LVH with PR 226 ms and P 152 ms),
//   ptbxl-16190 (LAE label, P 110 ms and a small terminal P in V1), ptbxl-6926 (LAE with axis −49°: fascicular block too),
//   ptbxl-1785, ptbxl-15181 (RAE label, P in II 2.1 and 1.9 mm), all four RVH ECGs (normal axis; ptbxl-10279 meets LVH voltage).
//   RVH is taught in the rule only: PTB-XL has almost no RVH records that meet RVH criteria.
const NORMAL = ['ptbxl-10492', 'ptbxl-1476', 'ptbxl-4439', 'ptbxl-1899', 'ptbxl-8042', 'ptbxl-18860', 'ptbxl-5799', 'ptbxl-441'];
const LVH = ['ptbxl-7844', 'ptbxl-10562', 'ptbxl-16813', 'ptbxl-6347', 'ptbxl-11906', 'ptbxl-4206', 'ptbxl-12980'];
const LAE = ['ptbxl-17160', 'ptbxl-6685', 'ptbxl-3449', 'ptbxl-16197'];
const RAE = ['ptbxl-5231', 'ptbxl-3269'];

export const CHAMBERS: Course = {
  moduleId: 'chambers',
  story: {
    setting: 'Medicine OPD, Thursday',
    text: [
      'A 52-year-old driver has had headaches for a month. His blood pressure is 190/110 on both arms. He says he has "always had high BP" but stopped his tablets two years ago.',
      'His ECG shows very tall QRS complexes in the chest leads, with the ST segment sloping down and the T wave inverted in V5 and V6.',
    ],
    question: 'What does this ECG tell you about his blood pressure, and what does it not tell you?',
    answer: 'It shows left ventricular hypertrophy with a "strain" pattern: years of pressure load have thickened the left ventricle. That is target-organ damage, which makes treating his blood pressure more urgent. What it cannot do is rule LVH out: the ECG misses many people with a thick ventricle on echo. So a normal ECG does not mean a normal heart, and an echo confirms the finding.',
  },
  watch: {
    intro: 'Watch how a thick wall or a stretched atrium changes the tracing. Open each station and compare it with the normal ECG.',
    look: [
      'LVH: the thick left ventricle makes a bigger electrical force toward the left and back. Tall R in V5–V6, deep S in V1–V2.',
      'Strain: the thick wall repolarises abnormally, so the ST slopes down and the T inverts in the leads with tall R waves.',
      'RVH: the right ventricle becomes strong enough to pull the force to the right and forward: right axis and a dominant R in V1.',
    ],
  },
  rule: {
    sections: [
      { h: 'Left ventricular hypertrophy', body: [
        'Sokolow–Lyon: S in V1 plus the taller R in V5 or V6 of 35 mm or more. Or R in aVL of 11 mm or more.',
        'Cornell: R in aVL plus S in V3 over 28 mm in men or 20 mm in women.',
        'Strain: down-sloping ST depression and asymmetric T inversion in I, aVL, V5 and V6. It means a worse prognosis.',
        'The ECG is specific but not sensitive. Young, thin adults can meet voltage criteria with normal hearts, and many people with LVH on echo have a normal ECG.',
        'Causes: hypertension, aortic stenosis, hypertrophic cardiomyopathy, coarctation.',
      ] },
      { h: 'Right ventricular hypertrophy', body: [
        'Right axis deviation (beyond +90°), a dominant R in V1 (taller than the S, or 7 mm or more), and deep S waves in V5–V6.',
        'Often with right atrial enlargement and T inversion in V1–V3 (right ventricular strain).',
        'Causes: pulmonary hypertension, mitral stenosis, chronic lung disease, congenital heart disease. Acute strain from a large pulmonary embolism looks similar.',
      ] },
      { h: 'The atria', body: [
        'Left atrial enlargement: a P wave of 120 ms or more in lead II, often notched (P mitrale), and a biphasic P in V1 whose negative end is at least one small square deep and one small square wide. Think mitral valve disease, hypertension, and a higher risk of AF.',
        'Right atrial enlargement: a tall, peaked P of 2.5 mm or more in II, III and aVF (P pulmonale). Think pulmonary hypertension, COPD and tricuspid disease.',
      ] },
    ],
    compare: {
      title: 'Look-alikes to tell apart',
      cols: ['You see', 'Chamber enlargement', 'Look-alike'],
      rows: [
        ['Tall chest-lead voltages', 'LVH: high voltage with strain, a broad or notched P, or a known cause', 'A young, thin, athletic adult: high voltage alone, with no strain and normal P waves'],
        ['Lateral ST depression and T inversion', 'LVH strain: with high voltage, asymmetric T waves', 'Ischaemia: no high voltage, often symmetric T waves, symptoms or a troponin rise'],
        ['A dominant R in V1', 'RVH: with right axis deviation and deep S in V5–V6', 'RBBB (QRS 120 ms or more), posterior MI (ST depression in V1–V3) or WPW (short PR, delta wave)'],
      ],
    },
  },
  worked: {
    ecg: 'ptbxl-8456',
    steps: [
      { title: 'Rate, rhythm and intervals', text: 'Sinus rhythm at about 84/min. PR 148 ms, QRS 96 ms: narrow, so a bundle branch block is not the reason for any tall complexes.' },
      { title: 'Measure the S in V1', text: 'Use the calipers from the baseline to the bottom of the S wave in V1. Each small square is 1 mm.' },
      { title: 'Measure the tallest R in V5 or V6', text: 'From the baseline to the top of the R wave. Add the two: about 42 mm here, well over 35 mm.' },
      { title: 'Look for strain', text: 'Check the ST segment and T wave in I, aVL, V5 and V6: is the ST sloping down with an inverted, asymmetric T?' },
      { title: 'Check the P waves', text: 'The P in II is under 120 ms and under 2.5 mm, so there is no clear atrial enlargement.' },
      { title: 'Say the answer and act', text: 'Sinus rhythm with left ventricular hypertrophy by voltage (Sokolow–Lyon). Look for the cause (blood pressure, aortic stenosis murmur) and confirm with an echo.' },
    ],
  },
  guided: [
    { ecg: 'ptbxl-542', hint: 'Add the depth of the S in V1 to the height of the R in V5 or V6, in small squares. Is it 35 or more?' },
    { ecg: 'ptbxl-6851', hint: 'Look at the P wave in II: how many small squares wide is it? Then look at V1: is the end of the P wave negative?' },
    { ecg: 'ptbxl-8177', hint: 'Look at the P wave in II, III and aVF. Is it taller than two and a half small squares?' },
  ],
  pools: { sinus: [...NORMAL, ...LVH, ...LAE, ...RAE], other: [], pre: 4, check: 10, checkOther: 0, pass: 8 },
  fields: [],
  question: 'What does this ECG show?',
  answer: { normal: 'normal', lvh: 'lvh', lae: 'lae', rae: 'rae' },
  options: [['normal', 'Normal ECG'], ['lvh', 'Left ventricular hypertrophy'], ['lae', 'Left atrial enlargement'], ['rae', 'Right atrial enlargement']],
};
