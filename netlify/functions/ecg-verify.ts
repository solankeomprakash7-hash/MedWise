// Verifies the Razorpay signature and activates the plan on users/{uid}.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { activate, configured, json, uidFrom } from './_ecgShared';

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!configured()) return json({ error: 'Payments are not configured' }, 501);
  const uid = await uidFrom(req); if (!uid) return json({ error: 'Sign in first' }, 401);
  const b = await req.json().catch(() => ({}));
  const { razorpay_order_id: oid, razorpay_payment_id: pid, razorpay_signature: sig } = b;
  if (!oid || !pid || !sig) return json({ error: 'Missing payment fields' }, 400);
  const want = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!).update(`${oid}|${pid}`).digest('hex');
  if (want.length !== sig.length || !timingSafeEqual(Buffer.from(want), Buffer.from(sig))) return json({ error: 'Bad signature' }, 400);
  if (!(await activate(oid, pid, { uid, via: 'browser' }))) return json({ error: 'Unknown order' }, 400);
  return json({ ok: true });
};
