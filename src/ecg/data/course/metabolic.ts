// Module 10 · Electrolytes, drugs and temperature. The skill: measure the QT, then recognise the signature of
// potassium, QT-prolonging drugs, digoxin and cold. The open datasets do not say which electrolyte is abnormal,
// so potassium and hypothermia come from the lab's heart model (labelled as teaching models), in graded severities.
//
// Left out on purpose: ptbxl-10512 (labelled digoxin effect, but QT 602 ms: digoxin shortens the QT);
//   ptbxl-320, ptbxl-260 (long QT with another finding or a borderline QTc); the "electrolyte" ECGs (the electrolyte is not named).
import type { Course } from './types';

const HYPERK = ['model-hyperk-v2', 'model-hyperk-v3', 'model-hyperk-v4'];
const HYPOK = ['model-hypok', 'model-hypok-v1', 'model-hypok-v3'];
const LONGQT = ['ptbxl-13838', 'ptbxl-9894', 'model-longqt', 'model-longqt-v1', 'model-longqt-v2', 'model-longqt-v3'];
const DIG = ['ptbxl-7909', 'ptbxl-1065', 'ptbxl-19926', 'model-digoxin', 'model-digoxin-v1', 'model-digoxin-v2'];
const COLD = ['model-hypothermia', 'model-hypothermia-v1', 'model-hypothermia-v3'];
const NORMAL = ['ptbxl-1899', 'ptbxl-5799', 'ptbxl-8042', 'ptbxl-441'];

