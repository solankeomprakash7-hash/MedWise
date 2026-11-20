import * as React from 'react';
import { useApp } from '../EcgApp';
import { auth } from '../../lib/firebase';
import { Check } from 'lucide-react';

type PlanKey = 'student' | 'pro'; type Period = 'month' | 'year';
const PRICE: Record<PlanKey, Record<Period, number>> = { student: { month: 199, year: 1499 }, pro: { month: 499, year: 2999 } };
const FEATS: Record<'free' | PlanKey, string[]> = {
  free: ['Placement test and skill report', 'First 3 units of Level 1', '5 real-ECG reads a week', "Today's ECG, emergency and exam samples"],
  student: ['All of Levels 1 and 2', 'Unlimited real-ECG reads', 'Spaced repetition of your mistakes', 'Full 20-question exam papers'],
  pro: ['Everything in Student', 'Level 3 Emergencies now, Level 4 when released', 'Full emergency-mode rounds', 'Emergency ECGs in your practice and exam papers'],
};

declare global { interface Window { Razorpay?: new (o: object) => { open: () => void } } }
const loadCheckout = () => new Promise<void>((res, rej) => {
  if (window.Razorpay) return res();
  const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = () => res(); s.onerror = () => rej(new Error('Could not load the payment window.'));
  document.body.appendChild(s);
});

export default function Upgrade() {
  const { plan, user, signIn } = useApp();
  const [period, setPeriod] = React.useState<Period>('year');
  const [busy, setBusy] = React.useState<PlanKey | null>(null);
  const [msg, setMsg] = React.useState('');

  async function buy(k: PlanKey) {
    if (!user) { signIn(); return; }
    setBusy(k); setMsg('');
    try {
      const token = await auth.currentUser!.getIdToken();
      const r = await fetch('/.netlify/functions/ecg-order', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ plan: k, period }) });
      if (r.status === 501) throw new Error('Payments are not switched on yet. Your account stays on the free plan for now.');
      if (!r.ok) throw new Error('Could not start the payment. Please try again.');
      const o = await r.json();
      await loadCheckout();
      new window.Razorpay!({
        key: o.keyId, order_id: o.orderId, amount: o.amount, currency: 'INR', name: 'MedWise ECG',
        description: `${k === 'pro' ? 'Pro' : 'Student'} plan, 1 ${period}`, prefill: { email: user.email || '', name: user.displayName || '' },
        theme: { color: '#004a80' },
        handler: async (resp: Record<string, string>) => {
          const v = await fetch('/.netlify/functions/ecg-verify', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await auth.currentUser!.getIdToken()}` }, body: JSON.stringify(resp) });
          setMsg(v.ok ? 'Payment received. Your plan is active.' : 'Payment received but not yet confirmed. It will activate within a few minutes; contact us if it does not.');
        },
        modal: { ondismiss: () => setBusy(null) },
      }).open();
    } catch (e) { setMsg((e as Error).message); }
    setBusy(null);
  }

  const Card = ({ k, title, price }: { k: 'free' | PlanKey; title: string; price: string }) => (
    <div className={`border bg-white p-5 flex flex-col gap-3 ${k === 'student' ? 'border-nejm-blue shadow-[inset_0_3px_0_#991b1b]' : 'border-nejm-border'}`}>
      <div><p className="font-serif font-bold text-xl text-nejm-blue">{title}</p><p className="font-mono text-2xl tabular-nums mt-1">{price}</p></div>
      <ul className="flex flex-col gap-1.5 text-sm flex-1">{FEATS[k].map(f => <li key={f} className="flex gap-2"><Check size={16} className="text-green-700 shrink-0 mt-0.5" />{f}</li>)}</ul>
      {k === 'free' ? <p className="text-xs text-slate-500">{plan === 'free' ? 'Your current plan' : ''}</p>
        : plan === k ? <p className="text-sm font-bold text-green-800">Your current plan</p>
        : <button className="nejm-btn" disabled={!!busy} onClick={() => buy(k)}>{busy === k ? 'Opening…' : `Get ${title}`}</button>}
    </div>
  );
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div><h1 className="text-3xl font-serif font-bold">Plans</h1><p className="text-slate-600 mt-1">Prices in Indian rupees, including taxes. Pay by UPI, card or net banking.</p></div>
        <div className="inline-flex border border-nejm-border text-xs font-bold uppercase tracking-widest" role="group" aria-label="Billing period">
          {(['month', 'year'] as Period[]).map(x => <button key={x} aria-pressed={period === x} onClick={() => setPeriod(x)} className={`px-4 py-2 ${period === x ? 'bg-nejm-blue text-white' : 'bg-white text-nejm-blue'}`}>{x === 'month' ? 'Monthly' : 'Yearly · save ~40%'}</button>)}
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Card k="free" title="Free" price="₹0" />
        <Card k="student" title="Student" price={`₹${PRICE.student[period].toLocaleString('en-IN')}/${period}`} />
        <Card k="pro" title="Pro" price={`₹${PRICE.pro[period].toLocaleString('en-IN')}/${period}`} />
      </div>
      {msg && <p className="text-sm text-nejm-blue" role="status">{msg}</p>}
      <p className="text-xs text-slate-500">Colleges and hospitals: seat licences with faculty reports are available on request.</p>
    </section>
  );
}
