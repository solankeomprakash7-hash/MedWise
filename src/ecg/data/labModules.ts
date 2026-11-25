// The interactive lab as a course of modules. Each module opens public/ecg-lab.html limited to its own
// patterns, modes and cases (?embed=1&module=…&only=…&tabs=…&cases=…); the lab reports progress back.
import type { LabProgress, Plan } from '../lib/progress';
import { COURSES, COURSE_STEPS } from './course';

export type Station = { id: string; name: string };
export type Tier = Plan; // 'free' | 'student' | 'pro'
export type Check =
  | { kind: 'explore' }                 // every station opened
  | { kind: 'quiz'; need: number }      // every station opened + `need` tracings named correctly in the module quiz
  | { kind: 'cases' }                   // every case finished
  | { kind: 'read'; need: number };     // `need` ECGs read with at least 70% of the graded steps right
export type LabModule = {
  id: string; n: number; title: string; tier: Tier; minutes: number; forWho: string;
  summary: string; objectives: string[];
  tabs: ('waves' | 'learn' | 'quiz' | 'cases' | 'read')[];
  stationKind: 'wave' | 'pattern' | 'case' | 'none';
  stations: Station[]; check: Check;
};

const W = (id: string, name: string): Station => ({ id, name });

export const LAB_MODULES: LabModule[] = [
  { id: 'waves', n: 1, title: 'Waves and intervals', tier: 'free', minutes: 50, forWho: 'Start here',
    summary: 'Watch one beat being written, letter by letter, while the heart depolarises on screen.',
    objectives: ['Name P, Q, R, S, T and U and the event behind each one', 'Measure PR, QRS and QT on the grid', 'Recognise the normal and abnormal forms of every wave'],
    tabs: ['waves'], stationKind: 'wave', check: { kind: 'explore' },
    stations: [W('overview', 'A beat, letter by letter'), W('P', 'P wave'), W('Q', 'Q wave'), W('R', 'R wave'), W('S', 'S wave'), W('T', 'T wave'), W('U', 'U wave')] },
  { id: 'sinus', n: 2, title: 'Sinus rhythm and rate', tier: 'free', minutes: 45, forWho: 'Start here',
    summary: 'The reference tracing, and what happens to it when the sinus node speeds up or slows down.',
    objectives: ['Confirm sinus rhythm in four checks', 'Calculate the rate two ways', 'Change the rate and watch the QT shorten'],
    tabs: ['learn', 'quiz'], stationKind: 'pattern', check: { kind: 'quiz', need: 3 },
    stations: [W('normal', 'Normal sinus rhythm'), W('sinus_brady', 'Sinus bradycardia'), W('sinus_tachy', 'Sinus tachycardia')] },
  { id: 'avblock', n: 3, title: 'AV blocks', tier: 'student', minutes: 45, forWho: 'Students and interns',
    summary: 'Watch the impulse stall in the AV node, then fail to cross it, beat by beat.',
    objectives: ['Tell first-degree, Mobitz I, Mobitz II and complete block apart', 'Find the block on the heart, not just the strip', 'Know which ones need pacing pads'],
    tabs: ['learn', 'quiz'], stationKind: 'pattern', check: { kind: 'quiz', need: 5 },
    stations: [W('avb1', 'First-degree AV block'), W('mobitz1', 'Mobitz I (Wenckebach)'), W('mobitz2', 'Mobitz II'), W('chb', 'Complete heart block')] },
  { id: 'bundles', n: 4, title: 'Bundle branches, fascicles and pacing', tier: 'student', minutes: 50, forWho: 'Students and interns',
    summary: 'Why a blocked bundle widens the QRS, how pre-excitation slurs it, and what a pacemaker looks like.',
    objectives: ['Read RBBB and LBBB from V1 and V6', 'Spot left axis deviation from a fascicular block', 'Recognise a delta wave and a paced rhythm'],
    tabs: ['learn', 'quiz'], stationKind: 'pattern', check: { kind: 'quiz', need: 5 },
    stations: [W('rbbb', 'Right bundle branch block'), W('lbbb', 'Left bundle branch block'), W('lafb', 'Left anterior fascicular block'), W('wpw', 'Wolff–Parkinson–White'), W('paced', 'Ventricular paced rhythm')] },
  { id: 'svt', n: 5, title: 'Atrial and narrow-complex rhythms', tier: 'student', minutes: 40, forWho: 'Students and interns',
    summary: 'Fibrillation, flutter circuits, re-entry and junctional escape, each drawn on the heart as it happens.',
    objectives: ['Separate AF, flutter and AVNRT at the bedside', 'Know when AF is rapid enough to treat now', 'Recognise a junctional rhythm'],
    tabs: ['learn', 'quiz'], stationKind: 'pattern', check: { kind: 'quiz', need: 5 },
    stations: [W('af', 'Atrial fibrillation'), W('af_rvr', 'AF with rapid ventricular response'), W('flutter', 'Atrial flutter, 2:1'), W('svt', 'AV nodal re-entry (AVNRT)'), W('junctional', 'Junctional rhythm')] },
  { id: 'chambers', n: 6, title: 'Chamber enlargement', tier: 'student', minutes: 20, forWho: 'Students and interns',
    summary: 'Thick walls make big voltages. See how LV and RV hypertrophy move the vector and strain the ST–T.',
    objectives: ['Apply a voltage criterion for LVH', 'Recognise the strain pattern', 'Spot right ventricular hypertrophy from V1'],
    tabs: ['learn', 'quiz'], stationKind: 'pattern', check: { kind: 'quiz', need: 3 },
    stations: [W('lvh', 'LV hypertrophy with strain'), W('rvh', 'Right ventricular hypertrophy')] },
  { id: 'read', n: 7, title: 'Systematic read drill', tier: 'student', minutes: 30, forWho: 'Everyone, weekly',
    summary: 'Read an unnamed tracing in nine graded steps, with calipers, against the clock.',
    objectives: ['Read every ECG in the same order', 'Measure intervals with calipers', 'See which step you get wrong most often'],
    tabs: ['read'], stationKind: 'none', check: { kind: 'read', need: 8 }, stations: [] },
  { id: 'ventricular', n: 8, title: 'Ventricular rhythms and arrest', tier: 'pro', minutes: 30, forWho: 'Interns and residents',
    summary: 'Ectopics, VT, torsades and VF: the rhythms where the next minute matters.',
    objectives: ['Call broad-complex tachycardia VT until proven otherwise', 'Recognise torsades and its triggers', 'Match each rhythm to shock, drug or observation'],
    tabs: ['learn', 'quiz'], stationKind: 'pattern', check: { kind: 'quiz', need: 5 },
    stations: [W('pvc', 'Ventricular bigeminy'), W('vt', 'Monomorphic VT'), W('tdp', 'Torsades de pointes'), W('vf', 'Ventricular fibrillation')] },
  { id: 'acs', n: 9, title: 'Ischaemia and infarction', tier: 'pro', minutes: 50, forWho: 'Interns and residents',
    summary: 'Territories, reciprocal change and the STEMI equivalents that are missed on night shifts.',
    objectives: ['Map ST elevation to its artery', 'Recognise posterior MI from V1–V3', 'Call Wellens, de Winter and the aVR pattern'],
    tabs: ['learn', 'quiz'], stationKind: 'pattern', check: { kind: 'quiz', need: 6 },
    stations: [W('stemi_ant', 'Anterior STEMI (LAD)'), W('stemi_inf', 'Inferior STEMI (RCA)'), W('stemi_post', 'Posterior MI'), W('old_inf', 'Old inferior MI'), W('nste_avr', 'Diffuse ST depression, aVR elevation'), W('wellens', 'Wellens syndrome'), W('dewinter', 'De Winter T waves')] },
  { id: 'metabolic', n: 10, title: 'Electrolytes, drugs and temperature', tier: 'pro', minutes: 30, forWho: 'Interns and residents',
    summary: 'Potassium, QT-prolonging drugs, digoxin and cold, each with its own signature.',
    objectives: ['Stage hyperkalaemia from the T wave to the sine wave', 'Recognise hypokalaemia and long QT', 'Spot digoxin effect and the Osborn wave'],
    tabs: ['learn', 'quiz'], stationKind: 'pattern', check: { kind: 'quiz', need: 5 },
    stations: [W('hyperk', 'Hyperkalaemia'), W('hypok', 'Hypokalaemia'), W('longqt', 'Long QT'), W('digoxin', 'Digoxin effect'), W('hypothermia', 'Hypothermia')] },
  { id: 'mimics', n: 11, title: 'Must-not-miss and mimics', tier: 'pro', minutes: 30, forWho: 'Residents and exam aspirants',
    summary: 'Pericarditis, Brugada, pulmonary embolism and the lead reversal that fools everyone once.',
    objectives: ['Separate pericarditis from STEMI', 'Recognise the type 1 Brugada pattern', 'Catch limb lead reversal before acting on it'],
    tabs: ['learn', 'quiz'], stationKind: 'pattern', check: { kind: 'quiz', need: 4 },
    stations: [W('pericarditis', 'Acute pericarditis'), W('brugada', 'Brugada pattern, type 1'), W('pe', 'Pulmonary embolism'), W('lead_rev', 'Limb lead reversal (LA–RA)')] },
  { id: 'cases', n: 12, title: 'Clinical cases', tier: 'pro', minutes: 90, forWho: 'Interns and residents',
    summary: 'Eighteen bedside stories: history and vitals first, then the ECG, then what you do next.',
    objectives: ['Read the ECG in its clinical context', 'Commit to a next step under time pressure', 'Learn from a worked answer after every question'],
    tabs: ['cases'], stationKind: 'case', check: { kind: 'cases' },
    stations: [
      W('c1', 'Crushing chest pain, sweating'), W('c2', 'Chest pain while climbing stairs'), W('c3', 'Sudden breathlessness after delivery'),
      W('c4', 'Weak legs after missed dialysis'), W('c5', 'Sudden pounding palpitations'), W('c6', 'Dizzy spells in an elderly woman'),
      W('c7', 'Irregular palpitations and weight loss'), W('c8', 'Fast heartbeat in a man with an old MI'), W('c9', 'Collapse on day three of treatment'),
      W('c10', 'Chest pain after a viral fever'), W('c11', 'Fever and a fainting spell'), W('c12', 'Headache and very high blood pressure'),
      W('c13', 'Cramps after three days of diarrhoea'), W('c14', 'A pre-op ECG that looks wrong'), W('c15', 'Chest pain, “no ST elevation”'),
      W('c16', 'Chest pain yesterday, fine today'), W('c17', 'Fast irregular pulse in septic shock'), W('c18', 'Elderly man found on the floor')] },
];

