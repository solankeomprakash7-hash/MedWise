// Module 5 · Atrial and narrow-complex rhythms. The skill: a fast narrow rhythm in front of you, which one is it?
import type { Course } from './types';

// Real ECGs used here. Left out on purpose:
//   ptbxl-8461, ptbxl-3134, ptbxl-12489 (labelled SVT but marked irregular: AVNRT and AVRT are regular)
//   chapman-JS45375 (labelled SVT at 270/min: possible, but unusual in adults; check the label)
//   chapman-JS09293, chapman-JS09044 (labelled junctional but irregular). Junctional rhythm is taught in the rule only,
//   as one clean example is not enough to test it.
const AF = ['ptbxl-12147', 'ptbxl-10407', 'ptbxl-14221', 'ptbxl-6713', 'ptbxl-12056', 'ptbxl-2032', 'ptbxl-20406', 'ptbxl-16098', 'ptbxl-330', 'ptbxl-866'];
const FLUTTER = ['ptbxl-6179', 'ptbxl-12986', 'ptbxl-1773', 'ptbxl-449', 'ptbxl-15106', 'chapman-JS16759', 'chapman-JS16491', 'chapman-JS09018', 'chapman-JS17356', 'chapman-JS17061', 'chapman-JS04844'];
const SVT = ['ptbxl-2051', 'ptbxl-12346', 'chapman-JS45374', 'chapman-JS45366', 'chapman-JS45376', 'chapman-JS45370', 'chapman-JS45381'];
const STACH = ['ptbxl-18888', 'ptbxl-8594', 'ptbxl-8099', 'ptbxl-12720', 'ptbxl-12182'];

