// The learning path. Levels 1–2 are written; 3–4 are listed so learners can see what comes next.

export type Question = { q: string; o: string[]; a: number; why: string; img?: string };
export type Unit = {
  id: string; level: number; title: string; minutes: number; summary: string;
  points: string[]; lab: string; labLabel: string; practice: string[]; quiz: Question[];
};
export type Level = { n: number; name: string; forWho: string; outcome: string; ready: boolean };

export const LEVELS: Level[] = [
  { n: 1, name: 'Foundations', forWho: 'Students and anyone starting from zero', outcome: 'Name every wave and measure every interval on a normal ECG', ready: true },
  { n: 2, name: 'Reading', forWho: 'Final-year students and interns', outcome: 'Read an unknown ECG in order, unaided', ready: true },
  { n: 3, name: 'Emergencies', forWho: 'Interns and residents', outcome: 'The right action in 30 seconds for the ECGs that kill', ready: false },
  { n: 4, name: 'Advanced', forWho: 'Medicine-side residents and exam aspirants', outcome: 'Mimics, pre-excitation, pacing and inherited syndromes', ready: false },
];

export const UNITS: Unit[] = [
  // ---------------- Level 1 ----------------
  { id: 'l1-heart', level: 1, title: 'How the heart writes the ECG', minutes: 12,
    summary: 'The ECG is the shadow of one moving electrical force, seen from twelve directions. Once you see that, every wave makes sense.',
    points: [
      'The SA node fires; the wave spreads through the atria (P wave), pauses in the AV node (PR segment), then races down the His–Purkinje system (QRS).',
      'During the plateau every ventricular cell is depolarised, so no current flows: the ST segment is flat.',
      'Repolarisation runs in the opposite direction with the opposite charge, so the T wave normally points the same way as the QRS.',
      'A lead draws upward when the force moves toward its positive electrode, downward when it moves away, and almost nothing at right angles.',
    ],
    lab: 'wave-overview', labLabel: 'Watch one beat, step by step', practice: ['normal'],
    quiz: [
      { q: 'What makes the flat PR segment?', o: ['Atrial repolarisation', 'Delay in the AV node', 'Septal depolarisation', 'Ventricular plateau'], a: 1, why: 'The AV node conducts slowly on purpose. Too little tissue is involved to register, so the line stays flat.' },
      { q: 'Why is the ST segment normally flat?', o: ['The heart is resting', 'All ventricular cells are at the same voltage during the plateau', 'The AV node blocks conduction', 'The atria are repolarising'], a: 1, why: 'With every cell depolarised and on its plateau there is no voltage difference, so no current flows.' },
      { q: 'A force moving at right angles to a lead produces…', o: ['A tall upward deflection', 'A deep downward deflection', 'A small or biphasic deflection', 'A delta wave'], a: 2, why: 'The lead records only the part of the force along its own axis; at 90° that part is close to zero.' },
    ] },
  { id: 'l1-paper', level: 1, title: 'Paper, speed and measuring', minutes: 10,
    summary: 'Every number you read off an ECG comes from the grid. Learn the squares once and you can measure anything.',
    points: [
      'At 25 mm/s one small square is 40 ms and one big square is 200 ms; five big squares are one second.',
      'At 10 mm/mV one small square is 0.1 mV; check the calibration step (10 mm tall) before trusting any voltage.',
      'Regular rate: 300 ÷ big squares between two R waves, or 1500 ÷ small squares.',
      'Irregular rate: count the QRS complexes on the 10-second rhythm strip and multiply by 6.',
      'Use calipers: measure from the start of one wave to the start of the next, not peak to peak.',
    ],
    lab: 'normal', labLabel: 'Measure a beat with the calipers', practice: ['normal', 'sinus_brady', 'sinus_tachy'],
    quiz: [
      { q: 'Four big squares separate two R waves. The rate is…', o: ['60/min', '75/min', '100/min', '150/min'], a: 1, why: '300 ÷ 4 = 75.' },
      { q: 'A PR interval spans 4 small squares. How long is it?', o: ['80 ms', '120 ms', '160 ms', '200 ms'], a: 2, why: '4 × 40 ms = 160 ms, inside the normal 120–200 ms.' },
      { q: 'The rhythm is irregular. Best way to get the rate?', o: ['300 ÷ big squares', '1500 ÷ small squares', 'QRS count on the 10-s strip × 6', 'Read it from the monitor'], a: 2, why: 'The 300 and 1500 rules need regular R–R intervals.' },
    ] },
  { id: 'l1-p', level: 1, title: 'The P wave and PR interval', minutes: 12,
    summary: 'The P wave is the atria; the PR interval is the time it takes the impulse to reach the ventricles.',
    points: [
      'A sinus P is upright in I and II and inverted in aVR. It is tallest in II because the atrial force points to about +60°.',
      'V1 sits over the right atrium: the first half of the P (right atrium) points up, the second half (left atrium) down.',
      'Normal P: under 120 ms wide and under 2.5 mm tall. Tall and peaked in II = right atrial enlargement; broad and notched = left.',
      'Normal PR: 120–200 ms. Longer = AV-node delay (first-degree block); shorter = pre-excitation or a junctional focus.',
    ],
    lab: 'wave-P', labLabel: 'Explore every P-wave form', practice: ['normal', 'lae', 'rae', 'avb1'],
    quiz: [
      { q: 'In which lead is the sinus P wave tallest, and why?', o: ['V1, it is closest to the atria', 'II, it lies along the atrial axis', 'aVR, it looks into the atria', 'V6, it is lateral'], a: 1, why: 'The atrial force points to about +60°, the axis of lead II.' },
      { q: 'A P wave in II is 3 mm tall and peaked. Think of…', o: ['Left atrial enlargement', 'Right atrial enlargement', 'Hyperkalaemia', 'Normal variant'], a: 1, why: 'P pulmonale: 2.5 mm or more in the inferior leads.' },
      { q: 'PR interval of 260 ms, every P conducted. This is…', o: ['Normal', 'First-degree AV block', 'Mobitz II', 'WPW'], a: 1, why: 'A constant PR over 200 ms with every P followed by a QRS.' },
    ] },
  { id: 'l1-qrs', level: 1, title: 'The QRS: Q, R and S', minutes: 15,
    summary: 'The QRS is the ventricles. Name its parts by direction, then learn which shapes are normal in which lead.',
    points: [
      'Q: any downward deflection before the first upward one. R: the first upward deflection. S: the downward deflection after R.',
      'Small septal q waves are normal in I, aVL, V5 and V6. A Q of 40 ms or more, or deeper than 25% of the R, in two contiguous leads is pathological.',
      'R grows from V1 to V5; the transition (R = S) sits around V3–V4. Poor R progression suggests old anterior MI, LVH or lead misplacement.',
      'QRS under 120 ms is narrow. 120 ms or more means the impulse bypassed part of the Purkinje system: bundle branch block, ventricular beat or pre-excitation.',
    ],
    lab: 'wave-Q', labLabel: 'See normal and abnormal Q, R and S', practice: ['normal', 'old_mi', 'rbbb', 'lbbb'],
    quiz: [
      { q: 'Where are small septal q waves normal?', o: ['V1–V3', 'I, aVL, V5, V6', 'II, III, aVF only', 'Nowhere'], a: 1, why: 'The septum depolarises left to right, away from the left-sided leads.' },
      { q: 'Which Q wave is pathological?', o: ['20 ms wide in V6', '40 ms wide and 30% of the R in II, III and aVF', 'A small Q in III that vanishes on inspiration', 'QS in aVR'], a: 1, why: '40 ms or more, or over 25% of R, in contiguous leads.' },
      { q: 'A QRS of 140 ms means…', o: ['Normal conduction', 'Conduction outside the normal Purkinje pathway', 'Hyperacute ischaemia', 'Atrial enlargement'], a: 1, why: 'Bundle branch block, a ventricular rhythm or pre-excitation.' },
    ] },
  { id: 'l1-t', level: 1, title: 'T, U and the QT', minutes: 12,
    summary: 'The T wave is recovery. It is the most sensitive and least specific wave on the ECG.',
    points: [
      'T is upright in I, II and V3–V6, always inverted in aVR, and may be inverted alone in III, aVL, aVF or V1.',
      'Tall, narrow, peaked T = hyperkalaemia. Tall, broad, bulky T early in chest pain = hyperacute STEMI.',
      'QT runs from the start of the QRS to the end of the T. Correct it for rate: QTc = QT ÷ √RR. Normal under 450 ms (men), 460 ms (women).',
      'A U wave after the T is normal if small; a prominent U with a flat T suggests low potassium. End the QT at the T, not the U.',
    ],
    lab: 'wave-T', labLabel: 'Compare peaked, hyperacute and ischaemic T', practice: ['normal', 'isch_t', 'longqt'],
    quiz: [
      { q: 'Tall, narrow, pointed T waves with a narrow base suggest…', o: ['Hyperacute STEMI', 'Hyperkalaemia', 'Hypokalaemia', 'Pericarditis'], a: 1, why: 'Fast, synchronised repolarisation from high extracellular potassium.' },
      { q: 'In which lead is an inverted T always normal?', o: ['V2', 'II', 'aVR', 'V5'], a: 2, why: 'aVR looks into the cavity, opposite the main forces.' },
      { q: 'You measure the QT to the end of a large U wave. The result is…', o: ['Correct', 'An overestimate', 'An underestimate', 'Only valid in V1'], a: 1, why: 'The QT ends at the end of the T wave (tangent method).' },
    ] },
  { id: 'l1-leads', level: 1, title: 'The 12 leads and what they look at', minutes: 12,
    summary: 'Each lead is a camera on one wall of the heart. Group them and you can localise any change.',
    points: [
      'Inferior wall: II, III, aVF. Lateral: I, aVL, V5, V6. Anterior: V3, V4. Septal: V1, V2.',
      'aVR looks into the cavity from the upper right; it is the mirror of the lateral and inferior leads.',
      'Limb leads see the frontal plane (up–down, left–right); chest leads see the horizontal plane (front–back, left–right).',
      'Changes that respect one group of leads point to one coronary artery; changes everywhere suggest a global cause.',
    ],
    lab: 'wave-R', labLabel: 'Watch R progression across V1–V6', practice: ['normal', 'old_mi', 'lead_rev'],
    quiz: [
      { q: 'Which leads look at the inferior wall?', o: ['I, aVL, V6', 'II, III, aVF', 'V1, V2', 'V3, V4'], a: 1, why: 'Their positive poles sit on the left leg.' },
      { q: 'Which lead is the mirror of the lateral leads?', o: ['aVR', 'V3', 'III', 'V6'], a: 0, why: 'aVR looks from the upper right, opposite the main left-sided forces.' },
      { q: 'ST changes in almost every lead suggest…', o: ['Single-vessel occlusion', 'A global cause such as pericarditis or subendocardial ischaemia', 'Lead reversal', 'Normal variant'], a: 1, why: 'One artery supplies one territory; diffuse change points elsewhere.' },
    ] },
  // ---------------- Level 2 ----------------
  { id: 'l2-order', level: 2, title: 'The 9-step reading order', minutes: 10,
    summary: 'Experts are not faster because they skip steps; they are faster because the order is automatic.',
    points: [
      '1 Calibration and speed. 2 Rate. 3 Rhythm: is there a P before every QRS and a QRS after every P?',
      '4 Axis from I and aVF. 5 Intervals: PR, QRS, QT.',
      '6 P wave shape. 7 QRS: Q waves, R progression, voltage. 8 ST segment. 9 T and U waves.',
      'Then decide: what is the diagnosis, and what must happen in the next 10 minutes?',
    ],
    lab: 'normal', labLabel: 'Practise the order on the reference ECG', practice: ['normal', 'avb1', 'lafb'],
    quiz: [
      { q: 'What comes before reading any voltage?', o: ['Axis', 'Calibration check', 'ST segment', 'Rhythm'], a: 1, why: 'A half-standard (5 mm/mV) recording halves every voltage.' },
      { q: 'The rhythm step asks…', o: ['Is the QRS wide?', 'Is there a P before every QRS and a QRS after every P?', 'Is the axis normal?', 'Is the ST flat?'], a: 1, why: 'That single question separates sinus rhythm, AF, blocks and junctional rhythms.' },
      { q: 'Why read in a fixed order?', o: ['It is faster to skip', 'So nothing is missed when one finding grabs your attention', 'Exams require it', 'Machines do it that way'], a: 1, why: 'The commonest error is stopping at the first abnormality.' },
    ] },
  { id: 'l2-rhythm', level: 2, title: 'Rate and rhythm', minutes: 15,
    summary: 'Three questions sort almost every rhythm: regular or not, narrow or wide, P waves or not.',
    points: [
      'Sinus: a normal P before every QRS at a constant PR. Sinus arrhythmia varies with breathing and is normal.',
      'Atrial fibrillation: no P waves and an irregularly irregular rhythm.',
      'Atrial flutter: sawtooth F waves at about 300/min, often with 2:1 block giving a rate of 150.',
      'Ectopic beats: premature, often wide, with no preceding P and a compensatory pause.',
    ],
    lab: 'af', labLabel: 'Watch the atria fibrillate', practice: ['af', 'flutter', 'sinus_arrh', 'pvc', 'bigeminy'],
    quiz: [
      { q: 'No P waves and an irregularly irregular rhythm is…', o: ['Sinus arrhythmia', 'Atrial fibrillation', 'Atrial flutter 2:1', 'Multifocal ectopics'], a: 1, why: 'The hallmark pair of AF.' },
      { q: 'A regular narrow rhythm fixed at 150/min should make you think of…', o: ['Sinus tachycardia only', 'Atrial flutter with 2:1 block', 'VT', 'AF'], a: 1, why: 'Atrial rate 300 with every second wave conducted.' },
      { q: 'An early wide beat with no P before it is…', o: ['A ventricular ectopic', 'A blocked P', 'A junctional beat', 'Normal'], a: 0, why: 'The impulse starts in the ventricle and spreads cell to cell.' },
    ] },
  { id: 'l2-axis', level: 2, title: 'Axis in 60 seconds', minutes: 10,
    summary: 'Two leads, one glance. Lead I and aVF tell you the quadrant; lead II settles the borderline.',
    points: [
      'I positive, aVF positive: normal (0° to +90°).',
      'I positive, aVF negative: look at II. II positive = still normal (to −30°). II negative = left axis deviation.',
      'I negative, aVF positive: right axis deviation. Both negative: extreme axis.',
      'Left axis: LAFB, inferior MI, LBBB, paced rhythm. Right axis: RVH, PE, LPFB, lateral MI, lead reversal.',
    ],
    lab: 'lafb', labLabel: 'See the axis swing in LAFB', practice: ['lafb', 'lpfb', 'rvh', 'normal'],
    quiz: [
      { q: 'QRS positive in I, negative in aVF, negative in II. The axis is…', o: ['Normal', 'Left', 'Right', 'Extreme'], a: 1, why: 'Beyond −30°: left axis deviation.' },
      { q: 'QRS negative in I, positive in aVF. The axis is…', o: ['Normal', 'Left', 'Right', 'Extreme'], a: 2, why: 'Between +90° and +180°.' },
      { q: 'A common cause of left axis deviation is…', o: ['RVH', 'Left anterior fascicular block', 'Pulmonary embolism', 'Dextrocardia'], a: 1, why: 'The anterosuperior LV activates late and from below.' },
    ] },
  { id: 'l2-bbb', level: 2, title: 'Bundle branch and fascicular blocks', minutes: 15,
    summary: 'A wide QRS with a recognisable shape tells you which branch is slow.',
    points: [
      'RBBB: QRS ≥ 120 ms, rSR′ in V1, wide slurred S in I and V6. The ST elevation of an MI is still readable.',
      'LBBB: QRS ≥ 120 ms, broad notched R in I, aVL, V6 with no septal q, QS or rS in V1. ST-T is discordant; ischaemia is hard to read (use Sgarbossa).',
      'LAFB: left axis beyond −45°, qR in I and aVL, rS inferiorly. LPFB: right axis with rS in I and qR in III.',
      'RBBB plus a fascicular block is bifascicular block; add a long PR and watch for complete heart block.',
    ],
    lab: 'rbbb', labLabel: 'Watch the right ventricle activate late', practice: ['rbbb', 'irbbb', 'lbbb', 'lafb', 'lpfb'],
    quiz: [
      { q: 'rSR′ in V1 with a QRS of 140 ms is…', o: ['LBBB', 'RBBB', 'LAFB', 'WPW'], a: 1, why: 'The late R′ is the right ventricle activating late.' },
      { q: 'In LBBB the ST–T normally points…', o: ['The same way as the QRS', 'Opposite to the main QRS deflection', 'Always up', 'Always down'], a: 1, why: 'Abnormal depolarisation gives secondary, discordant repolarisation.' },
      { q: 'RBBB + LAFB is called…', o: ['Trifascicular block', 'Bifascicular block', 'Complete heart block', 'Incomplete RBBB'], a: 1, why: 'Two of the three fascicles are blocked.' },
    ] },
  { id: 'l2-chambers', level: 2, title: 'Chamber enlargement', minutes: 12,
    summary: 'More muscle makes a bigger force. The ECG is specific for hypertrophy but not sensitive; echo decides.',
    points: [
      'LVH: S V1 + R V5 or V6 ≥ 35 mm (Sokolow–Lyon) or R aVL + S V3 > 28 mm men, 20 mm women (Cornell). Lateral strain often follows.',
      'RVH: right axis, dominant R in V1, deep S in V5–V6, RV strain in V1–V3.',
      'Left atrium: broad notched P in II, deep terminal P in V1. Right atrium: tall peaked P in II.',
      'Young, thin people often have high voltage without LVH.',
    ],
    lab: 'lvh', labLabel: 'See LVH with strain', practice: ['lvh', 'rvh', 'lae', 'rae'],
    quiz: [
      { q: 'S in V1 is 18 mm and R in V5 is 22 mm. By Sokolow–Lyon this is…', o: ['Normal', 'LVH by voltage', 'RVH', 'Low voltage'], a: 1, why: '18 + 22 = 40 mm, over 35 mm.' },
      { q: 'Dominant R in V1 with right axis suggests…', o: ['LVH', 'RVH', 'LAFB', 'Normal'], a: 1, why: 'The thick right ventricle outweighs the left.' },
      { q: 'How do you confirm LVH?', o: ['Repeat ECG', 'Echocardiography', 'Troponin', 'Chest X-ray'], a: 1, why: 'Echo measures wall thickness and mass directly.' },
    ] },
  { id: 'l2-isch', level: 2, title: 'Old infarcts and ischaemic changes', minutes: 15,
    summary: 'Before you learn acute STEMI (Level 3), learn what a completed infarct and chronic ischaemia look like.',
    points: [
      'Old MI: pathological Q waves in two contiguous leads, ST back at baseline, T inversion may persist.',
      'Map Q waves to territory: inferior (II, III, aVF) = usually RCA; anterior (V1–V4) = LAD; lateral (I, aVL, V5–V6) = circumflex.',
      'Ischaemic T inversion: symmetrical and in a territory. Non-specific T change: shallow, scattered, often benign.',
      'Always compare with an old ECG; a change is more important than an abnormality.',
    ],
    lab: 'old_inf', labLabel: 'See why dead muscle makes a Q', practice: ['old_mi', 'isch_t', 'post_mi'],
    quiz: [
      { q: 'Q waves in II, III and aVF with a flat ST point to…', o: ['Acute inferior STEMI', 'Old inferior MI', 'Pericarditis', 'LVH'], a: 1, why: 'Q waves remain after the infarct; the ST has returned to baseline.' },
      { q: 'Anterior Q waves (V1–V4) usually mean disease of the…', o: ['RCA', 'LAD', 'Circumflex', 'Left main only'], a: 1, why: 'The LAD supplies the anterior wall and septum.' },
      { q: 'Most useful single comparison when reading an abnormal ECG?', o: ['A textbook picture', 'The patient\'s previous ECG', 'The machine report', 'A colleague\'s guess'], a: 1, why: 'New change matters more than a stable abnormality.' },
    ] },
];

export const unitsFor = (level: number) => UNITS.filter(u => u.level === level);
