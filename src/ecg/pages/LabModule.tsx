import * as React from 'react';
import { useApp } from '../EcgApp';
import { LAB_MODULES, TIER_LABEL, labOpen, labSrc, moduleStatus, type LabModule as Mod } from '../data/labModules';
import { emptyLab, today, type LabProgress } from '../lib/progress';
import { FEATS, PRICE, inr } from '../data/plans';
import { Check, Lock, ChevronLeft, ChevronRight, Target } from 'lucide-react';

type LabMsg = { src: 'medwise-lab'; module: string; ev: 'view' | 'quiz' | 'case' | 'read'; kind?: string; id?: string; ok?: boolean; right?: number; total?: number };

export default function LabModule({ id }: { id: string }) {
  const { plan } = useApp();
  const m = LAB_MODULES.find(x => x.id === id);
  if (!m) return <p>Module not found. <a className="underline" href="#/lab">Back to the lab</a></p>;
  return labOpen(plan, m.tier) ? <OpenModule m={m} key={m.id} /> : <Locked m={m} />;
}

function Head({ m }: { m: Mod }) {
  return (
    <div className="flex flex-col gap-2">
      <a href="#/lab" className="text-sm text-muted hover:text-ink inline-flex items-center gap-1 w-fit"><ChevronLeft size={16} />All lab modules</a>
      <p className="eyebrow">Module {m.n} of {LAB_MODULES.length} · {TIER_LABEL[m.tier]} · about {m.minutes} min</p>
      <h1 className="text-3xl md:text-4xl">{m.title}</h1>
      <p className="text-lg text-ink/80 max-w-prose">{m.summary}</p>
    </div>
  );
}