export const SVT_COURSE: Course = {
  moduleId: 'svt',
  story: {
    setting: 'Casualty, Sunday afternoon',
    text: [
      'A 58-year-old woman has had palpitations for two hours. Her pulse is 150/min and regular, blood pressure 118/76, and she is talking comfortably.',
      'The nurse has already drawn up adenosine: "It’s SVT, isn’t it?"',
    ],
    question: 'A regular narrow tachycardia at almost exactly 150/min. What diagnosis must you look for before calling it SVT, and where?',
    answer: 'Atrial flutter with 2:1 block. The atria flutter at about 300/min and every second wave gets through, giving a ventricular rate near 150. Look for saw-tooth flutter waves in II, III, aVF and V1; one of each pair often hides in the QRS or T wave. Adenosine will not stop flutter. It may briefly slow the ventricles and unmask the flutter waves, which helps the diagnosis, but treatment is rate control or cardioversion, and anticoagulation is considered as for AF.',
  },
  watch: {
    intro: 'Watch each rhythm start in a different place. Open each station, look at the heart, and compare the baselines between the QRS complexes.',
    look: [
      'AF: no single wavefront in the atria, only chaotic activity. The baseline wobbles and the QRS complexes arrive at random.',
      'AF with a fast ventricular rate: the same chaos with more beats getting through the AV node.',
      'Flutter: one wave circles the right atrium about 300 times a minute, drawing saw-tooth waves. The AV node lets through every second or third one.',
      'AVNRT: a small circuit in and around the AV node. The atria and ventricles fire at almost the same moment, so the P wave hides inside the QRS.',
      'Junctional rhythm: the AV junction takes over. The QRS is narrow and the P wave is absent or inverted close to it.',
    ],
  },
  rule: {
    sections: [
      { h: 'Two questions for any narrow tachycardia', body: [
        'Is it regular or irregular? Measure several R–R intervals on the rhythm strip.',
        'Where are the P waves? In front of each QRS, hidden, after the QRS, or replaced by flutter or fibrillatory waves?',
      ] },
      { h: 'Irregular', body: [
        'Atrial fibrillation: no P waves, a wavy or flat baseline, irregularly irregular R–R intervals.',
        'Atrial flutter with variable block: saw-tooth waves, with the R–R jumping between multiples of the flutter cycle.',
        'Multifocal atrial tachycardia: at least three different P-wave shapes, usually in severe lung disease. Treat the lungs, not the rhythm.',
      ] },
      { h: 'Regular', body: [
        'Sinus tachycardia: a normal P before every QRS, gradual onset and offset, and a rate that changes with the cause. In adults at rest it is rarely above 150/min.',
        'Atrial flutter with 2:1 block: about 150/min, with flutter waves in II, III, aVF and V1.',
        'AVNRT, the commonest SVT: 140–250/min, sudden onset, P waves hidden in the QRS or seen as a small extra deflection at its end (a pseudo-r′ in V1).',
        'AVRT, through an accessory pathway: the P wave sits just after the QRS, in the ST segment.',
      ] },
      { h: 'What to do', body: [
        'Unstable (shock, syncope, chest pain, heart failure): synchronised DC cardioversion.',
        'Stable regular SVT: vagal manoeuvres (the modified Valsalva, with legs raised after the strain), then adenosine 6 mg as a rapid IV push with a flush, then 12 mg if needed. Record a rhythm strip as you give it.',
        'AF and flutter: control the rate (a beta-blocker or diltiazem; avoid these in decompensated heart failure), treat the trigger (sepsis, thyroid, alcohol, dehydration) and assess stroke risk with CHA₂DS₂-VASc.',
        'Sinus tachycardia: never cardiovert it, and do not slow it with drugs until you know why it is fast.',
      ] },
    ],
    compare: {
      title: 'Look-alikes to tell apart',
      cols: ['You see', 'Usually', 'Also consider'],
      rows: [
        ['Regular, narrow, about 150/min', 'Sinus tachycardia if a P is in front of every QRS', 'Atrial flutter 2:1 (saw-tooth in II, III, aVF) and AVNRT (no visible P)'],
        ['Irregular and narrow', 'Atrial fibrillation: no P waves at all', 'Flutter with variable block; multifocal atrial tachycardia; sinus rhythm with frequent ectopic beats'],
        ['Narrow and slow, no clear P', 'Junctional rhythm: 40–60/min, P absent or inverted next to the QRS', 'AF with a slow ventricular rate (irregular); sinus bradycardia with flat P waves'],
      ],
    },
  },
  worked: {
    ecg: 'ptbxl-2739',
    steps: [
      { title: 'Regular or irregular?', text: 'Measure several R–R intervals on the rhythm strip: they are the same. Regular.' },
      { title: 'Rate and width', text: 'About two big squares between R waves: 300 ÷ 2 ≈ 150/min (the key says 147). The QRS is narrow. A regular narrow tachycardia.' },
      { title: 'Look for P waves in II, III and aVF', text: 'There is no normal P wave in front of each QRS. Instead the baseline has a repeating saw-tooth pattern.' },
      { title: 'Count the flutter waves', text: 'Two flutter waves for every QRS: an atrial rate of about 300/min with 2:1 conduction. One wave of each pair is partly hidden in the QRS or T.' },
      { title: 'Say the answer and act', text: 'Atrial flutter with 2:1 block, ventricular rate about 150/min. If stable: control the rate or plan cardioversion, look for a trigger, and assess stroke risk as for AF.' },
    ],
  },
  guided: [
    { ecg: 'ptbxl-12542', hint: 'Measure three R–R intervals in a row. Are any two the same? Now look for P waves in front of each QRS.' },
    { ecg: 'ptbxl-7889', hint: 'It is regular and fast. Is there a P wave in front of each QRS, or can you not find any?' },
    { ecg: 'ptbxl-4117', hint: 'Count the QRS complexes on the 10-second strip and multiply by 6: is it over 110? Then look at the rhythm and the baseline.' },
  ],
  pools: { sinus: [...AF, ...FLUTTER, ...SVT, ...STACH], other: [], pre: 4, check: 10, checkOther: 0, pass: 8 },
  fields: ['rate'],
  question: 'What is the rhythm?',
  answer: { af: 'af', flutter: 'flutter', svt: 'svt', sinus_tachy: 'stach' },
  options: [['stach', 'Sinus tachycardia'], ['af', 'Atrial fibrillation'], ['flutter', 'Atrial flutter'], ['svt', 'SVT (AVNRT or AVRT)']],
};
