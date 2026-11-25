import * as React from 'react';
import { LAB_MODULES, labOpen, TIER_LABEL } from '../data/labModules';
import { useApp } from '../EcgApp';
import { Check, X, Zap } from 'lucide-react';

// "Spot it": a 10-second warm-up on the lab's model 12-leads. One tracing, three names, instant feedback,
// and a link to the module that teaches it. Streak and best score are a per-browser convenience only.
type Q = { id: string; name: string; mod: (typeof LAB_MODULES)[number]; opts: string[] };
const POOL = LAB_MODULES.filter(m => m.stationKind === 'pattern').flatMap(m => m.stations.map(s => ({ id: s.id, name: s.name, mod: m })));
const KEY = 'medwise-spotit';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '') as { streak: number; best: number }; } catch { return { streak: 0, best: 0 }; } };
const save = (v: { streak: number; best: number }) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* storage blocked */ } };
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

function makeQ(avoid?: string): Q {
  let a = pick(POOL); while (a.id === avoid) a = pick(POOL);
  // Distractors: one from the same module when possible (the hard one), the rest from anywhere.
  const same = POOL.filter(x => x.mod.id === a.mod.id && x.id !== a.id), other = POOL.filter(x => x.mod.id !== a.mod.id);
  const ds = new Set<string>(); if (same.length) ds.add(pick(same).name);
  while (ds.size < 2) ds.add(pick(other).name);
  const opts = [a.name, ...ds].sort(() => Math.random() - 0.5);
  return { ...a, opts };
}

export default function SpotIt() {
  const { plan } = useApp();
  const [q, setQ] = React.useState<Q>(() => makeQ());
  const [ans, setAns] = React.useState<string | null>(null);
  const [st, setSt] = React.useState(load);
  const [loaded, setLoaded] = React.useState(false);
  const box = React.useRef<HTMLDivElement>(null);

  const choose = React.useCallback((o: string) => {
    if (ans) return; setAns(o);
    const ok = o === q.name, next = { streak: ok ? st.streak + 1 : 0, best: Math.max(st.best, ok ? st.streak + 1 : 0) };
    setSt(next); save(next);
  }, [ans, q, st]);
  const next = React.useCallback(() => { setAns(null); setLoaded(false); setQ(x => makeQ(x.id)); }, []);

  // Keys 1–3 answer, Enter or N for the next tracing, while the card has focus.
  const onKey = (e: React.KeyboardEvent) => {
    const n = Number(e.key); if (n >= 1 && n <= q.opts.length) { e.preventDefault(); choose(q.opts[n - 1]); }
    else if (ans && (e.key.toLowerCase() === 'n' || (e.key === 'Enter' && !(e.target as HTMLElement).closest('button, a')))) { e.preventDefault(); next(); }
  };
  const ok = ans === q.name, open = labOpen(plan, q.mod.tier);

  return (
    <div ref={box} tabIndex={-1} onKeyDown={onKey} className="card overflow-hidden outline-none" aria-labelledby="spot-h">
      <div className="px-5 pt-4 pb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="eyebrow flex items-center gap-1.5"><Zap size={14} className="text-accent-ink" />Spot it · 10-second warm-up</p>
          <h2 id="spot-h" className="text-xl mt-1">What does this 12-lead show?</h2>
        </div>
        <span className="flex gap-2">
          <span className="chip font-mono tabular-nums" aria-label={`Streak ${st.streak}`}>Streak {st.streak}</span>
          <span className="chip font-mono tabular-nums text-muted" aria-label={`Best ${st.best}`}>Best {st.best}</span>
        </span>
      </div>
      <div className="paper border-y border-line relative overflow-hidden aspect-[2.4/1]">
        {!loaded && <span className="absolute inset-0 animate-pulse bg-paper" aria-hidden="true" />}
        <img key={q.id} src={`/ecg/model/model-${q.id}.webp`} alt="A model 12-lead ECG. Name the pattern." onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover object-left-top transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`} />
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div className="grid sm:grid-cols-3 gap-2" role="group" aria-label="Choose the pattern">
          {q.opts.map((o, i) => {
            const right = ans && o === q.name, wrong = ans === o && !ok;
            return <button key={o} onClick={() => choose(o)} disabled={!!ans && !right && !wrong}
              className={`spot-opt text-left rounded-sm border px-3 py-2.5 text-[15px] flex items-center gap-2 ${right ? 'border-ok bg-[#e8f4ee] text-ok font-medium is-right' : wrong ? 'border-bad bg-[#fdecea] text-bad is-wrong' : 'border-line-strong bg-card hover:border-ink/40'}`}>
              <kbd className="font-mono text-[11px] text-muted border border-line rounded px-1.5 hidden sm:inline">{i + 1}</kbd>
              <span className="flex-1">{o}</span>{right && <Check size={16} />}{wrong && <X size={16} />}
            </button>;
          })}
        </div>
        <div aria-live="polite" className="min-h-[44px] flex flex-wrap items-center justify-between gap-3">
          {ans ? <>
            <p className="text-sm">{ok ? <b className="text-ok">Correct.</b> : <><b className="text-bad">Not quite.</b> It is {q.name}.</>}{' '}
              <span className="text-muted">Taught in Module {q.mod.n}, {q.mod.title}{open ? '' : ` (${TIER_LABEL[q.mod.tier]})`}.</span></p>
            <span className="flex gap-2">
              <a href={`#/lab/${q.mod.id}`} className="btn-secondary !h-9 !text-sm">{open ? 'Study it' : 'See the module'}</a>
              <button className="btn-primary !h-9 !text-sm btn-arrow" onClick={() => { next(); box.current?.focus(); }} autoFocus>Next</button>
            </span>
          </> : <p className="text-sm text-muted">Pick an answer{' '}<span className="hidden sm:inline">or press 1, 2 or 3</span>. Teaching models drawn by the lab's heart model.</p>}
        </div>
      </div>
    </div>
  );
}
