// Module 3 · AV blocks. The skill: find every P wave, decide how it relates to the QRS, and know who needs pacing.
import type { Course } from './types';

// Real ECGs used here. Left out on purpose:
//   ptbxl-13906 (first-degree block without a PR in the key),
//   ptbxl-18101 (second-degree block at 114/min with QRS 126 ms: unusual, needs a second look), chapman-JS12426 (no rate),
//   chapman-JS12487 (rate recorded as 6/min), chapman-JS12498 (no rate),
//   ptbxl-4827, chapman-JS12497, chapman-JS12485 (complete block at 60–78/min: possible, but check the labels first).
const NORMAL_AV = ['ptbxl-2400', 'ptbxl-8201', 'ptbxl-4808', 'ptbxl-11331', 'ptbxl-10492', 'ptbxl-1476', 'ptbxl-8042', 'ptbxl-5799'];
const AVB1 = ['ptbxl-14332', 'ptbxl-9108', 'ptbxl-9657'];
const AVB2 = ['ptbxl-14009', 'ptbxl-19164', 'chapman-JS12431', 'chapman-JS12429', 'chapman-JS12428', 'chapman-JS12458'];
const CHB = ['ptbxl-8620', 'ptbxl-21533', 'chapman-JS12499'];

export const AVBLOCK: Course = {
  moduleId: 'avblock',
  story: {
    setting: 'Medicine OPD, Monday morning',
    text: [
      'A 74-year-old woman has had three dizzy spells this week. Yesterday she blacked out briefly in the kitchen. She takes amlodipine and nothing else.',
      'Her pulse is 38/min and regular. Blood pressure 150/60. She looks well sitting on the couch.',
    ],
    question: 'Her pulse is slow but regular. What on the ECG decides whether she goes home or to the coronary care unit tonight?',
    answer: 'Whether the P waves are linked to the QRS complexes. If P waves march through at their own faster rate, unrelated to a slow, often broad escape rhythm, this is complete heart block: put pacing pads on and admit for a pacemaker. A regular pulse does not make it safe. Sinus bradycardia, with a P before every QRS and a fixed PR, would be a very different conversation.',
  },
  watch: {
    intro: 'Watch the impulse stall in the AV node and then fail to cross it. Open each station and slow the beat to 0.2×. The red X on the heart shows where the block is.',
    look: [
      'First-degree block: every P still reaches the ventricles; the PR is just long.',
      'Mobitz I (Wenckebach): the PR grows longer beat by beat until one P is not followed by a QRS.',
      'Mobitz II: the PR stays the same, then a P suddenly fails to conduct.',
      'Complete block: the atria and ventricles beat to their own rhythms. P waves fall anywhere, even inside the QRS or T.',
    ],
  },
  rule: {
    sections: [
      { h: 'Find every P wave first', body: [
        'Use the lead II rhythm strip. Mark the P waves you can see, then measure the P–P interval and walk it across the strip with the calipers. Hidden P waves sit inside T waves and QRS complexes exactly where the P–P interval says they should be.',
        'Then ask two questions: does every P have a QRS after it, and is the PR the same each time?',
      ] },
      { h: 'Name the block', body: [
        'First-degree: PR over 200 ms, constant, and every P conducts. Usually benign: review AV-nodal drugs (beta-blockers, calcium-channel blockers, digoxin).',
        'Second-degree Mobitz I (Wenckebach): the PR lengthens until a P is dropped, then resets. The block is usually in the AV node; often benign (athletes, sleep, inferior MI, drugs). Monitor.',
        'Second-degree Mobitz II: a constant PR, then a sudden dropped P. The block is below the AV node, often with a bundle branch block. It can progress to complete block without warning: this needs a pacemaker.',
        '2:1 block: every second P is dropped, so you cannot see whether the PR would have lengthened. A broad QRS points to a block below the node; treat it like Mobitz II until proven otherwise.',
        'Third-degree (complete) block: P waves and QRS complexes are regular but unrelated. The escape is junctional (narrow, 40–60/min) or ventricular (broad, 20–40/min).',
      ] },
      { h: 'Who needs pacing', body: [
        'Pacing pads on now if there is shock, syncope, heart failure, pauses over 3 seconds or a ventricular rate under about 40/min.',
        'Mobitz II, high-grade block and complete heart block need admission for a permanent pacemaker unless a reversible cause is found (drugs, hyperkalaemia, acute inferior MI).',
        'Atropine may help a block in the AV node. It rarely helps a block below the node, and it should never delay pacing in an unstable patient.',
      ] },
    ],
    compare: {
      title: 'Look-alikes to tell apart',
      cols: ['You see', 'AV block', 'Look-alike'],
      rows: [
        ['A pause after a P wave', 'Mobitz I or II: the dropped P arrives on time, at the regular P–P interval', 'A blocked premature atrial beat: the P comes early, often hidden in the T wave, so the P–P interval is short'],
        ['Slow and regular', 'Complete block: P waves faster than the QRS and unrelated to them', 'Sinus bradycardia: a P before every QRS and a fixed PR. Junctional rhythm: no P waves, or inverted P waves right next to the QRS'],
        ['P and QRS unrelated', 'Complete block: the atrial rate is faster than the ventricular rate', 'AV dissociation: the ventricles (e.g. an accelerated junctional rhythm) go faster than the atria. It is not a block'],
      ],
    },
  },
  worked: {
    ecg: 'ptbxl-959',
    steps: [
      { title: 'Rate and rhythm', text: 'The QRS complexes are regular and slow, about 40/min. That alone does not tell you the cause.' },
      { title: 'Find the P waves', text: 'On the lead II strip there are more P waves than QRS complexes. Measure one P–P interval with the calipers and walk it across: the P waves are regular and faster than the QRS rate. Some sit inside T waves.' },
      { title: 'Is the PR constant?', text: 'No. The distance from each P to the next QRS keeps changing. The P waves and QRS complexes are not related.' },
      { title: 'Look at the escape rhythm', text: 'The QRS is broad (about 138 ms). A broad escape at 40/min comes from low down, below the AV node, and is unreliable.' },
      { title: 'Say the answer and act', text: 'Complete (third-degree) heart block with a broad escape rhythm at about 40/min. Pacing pads on, monitor, check potassium and drugs, and refer for a pacemaker.' },
    ],
  },
  guided: [
    { ecg: 'ptbxl-4780', hint: 'Measure the PR in lead II on two or three beats. Is it over one big square, and is it the same each time?' },
    { ecg: 'ptbxl-16401', hint: 'Count the P waves and the QRS complexes on the rhythm strip. Are there more P waves than QRS complexes?' },
    { ecg: 'ptbxl-16151', hint: 'The rate is very slow. Walk the P–P interval with the calipers: do the P waves keep their own rhythm regardless of the QRS?' },
  ],
  pools: { sinus: [...NORMAL_AV, ...AVB1, ...AVB2, ...CHB], other: ['junctional'], pre: 4, check: 10, checkOther: 2, pass: 8 },
  fields: ['rate'],
  question: 'What is the conduction?',
  answer: { normal: 'normal_av', sinus_brady: 'normal_av', avb1: 'avb1', avb2: 'avb2', chb: 'chb', junctional: 'junc' },
  options: [['normal_av', 'Sinus rhythm, every P conducts normally'], ['avb1', 'First-degree AV block'], ['avb2', 'Second-degree AV block'], ['chb', 'Complete (third-degree) heart block'], ['junc', 'Junctional rhythm, no AV block']],
};
