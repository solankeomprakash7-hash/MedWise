// Learner progress. Signed-in learners: Firestore doc users/{uid}/ecg/progress (plan lives on users/{uid},
// which only the server may write). Guests: browser storage, merged into the account on sign-in.
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export type Card = { box: number; due: string; seen: number; right: number };
export type Progress = {
  v: 1;
  level: number | null;               // starting level from placement (null = not placed)
  placement?: { sec: number[]; total: number; at: string };
  units: Record<string, { done: boolean; score: number; at: string }>;
  cards: Record<string, Card>;        // spaced repetition, keyed by real-ECG id
  skills: Record<string, [number, number]>; // drill step -> [right, total]
  daily: { last: string | null; streak: number; best: number };
  week: { key: string; reads: number };
};
export type Plan = 'free' | 'student' | 'pro';

export const empty = (): Progress => ({ v: 1, level: null, units: {}, cards: {}, skills: {}, daily: { last: null, streak: 0, best: 0 }, week: { key: '', reads: 0 } });

const LS = 'medwise-ecg-progress';
export const localLoad = (): Progress => { try { const v = JSON.parse(localStorage.getItem(LS) || 'null'); return v && v.v === 1 ? v : empty(); } catch { return empty(); } };
export const localSave = (p: Progress) => { try { localStorage.setItem(LS, JSON.stringify(p)); } catch { /* storage blocked */ } };

const ref = (uid: string) => doc(db, 'users', uid, 'ecg', 'progress');

/** Merge two progress records, keeping the better or later value of each item. */
export function merge(a: Progress, b: Progress): Progress {
  const out = empty();
  out.level = Math.max(a.level ?? 0, b.level ?? 0) || null;
  out.placement = (a.placement?.at ?? '') > (b.placement?.at ?? '') ? a.placement : b.placement;
  out.units = { ...a.units };
  for (const [k, v] of Object.entries(b.units)) if (!out.units[k] || v.score > out.units[k].score) out.units[k] = v;
  out.cards = { ...a.cards };
  for (const [k, v] of Object.entries(b.cards)) if (!out.cards[k] || v.seen > out.cards[k].seen) out.cards[k] = v;
  out.skills = { ...a.skills };
  for (const [k, v] of Object.entries(b.skills)) { const o = out.skills[k] || [0, 0]; out.skills[k] = [o[0] + v[0], o[1] + v[1]]; }
  out.daily = (a.daily.last ?? '') >= (b.daily.last ?? '') ? a.daily : b.daily;
  out.daily = { ...out.daily, best: Math.max(a.daily.best, b.daily.best) };
  out.week = a.week.key === b.week.key ? { key: a.week.key, reads: Math.max(a.week.reads, b.week.reads) } : (a.week.key > b.week.key ? a.week : b.week);
  return out;
}

export async function cloudLoad(uid: string): Promise<Progress | null> {
  const s = await getDoc(ref(uid));
  return s.exists() ? (s.data() as Progress) : null;
}
export async function cloudSave(uid: string, p: Progress) { await setDoc(ref(uid), p); }

/** Plan is read from users/{uid}.plan; anything unrecognised counts as free. */
export function watchPlan(uid: string, cb: (p: Plan) => void) {
  return onSnapshot(doc(db, 'users', uid), s => {
    const v = s.exists() ? (s.data() as { plan?: string; planUntil?: string }) : {};
    const live = !v.planUntil || v.planUntil >= new Date().toISOString();
    cb(live && (v.plan === 'student' || v.plan === 'pro') ? v.plan : 'free');
  }, () => cb('free'));
}

// ---- dates ----
export const today = () => new Date().toISOString().slice(0, 10);
export const addDays = (d: string, n: number) => { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
export const weekKey = (d = new Date()) => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return `${t.getUTCFullYear()}-W${Math.ceil(((+t - +y) / 864e5 + 1) / 7)}`; };
