import * as React from 'react';
import { useApp } from '../EcgApp';
import { LAB_MODULES, TIER_LABEL, labOpen, labSrc, moduleStatus, type LabModule as Mod } from '../data/labModules';
import { emptyLab, today, type LabProgress } from '../lib/progress';
import { FEATS, PRICE, inr } from '../data/plans';
import { Check, Lock, ChevronLeft, ChevronRight, Target, PartyPopper, X } from 'lucide-react';
import ProgressRing from '../components/ProgressRing';
import CourseModule from '../components/CourseModule';
import { COURSES } from '../data/course';

/** Apply one message from the lab to a module's progress; null when the message changes nothing. */
function applyMsg(m: Mod, prev: LabProgress | undefined, d: LabMsg): LabProgress | null {
  const cur: LabProgress = { ...emptyLab(), ...(prev || {}) };
  const seen = new Set(cur.seen);
  if (d.ev === 'view' && d.id && d.kind === m.stationKind) seen.add(d.id);
  else if (d.ev === 'case' && d.id) seen.add(d.id);
  else if (d.ev === 'quiz') { cur.total++; if (d.ok) cur.right++; }
  else if (d.ev === 'read' && d.total) { cur.total++; if ((d.right ?? 0) / d.total >= 0.7) { cur.right++; cur.reads++; } }
  else return null;
  cur.seen = m.stations.filter(s => seen.has(s.id)).map(s => s.id);
  if (!cur.done && moduleStatus(m, cur).done) cur.done = today();
  return cur;
}
/** A one-line note on what just happened, for the toast. */
function noteFor(m: Mod, before: LabProgress | undefined, after: LabProgress, d: LabMsg): [string, 'ok' | 'bad' | 'info'] | null {
  if (after.done && !before?.done) return ['Module complete', 'ok'];
  const name = m.stations.find(s => s.id === d.id)?.name;
  if ((d.ev === 'view' || d.ev === 'case') && after.seen.length > (before?.seen.length ?? 0))
    return [`${d.ev === 'case' ? 'Case finished' : 'Station explored'}: ${name} · ${after.seen.length}/${m.stations.length}`, 'info'];
  if (d.ev === 'quiz' && m.check.kind === 'quiz') return d.ok ? [`Correct · ${Math.min(after.right, m.check.need)}/${m.check.need} for the module`, 'ok'] : ['Not quite. Read the notes, then try the next one', 'bad'];
  if (d.ev === 'read' && m.check.kind === 'read') return after.reads > (before?.reads ?? 0) ? [`Good read · ${Math.min(after.reads, m.check.need)}/${m.check.need}`, 'ok'] : ['Below 7 in 10 steps. Check the tips and read another', 'bad'];
  return null;
}

type LabMsg = { src: 'medwise-lab'; module: string; ev: 'view' | 'quiz' | 'case' | 'read'; kind?: string; id?: string; ok?: boolean; right?: number; total?: number };

