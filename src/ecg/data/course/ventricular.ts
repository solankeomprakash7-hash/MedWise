// Module 8 · Ventricular rhythms and arrest. The skill: recognise ventricular ectopy, VT, torsades and VF, and know
// what each one obliges you to do in the next minute.
// The open datasets have no clean VT, VF or torsades, so those come from the lab's heart model (labelled as teaching
// models wherever they appear); ectopic beats and the look-alikes are real ECGs.
import type { Course } from './types';

const ECTOPIC = ['ptbxl-297', 'ptbxl-6189', 'ptbxl-6012', 'ptbxl-11151', 'ptbxl-4262', 'ptbxl-14501', 'ptbxl-13878', 'model-pvc'];
const VT = ['model-vt-v1', 'model-vt-v2', 'model-vt-v3', 'model-vt-v4', 'model-vt-v5', 'model-vt-v6'];
const TDP = ['model-tdp-v2', 'model-tdp-v3', 'model-tdp-v4', 'model-tdp'];
const VF = ['model-vf-v1', 'model-vf-v3', 'model-vf-v4', 'model-vf-v5', 'model-vf'];
// Look-alikes that are not ventricular: narrow fast rhythms and a broad QRS from bundle branch block.
const NOT_VENT = ['ptbxl-2051', 'ptbxl-12346', 'chapman-JS45370', 'ptbxl-4117', 'ptbxl-11474', 'ptbxl-8868'];
// ptbxl-17513 left out: labelled ventricular ectopics, but the key says regular.

