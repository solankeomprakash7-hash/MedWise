// Grading, spaced repetition, daily ECG and plan limits.
import REAL from '../data/realEcgs.json';
import MODEL from '../data/modelEcgs.json';
import { ACTS, AXES, RHYTHMS, TAGS, axisCat, label } from '../data/options';
import { type Card, type Plan, type Progress, addDays, today, weekKey } from './progress';
import { UNITS } from '../data/curriculum';

export type RealKey = { hr: number | null; regular: boolean; axis: number | null; pr: number | null; qrs: number | null; qt: number | null;
  rhythm: string[]; tags: string[]; opt: string[]; act: string[] };
export type RealEcg = { id: string; src: string; rec: string; pattern: string; title: string; level: number; age: string; sex: string; key: RealKey; teach: string; draft: boolean; model?: boolean };
const realTitle = new Map((REAL as RealEcg[]).map(e => [e.pattern, e.title]));
/** Real ECGs first; model tracings cover emergencies the open datasets lack. Shared patterns use the real-ECG title. */
export const ECGS: RealEcg[] = [...(REAL as RealEcg[]), ...(MODEL as RealEcg[]).map(e => ({ ...e, title: realTitle.get(e.pattern) || e.title }))];
/** Answers that also count as right for a pattern. */
export const DX_ALSO: Record<string, string[]> = { mobitz1: ['avb2'], mobitz2: ['avb2'], avb2: ['mobitz1', 'mobitz2'], af_rvr: ['af'], af: ['af_rvr'] };
export const dxOk = (pattern: string, ans?: string) => !!ans && (ans === pattern || (DX_ALSO[pattern] || []).includes(ans));
export const byId = (id: string) => ECGS.find(e => e.id === id)!;
export const imgOf = (id: string) => id.startsWith('model-') ? `/ecg/model/${id}.webp` : `/ecg/real/${id}.webp`;
export const DX = [...new Map(ECGS.map(e => [e.pattern, e.title])).entries()].sort((a, b) => a[1].localeCompare(b[1]));

// ---------- plan limits ----------
export const FREE_UNITS = ['l1-heart', 'l1-paper', 'l1-p'];
export const FREE_READS_PER_WEEK = 5;
export const unitOpen = (plan: Plan, unitId: string) => plan === 'pro' || FREE_UNITS.includes(unitId) || (plan === 'student' && !unitId.startsWith('l3') && !unitId.startsWith('l4'));
export const EMERGENCY_SAMPLE = 3, EXAM_SAMPLE = 5;
export const readsLeft = (plan: Plan, p: Progress) => plan !== 'free' ? Infinity : Math.max(0, FREE_READS_PER_WEEK - (p.week.key === weekKey() ? p.week.reads : 0));

// ---------- grading ----------
export type Answer = { rate?: number; reg?: 'reg' | 'irr'; rhythm?: string; axis?: string; pr?: number; noPR?: boolean; qrs?: number; qt?: number; tags: string[]; dx?: string; act?: string };
export type Row = { key: string; label: string; you: string; ans: string; ok: boolean | null; tip: string };
export const TIPS: Record<string, string> = {
  rate: 'Regular: 300 ÷ big squares between R waves. Irregular: count QRS complexes on the 10-second strip × 6.',
  reg: 'Measure three or four R–R intervals on the rhythm strip; more than 1–2 small squares of difference means irregular.',
  rhythm: 'Ask: a P before every QRS? A QRS after every P? Narrow or wide? No P with an irregular rhythm is AF until proven otherwise.',
  axis: 'I and aVF both positive = normal. I positive, aVF negative: check II (positive = normal, negative = left). I negative, aVF positive = right.',
  pr: 'Start of the P to the first deflection of the QRS, usually in II. Normal 120–200 ms.',
  qrs: 'First to last deflection in the lead where the QRS is widest, often V1–V3. 120 ms or more is broad.',
  qt: 'Start of the QRS to the end of the T in II or V5 (tangent method). Then QTc = QT ÷ √RR.',
  tags: 'Compare the ST at the J point with the PR baseline lead by lead; group changes by territory; then T, Q, and extras.',
  dx: 'Combine the steps: rhythm and conduction first, then territory of any ST change, then chamber clues.',
  act: 'Ask what this ECG obliges you to do in the next 10 minutes.',
};
const near = (v: number | undefined, x: number, t: number) => v != null && !isNaN(v) && Math.abs(v - x) <= t;

