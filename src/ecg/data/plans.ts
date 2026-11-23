// Plans and prices, shared by the Upgrade page, the Lab and the locked-module screens.
import { LAB_MODULES } from './labModules';

export type PaidPlan = 'student' | 'pro';
export type Period = 'month' | 'year';
export const PRICE: Record<PaidPlan, Record<Period, number>> = { student: { month: 199, year: 1499 }, pro: { month: 499, year: 2999 } };
export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const count = (t: string) => LAB_MODULES.filter(m => m.tier === t).length;
const range = (t: string) => { const ns = LAB_MODULES.filter(m => m.tier === t).map(m => m.n); return ns.length ? `${Math.min(...ns)}–${Math.max(...ns)}` : ''; };

export const FEATS: Record<'free' | PaidPlan, string[]> = {
  free: [`Lab modules ${range('free')}: waves, intervals and sinus rhythm`, 'Placement test and skill report', 'First 3 units of Level 1', '5 real-ECG reads a week', "Today's ECG, emergency and exam samples"],
  student: ['Everything in Free', `Lab modules ${range('student')}: blocks, bundles, SVT, chambers, read drill`, 'All of Levels 1 and 2', 'Unlimited real-ECG reads', 'Spaced repetition of your mistakes', 'Full 20-question exam papers'],
  pro: ['Everything in Student', `All ${LAB_MODULES.length} lab modules, including ACS, VT/VF, electrolytes and mimics`, `${LAB_MODULES.find(m => m.id === 'cases')?.stations.length ?? 18} interactive clinical cases`, 'Levels 3 and 4: Emergencies and Advanced', 'Full emergency-mode rounds'],
};

/** Rows for the plan comparison table: [feature, free, student, pro]; true/false or a short value. */
export const COMPARE: [string, string | boolean, string | boolean, string | boolean][] = [
  ['Interactive lab modules', `${count('free')} of ${LAB_MODULES.length}`, `${count('free') + count('student')} of ${LAB_MODULES.length}`, `All ${LAB_MODULES.length}`],
  ['Animated heart, vectors and 12-lead', true, true, true],
  ['Lab clinical cases', false, false, '18 cases'],
  ['Learning-path units', '3', '12 (Levels 1–2)', '24 (Levels 1–4)'],
  ['Real 12-lead ECG reads', '5 a week', 'Unlimited', 'Unlimited'],
  ['Spaced repetition of mistakes', false, true, true],
  ["Today's ECG and streak", true, true, true],
  ['Emergency mode (30 s per ECG)', '3-ECG sample', '3-ECG sample', 'Full rounds'],
  ['Exam papers', '5-question sample', 'Full 20 questions', 'Full, with emergency ECGs'],
  ['Progress synced across devices', 'With a free account', true, true],
];
