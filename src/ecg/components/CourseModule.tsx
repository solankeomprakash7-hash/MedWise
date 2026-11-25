import * as React from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useApp } from '../EcgApp';
import { LAB_MODULES, labOpen, labSrc, TIER_LABEL, type LabModule } from '../data/labModules';
import { COURSE_STEPS } from '../data/course';
import type { Course, Field } from '../data/course/types';
import { ECGS, byId, imgOf, review, passed, type RealEcg, type Row } from '../lib/logic';
import { emptyLab, today, type CourseProgress, type LabProgress } from '../lib/progress';
import EcgViewer from './EcgViewer';
import Drill, { Results } from './Drill';
import ProgressRing from './ProgressRing';
import { Check, X, ChevronLeft, ChevronRight, Lightbulb, Star, RotateCcw } from 'lucide-react';

// ---------- items: one ECG, a few measurements and one choice, marked at once ----------
type Res = { id: string; ok: boolean; catOk: boolean; wrong: number };
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const catOf = (c: Course, e: RealEcg) => c.answer[e.pattern] ?? c.options[c.options.length - 1][0];
const label = (c: Course, k: string) => c.options.find(o => o[0] === k)?.[1] ?? k;
const FIELD: Record<Field, { name: string; unit: string; ph: string; key: (e: RealEcg) => number | null; tol: (e: RealEcg) => number }> = {
  rate: { name: 'Heart rate', unit: '/min', ph: 'e.g. 75', key: e => e.key.hr, tol: e => Math.max(8, (e.key.hr ?? 0) * (e.key.regular ? 0.1 : 0.15)) },
  pr: { name: 'PR interval', unit: 'ms', ph: 'e.g. 160', key: e => e.key.pr, tol: () => 30 },
  qrs: { name: 'QRS width', unit: 'ms', ph: 'e.g. 90', key: e => e.key.qrs, tol: () => 25 },
  qt: { name: 'QT interval', unit: 'ms', ph: 'e.g. 400', key: e => e.key.qt, tol: () => 40 },
};
const qtc = (e: RealEcg) => (e.key.qt && e.key.hr ? Math.round(e.key.qt / Math.sqrt(60 / e.key.hr)) : null);
/** Draw n items spread across answer categories, so a checkpoint never ends up all one pattern. */
function balanced(c: Course, ids: string[], n: number) {
  const groups = new Map<string, string[]>();
  shuffle(ids).forEach(id => { const k = c.mode === 'read' ? byId(id).pattern : catOf(c, byId(id)); groups.set(k, [...(groups.get(k) || []), id]); });
  const lists = shuffle([...groups.values()]), out: string[] = [];
  while (out.length < n && lists.some(l => l.length)) lists.forEach(l => { if (l.length && out.length < n) out.push(l.shift()!); });
  return out;
}