export function grade(e: RealEcg, a: Answer): Row[] {
  const k = e.key, rows: Row[] = [];
  const push = (key: string, lbl: string, you: string, ans: string, ok: boolean | null) => rows.push({ key, label: lbl, you, ans, ok, tip: TIPS[key] });
  if (k.hr == null) push('rate', 'Rate', a.rate ? `${a.rate}/min` : '—', 'not graded', null);
  else push('rate', 'Rate', a.rate ? `${a.rate}/min` : '—', `${k.hr}/min`, near(a.rate, k.hr, Math.max(k.regular ? 8 : 12, k.hr * (k.regular ? 0.1 : 0.15))));
  push('reg', 'Regularity', a.reg ? (a.reg === 'reg' ? 'Regular' : 'Irregular') : '—', k.regular ? 'Regular' : 'Irregular', a.reg ? (a.reg === 'reg') === k.regular : false);
  push('rhythm', 'Rhythm', label(RHYTHMS, a.rhythm), k.rhythm.map(r => label(RHYTHMS, r)).join(' or '), !!a.rhythm && k.rhythm.includes(a.rhythm));
  if (k.axis == null) push('axis', 'Axis', label(AXES, a.axis), 'not graded', null);
  else { const ok = new Set([axisCat(k.axis - 15), axisCat(k.axis), axisCat(k.axis + 15)]);
    push('axis', 'Axis', label(AXES, a.axis), `${label(AXES, axisCat(k.axis))} (${k.axis > 0 ? '+' : ''}${k.axis}°)`, !!a.axis && ok.has(a.axis)); }
  if (k.pr == null) push('pr', 'PR', a.noPR ? 'no fixed PR' : a.pr ? `${a.pr} ms` : '—', 'not graded', null);
  else push('pr', 'PR', a.noPR ? 'no fixed PR' : a.pr ? `${a.pr} ms` : '—', `${k.pr} ms`, !a.noPR && near(a.pr, k.pr, 30));
  if (k.qrs == null) push('qrs', 'QRS', a.qrs ? `${a.qrs} ms` : '—', 'not graded', null);
  else push('qrs', 'QRS', a.qrs ? `${a.qrs} ms` : '—', `${k.qrs} ms`, near(a.qrs, k.qrs, 25));
  if (k.qt == null) push('qt', 'QT', a.qt ? `${a.qt} ms` : '—', 'not graded', null);
  else push('qt', 'QT', a.qt ? `${a.qt} ms` : '—', `${k.qt} ms`, near(a.qt, k.qt, 40));
  const you = a.tags.filter(t => t !== 'none'), allowed = new Set([...k.tags, ...k.opt]);
  const missed = k.tags.filter(t => !you.includes(t)), extra = you.filter(t => !allowed.has(t));
  const names = (l: string[]) => l.length ? l.map(t => label(TAGS, t)).join(', ') : 'none';
  const tagRow = { key: 'tags', label: 'ST–T and extras', you: a.tags.length ? names(you) : '—', ans: names(k.tags) + (k.opt.length ? ` (also fine: ${names(k.opt)})` : ''),
    ok: a.tags.length > 0 && !missed.length && !extra.length,
    tip: [missed.length ? `Missed: ${names(missed)}.` : '', extra.length ? `Not expected: ${names(extra)}.` : '', TIPS.tags].filter(Boolean).join(' ') };
  rows.push(tagRow);
  const dxTitle = (DX.find(d => d[0] === a.dx) || [null, '—'])[1];
  push('dx', 'Diagnosis', dxTitle, e.title, dxOk(e.pattern, a.dx));
  push('act', 'Next step', label(ACTS, a.act), k.act.map(x => label(ACTS, x)).join(' or '), !!a.act && k.act.includes(a.act));
  return rows;
}

// ---------- spaced repetition (Leitner boxes) ----------
const GAP = [0, 1, 3, 7, 21, 45];
export function review(card: Card | undefined, passed: boolean): Card {
  const c = card || { box: 0, due: today(), seen: 0, right: 0 };
  const box = passed ? Math.min(GAP.length - 1, c.box + 1) : 0;
  return { box, due: addDays(today(), passed ? GAP[box] : 1), seen: c.seen + 1, right: c.right + (passed ? 1 : 0) };
}
export const passed = (rows: Row[]) => {
  const g = rows.filter(r => r.ok != null), right = g.filter(r => r.ok).length;
  return rows.find(r => r.key === 'dx')!.ok === true && right / g.length >= 0.7;
};

/** Practice levels: placed level and below; Level 3–4 ECGs only once the learner is placed at 3+. */
export const poolFor = (p: Progress) => ECGS.filter(e => e.level <= Math.max(2, p.level ?? 1));
export function dueCards(p: Progress) { const t = today(); return Object.entries(p.cards).filter(([, c]) => c.due <= t).map(([id]) => id); }
export function nextEcg(p: Progress, avoid?: string): RealEcg {
  const due = dueCards(p).filter(id => id !== avoid);
  if (due.length) return byId(due[0]);
  const pool = poolFor(p).filter(e => !p.cards[e.id] && e.id !== avoid);
  const from = pool.length ? pool : poolFor(p).filter(e => e.id !== avoid);
  return from[Math.floor(Math.random() * from.length)];
}

// ---------- daily ECG ----------
const hash = (s: string) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
export function dailyEcg(p: Progress, date = today()) { const pool = poolFor(p); return pool[hash(date) % pool.length]; }
export function bumpDaily(p: Progress, date = today()): Progress['daily'] {
  if (p.daily.last === date) return p.daily;
  const streak = p.daily.last === addDays(date, -1) ? p.daily.streak + 1 : 1;
  return { last: date, streak, best: Math.max(p.daily.best, streak) };
}

// ---------- learning path ----------
export const nextUnit = (p: Progress) => UNITS.find(u => u.level >= (p.level ?? 1) && !p.units[u.id]?.done) || null;
export const skillPct = (p: Progress, k: string) => { const v = p.skills[k]; return v && v[1] ? Math.round(100 * v[0] / v[1]) : null; };
