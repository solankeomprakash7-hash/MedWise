// Redeems a pilot or institution access code: unlocks a plan until the code's end date, with no payment.
// Codes live only in the Netlify environment variable ECG_ACCESS_CODES, never in the browser:
//   ECG_ACCESS_CODES = CODE:plan:YYYY-MM-DD[,CODE:plan:YYYY-MM-DD...]
//   e.g. MEDWISE-PILOT:pro:2027-01-31,GMC-INTERNS:student:2027-06-30
// Needs FIREBASE_SERVICE_ACCOUNT as well. Each redemption is recorded in Firestore `redemptions/{uid}` (server only).
import { timingSafeEqual } from 'node:crypto';
import { admin, json, uidFrom } from './_ecgShared';

type Code = { code: string; plan: 'student' | 'pro'; until: string };
const RANK = { free: 0, student: 1, pro: 2 } as const;
const MAX_TRIES = 8, WINDOW_MS = 60 * 60 * 1000; // wrong codes per account per hour

function codes(): Code[] {
  return (process.env.ECG_ACCESS_CODES || '').split(',').map(s => s.trim()).filter(Boolean).flatMap(s => {
    const [code, plan, until] = s.split(':').map(x => (x || '').trim());
    if (!code || (plan !== 'student' && plan !== 'pro') || !/^\d{4}-\d{2}-\d{2}$/.test(until)) return [];
    return [{ code: code.toUpperCase(), plan, until: `${until}T23:59:59.000Z` }];
  });
}
const same = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!process.env.FIREBASE_SERVICE_ACCOUNT || !codes().length) return json({ error: 'Access codes are not switched on.' }, 501);
  const uid = await uidFrom(req); if (!uid) return json({ error: 'Sign in with a verified email first.' }, 401);
  const { code } = await req.json().catch(() => ({})) as { code?: string };
  const entered = String(code || '').trim().toUpperCase().slice(0, 64);
  const { db } = admin(), log = db.doc(`redemptions/${uid}`);

  // Slow down guessing: a limited number of wrong codes per account per hour.
  const prev = (await log.get()).data() || {};
  const now = Date.now(), recent = (prev.fails || []).filter((t: number) => now - t < WINDOW_MS);
  if (recent.length >= MAX_TRIES) return json({ error: 'Too many wrong codes. Try again in an hour.' }, 429);

  const hit = codes().find(c => same(c.code, entered));
  if (!hit) { await log.set({ fails: [...recent, now] }, { merge: true }); return json({ error: 'That code is not valid. Check the spelling and try again.' }, 400); }
  if (hit.until < new Date().toISOString()) return json({ error: 'That code has expired.' }, 400);

  const user = db.doc(`users/${uid}`); const cur = (await user.get()).data() || {};
  const curPlan = (cur.planUntil && cur.planUntil >= new Date().toISOString() ? cur.plan : 'free') as keyof typeof RANK;
  // Never downgrade: keep a better plan, or the same plan with a later end date.
  if ((RANK[curPlan] ?? 0) > RANK[hit.plan] || (curPlan === hit.plan && cur.planUntil >= hit.until))
    return json({ ok: true, plan: curPlan, until: cur.planUntil, unchanged: true });
  await user.set({ plan: hit.plan, planUntil: hit.until }, { merge: true });
  await log.set({ code: hit.code, plan: hit.plan, until: hit.until, at: new Date().toISOString(), fails: [] }, { merge: true });
  return json({ ok: true, plan: hit.plan, until: hit.until });
};