function Item({ c, id, n, of, hint, onDone }: { c: Course; id: string; n: number; of: number; hint?: string; onDone: (r: Res) => void }) {
  const e = byId(id);
  const [vals, setVals] = React.useState<Record<string, string>>({});
  const [cat, setCat] = React.useState<string | null>(null);
  const [showHint, setShowHint] = React.useState(false);
  const [res, setRes] = React.useState<Res | null>(null);
  React.useEffect(() => { setVals({}); setCat(null); setShowHint(false); setRes(null); }, [id]);
  const filled = c.fields.every(f => (vals[f] ?? '') !== '') && !!cat;
  const fieldOk = (f: Field) => { const k = FIELD[f].key(e); return k == null ? null : Math.abs(Number(vals[f]) - k) <= FIELD[f].tol(e); };
  const check = () => {
    const wrong = c.fields.filter(f => fieldOk(f) === false).length, catOk = cat === catOf(c, e);
    // The choice must be right; with several measurements, one may be off.
    setRes({ id, catOk, wrong, ok: catOk && wrong <= (c.fields.length > 1 ? 1 : 0) });
  };
  const right = catOf(c, e), q = qtc(e);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2"><p className="eyebrow">ECG {n} of {of}</p>{hint && !res && <button className="text-sm text-accent-ink inline-flex items-center gap-1" onClick={() => setShowHint(h => !h)} aria-expanded={showHint}><Lightbulb size={15} />{showHint ? 'Hide hint' : 'Show a hint'}</button>}</div>
      <EcgViewer src={imgOf(id)} alt="A real 12-lead ECG to read" />
      {showHint && hint && <p className="text-sm rounded-md bg-gold-soft text-gold-ink px-4 py-3 flex gap-2"><Lightbulb size={16} className="shrink-0 mt-0.5" />{hint}</p>}
      <div className="card p-5 flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-3">
          {c.fields.map((f, i) => {
            const ok = res ? fieldOk(f) : undefined, k = FIELD[f].key(e);
            return <label key={f} className="flex flex-col gap-1.5" htmlFor={`${f}-${id}`}>
              <span className="font-medium">{i + 1}. {FIELD[f].name}</span>
              <span className="flex items-center gap-2">
                <input id={`${f}-${id}`} type="number" inputMode="numeric" value={vals[f] ?? ''} disabled={!!res} placeholder={FIELD[f].ph}
                  onChange={ev => setVals(v => ({ ...v, [f]: ev.target.value }))}
                  className={`input !w-28 font-mono ${ok === true ? '!border-ok' : ok === false ? '!border-bad' : ''}`} />
                <span className="text-sm text-muted font-mono">{FIELD[f].unit}</span>
                {res && <span className={`text-sm font-mono ${ok === false ? 'text-bad' : ok ? 'text-ok' : 'text-muted'}`}>{k == null ? 'not graded' : `${ok ? '✓' : '✗'} ${k}`}</span>}
              </span>
            </label>;
          })}
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-medium">{c.fields.length + 1}. {c.question}</span>
          <div className="grid sm:grid-cols-2 gap-2" role="radiogroup" aria-label={c.question}>
            {c.options.map(([k, l]) => {
              const st = !res ? (cat === k ? 'border-ink bg-ink/[.04] font-medium shadow-[inset_3px_0_0_var(--color-accent)]' : 'border-line-strong hover:border-ink/50')
                : k === right ? 'border-ok bg-[#e8f4ee] text-ok font-medium disabled:opacity-100' : k === cat ? 'border-bad bg-[#fdecea] text-bad disabled:opacity-100' : 'border-line';
              return <button key={k} type="button" role="radio" aria-checked={cat === k} disabled={!!res} onClick={() => setCat(k)}
                className={`text-left rounded-sm border px-3 py-2.5 text-[15px] transition-colors disabled:cursor-default ${st}`}>{l}</button>;
            })}
          </div>
        </div>
        {!res ? <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary" disabled={!filled} onClick={check}>Check</button>
          {!filled && <span className="text-sm text-muted">Answer every part to check.</span>}
        </div> : <div className="flex flex-col gap-3" aria-live="polite">
          <p className="flex items-start gap-2">{res.ok ? <Check size={20} className="text-ok shrink-0" /> : <X size={20} className="text-bad shrink-0" />}
            <span><b className={res.ok ? 'text-ok' : 'text-bad'}>{res.ok ? 'Correct.' : 'Not quite.'}</b>{' '}
              This is <b>{e.title}</b>{c.answer[e.pattern] && label(c, right).toLowerCase() !== e.title.toLowerCase() ? <> ({label(c, right).replace(/^./, x => x.toLowerCase())})</> : ''}
              {e.key.hr != null && <> at <span className="font-mono">{e.key.hr}/min</span>, {e.key.regular ? 'regular' : 'irregular'}</>}
              {c.fields.includes('qt') && q != null && <>; QTc <span className="font-mono">{q} ms</span> (Bazett)</>}.
              {!res.catOk ? '' : res.wrong ? ` Your choice was right; check the measurement${res.wrong > 1 ? 's' : ''} marked ✗.` : ''}</span></p>
          <p className="text-sm text-muted max-w-prose">{e.teach}</p>
          {e.model && <p className="text-xs text-muted">This tracing is a teaching model drawn by the MedWise heart model, used where the open datasets have no clean real example.</p>}
          <div><button className="btn-primary btn-arrow" onClick={() => onDone(res)} autoFocus>{n < of ? 'Next ECG' : 'See my result'}</button></div>
        </div>}
      </div>
    </div>
  );
}

