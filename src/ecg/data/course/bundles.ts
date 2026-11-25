// Module 4 · Bundle branches, fascicles and pacing. The skill: measure the QRS, then say why it is broad.
import type { Course } from './types';

// Real ECGs used here. Left out on purpose:
//   all 5 left anterior fascicular block ECGs (ptbxl-8646, -9071, -9195, -12319, -1220): axis −21° to −39°, not beyond −45°
//   ptbxl-16116 (left posterior fascicular block with axis +87°, not right axis deviation)
//   ptbxl-19330 (WPW with PR 180 ms and QRS 84 ms), ptbxl-12559 (WPW with PR 140 ms): no short PR in the key
//   ptbxl-18334, ptbxl-8559 (incomplete RBBB with QRS 146 and 126 ms, which would be complete RBBB)
// Left anterior fascicular block is tested with 6 ECGs added on 2026-11-25 whose axis is truly beyond −45° (approved that day).
const NORMAL = ['ptbxl-10492', 'ptbxl-1476', 'ptbxl-4439', 'ptbxl-1899', 'ptbxl-8042', 'ptbxl-18860', 'ptbxl-5799', 'ptbxl-441'];
const RBBB = ['ptbxl-11614', 'ptbxl-1123', 'ptbxl-9324', 'ptbxl-10359', 'ptbxl-2034'];
const LBBB = ['ptbxl-11474', 'ptbxl-8868', 'ptbxl-1156', 'ptbxl-4415', 'ptbxl-14181'];
const WPW = ['ptbxl-9795', 'ptbxl-14653'];
const LAFB = ['ptbxl-41', 'ptbxl-447', 'ptbxl-520', 'ptbxl-786', 'ptbxl-940', 'ptbxl-1005'];
const PACED = ['ptbxl-1674', 'ptbxl-12532', 'ptbxl-8060', 'ptbxl-6491', 'ptbxl-2090'];

