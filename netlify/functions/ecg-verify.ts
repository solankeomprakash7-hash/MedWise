// Verifies the Razorpay signature and activates the plan on users/{uid}.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { admin, configured, json, uidFrom } from './_ecgShared';

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!configured()) return json({ error: 'Payments are not configured' }, 501);
  const uid = await uidFrom(req); if (!uid) return json({ error: 'Sign in first' }, 401);
  const b = await req.json().catch(() => ({}));
  const { razorpay_order_id: oid, razorpay_payment_id: pid, razorpay_signature: sig } = b;
  if (!oid || !pid || !sig) return json({ error: 'Missing payment fields' }, 400);
  const want = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!).update(`${oid}|${pid}`).digest('hex');
  if (want.length !== sig.length || !timingSafeEqual(Buffer.from(want), Buffer.from(sig))) return json({ error: 'Bad signature' }, 400);
  const { db } = admin(); const pay = db.doc(`payments/${oid}`); const ps = await pay.get();
  if (!ps.exists || ps.get('uid') !== uid) return json({ error: 'Unknown order' }, 400);
  if (ps.get('status') !== 'paid') {
    const user = db.doc(`users/${uid}`); const cur = (await user.get()).data() || {};
    const start = cur.planUntil && cur.planUntil > new Date().toISOString() ? new Date(cur.planUntil) : new Date();
    if (ps.get('period') === 'year') start.setFullYear(start.getFullYear() + 1); else start.setMonth(start.getMonth() + 1);
    await db.runTransaction(async t => {
      t.set(user, { plan: ps.get('plan'), planUntil: start.toISOString() }, { merge: true });
      t.update(pay, { status: 'paid', paymentId: pid, paidAt: new Date().toISOString() });
    });
  }
  return json({ ok: true });
};