/** Read mode: the full nine-step read, marked step by step; it also feeds the learner's skills profile. */
function ReadItem({ id, n, of, hint, onDone }: { id: string; n: number; of: number; hint?: string; onDone: (r: Res) => void }) {
  const { update } = useApp();
  const e = byId(id);
  const [rows, setRows] = React.useState<Row[] | null>(null);
  React.useEffect(() => setRows(null), [id]);
  if (rows) {
    const ok = passed(rows), dx = rows.find(r => r.key === 'dx')?.ok === true;
    return <div className="flex flex-col gap-4">
      <p className="eyebrow">ECG {n} of {of}</p>
      <EcgViewer src={imgOf(id)} alt={e.title} />
      <div className="card p-5 flex flex-col gap-4">
        <p className="flex items-start gap-2">{ok ? <Check size={20} className="text-ok shrink-0" /> : <X size={20} className="text-bad shrink-0" />}
          <span><b className={ok ? 'text-ok' : 'text-bad'}>{ok ? 'A good read.' : 'Not yet.'}</b> {ok ? 'Right diagnosis and at least 7 in 10 steps right.' : dx ? 'Right diagnosis, but fewer than 7 in 10 steps right. Read the tips for the steps marked wrong.' : 'The diagnosis is not right. Find the first step that went wrong; that is usually where the read went off course.'}</span></p>
        <Results ecg={e} rows={rows} />
        <div><button className="btn-primary btn-arrow" onClick={() => onDone({ id, ok, catOk: dx, wrong: rows.filter(r => r.ok === false).length })} autoFocus>{n < of ? 'Next ECG' : 'See my result'}</button></div>
      </div>
    </div>;
  }
  return <div className="flex flex-col gap-3">
    <p className="eyebrow">ECG {n} of {of} · read it in nine steps</p>
    <Drill ecg={e} onDone={r => {
      setRows(r);
      update(pr => { const skills = { ...pr.skills }; r.forEach(x => { if (x.ok == null) return; const v = skills[x.key] || [0, 0]; skills[x.key] = [v[0] + (x.ok ? 1 : 0), v[1] + 1]; }); return { ...pr, skills }; });
    }}>{hint && <p className="text-sm rounded-md bg-gold-soft text-gold-ink px-4 py-3 flex gap-2"><Lightbulb size={16} className="shrink-0 mt-0.5" />{hint}</p>}</Drill>
  </div>;
}

function Series({ c, ids, hints, onFinish }: { c: Course; ids: string[]; hints?: string[]; onFinish: (r: Res[]) => void }) {
  const [i, setI] = React.useState(0), [rs, setRs] = React.useState<Res[]>([]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1.5" aria-hidden="true">{ids.map((x, k) => <span key={x} className={`h-1.5 flex-1 rounded-full ${k < rs.length ? (rs[k].ok ? 'bg-ok' : 'bg-bad') : k === i ? 'bg-ink' : 'bg-line'}`} />)}</div>
      {(() => { const done = (r: Res) => { const n = [...rs, r]; setRs(n); if (i + 1 < ids.length) { setI(i + 1); scrollTo({ top: 0 }); } else onFinish(n); };
        return c.mode === 'read' ? <ReadItem key={ids[i]} id={ids[i]} n={i + 1} of={ids.length} hint={hints?.[i]} onDone={done} />
          : <Item key={ids[i]} c={c} id={ids[i]} n={i + 1} of={ids.length} hint={hints?.[i]} onDone={done} />; })()}
    </div>
  );
}

