// Module 11 · Must-not-miss and mimics. The skill: ST elevation or a strange 12-lead in front of you; is it a STEMI,
// or something that looks like one (and needs a different plan)?
// Real ECGs: STEMIs that met the 4th Universal Definition on measurement and were already reviewed, LV aneurysm, and
// early repolarisation. Pericarditis, Brugada, PE and lead reversal come from the lab's heart model (labelled as models).
//
// Left out on purpose: ptbxl-234 (aneurysm with first-degree block as well).
import type { Course } from './types';

const STEMI = ['ptbxl-1063', 'ptbxl-20139', 'ptbxl-5891', 'ptbxl-532', 'model-stemi_inf', 'model-stemi_ant'];
const PERI = ['model-pericarditis', 'model-pericarditis-v2', 'model-pericarditis-v3'];
const ER = ['chapman-JS24754', 'chapman-JS24764', 'chapman-JS24731', 'chapman-JS24752', 'chapman-JS24732'];
const BRUGADA = ['model-brugada', 'model-brugada-v2', 'model-brugada-v3'];
const PE = ['model-pe', 'model-pe-v1', 'model-pe-v2', 'model-pe-v3'];
const LEADREV = ['model-lead_rev', 'model-lead_rev-v1', 'model-lead_rev-v2'];

