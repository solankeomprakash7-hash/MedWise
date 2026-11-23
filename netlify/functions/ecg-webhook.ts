// Razorpay webhook: activates the plan even if the learner closed the payment window before the
// browser could confirm. Set up in Razorpay → Account & Settings → Webhooks:
//   URL    https://<your-site>/.netlify/functions/ecg-webhook
//   Secret any long random text; put the same text in Netlify as RAZORPAY_WEBHOOK_SECRET
//   Events order.paid
import { createHmac, timingSafeEqual } from 'node:crypto';
import { activate, json } from './_ecgShared';

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !process.env.FIREBASE_SERVICE_ACCOUNT) return json({ error: 'Webhook not configured' }, 501);
  const raw = await req.text(); // the signature covers the exact bytes Razorpay sent
  const sig = req.headers.get('x-razorpay-signature') || '';
  const want = createHmac('sha256', secret).update(raw).digest('hex');
  if (want.length !== sig.length || !timingSafeEqual(Buffer.from(want), Buffer.from(sig))) return json({ error: 'Bad signature' }, 400);
  let ev: { event?: string; payload?: { order?: { entity?: { id?: string } }; payment?: { entity?: { id?: string; amount?: number; status?: string } } } };
  try { ev = JSON.parse(raw); } catch { return json({ error: 'Bad body' }, 400); }
  if (ev.event !== 'order.paid') return json({ ignored: ev.event ?? 'unknown' }); // 200, so Razorpay does not retry
  const oid = ev.payload?.order?.entity?.id, pay = ev.payload?.payment?.entity;
  if (!oid || !pay?.id || pay.status !== 'captured') return json({ ignored: 'not captured' });
  // Orders not created by this site (unknown id) are acknowledged and left alone.
  const ok = await activate(oid, pay.id, { amount: pay.amount, via: 'webhook' });
  return json({ ok });
};