export const TIER_LABEL: Record<Tier, string> = { free: 'Free', student: 'Student', pro: 'Pro' };
export const labOpen = (plan: Plan, tier: Tier) => tier === 'free' || plan === 'pro' || (plan === 'student' && tier === 'student');

/** Patterns a learner may practise in the read drill: every pattern in the modules their plan opens. */
export const readPool = (plan: Plan) => LAB_MODULES.filter(m => m.stationKind === 'pattern' && labOpen(plan, m.tier)).flatMap(m => m.stations.map(s => s.id));

/** The lab URL for a module, limited to what the module (and the plan) includes. */
export function labSrc(m: LabModule, plan: Plan, start?: string) {
  const q = new URLSearchParams({ embed: '1', module: m.id, tabs: m.tabs.join(',') });
  if (m.stationKind === 'pattern') q.set('only', m.stations.map(s => s.id).join(','));
  if (m.check.kind === 'read' && plan !== 'pro') q.set('only', readPool(plan).join(','));
  const hash = start && m.stationKind === 'wave' ? `wave-${start}` : start && m.stationKind === 'pattern' ? start
    : m.tabs[0] === 'learn' ? m.stations[0]?.id : m.tabs[0];
  return `/ecg-lab.html?${q.toString()}#${hash}`;
}