export const MIMICS: Course = {
  moduleId: 'mimics',
  story: {
    setting: 'Casualty, Saturday night',
    text: [
      'A 24-year-old man has had sharp central chest pain for two days after a viral illness. It is worse lying flat and better leaning forward. Pulse 102/min, temperature 38.1 °C.',
      'His ECG shows ST elevation in most leads. The machine report says "acute MI". The registrar is reaching for the phone to the cath lab.',
    ],
    question: 'What features on the ECG would make you think of pericarditis rather than a STEMI?',
    answer: 'ST elevation that is widespread rather than in one coronary territory, concave in shape, with PR depression (and PR elevation in aVR), and no reciprocal ST depression except in aVR and V1. Q waves do not form. The story fits too. If the pattern is classic, treat pericarditis (an NSAID with colchicine) and get an echo for an effusion. If in doubt, repeat the ECG, check a troponin and speak to cardiology: missing a STEMI is worse than a careful second look.',
  },
  watch: {
    intro: 'Compare each mimic with the STEMI patterns. Open each station, then look at which leads change and whether any lead shows the mirror image.',
    look: [
      'Pericarditis: the whole epicardium is inflamed, so the ST rises almost everywhere and only aVR (and V1) points the other way.',
      'Brugada: the abnormality is local to the right ventricular outflow tract, so only V1–V2 show the coved ST elevation.',
      'PE: the right ventricle strains: sinus tachycardia, a right-sided T-wave inversion, sometimes S1Q3T3 or RBBB.',
      'Lead reversal: the heart is normal, only the cables are swapped: lead I turns upside down.',
    ],
  },
  rule: {
    sections: [
      { h: 'STEMI, the one not to miss', body: [
        'ST elevation in two contiguous leads in one coronary territory, with reciprocal ST depression on the opposite side, evolving over minutes to hours.',
        'When a mimic and a STEMI are both possible, repeat the ECG every 15–30 minutes, compare with old ECGs and get senior help early.',
      ] },
      { h: 'Acute pericarditis', body: [
        'Widespread concave ST elevation (more leads than one artery supplies), PR depression with PR elevation in aVR, no reciprocal change except aVR and V1, no Q waves.',
        'Pleuritic pain that is better sitting forward; often fever and a rub. Treat with an NSAID and colchicine; echo for effusion or tamponade.',
      ] },
      { h: 'Benign early repolarisation', body: [
        'Small concave ST elevation, mostly V2–V4, with a notched or slurred J point and tall T waves, in a young, well person, often with a slow heart rate. Stable on repeat ECGs.',
        'No reciprocal change, no Q waves, no symptoms that fit ischaemia.',
      ] },
      { h: 'LV aneurysm', body: [
        'Persistent ST elevation with deep Q waves (often QS) in the territory of an old infarct, weeks after the event. The T waves are small relative to the QRS.',
        'Compare with old ECGs: if they show the same ST elevation, it is the scar, not a new infarct.',
      ] },
      { h: 'Brugada, PE and lead reversal', body: [
        'Brugada type 1: coved ST elevation of 2 mm or more in V1–V2 falling into an inverted T wave. Risk of sudden death; fever and some drugs unmask it. Treat fever, avoid sodium-channel blockers, refer to cardiology.',
        'Pulmonary embolism: sinus tachycardia is the commonest finding; also T inversion in V1–V4 and III, right axis, RBBB, and S1Q3T3. A normal ECG does not rule PE out.',
        'Limb lead reversal (left and right arm): lead I inverted (negative P, QRS and T), aVR upright, chest leads normal. Re-site the electrodes before diagnosing anything.',
      ] },
    ],
    compare: {
      title: 'STEMI or mimic?',
      cols: ['Feature', 'Points to STEMI', 'Points to a mimic'],
      rows: [
        ['Where the ST rises', 'One coronary territory', 'Everywhere (pericarditis), V1–V2 only (Brugada), V2–V4 in a well young person (early repolarisation)'],
        ['Mirror image', 'Reciprocal ST depression in the opposite leads', 'None, apart from aVR and V1 in pericarditis'],
        ['Over time', 'Evolves over minutes to hours', 'Unchanged on repeat ECGs and on old ECGs (early repolarisation, aneurysm)'],
        ['Other clues', 'Ischaemic pain, risk factors, rising troponin', 'PR depression; deep old Q waves; an inverted lead I with normal chest leads'],
      ],
    },
  },
  worked: {
    ecg: 'model-pericarditis-v1',
    steps: [
      { title: 'Rate and rhythm', text: 'Sinus tachycardia, about 96/min. (This tracing is a teaching model from the MedWise heart model.)' },
      { title: 'Where is the ST raised?', text: 'In I, II, aVF and V2–V6: more leads than any single coronary artery supplies.' },
      { title: 'Look for a mirror image', text: 'Only aVR (and V1) shows ST depression. There is no reciprocal depression in aVL or the inferior leads.' },
      { title: 'Look at the PR segment', text: 'The PR segment dips below the baseline in II and rises in aVR: atrial injury from the inflamed pericardium.' },
      { title: 'Say the answer and act', text: 'Acute pericarditis. Confirm with the story, check a troponin and an echo, treat with an NSAID and colchicine, and repeat the ECG if anything does not fit.' },
    ],
  },
  guided: [
    { ecg: 'ptbxl-8636', hint: 'Look at V1–V4: are there Q waves (or QS complexes) as well as ST elevation? Think about when the infarct might have happened.' },
    { ecg: 'chapman-JS24787', hint: 'How high is the ST in V2–V4, and what shape is it? Is there any ST depression anywhere else? What is the heart rate?' },
    { ecg: 'model-brugada-v1', hint: 'Compare V1–V2 with V3–V6. Where is the abnormal ST, and what shape is it?' },
  ],
  pools: { sinus: [...STEMI, ...PERI, ...ER, ...BRUGADA, ...PE, ...LEADREV], other: [], pre: 4, check: 10, checkOther: 0, pass: 8 },
  fields: [],
  question: 'What is the most likely cause?',
  answer: { acute_mi: 'stemi', stemi_inf: 'stemi', stemi_ant: 'stemi', pericarditis: 'peri', early_repol: 'er', aneurysm: 'aneur', brugada: 'brugada', pe: 'pe', lead_rev: 'leadrev' },
  options: [['stemi', 'STEMI'], ['peri', 'Acute pericarditis'], ['er', 'Benign early repolarisation'], ['aneur', 'LV aneurysm (old infarct)'], ['brugada', 'Brugada pattern'], ['pe', 'Pulmonary embolism (right heart strain)'], ['leadrev', 'Limb lead reversal']],
};