export const BUNDLES: Course = {
  moduleId: 'bundles',
  story: {
    setting: 'Casualty, 11 p.m.',
    text: [
      'A 66-year-old man with diabetes has had central chest heaviness for an hour. The ECG shows broad QRS complexes, and the machine report says "ST elevation V1–V3, consider acute MI".',
      'The registrar on call asks you: "Do I activate the cath lab?"',
    ],
    question: 'What do you need to recognise first, and what would help you most right now?',
    answer: 'Whether the broad QRS is a left bundle branch block. In LBBB the ST segment normally moves opposite to the main QRS deflection, so ST elevation in V1–V3 is expected and does not on its own mean infarction. Find an old ECG: if the LBBB is old and the ST changes follow the expected pattern, the ECG alone does not prove a STEMI. Changes that go the "wrong" way (concordant ST elevation or depression) do suggest infarction. This module teaches you to recognise each kind of broad QRS; spotting ischaemia inside LBBB comes later in the course.',
  },
  watch: {
    intro: 'Watch what happens when one branch of the conduction system is cut. Open each station and slow the beat. The red X on the heart marks the block.',
    look: [
      'RBBB: the left ventricle fires on time, then the right ventricle is activated late, cell to cell. That late rightward force draws the second R (R′) in V1.',
      'LBBB: the septum is activated from the right side, so the small septal q in I and V6 disappears, and the whole left ventricle is late.',
      'WPW: an extra pathway (the Kent bundle) lets the impulse skip the AV-node delay. The PR is short and the QRS starts with a slurred upstroke.',
      'Paced rhythm: the impulse starts at the pacing lead in the right ventricle, so the QRS looks like a left bundle branch block, preceded by a spike.',
    ],
  },
  rule: {
    sections: [
      { h: 'Why a QRS becomes broad', body: [
        'Normally the impulse races down the His–Purkinje system and both ventricles fire within about 100 ms. If part of that highway is blocked or bypassed, the impulse spreads slowly from muscle cell to muscle cell, and the QRS becomes 120 ms or more.',
        'With sinus P waves in front, a broad QRS has three main causes: bundle branch block, pre-excitation (WPW) or ventricular pacing.',
      ] },
      { h: 'Right bundle branch block', body: [
        'QRS 120 ms or more; rSR′ ("M" shape) in V1–V2; a broad, slurred S wave in I, aVL, V5 and V6.',
        'T inversion in V1–V3 is expected with RBBB. The axis is usually normal, because the left ventricle still fires normally.',
        'Often a normal finding. New RBBB with breathlessness or chest pain: think of pulmonary embolism and ischaemia.',
        'rSR′ with a QRS under 120 ms is incomplete RBBB, usually a normal variant.',
      ] },
      { h: 'Left bundle branch block', body: [
        'QRS 120 ms or more; broad, notched or flat-topped R in I, aVL, V5–V6 with no septal q; deep QS or rS in V1–V3.',
        'The ST segment and T wave point opposite to the main QRS deflection (discordant). That is expected, and it hides ischaemia.',
        'Almost always a sign of heart disease: ischaemia, cardiomyopathy, hypertension or aortic stenosis. New LBBB needs an echo.',
        'Memory aid for V1 and V6: WiLLiaM (LBBB: W in V1, M in V6) and MaRRoW (RBBB: M in V1, W in V6).',
      ] },
      { h: 'Fascicular blocks', body: [
        'Left anterior fascicular block: left axis deviation (−45° or beyond), qR in I and aVL, rS in II, III and aVF, QRS under 120 ms.',
        'Left posterior fascicular block: right axis deviation (+90° to +180°), rS in I and aVL, qR in III and aVF, once right ventricular hypertrophy, lateral MI and PE are excluded.',
        'Bifascicular block (RBBB with one of these) plus syncope can mean intermittent complete heart block: admit and monitor.',
      ] },
      { h: 'Pre-excitation (WPW) and pacing', body: [
        'WPW: PR under 120 ms, a slurred start to the QRS (delta wave), a broad QRS and secondary ST–T changes. The danger is atrial fibrillation conducted down the extra pathway: avoid AV-nodal blockers (adenosine, verapamil, beta-blockers, digoxin), use electrical cardioversion if unstable, and refer for ablation.',
        'Ventricular pacing: a sharp spike before each broad QRS, which looks like LBBB from a right-ventricular lead. Check capture (a QRS after every spike) and sensing (no spikes landing on the patient’s own beats).',
      ] },
    ],
    compare: {
      title: 'Look-alikes to tell apart',
      cols: ['You see', 'This module', 'Look-alike'],
      rows: [
        ['Broad QRS with P waves', 'Bundle branch block: normal PR, no spikes', 'WPW: short PR and a delta wave. Paced: a spike before each QRS'],
        ['rSR′ in V1', 'RBBB: QRS 120 ms or more', 'Incomplete RBBB: QRS under 120 ms, usually normal. Brugada: coved ST elevation in V1–V2'],
        ['Broad and fast', 'SVT with a known bundle branch block', 'Ventricular tachycardia. Treat a broad regular tachycardia as VT until proven otherwise (Module 8)'],
      ],
    },
  },
  worked: {
    ecg: 'ptbxl-4051',
    steps: [
      { title: 'Rate and rhythm', text: 'Regular, about 77/min, with a P wave before every QRS: sinus rhythm.' },
      { title: 'Measure the QRS', text: 'At its widest it is about 132 ms, just over three small squares. Broad.' },
      { title: 'Look at V1', text: 'An rSR′ pattern: a small r, an S, then a second, taller R′. The late R′ is the right ventricle firing late.' },
      { title: 'Look at I and V6', text: 'A broad, slurred S wave. That is the same late right-ventricular force, seen from the left side.' },
      { title: 'Check the axis and PR', text: 'Lead I and aVF are both positive: normal axis, so there is no fascicular block as well. The PR is 200 ms, at the upper limit of normal.' },
      { title: 'Say the answer', text: 'Sinus rhythm at 77/min with right bundle branch block, QRS 132 ms, normal axis. If the patient is well and it is not new, no urgent action is needed.' },
    ],
  },
  guided: [
    { ecg: 'ptbxl-5504', hint: 'Look at V1 and V6. In V1, is the QRS mostly down (QS) or up? In V6, is there a small q at the start, or a broad R straight away?' },
    { ecg: 'ptbxl-12083', hint: 'Zoom in just before each broad QRS. Is there a very thin vertical line?' },
    { ecg: 'ptbxl-6240', hint: 'Measure the PR. Is it shorter than three small squares? Then look at the start of the QRS: does it rise slowly before it shoots up?' },
  ],
  pools: { sinus: [...NORMAL, ...RBBB, ...LBBB, ...LAFB, ...WPW, ...PACED], other: [], pre: 4, check: 10, checkOther: 0, pass: 8 },
  fields: ['qrs'],
  question: 'What is the conduction?',
  answer: { normal: 'normal', rbbb: 'rbbb', lbbb: 'lbbb', lafb: 'lafb', wpw: 'wpw', paced: 'paced' },
  options: [['normal', 'Narrow QRS, normal conduction'], ['rbbb', 'Right bundle branch block'], ['lbbb', 'Left bundle branch block'], ['lafb', 'Left anterior fascicular block'], ['wpw', 'Pre-excitation (WPW pattern)'], ['paced', 'Ventricular paced rhythm']],
};