// ---------- the module ----------
export default function CourseModule({ m, c }: { m: LabModule; c: Course }) {
  const { p, update, plan, user } = useApp();
  const lp = p.lab?.[m.id], cp: CourseProgress = lp?.course ?? { step: 0 };
  const [step, setStep] = React.useState(() => Math.min(cp.step, COURSE_STEPS.length - 1));
  const [attempt, setAttempt] = React.useState(0);
  const [last, setLast] = React.useState<Res[] | null>(null);
  const idx = LAB_MODULES.indexOf(m), next = LAB_MODULES[idx + 1];

  const saveCourse = React.useCallback((fn: (c: CourseProgress) => CourseProgress, extra?: (l: LabProgress) => LabProgress) => update(pr => {
    const cur: LabProgress = { ...emptyLab(), ...(pr.lab?.[m.id] || {}) };
    let l: LabProgress = { ...cur, course: fn(cur.course ?? { step: 0 }) };
    if (extra) l = extra(l);
    return { ...pr, lab: { ...(pr.lab || {}), [m.id]: l } };
  }), [update, m.id]);
  const go = (s: number) => { setStep(s); scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    if (s > cp.step) saveCourse(x => ({ ...x, step: s })); };

  // Fixed per attempt: pre-test and checkpoint never reuse the worked or guided ECGs, and never each other.
  const used = React.useMemo(() => new Set([c.worked.ecg, ...c.guided.map(g => g.ecg)]), [c]);
  const pre = React.useMemo(() => balanced(c, c.pools.sinus.filter(x => !used.has(x)), c.pools.pre), [c, used]);
  const check = React.useMemo(() => {
    const sinus = balanced(c, c.pools.sinus.filter(x => !used.has(x) && !pre.includes(x)), c.pools.check - c.pools.checkOther);
    const other = shuffle(ECGS.filter(e => c.pools.other.includes(e.pattern) && e.key.hr != null && !e.model)).slice(0, c.pools.checkOther).map(e => e.id);
    return shuffle([...sinus, ...other]);
  }, [c, used, pre, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishCheck = (rs: Res[]) => {
    const r = rs.filter(x => x.ok).length, t = rs.length, pass = r >= c.pools.pass;
    setLast(rs);
    saveCourse(x => {
      const best = !x.best || r / t > x.best[0] / x.best[1] ? [r, t] as [number, number] : x.best;
      const out: CourseProgress = { ...x, step: Math.max(x.step, 7), best };
      if (pass && !x.passed) out.passed = today();
      return out;
    }, l => (pass && !l.done ? { ...l, done: today() } : l));
    // Missed ECGs join the spaced-review queue in Practise.
    update(pr => { const cards = { ...pr.cards }; rs.filter(x => !x.ok).forEach(x => { cards[x.id] = review(cards[x.id], false); }); return { ...pr, cards }; });
    setStep(7); scrollTo({ top: 0 });
  };

  const pct = Math.round(100 * (cp.passed ? COURSE_STEPS.length : Math.min(cp.step, COURSE_STEPS.length - 1)) / COURSE_STEPS.length);
  const Nav = ({ back = true, nextLabel = 'Next', disabled = false }: { back?: boolean; nextLabel?: string; disabled?: boolean }) => (
    <div className="flex flex-wrap justify-between gap-3 pt-2">
      {back && step > 0 ? <button className="btn-secondary" onClick={() => go(step - 1)}><ChevronLeft size={16} />Back</button> : <span />}
      <button className="btn-primary btn-arrow" disabled={disabled} onClick={() => go(step + 1)}>{nextLabel}</button>
    </div>
  );

  return (
    <article className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <a href="#/lab" className="text-sm text-muted hover:text-ink inline-flex items-center gap-1 w-fit"><ChevronLeft size={16} />All lab modules</a>
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="min-w-0">
            <p className="eyebrow">Module {m.n} of {LAB_MODULES.length} · {TIER_LABEL[m.tier]} · about {m.minutes} min</p>
            <h1 className="text-3xl md:text-4xl">{m.title}</h1>
          </div>
          <ProgressRing pct={pct} done={!!cp.passed} size={52}>{pct}%</ProgressRing>
        </div>
      </div>

      {/* stepper: steps already reached can be revisited */}
      <ol className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1" aria-label="Module steps">
        {COURSE_STEPS.map((s, i) => {
          const reached = i <= Math.max(cp.step, step), on = i === step;
          return <li key={s} className="shrink-0">
            <button disabled={!reached} onClick={() => go(i)} aria-current={on ? 'step' : undefined}
              className={`h-9 px-3 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5 border transition-colors ${on ? 'bg-ink text-white border-ink' : reached ? 'bg-card border-line-strong text-ink hover:border-ink/50' : 'bg-transparent border-line text-muted'}`}>
              <span className="font-mono text-[11px] opacity-70">{i + 1}</span>{s}</button></li>;
        })}
      </ol>

      <div className="max-w-3xl w-full flex flex-col gap-5">
        {step === 0 && (cp.pre ? <div className="card p-6 flex flex-col gap-3">
            <h2 className="text-2xl">Your starting point: <span className="font-mono">{cp.pre[0]}/{cp.pre[1]}</span></h2>
            <p className="text-muted">You took the short pre-test already. The checkpoint at the end will show how far you have come.</p>
            <Nav nextLabel="Continue" />
          </div> : <>
            <div className="card p-6 flex flex-col gap-2">
              <h2 className="text-2xl">Before you start: {c.pools.pre} {c.mode === 'read' ? 'full reads' : 'quick ECGs'}</h2>
              <p className="text-muted">Give each one your best guess, even if you are unsure. It is not marked against you. It sets your starting point, so the checkpoint at the end can show what you learned.</p>
            </div>
            <Series c={c} ids={pre} onFinish={rs => { const r = rs.filter(x => x.ok).length; saveCourse(x => ({ ...x, pre: [r, rs.length], step: Math.max(x.step, 1) })); go(1); }} />
          </>)}

        {step === 1 && <div className="card p-6 md:p-8 flex flex-col gap-4">
          <p className="eyebrow">{c.story.setting}</p>
          {c.story.text.map(t => <p key={t} className="text-lg">{t}</p>)}
          <p className="text-lg font-medium">{c.story.question}</p>
          <details className="rounded-md bg-accent-soft p-4 group"><summary className="cursor-pointer font-medium text-accent-ink">Think, then show the answer</summary><p className="mt-2">{c.story.answer}</p></details>
          <Nav />
        </div>}

        {step === 2 && <>
          <div className="card p-6 flex flex-col gap-3">
            <p>{c.watch.intro}</p>
            <ul className="flex flex-col gap-2">{c.watch.look.map(t => <li key={t} className="flex gap-2"><span className="h-1.5 w-1.5 bg-accent mt-2.5 shrink-0" />{t}</li>)}</ul>
          </div>
          <div className="card overflow-hidden"><iframe title={`Interactive ECG lab: ${m.title}`} src={labSrc(m, plan)} className="w-full block" style={{ height: '78vh', minHeight: 600, border: 0 }} /></div>
          <Nav />
        </>}

        {step === 3 && <>
          {c.rule.sections.map(s => <div key={s.h} className="card p-6 flex flex-col gap-3"><h2 className="text-xl">{s.h}</h2>
            <ul className="flex flex-col gap-2">{s.body.map(t => <li key={t} className="flex gap-2"><span className="h-1.5 w-1.5 bg-accent mt-2.5 shrink-0" />{t}</li>)}</ul></div>)}
          <div className="card overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]"><caption className="text-left px-5 pt-5 pb-2 text-xl font-medium text-ink">{c.rule.compare.title}</caption>
              <thead><tr className="text-left border-b border-line">{c.rule.compare.cols.map(h => <th key={h} scope="col" className="px-5 py-2.5 font-medium text-muted">{h}</th>)}</tr></thead>
              <tbody>{c.rule.compare.rows.map(r => <tr key={r[0]} className="border-b border-line last:border-0 align-top">
                <th scope="row" className="px-5 py-3 text-left font-medium">{r[0]}</th><td className="px-5 py-3">{r[1]}</td><td className="px-5 py-3">{r[2]}</td></tr>)}</tbody></table>
          </div>
          <Nav />
        </>}

        {step === 4 && <Worked c={c} nav={<Nav />} />}

        {step === 5 && <>
          <div className="card p-6"><h2 className="text-2xl">Guided practice</h2><p className="text-muted mt-1">{c.guided.length} real ECGs. Use the calipers, ask for a hint if you need one, and read the explanation after each.</p></div>
          <Series key={`g${step}`} c={c} ids={c.guided.map(g => g.ecg)} hints={c.guided.map(g => g.hint)} onFinish={() => go(6)} />
        </>}

        {step === 6 && <>
          <div className="card p-6 flex flex-col gap-2">
            <h2 className="text-2xl">Checkpoint: {c.pools.check} unseen ECGs</h2>
            <p className="text-muted">No hints this time. {c.pools.checkOther ? `${c.pools.checkOther} of them are look-alikes from other topics. ` : ''}Get {c.pools.pass} of {c.pools.check} right to complete the module: {c.mode === 'read' ? 'the right diagnosis with at least 7 in 10 steps right' : <>the right answer, with {c.fields.length > 1 ? 'no more than one measurement off' : 'the measurement close to the true value'}</>}.{cp.best ? ` Your best so far: ${cp.best[0]}/${cp.best[1]}.` : ''}</p>
          </div>
          <Series key={`c${attempt}`} c={c} ids={check} onFinish={finishCheck} />
        </>}

        {step === 7 && <ReviewStep c={c} cp={cp} last={last} next={next} nextOpen={!!next && labOpen(plan, next.tier)} moduleId={m.id} plan={plan} uid={user?.uid}
          onRetry={() => { setAttempt(a => a + 1); setLast(null); setStep(6); scrollTo({ top: 0 }); }} onRated={n => saveCourse(x => ({ ...x, rated: n }))} />}
      </div>
    </article>
  );
}

function Worked({ c, nav }: { c: Course; nav: React.ReactNode }) {
  const [k, setK] = React.useState(1); const e = byId(c.worked.ecg);
  return <>
    <div className="card p-6"><h2 className="text-2xl">Worked example</h2><p className="text-muted mt-1">Follow a real read, one step at a time. Use the calipers to check each number yourself.</p></div>
    <EcgViewer src={imgOf(e.id)} alt="A real 12-lead ECG, read step by step below" />
    <ol className="flex flex-col gap-2">
      {c.worked.steps.slice(0, k).map((s, i) => <li key={s.title} className="card p-5 flex gap-4 path-preview">
        <span className="w-7 h-7 rounded-full bg-accent-soft text-accent-ink font-mono text-sm flex items-center justify-center shrink-0">{i + 1}</span>
        <div><p className="font-medium">{s.title}</p><p className="text-muted mt-0.5">{s.text}</p></div></li>)}
    </ol>
    {k < c.worked.steps.length ? <div><button className="btn-secondary" onClick={() => setK(k + 1)}>Show step {k + 1}: {c.worked.steps[k].title}</button></div> : nav}
  </>;
}

function ReviewStep({ c, cp, last, next, nextOpen, moduleId, plan, uid, onRetry, onRated }: {
  c: Course; cp: CourseProgress; last: Res[] | null; next?: LabModule; nextOpen: boolean; moduleId: string; plan: string; uid?: string;
  onRetry: () => void; onRated: (n: number) => void }) {
  const r = last ? last.filter(x => x.ok).length : cp.best?.[0] ?? 0, t = last ? last.length : cp.best?.[1] ?? c.pools.check;
  const passed = r >= c.pools.pass || (!last && !!cp.passed);
  const prePct = cp.pre ? Math.round(100 * cp.pre[0] / cp.pre[1]) : null, nowPct = Math.round(100 * r / t);
  const missed = last?.filter(x => !x.ok) ?? [];
  return <>
    <div className={`card p-6 md:p-8 flex flex-col gap-4 ${passed ? 'border-ok shadow-[inset_0_3px_0_var(--color-ok)]' : ''}`}>
      <p className="eyebrow">{passed ? 'Module complete' : 'Not yet'}</p>
      <h2 className="text-3xl">{passed ? `Passed with ${r} of ${t}.` : `${r} of ${t}. You need ${c.pools.pass} to complete the module.`}</h2>
      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div className="rounded-md bg-surface border border-line p-4"><p className="text-xs text-muted">Before the module</p><p className="font-mono text-3xl tabular-nums mt-1">{prePct == null ? '—' : `${prePct}%`}</p></div>
        <div className="rounded-md bg-accent-soft border border-line p-4"><p className="text-xs text-accent-ink">Checkpoint</p><p className="font-mono text-3xl tabular-nums mt-1 text-accent-ink">{nowPct}%</p></div>
      </div>
      {missed.length > 0 && <p className="text-muted">{missed.length === 1 ? 'The ECG you missed is' : `The ${missed.length} ECGs you missed are`} now in your review queue. {missed.length === 1 ? 'It comes' : 'They come'} back in <a className="link" href="#/practice">Practise</a> tomorrow, then at growing gaps until you get {missed.length === 1 ? 'it' : 'them'} right.</p>}
      <div className="flex flex-wrap gap-3">
        {!passed && <button className="btn-primary" onClick={onRetry}><RotateCcw size={16} />Try a new checkpoint</button>}
        {passed && next && <a className="btn-primary btn-arrow" href={`#/lab/${next.id}`}>{nextOpen ? `Start Module ${next.n}` : `See Module ${next.n}`}</a>}
        {passed && <button className="btn-secondary" onClick={onRetry}>Take another checkpoint</button>}
      </div>
    </div>
    {(passed || last) && <Feedback moduleId={moduleId} plan={plan} uid={uid} rated={cp.rated} onRated={onRated} score={[r, t]} />}
  </>;
}

/** One question at the moment of success, plus an optional comment. Saved to Firestore `feedback`. */
export function Feedback({ moduleId, plan, uid, rated, onRated, score }: { moduleId: string; plan: string; uid?: string; rated?: number; onRated: (n: number) => void; score: [number, number] }) {
  const [n, setN] = React.useState(0), [txt, setTxt] = React.useState(''), [state, setState] = React.useState<'idle' | 'busy' | 'done' | 'err'>(rated ? 'done' : 'idle');
  if (state === 'done') return <div className="card p-5 text-sm text-muted">Thank you for your feedback on this module.</div>;
  const send = async () => {
    setState('busy');
    try {
      await addDoc(collection(db, 'feedback'), { module: moduleId, rating: n, comment: txt.trim().slice(0, 1000), plan, uid: uid ?? null, score: score[0], of: score[1], createdAt: serverTimestamp() });
      onRated(n); setState('done');
    } catch { setState('err'); }
  };
  return (
    <div className="card p-6 flex flex-col gap-3">
      <h3 className="text-xl">Did this module help you read ECGs better?</h3>
      <div className="flex gap-1" role="radiogroup" aria-label="Rating, 1 to 5">
        {[1, 2, 3, 4, 5].map(k => <button key={k} role="radio" aria-checked={n === k} aria-label={`${k} of 5`} onClick={() => setN(k)}
          className="p-1"><Star size={28} className={k <= n ? 'text-gold fill-gold' : 'text-line-strong'} /></button>)}
      </div>
      <label className="label" htmlFor="fb-txt">What helped most, or what was confusing? (optional)</label>
      <textarea id="fb-txt" className="input min-h-24" maxLength={1000} value={txt} onChange={e => setTxt(e.target.value)} />
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary" disabled={!n || state === 'busy'} onClick={send}>{state === 'busy' ? 'Sending…' : 'Send feedback'}</button>
        {state === 'err' && <span className="text-sm text-bad">Your feedback was not saved. Check your connection and try again.</span>}
      </div>
    </div>
  );
}
