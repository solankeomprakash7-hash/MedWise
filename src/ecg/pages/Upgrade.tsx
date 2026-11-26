import * as React from 'react';
import { useApp } from '../EcgApp';
import { auth } from '../../lib/firebase';
import { Check, Minus, KeyRound } from 'lucide-react';
import { COMPARE, FEATS, PRICE, inr, type PaidPlan as PlanKey, type Period } from '../data/plans';

declare global { interface Window { Razorpay?: new (o: object) => { open: () => void } } }
const loadCheckout = () => new Promise<void>((res, rej) => {
  if (window.Razorpay) return res();
  const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = () => res(); s.onerror = () => rej(new Error('Could not load the payment window.'));
  document.body.appendChild(s);
});

export default function Upgrade({ code }: { code?: string }) {
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
        theme: { color: '#1a1c49' },
        handler: async (resp: Record<string, string>) => {
          const v = await fetch('/.netlify/functions/ecg-verify', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await auth.currentUser!.getIdToken()}` }, body: JSON.stringify(resp) });
          setMsg(v.ok ? 'Payment received. Your plan is active.' : 'Payment received but not yet confirmed. It will activate within a few minutes; contact us if it does not.');
        },
        modal: { ondismiss: () => setBusy(null) },
      }).open();
    } catch (e) { setMsg((e as Error).message); }
    setBusy(null);
  }

  const perMonth = (k: PlanKey) => period === 'year' ? `about ${inr(Math.round(PRICE[k].year / 12))} a month, paid once for 12 months` : 'paid once for 1 month';
  const Card = ({ k, title, price, who }: { k: 'free' | PlanKey; title: string; price: string; who: string }) => (
    <div className={`card p-5 flex flex-col gap-3 ${k === 'student' ? 'border-ink shadow-[inset_0_3px_0_var(--color-accent)]' : 'border-line'}`}>
      <div className="flex items-start justify-between gap-2"><p className="font-display text-xl text-ink">{title}</p>{k === 'student' && <span className="chip-accent">Best for students</span>}</div>
      <div><p className="font-mono text-2xl tabular-nums">{price}</p><p className="text-xs text-muted mt-1">{k === 'free' ? 'Free for ever. No card, no trial period.' : perMonth(k)}</p></div>
      <p className="text-sm text-muted">{who}</p>
      <ul className="flex flex-col gap-1.5 text-sm flex-1">{FEATS[k].map(f => <li key={f} className="flex gap-2"><Check size={16} className="text-ok shrink-0 mt-0.5" />{f}</li>)}</ul>
      {k === 'free' ? (plan === 'free' ? <a href="#/lab" className="btn-secondary">Start free</a> : <p className="text-xs text-muted">Included in your plan</p>)
        : plan === k ? <p className="text-sm font-bold text-ok">Your current plan</p>
        : <button className="btn-primary" disabled={!!busy} onClick={() => buy(k)}>{busy === k ? 'Opening…' : `Get ${title}`}</button>}
    </div>
  );
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div><p className="eyebrow eyebrow-dot">Plans</p><h1 className="text-3xl md:text-4xl font-display mt-1">Start free. Subscribe when you need more.</h1><p className="text-muted mt-1">Prices in Indian rupees, including taxes. Pay by UPI, card or net banking.</p></div>
        <div className="inline-flex border border-line rounded-sm overflow-hidden text-sm font-medium bg-card" role="group" aria-label="Billing period">
          {(['month', 'year'] as Period[]).map(x => <button key={x} aria-pressed={period === x} onClick={() => setPeriod(x)} className={`px-4 py-2 ${period === x ? 'bg-ink text-white' : 'bg-white text-ink'}`}>{x === 'month' ? 'Monthly' : 'Yearly · save ~40%'}</button>)}
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Card k="free" title="Free" price="₹0" who="Learn the basics: waves, intervals and sinus rhythm." />
        <Card k="student" title="Student" price={`${inr(PRICE.student[period])}/${period}`} who="Medical students and interns building a reading habit." />
        <Card k="pro" title="Pro" price={`${inr(PRICE.pro[period])}/${period}`} who="Interns, residents and doctors who handle emergencies." />
      </div>
      {msg && <p className="text-sm text-ink" role="status">{msg}</p>}
      <AccessCode initial={code} />
      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <caption className="text-left px-5 pt-5 pb-3 text-xl font-medium text-ink">Compare plans</caption>
          <thead><tr className="border-b border-line text-left">
            <th scope="col" className="px-5 py-2.5 font-medium text-muted">Feature</th>
            {(['Free', 'Student', 'Pro'] as const).map(t => <th key={t} scope="col" className={`px-3 py-2.5 font-medium ${plan === t.toLowerCase() ? 'text-accent-ink' : ''}`}>{t}{plan === t.toLowerCase() ? ' (yours)' : ''}</th>)}
          </tr></thead>
          <tbody>{COMPARE.map(([f, ...cells]) => <tr key={f} className="border-b border-line last:border-b-0">
            <th scope="row" className="px-5 py-2.5 text-left font-normal">{f}</th>
            {cells.map((c, i) => <td key={i} className="px-3 py-2.5">{c === true ? <Check size={16} className="text-ok" aria-label="Included" /> : c === false ? <Minus size={16} className="text-line-strong" aria-label="Not included" /> : c}</td>)}
          </tr>)}</tbody>
        </table>
      </div>
      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div><p className="font-medium">Is Free really free?</p><p className="text-muted mt-1">Yes. The free modules and samples never expire and need no card. A free account only keeps your progress across devices.</p></div>
        <div><p className="font-medium">Will I be charged again?</p><p className="text-muted mt-1">No. Each payment covers the month or year you choose. When it ends you return to Free and keep your progress.</p></div>
        <div><p className="font-medium">Do I lose progress if I upgrade or lapse?</p><p className="text-muted mt-1">No. Progress is kept separately from your plan; locked modules simply reopen when you subscribe again.</p></div>
      </div>
      <p className="text-xs text-muted">Plans do not renew automatically. See <a className="underline" href="#/legal/refunds">refunds</a> and <a className="underline" href="#/legal/terms">terms</a>. Colleges and hospitals: seat licences are available on request through <a className="underline" href="#/legal/contact">contact</a>.</p>
    </section>
  );
}

/** Pilot or institution access code: unlocks a plan until a set date, checked on the server (ecg-redeem). */
function AccessCode({ initial }: { initial?: string }) {
  const { user, plan, signIn } = useApp();
  const [code, setCode] = React.useState(initial ? decodeURIComponent(initial).toUpperCase() : '');
  const [busy, setBusy] = React.useState(false);
  const [res, setRes] = React.useState<{ ok: boolean; text: string } | null>(null);
  const redeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { signIn(); return; }
    if (!code.trim()) { setRes({ ok: false, text: 'Type the code you were given.' }); return; }
    setBusy(true); setRes(null);
    try {
      const r = await fetch('/.netlify/functions/ecg-redeem', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await auth.currentUser!.getIdToken()}` }, body: JSON.stringify({ code }) });
      const d = await r.json().catch(() => ({}));
      if (r.status === 501) setRes({ ok: false, text: 'Access codes are not switched on yet.' });
      else if (!r.ok) setRes({ ok: false, text: d.error || 'The code could not be checked. Please try again.' });
      else {
        const until = d.until ? new Date(d.until).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
        const name = d.plan === 'pro' ? 'Pro' : 'Student';
        setRes({ ok: true, text: d.unchanged ? `You already have ${name}${until ? ` until ${until}` : ''}, so nothing changed.` : `Done: ${name} is unlocked until ${until}. Every module on that plan is open now.` });
      }
    } catch { setRes({ ok: false, text: 'No connection. Check your internet and try again.' }); }
    setBusy(false);
  };
  return (
    <form onSubmit={redeem} className="card p-5 flex flex-wrap items-end gap-3" aria-labelledby="code-h">
      <div className="flex-1 min-w-[14rem]">
        <p id="code-h" className="font-medium flex items-center gap-2"><KeyRound size={16} className="text-accent-ink" />Have an access code?</p>
        <p className="text-sm text-muted mt-0.5">From a pilot, your college or your hospital. {user ? '' : 'Sign in first, with a verified email.'}{plan !== 'free' && user ? ` You are on ${plan === 'pro' ? 'Pro' : 'Student'} now.` : ''}</p>
      </div>
      <label className="sr-only" htmlFor="access-code">Access code</label>
      <input id="access-code" className="input !w-56 font-mono uppercase" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. MEDWISE-PILOT" autoComplete="off" spellCheck={false} />
      <button className="btn-primary" disabled={busy}>{busy ? 'Checking…' : user ? 'Unlock' : 'Sign in to unlock'}</button>
      {res && <p role="status" className={`w-full text-sm ${res.ok ? 'text-ok' : 'text-bad'}`}>{res.text}</p>}
    </form>
  );
}
