// Module 9 · Ischaemia and infarction. The skill: say whether an ECG shows a STEMI (and where), a STEMI equivalent,
// ischaemia without ST elevation, or an old infarct, because each one changes what happens in the next ten minutes.
//
// Every "STEMI" here was checked against the 4th Universal Definition of MI on the PTB-XL+ J-point ST amplitudes
// (tools/stemi_check.py): ST elevation in two contiguous leads, ≥1 mm (≥2 mm in V2–V3 in men 40 and over, ≥2.5 mm under 40,
// ≥1.5 mm in women), with an "acute" or "recent" report, sinus rhythm and a narrow QRS. The 9 STEMIs added on 2026-11-25
// wait for clinical review, so this lesson shows only in the reviewer preview until they are signed off.
//
// Left out on purpose:
//   labelled "acute MI" but not meeting STEMI criteria on measurement: ptbxl-12841, -15811, -3219, -6172, -8652, -18198;
//   meeting them but subacute, extensive or mixed: ptbxl-20139, -5891 (subacute anterior), ptbxl-1063 (inferior and anterior), ptbxl-532;
//   ptbxl-16463, -6120, -17993 ("injury" with no measured ST shift), ptbxl-8768 (with fascicular block), ptbxl-18480 (no P wave found);
//   ptbxl-13084 (old infarct, report says normal ECG), ptbxl-3405 (old infarct with inferior ST depression), ptbxl-10245 (ventricular ectopics);
//   the posterior-MI ECGs (ptbxl-19300, -9807, -4824, -19309: one is in complete heart block, the others do not show the pattern clearly).
import type { Course } from './types';

const INF = ['ptbxl-8075', 'ptbxl-8611', 'ptbxl-19269', 'model-stemi_inf'];
const ANT = ['ptbxl-11944', 'ptbxl-11353', 'ptbxl-19067', 'ptbxl-20617', 'model-stemi_ant'];
const NSTE = ['ptbxl-4175', 'ptbxl-15880', 'ptbxl-1812', 'ptbxl-13779', 'ptbxl-4284', 'ptbxl-171', 'ptbxl-2922', 'ptbxl-20068', 'ptbxl-7992'];
const OLD = ['ptbxl-4106', 'ptbxl-1373', 'ptbxl-1903', 'ptbxl-7781', 'ptbxl-2134'];
const EQUIV = ['model-stemi_post', 'model-wellens', 'model-nste_avr'];

