// Creates a Razorpay order for a plan. The amount is set here, never by the browser.
import { PRICES, admin, configured, json, uidFrom } from './_ecgShared';

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!configured()) return json({ error: 'Payments are not configured' }, 501);
  const uid = await uidFrom(req); if (!uid) return json({ error: 'Sign in first' }, 401);
  const { plan, period } = await req.json().catch(() => ({}));
  const amount = PRICES[plan]?.[period]; if (!amount) return json({ error: 'Unknown plan' }, 400);
  const basic = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  const r = await fetch('https://api.razorpay.com/v1/orders', { method: 'POST', headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency: 'INR', receipt: `ecg_${uid.slice(0, 12)}_${Date.now()}`, notes: { uid, plan, period } }) });
  if (!r.ok) return json({ error: 'Razorpay refused the order' }, 502);
  const o = await r.json();
  await admin().db.doc(`payments/${o.id}`).set({ uid, plan, period, amount, status: 'created', createdAt: new Date().toISOString() });
  return json({ orderId: o.id, amount, keyId: process.env.RAZORPAY_KEY_ID });
};
