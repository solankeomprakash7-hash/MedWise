// Shared helpers for the ECG payment functions. Needs these environment variables in Netlify:
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET  - from the Razorpay dashboard
//   FIREBASE_SERVICE_ACCOUNT              - the Firebase service-account JSON, as one line
//   RAZORPAY_WEBHOOK_SECRET               - the secret set on the Razorpay webhook (ecg-webhook.ts)
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export const PRICES: Record<string, Record<string, number>> = { student: { month: 19900, year: 149900 }, pro: { month: 49900, year: 299900 } }; // paise
export const configured = () => !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.FIREBASE_SERVICE_ACCOUNT);

export function admin() {
  if (!getApps().length) initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)) });
  return { auth: getAuth(), db: getFirestore(firebaseConfig.firestoreDatabaseId) };
}
export async function uidFrom(req: Request) {
  const t = (req.headers.get('authorization') || '').replace(/^Bearer /, '');
  if (!t) return null;
  try { const d = await admin().auth.verifyIdToken(t); return d.email_verified ? d.uid : null; } catch { return null; }
}
export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/**
 * Marks order `oid` paid and extends the learner's plan. Safe to call twice (browser and webhook):
 * the status check runs inside the transaction, so a plan is never extended twice for one order.
 * `uid`, when given, must own the order. Returns false if the order is unknown or belongs to someone else.
 */
export async function activate(oid: string, pid: string, opts: { uid?: string; amount?: number; via: 'browser' | 'webhook' }) {
  const { db } = admin(); const pay = db.doc(`payments/${oid}`);
  return db.runTransaction(async t => {
    const ps = await t.get(pay);
    if (!ps.exists || (opts.uid && ps.get('uid') !== opts.uid)) return false;
    if (opts.amount != null && opts.amount !== ps.get('amount')) return false;
    if (ps.get('status') === 'paid') return true;
    const user = db.doc(`users/${ps.get('uid')}`); const cur = (await t.get(user)).data() || {};
    const now = new Date().toISOString();
    const until = cur.planUntil && cur.planUntil > now ? new Date(cur.planUntil) : new Date();
    if (ps.get('period') === 'year') until.setFullYear(until.getFullYear() + 1); else until.setMonth(until.getMonth() + 1);
    t.set(user, { plan: ps.get('plan'), planUntil: until.toISOString() }, { merge: true });
    t.update(pay, { status: 'paid', paymentId: pid, paidAt: now, activatedVia: opts.via });
    return true;
  });
}