/** How far a learner is through a module, and what is left. */
export function moduleStatus(m: LabModule, lp?: LabProgress) {
  if (COURSES[m.id]) { // full-format module: steps reached, done when the checkpoint is passed
    const c = lp?.course, steps = COURSE_STEPS.length, done = !!c?.passed;
    const at = Math.min(c?.step ?? 0, steps - 1);
    return { pct: done ? 100 : Math.round(100 * at / steps), done, todo: done ? '' : c?.step ? `Next: ${COURSE_STEPS[at]}` : `${steps} steps, ending in a checkpoint on unseen real ECGs`, seen: at, n: steps };
  }
  const seen = m.stations.filter(s => lp?.seen.includes(s.id)).length, n = m.stations.length, c = m.check;
  let have = seen, need = n, todo = '';
  if (c.kind === 'quiz') {
    const r = Math.min(lp?.right ?? 0, c.need); have += r; need += c.need;
    todo = seen < n ? `Open every station (${seen}/${n}), then name ${c.need} tracings in the quiz` : `Name ${c.need} tracings correctly in the quiz (${r}/${c.need})`;
  } else if (c.kind === 'read') {
    have = Math.min(lp?.reads ?? 0, c.need); need = c.need;
    todo = `Read ${c.need} ECGs with at least 7 in 10 steps right (${have}/${c.need})`;
  } else todo = c.kind === 'cases' ? `Finish every case (${seen}/${n})` : `Open every station (${seen}/${n})`;
  const done = !!lp?.done || (need > 0 && have >= need);
  return { pct: done ? 100 : need ? Math.round(100 * have / need) : 0, done, todo, seen, n };
}