export const ACS: Course = {
  moduleId: 'acs',
  story: {
    setting: 'Casualty, 6 a.m.',
    text: [
      'A 56-year-old bus driver has had heavy central chest pain for 40 minutes, with sweating and nausea. BP 100/70, pulse 64.',
      'His ECG shows ST elevation in II, III and aVF, and ST depression in aVL. The nearest cath lab is three hours away by road.',
    ],
    question: 'What is the diagnosis, what must happen now, and what should you check before giving nitrates?',
    answer: 'An acute inferior STEMI, usually from the right coronary artery; the ST depression in aVL is reciprocal change and makes it more convincing. He needs reperfusion now. With primary PCI more than two hours away, give fibrinolysis within minutes if there is no contraindication, with aspirin and the other drugs in your protocol, then transfer. Record right-sided leads (V4R): ST elevation there means right-ventricular infarction, where nitrates can drop the blood pressure sharply and fluids are often needed. Watch for heart block.',
  },
  watch: {
    intro: 'Watch an occluded artery produce an injury current, and see which leads face the injured wall. Open each station and tap the leads named under "Look for".',
    look: [
      'Inferior STEMI: II, III and aVF face the injured wall, so their ST rises; aVL looks from the opposite side, so its ST falls.',
      'Anterior STEMI: V1–V4 face the front of the left ventricle.',
      'Posterior MI: no lead faces the back, so you see the mirror image in V1–V3: ST depression and tall R waves.',
      'Wellens and de Winter: no ST elevation, yet both mean a critical LAD lesion.',
    ],
  },
  rule: {
    sections: [
      { h: 'STEMI criteria', body: [
        'New ST elevation at the J point in two contiguous leads: 1 mm or more in all leads except V2–V3.',
        'In V2–V3: 2 mm or more in men aged 40 and over, 2.5 mm or more in men under 40, and 1.5 mm or more in women.',
        'Reciprocal ST depression in the opposite leads makes a STEMI much more likely than a mimic.',
        'Compare with an old ECG and repeat the ECG every 15–30 minutes while the pain continues: early STEMIs evolve.',
      ] },
      { h: 'Which wall, which artery', body: [
        'Inferior: II, III, aVF. Usually the right coronary artery, sometimes the circumflex. Check V4R for right-ventricular involvement.',
        'Anterior: V1–V4 (septal V1–V2). The left anterior descending artery.',
        'Lateral: I, aVL, V5, V6. The circumflex or a diagonal branch.',
        'Posterior: ST depression with tall R waves in V1–V3. Record V7–V9: 0.5 mm of ST elevation there confirms it.',
      ] },
      { h: 'STEMI equivalents: no classic ST elevation, same urgency', body: [
        'Posterior MI, as above.',
        'De Winter T waves: up-sloping ST depression with tall, symmetric T waves in V1–V6. A proximal LAD occlusion.',
        'Wellens syndrome: deep or biphasic T waves in V2–V3 in a patient whose pain has settled. A critical proximal LAD stenosis: no stress test; refer for angiography.',
        'ST elevation in aVR with widespread ST depression: left main or three-vessel disease, or severe diffuse ischaemia. Treat as high risk.',
      ] },
      { h: 'Ischaemia without ST elevation, and old infarcts', body: [
        'ST depression of 0.5 mm or more in two contiguous leads, or new T inversion, suggests ischaemia. ST depression does not tell you which artery. The troponin makes the diagnosis of NSTEMI.',
        'An old infarct leaves pathological Q waves (40 ms or more, or more than a quarter of the R wave, or QS in V2–V3) with the ST back on the baseline. ST elevation that persists for weeks suggests a ventricular aneurysm.',
      ] },
      { h: 'What to do', body: [
        'STEMI or equivalent: reperfusion now. Primary PCI if it can be done within about two hours of first contact; otherwise fibrinolysis within minutes if there is no contraindication, then transfer.',
        'Ischaemia without ST elevation: treat as acute coronary syndrome, repeat ECGs, serial troponins and risk scoring; urgent angiography if pain persists or the patient is unstable.',
        'Old infarct: no emergency from the ECG alone; secondary prevention and an echo.',
      ] },
    ],
    compare: {
      title: 'Look-alikes to tell apart',
      cols: ['You see', 'Ischaemia', 'Look-alike'],
      rows: [
        ['ST elevation', 'STEMI: in one territory, with reciprocal depression, evolving', 'Pericarditis, early repolarisation, LV aneurysm, LBBB or pacing, Brugada (Module 11)'],
        ['ST depression', 'Ischaemia, or a posterior MI if it is in V1–V3', 'LVH strain, digoxin, or a fast heart rate'],
        ['Q waves', 'Old infarct in a coronary territory', 'Poor R progression from lead position, LVH or LBBB; a small q in III alone is normal'],
      ],
    },
  },
  worked: {
    ecg: 'ptbxl-6144',
    steps: [
      { title: 'Rate, rhythm and QRS', text: 'Sinus rhythm at about 94/min with a narrow QRS, so the ST segments can be judged directly.' },
      { title: 'Go lead by lead at the J point', text: 'Compare the J point with the baseline before each P wave. In V2–V5 the ST is raised: about 1.8 mm in V2, 1.9 mm in V3 and 1.5 mm in V4.' },
      { title: 'Apply the criteria', text: 'The patient is a woman, so the threshold in V2–V3 is 1.5 mm; V4 needs 1 mm. Contiguous leads V2–V4 all meet it.' },
      { title: 'Look for Q waves and T waves', text: 'Q waves in V2–V4 and T inversion: the infarct is evolving, as the report says it is recent.' },
      { title: 'Name the territory', text: 'V2–V5: the anterior wall, supplied by the left anterior descending artery.' },
      { title: 'Say the answer and act', text: 'Anterior STEMI. Reperfusion now, by primary PCI or fibrinolysis, alongside the usual ACS treatment.' },
    ],
  },
  guided: [
    { ecg: 'ptbxl-12899', hint: 'Compare II, III and aVF with aVL. Is the ST raised in one group and lowered in the other?' },
    { ecg: 'ptbxl-6751', hint: 'Look at the ST segment in V2–V5. Is it above or below the baseline? Is there any lead with ST elevation?' },
    { ecg: 'model-dewinter', hint: 'There is no ST elevation in V1–V6. Look at the shape of the ST segment and the height of the T waves.' },
  ],
  pools: { sinus: [...INF, ...ANT, ...NSTE, ...OLD, ...EQUIV], other: [], pre: 4, check: 10, checkOther: 0, pass: 8 },
  fields: [],
  question: 'What does this ECG show?',
  answer: { stemi_inf: 'inf', stemi_ant: 'ant', acute_inj: 'nste', isch_t: 'nste', old_mi: 'old', stemi_post: 'equiv', dewinter: 'equiv', wellens: 'equiv', nste_avr: 'equiv' },
  options: [['inf', 'Inferior STEMI'], ['ant', 'Anterior STEMI'], ['equiv', 'STEMI equivalent (posterior, de Winter, Wellens, aVR pattern)'], ['nste', 'Ischaemia without ST elevation'], ['old', 'Old infarct (Q waves, no acute change)']],
};