function OpenModule({ m }: { m: Mod }) {
  const { p, update, plan } = useApp();
  const frame = React.useRef<HTMLIFrameElement>(null);
  // Build the lab URL once per module, so progress updates never reload the lab.
  const src = React.useMemo(() => labSrc(m, plan), [m.id, plan]); // eslint-disable-line react-hooks/exhaustive-deps
  const lp = p.lab?.[m.id];
  const st = moduleStatus(m, lp);
  const idx = LAB_MODULES.indexOf(m), next = LAB_MODULES[idx + 1];

  React.useEffect(() => {
    const on = (e: MessageEvent) => {
      const d = e.data as LabMsg;
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow || !d || d.src !== 'medwise-lab' || d.module !== m.id) return;
      update(pr => {
        const cur: LabProgress = { ...emptyLab(), ...(pr.lab?.[m.id] || {}) };
        const seen = new Set(cur.seen);
        if (d.ev === 'view' && d.id && d.kind === m.stationKind) seen.add(d.id);
        else if (d.ev === 'case' && d.id) seen.add(d.id);
        else if (d.ev === 'quiz') { cur.total++; if (d.ok) cur.right++; }
        else if (d.ev === 'read' && d.total) { cur.total++; if ((d.right ?? 0) / d.total >= 0.7) { cur.right++; cur.reads++; } }
        else return pr;
        cur.seen = m.stations.filter(s => seen.has(s.id)).map(s => s.id);
        if (!cur.done && moduleStatus(m, cur).done) cur.done = today();
        return { ...pr, lab: { ...(pr.lab || {}), [m.id]: cur } };
      });
    };
    addEventListener('message', on); return () => removeEventListener('message', on);
  }, [m, update]);

  const goStation = (sid: string) => {
    const w = frame.current?.contentWindow; if (!w) return;
    const msg = m.stationKind === 'case' ? { cmd: 'case', idx: m.stations.findIndex(s => s.id === sid) } : { cmd: m.stationKind === 'wave' ? 'wave' : 'pattern', id: sid };
    w.postMessage({ src: 'medwise-app', ...msg }, location.origin);
    frame.current?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };
  const quizMode = () => frame.current?.contentWindow?.postMessage({ src: 'medwise-app', cmd: 'mode', mode: 'quiz' }, location.origin);

  return (
    <article className="flex flex-col gap-6">
      <Head m={m} />
      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="card overflow-hidden order-2 lg:order-1">
          <iframe ref={frame} title={`Interactive ECG lab: ${m.title}`} src={src} className="w-full block" style={{ height: '86vh', minHeight: 640, border: 0 }} />
        </div>
        <aside className="flex flex-col gap-4 order-1 lg:order-2 lg:sticky lg:top-20">
          <div className="card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="eyebrow">Your progress</span>
              {st.done ? <span className="chip-accent"><Check size={12} />Complete</span> : <span className="font-mono text-sm tabular-nums">{st.pct}%</span>}
            </div>
            <span className="h-1.5 rounded-full bg-line overflow-hidden"><span className={`block h-full rounded-full ${st.done ? 'bg-ok' : 'bg-accent'}`} style={{ width: `${st.pct}%` }} /></span>
            <p className="text-sm text-muted flex gap-2"><Target size={16} className="shrink-0 mt-0.5 text-accent-ink" />{st.done ? 'Module complete. Revisit any station whenever you like.' : st.todo}</p>
            {m.check.kind === 'quiz' && <button className="btn-secondary !h-9 !text-sm" onClick={quizMode}>Take the module quiz{lp?.total ? ` · ${lp.right}/${lp.total}` : ''}</button>}
          </div>
          {m.stations.length > 0 && <div className="card overflow-hidden">
            <p className="eyebrow px-5 pt-4 pb-2">{m.stationKind === 'case' ? 'Cases' : 'Stations'}</p>
            <ol className="max-h-[44vh] overflow-y-auto">
              {m.stations.map((s, i) => {
                const ok = lp?.seen.includes(s.id);
                return <li key={s.id}><button onClick={() => goStation(s.id)} className="w-full flex items-center gap-3 px-5 py-2.5 text-left hover:bg-surface border-t border-line">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono shrink-0 ${ok ? 'bg-ok text-white' : 'border border-line-strong'}`}>{ok ? <Check size={13} /> : i + 1}</span>
                  <span className="text-sm">{s.name}</span></button></li>;
              })}
            </ol>
          </div>}
          <div className="card p-5">
            <p className="eyebrow mb-2">By the end you can</p>
            <ul className="flex flex-col gap-2 text-sm">{m.objectives.map(o => <li key={o} className="flex gap-2"><span className="h-1.5 w-1.5 bg-accent mt-2 shrink-0" />{o}</li>)}</ul>
          </div>
          {next && <a href={`#/lab/${next.id}`} className={`${st.done ? 'btn-primary' : 'btn-secondary'} justify-between`}>
            <span className="truncate">Next: {next.title}</span>{labOpen(plan, next.tier) ? <ChevronRight size={16} /> : <Lock size={14} />}</a>}
        </aside>
      </div>
    </article>
  );
}

function Locked({ m }: { m: Mod }) {
  const { user, signIn } = useApp();
  const need = m.tier === 'pro' ? 'pro' : 'student';
  const free = LAB_MODULES.filter(x => x.tier === 'free');
  return (
    <article className="flex flex-col gap-6">
      <Head m={m} />
      <div className="grid md:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <p className="eyebrow mb-2">What you will learn</p>
            <ul className="flex flex-col gap-2">{m.objectives.map(o => <li key={o} className="flex gap-2"><span className="h-1.5 w-1.5 bg-accent mt-2.5 shrink-0" />{o}</li>)}</ul>
          </div>
          {m.stations.length > 0 && <div className="card overflow-hidden">
            <p className="eyebrow px-5 pt-4 pb-2">{m.stations.length} {m.stationKind === 'case' ? 'cases' : 'stations'} inside</p>
            <ol className="grid sm:grid-cols-2">{m.stations.map((s, i) => <li key={s.id} className="flex items-center gap-3 px-5 py-2.5 border-t border-line text-sm text-ink/80">
              <span className="w-6 h-6 rounded-full flex items-center justify-center bg-surface text-muted shrink-0"><Lock size={11} /></span>{i + 1}. {s.name}</li>)}</ol>
          </div>}
        </div>
        <div className="card p-5 flex flex-col gap-3 border-ink shadow-[inset_0_3px_0_var(--color-gold)]">
          <span className="chip-gold w-fit"><Lock size={12} />{TIER_LABEL[m.tier]} module</span>
          <p className="text-xl">Unlock with {TIER_LABEL[need]}</p>
          <p className="font-mono tabular-nums">{inr(PRICE[need].month)}/month <span className="text-muted">or</span> {inr(PRICE[need].year)}/year</p>
          <ul className="flex flex-col gap-1.5 text-sm">{FEATS[need].map(f => <li key={f} className="flex gap-2"><Check size={16} className="text-ok shrink-0 mt-0.5" />{f}</li>)}</ul>
          <a href="#/upgrade" className="btn-primary">See plans and pay</a>
          <p className="text-xs text-muted">One-time payment for the period you choose. Plans do not renew automatically.</p>
          {!user && <button className="link text-sm w-fit" onClick={signIn}>Already subscribed? Sign in</button>}
        </div>
      </div>
      <div className="card p-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm"><span className="font-medium">Free to try now:</span> {free.map(f => `Module ${f.n}, ${f.title}`).join(' and ')}.</p>
        <a href={`#/lab/${free[0].id}`} className="btn-secondary !h-9 !text-sm">Open a free module</a>
      </div>
    </article>
  );
}