export default function LabModule({ id }: { id: string }) {
  const { plan } = useApp();
  const m = LAB_MODULES.find(x => x.id === id);
  if (!m) return <p>Module not found. <a className="underline" href="#/lab">Back to the lab</a></p>;
  if (!labOpen(plan, m.tier)) return <Locked m={m} />;
  return COURSES[m.id] ? <CourseModule m={m} c={COURSES[m.id]} key={m.id} /> : <OpenModule m={m} key={m.id} />;
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
  const lpRef = React.useRef(lp); lpRef.current = lp;
  const [toast, setToast] = React.useState<{ text: string; tone: 'ok' | 'bad' | 'info'; k: number } | null>(null);
  const [fresh, setFresh] = React.useState<string | null>(null);
  const [celebrate, setCelebrate] = React.useState(false);
  const tRef = React.useRef<number | undefined>(undefined);
  const flash = (text: string, tone: 'ok' | 'bad' | 'info') => { setToast({ text, tone, k: Date.now() }); clearTimeout(tRef.current); tRef.current = window.setTimeout(() => setToast(null), 2600); };
  React.useEffect(() => () => clearTimeout(tRef.current), []);
  const nextStation = m.stations.find(s => !lp?.seen.includes(s.id));

  React.useEffect(() => {
    const on = (e: MessageEvent) => {
      const d = e.data as LabMsg;
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow || !d || d.src !== 'medwise-lab' || d.module !== m.id) return;
      const before = lpRef.current, after = applyMsg(m, before, d);
      if (!after) return;
      update(pr => { const c = applyMsg(m, pr.lab?.[m.id], d); return c ? { ...pr, lab: { ...(pr.lab || {}), [m.id]: c } } : pr; });
      const n = noteFor(m, before, after, d); if (n) flash(n[0], n[1]);
      if (after.seen.length > (before?.seen.length ?? 0) && d.id) setFresh(d.id);
      if (after.done && !before?.done) setCelebrate(true);
    };
    addEventListener('message', on); return () => removeEventListener('message', on);
  }, [m, update]); // eslint-disable-line react-hooks/exhaustive-deps

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
          {celebrate ? <div className="card p-5 flex flex-col gap-3 border-ok shadow-[inset_0_3px_0_var(--color-ok)] path-preview" role="status">
            <div className="flex items-center gap-3"><ProgressRing pct={100} done size={44} /><div><p className="eyebrow text-ok">Module {m.n} complete</p><p className="text-lg leading-tight">{m.title}</p></div></div>
            <p className="text-sm text-muted flex gap-2"><PartyPopper size={16} className="shrink-0 mt-0.5 text-gold-ink" />Done. It stays open for revision{next ? `, and Module ${next.n} is next.` : '.'}</p>
            {next && <a href={`#/lab/${next.id}`} className="btn-primary btn-arrow">{labOpen(plan, next.tier) ? `Start Module ${next.n}` : `See Module ${next.n}`}</a>}
            <button className="text-sm text-muted hover:text-ink w-fit" onClick={() => setCelebrate(false)}>Keep exploring this module</button>
          </div> : <div className="card p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <ProgressRing pct={st.pct} done={st.done} size={48}>{st.pct}%</ProgressRing>
              <div className="min-w-0"><p className="eyebrow">Your progress</p>
                <p className="text-sm mt-0.5">{st.done ? 'Module complete' : m.check.kind === 'quiz' && lp?.total ? <span className="font-mono tabular-nums">Quiz {lp.right}/{lp.total}</span> : st.pct ? 'Keep going' : 'Not started'}</p></div>
            </div>
            <p className="text-sm text-muted flex gap-2"><Target size={16} className="shrink-0 mt-0.5 text-accent-ink" />{st.done ? 'Revisit any station whenever you like.' : st.todo}</p>
            {nextStation && m.stationKind !== 'none' && <button className="btn-primary !h-10 !text-sm btn-arrow" onClick={() => goStation(nextStation.id)}>
              {lp?.seen.length ? 'Next' : 'First'} {m.stationKind === 'case' ? 'case' : 'station'}: {nextStation.name}</button>}
            {m.check.kind === 'quiz' && <button className={`${nextStation ? 'btn-secondary' : 'btn-primary'} !h-10 !text-sm`} onClick={quizMode}>Take the module quiz</button>}
          </div>}
          {m.stations.length > 0 && <div className="card overflow-hidden">
            <p className="eyebrow px-5 pt-4 pb-2">{m.stationKind === 'case' ? 'Cases' : 'Stations'}</p>
            <ol className="max-h-[44vh] overflow-y-auto">
              {m.stations.map((s, i) => {
                const ok = lp?.seen.includes(s.id);
                return <li key={s.id}><button onClick={() => goStation(s.id)} className="w-full flex items-center gap-3 px-5 py-2.5 text-left hover:bg-surface border-t border-line">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono shrink-0 ${ok ? 'bg-ok text-white' : 'border border-line-strong'} ${fresh === s.id ? 'tick-new' : ''}`}>{ok ? <Check size={13} /> : i + 1}</span>
                  <span className="text-sm">{s.name}</span></button></li>;
              })}
            </ol>
          </div>}
          <div className="card p-5">
            <p className="eyebrow mb-2">By the end you can</p>
            <ul className="flex flex-col gap-2 text-sm">{m.objectives.map(o => <li key={o} className="flex gap-2"><span className="h-1.5 w-1.5 bg-accent mt-2 shrink-0" />{o}</li>)}</ul>
          </div>
          {next && !celebrate && <a href={`#/lab/${next.id}`} className={`${st.done ? 'btn-primary' : 'btn-secondary'} justify-between`}>
            <span className="truncate">Next: {next.title}</span>{labOpen(plan, next.tier) ? <ChevronRight size={16} /> : <Lock size={14} />}</a>}
        </aside>
      </div>
      <div className="sr-only" aria-live="polite">{toast?.text}</div>
      {toast && <div key={toast.k} className={`mw-toast fixed left-1/2 bottom-24 md:bottom-8 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full px-4 h-11 text-sm font-medium shadow-lg max-w-[calc(100vw-32px)] ${toast.tone === 'ok' ? 'bg-ok text-white' : toast.tone === 'bad' ? 'bg-ink text-white' : 'bg-card text-ink border border-line'}`} aria-hidden="true">
        {toast.tone === 'ok' ? <Check size={16} /> : toast.tone === 'bad' ? <X size={16} /> : <span className="w-2 h-2 rounded-full bg-accent" />}<span className="truncate">{toast.text}</span></div>}
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