export const VENTRICULAR: Course = {
  moduleId: 'ventricular',
  story: {
    setting: 'Casualty, 1 a.m.',
    text: [
      'A 62-year-old man who had a heart attack four years ago has had palpitations for an hour. Pulse 180/min and regular, BP 100/64, alert and talking.',
      'The ECG shows a regular broad-complex tachycardia. Someone suggests "SVT with aberrancy, give verapamil".',
    ],
    question: 'What is the safest working diagnosis, and why is verapamil dangerous here?',
    answer: 'Ventricular tachycardia. In a patient with a previous infarct, a broad-complex tachycardia is VT in the large majority of cases, and treating VT as SVT can kill: verapamil drops the blood pressure and can tip VT into VF. He is stable for now, so prepare for synchronised cardioversion, give an antiarrhythmic such as amiodarone per your protocol, and check potassium and magnesium. If he becomes unstable, cardiovert; if he loses his pulse, defibrillate.',
  },
  watch: {
    intro: 'Watch a single focus in the ventricle take over. Open each station; on the VT station tap lead II and look for P waves marching through.',
    look: [
      'Ectopic beats: one beat starts in the ventricle, so it is early, broad and has no P wave in front of it.',
      'VT: the focus fires repeatedly and the whole ventricle is activated cell to cell, so every QRS is broad. The sinus node carries on independently.',
      'Torsades: the QRS axis twists around the baseline. It starts after a long QT.',
      'VF: no single wavefront, only chaos. There is no QRS and no cardiac output.',
    ],
  },
  rule: {
    sections: [
      { h: 'Ventricular ectopic beats', body: [
        'An early, broad QRS (often 120 ms or more) with no P wave in front, usually followed by a full compensatory pause.',
        'Bigeminy: every second beat is ectopic. Count only the normal beats for the underlying rate.',
        'Usually benign in a normal heart. Check potassium, magnesium, ischaemia and drugs. Frequent ectopics (about 10% of beats or more) deserve an echo.',
      ] },
      { h: 'Ventricular tachycardia', body: [
        'Three or more ventricular beats in a row at over 100/min; sustained if it lasts over 30 seconds or needs treatment.',
        'Features that prove VT: AV dissociation (P waves at their own slower rate), capture beats and fusion beats.',
        'Features that favour VT: a very broad QRS (over 160 ms), an extreme "north-west" axis, all chest leads pointing the same way (concordance), and a history of infarction or heart failure.',
        'Treat every regular broad-complex tachycardia as VT until proven otherwise.',
      ] },
      { h: 'Polymorphic VT and torsades de pointes', body: [
        'A fast, broad, irregular rhythm whose QRS axis twists around the baseline, usually starting after a long QT.',
        'Triggers: QT-prolonging drugs, low potassium or magnesium, and bradycardia.',
        'Treatment: IV magnesium sulfate, correct potassium, stop the culprit drugs, and raise the heart rate (pacing or isoprenaline) if it keeps recurring. Pulseless or unstable: defibrillate.',
      ] },
      { h: 'Ventricular fibrillation', body: [
        'Chaotic waves of varying size and shape, with no QRS complexes. The patient has no pulse.',
        'Start CPR and defibrillate immediately. Look for reversible causes (hypoxia, hypovolaemia, potassium and other metabolic causes, hypothermia, thrombosis, tamponade, toxins, tension pneumothorax).',
        'Fine VF can look like asystole. Check two leads and the gain before you call it asystole.',
      ] },
      { h: 'The first question: is there a pulse?', body: [
        'No pulse (VF or pulseless VT): CPR and defibrillation.',
        'Pulse but unstable (shock, syncope, chest pain, heart failure): synchronised DC cardioversion.',
        'Pulse and stable VT: an antiarrhythmic such as amiodarone per protocol, correct electrolytes, and be ready to cardiovert. Never verapamil for a broad-complex tachycardia.',
      ] },
    ],
    compare: {
      title: 'Look-alikes to tell apart',
      cols: ['You see', 'Ventricular', 'Look-alike'],
      rows: [
        ['Regular broad-complex tachycardia', 'VT: AV dissociation, very broad QRS, extreme axis', 'SVT with a known bundle branch block, or a pre-excited tachycardia. Treat as VT unless you are certain'],
        ['Irregular, broad and fast', 'Polymorphic VT or torsades: the axis twists', 'AF with a bundle branch block (the shape stays the same) or pre-excited AF in WPW (no AV-nodal blockers)'],
        ['Low, chaotic waves', 'Fine VF: check two leads and the gain', 'Asystole, or artefact from movement or a loose lead: look at the patient first'],
      ],
    },
  },
  worked: {
    ecg: 'model-vt',
    steps: [
      { title: 'Rate, rhythm and width', text: 'Regular, about 170/min, and every QRS is broad (about 160 ms). A regular broad-complex tachycardia.' },
      { title: 'Look at the axis', text: 'Lead I and aVF are both negative: an extreme ("north-west") axis. A normal heart cannot produce that from above the ventricles, so it points to VT.' },
      { title: 'Hunt for P waves', text: 'On the lead II strip, small bumps march through the QRS complexes at a slower, regular rate: AV dissociation. The atria and ventricles are beating independently.' },
      { title: 'Say the answer', text: 'Monomorphic ventricular tachycardia, about 170/min.' },
      { title: 'Act', text: 'Check for a pulse. Pulseless: CPR and defibrillation. Unstable: synchronised cardioversion. Stable: an antiarrhythmic per protocol, potassium and magnesium, and look for ischaemia. (This tracing is a teaching model from the MedWise heart model.)' },
    ],
  },
  guided: [
    { ecg: 'ptbxl-297', hint: 'Look along the rhythm strip for beats that come early. Is there a P wave in front of them? Are they broader than the others?' },
    { ecg: 'model-vf-v2', hint: 'Can you find a single QRS complex anywhere? Look at two or three leads before you decide.' },
    { ecg: 'model-tdp-v1', hint: 'Follow the rhythm strip from left to right. Do the complexes stay the same shape, or do they grow, shrink and flip?' },
  ],
  pools: { sinus: [...ECTOPIC, ...VT, ...TDP, ...VF, ...NOT_VENT], other: [], pre: 4, check: 10, checkOther: 0, pass: 8 },
  fields: [],
  question: 'What is the rhythm?',
  answer: { pvc: 'ectopic', bigeminy: 'ectopic', vt: 'vt', tdp: 'tdp', vf: 'vf', svt: 'notvent', af: 'notvent', lbbb: 'notvent' },
  options: [['ectopic', 'Sinus rhythm with ventricular ectopic beats'], ['vt', 'Monomorphic VT'], ['tdp', 'Polymorphic VT (torsades de pointes)'], ['vf', 'Ventricular fibrillation'], ['notvent', 'Not ventricular: SVT, AF or bundle branch block']],
};