export const METABOLIC: Course = {
  moduleId: 'metabolic',
  story: {
    setting: 'Dialysis unit, Monday morning',
    text: [
      'A 68-year-old man on haemodialysis missed both of last week’s sessions. He feels weak in the legs. Pulse 54/min, BP 160/96.',
      'His ECG shows tall, narrow, peaked T waves, almost no P waves, and a QRS that is starting to widen. The potassium result will take an hour.',
    ],
    question: 'Do you wait for the potassium result? What do you give first, and why?',
    answer: 'No. Hyperkalaemia with ECG changes is an emergency, and a broadening QRS means he is close to a sine-wave rhythm and arrest. Put him on a monitor and give IV calcium first: it does not lower potassium but protects the heart within minutes, and you repeat it if the ECG does not improve. Then shift potassium into the cells (insulin with glucose, nebulised salbutamol) and remove it, here by urgent dialysis. Stop potassium-raising drugs.',
  },
  watch: {
    intro: 'See how each electrolyte or drug changes the ventricular action potential, and so the ST, T and QT. Open each station and step through one beat slowly.',
    look: [
      'High potassium: repolarisation speeds up (peaked T), then conduction slows (flat P, then a broad QRS).',
      'Low potassium: the T wave flattens and a U wave grows after it.',
      'Long QT: repolarisation is delayed, so the T wave ends late.',
      'Digoxin: the ST segment sags in a "reverse tick" and the QT shortens.',
      'Hypothermia: a hump at the J point (the Osborn wave), with bradycardia and long intervals.',
    ],
  },
  rule: {
    sections: [
      { h: 'High potassium', body: [
        'In order of severity: tall, narrow, peaked T waves; then flat or absent P waves and a long PR; then a broad QRS; then a sine wave, VF or asystole.',
        'The ECG can look normal even when the potassium is high, and changes can progress within minutes.',
        'Treat ECG changes as an emergency: IV calcium to protect the heart, then insulin with glucose and salbutamol to shift potassium, then remove it (binders, diuretics, dialysis).',
      ] },
      { h: 'Low potassium (and magnesium)', body: [
        'Flat or inverted T waves, ST depression and a prominent U wave after the T, best seen in V2–V3.',
        'The T and U waves can merge into what looks like a long QT. Measure to the end of T, not the end of U.',
        'It raises the risk of ectopics, torsades and digoxin toxicity. Replace potassium and magnesium together.',
      ] },
      { h: 'Long QT', body: [
        'QTc over 450 ms in men or 460 ms in women is prolonged; over 500 ms carries a high risk of torsades de pointes.',
        'Common causes: drugs (macrolides, fluoroquinolones, ondansetron, haloperidol and other antipsychotics, some antiarrhythmics), low potassium, magnesium or calcium, and congenital long-QT syndromes.',
        'Stop or avoid QT-prolonging drugs, correct the electrolytes and monitor.',
      ] },
      { h: 'Digoxin: effect versus toxicity', body: [
        'Digoxin effect, at normal levels: scooped "reverse tick" ST depression, flattened T waves and a short QT. It is not toxicity.',
        'Digoxin toxicity: almost any arrhythmia, typically ventricular ectopics or bigeminy, AV block, atrial tachycardia with block, or bidirectional VT. Check the level and the potassium; digoxin-specific antibodies for serious toxicity.',
      ] },
      { h: 'Hypothermia, and calcium', body: [
        'Hypothermia: Osborn (J) waves at the end of the QRS, sinus bradycardia, long PR and QT, and often shivering artefact or AF. Rewarm and handle the patient gently: the cold heart fibrillates easily.',
        'High calcium shortens the QT; low calcium lengthens it by stretching the ST segment.',
      ] },
    ],
    compare: {
      title: 'Look-alikes to tell apart',
      cols: ['You see', 'Metabolic', 'Look-alike'],
      rows: [
        ['Tall T waves', 'Hyperkalaemia: narrow-based, tented, symmetrical', 'Hyperacute T waves of an early STEMI: broad-based, in one territory. Tall T in healthy young adults'],
        ['A long-looking QT', 'Long QT: the T itself ends late', 'Low potassium: a U wave fused to the T'],
        ['ST depression', 'Digoxin: scooped, with a short QT', 'Ischaemia: horizontal or down-sloping, in a territory, with symptoms'],
        ['A hump after the QRS', 'Osborn wave of hypothermia, with bradycardia', 'Early repolarisation (a small notch in a well person); Brugada pattern in V1–V2'],
      ],
    },
  },
  worked: {
    ecg: 'model-hyperk',
    steps: [
      { title: 'Rate and rhythm', text: 'About 66/min, with small P waves in front of each QRS. (This tracing is a teaching model from the MedWise heart model.)' },
      { title: 'Look at the T waves', text: 'In V2–V4 the T waves are tall, narrow and pointed, like a tent. That shape, not just the height, is what suggests potassium.' },
      { title: 'Look at the P and the PR', text: 'The P waves are small and the PR is long, about 220 ms: conduction in the atria is already slowing.' },
      { title: 'Measure the QRS', text: 'About 124 ms: broad. The QRS widens late, so this is advanced hyperkalaemia.' },
      { title: 'Say the answer and act', text: 'Hyperkalaemia with peaked T waves, flat P waves and a broadening QRS. Monitor, IV calcium now, then insulin with glucose and salbutamol, and a plan to remove the potassium.' },
    ],
  },
  guided: [
    { ecg: 'model-hyperk-v1', hint: 'Look at the shape of the T waves in V2–V4: broad and rounded, or narrow and pointed? Then check the P waves and the QRS width.' },
    { ecg: 'model-hypok-v2', hint: 'Follow the baseline after each T wave. Is there another wave before the next P?' },
    { ecg: 'model-hypothermia-v2', hint: 'The rate is slow. Look at the very end of each QRS in II and V4–V5: is there an extra hump?' },
  ],
  pools: { sinus: [...HYPERK, ...HYPOK, ...LONGQT, ...DIG, ...COLD, ...NORMAL], other: [], pre: 4, check: 10, checkOther: 0, pass: 8 },
  fields: ['qt'],
  question: 'What does this ECG show?',
  answer: { normal: 'normal', hyperk: 'hyperk', hypok: 'hypok', longqt: 'longqt', digoxin: 'digoxin', hypothermia: 'cold' },
  options: [['normal', 'Normal ECG'], ['hyperk', 'High potassium'], ['hypok', 'Low potassium'], ['longqt', 'Long QT'], ['digoxin', 'Digoxin effect'], ['cold', 'Hypothermia']],
};
