import * as React from 'react';
import { useApp } from '../EcgApp';
import { ACTS, label } from '../data/options';
import { type RealEcg, DX, ECGS, EMERGENCY_SAMPLE, dxOk, imgOf } from '../lib/logic';
import EcgViewer from '../components/EcgViewer';
import { Timer } from 'lucide-react';

const SECONDS = 30, ROUND = 10;
// Emergencies plus a few benign tracings, so learners also practise not over-calling.
const POOL = ECGS.filter(e => e.level === 3 || ['normal', 'sinus_tachy', 'early_repol', 'irbbb', 'sinus_arrh'].includes(e.pattern));
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
function makeRound(n: number) {
  const byPattern = new Map<string, RealEcg[]>(); POOL.forEach(e => byPattern.set(e.pattern, [...(byPattern.get(e.pattern) || []), e]));
  return shuffle([...byPattern.values()].map(l => l[Math.floor(Math.random() * l.length)])).slice(0, n).map(e => {
    const wrong = shuffle(DX.filter(([k]) => !dxOk(e.pattern, k) && k !== e.pattern)).slice(0, 3).map(d => d[0]);
    return { e, dxOpts: shuffle([e.pattern, ...wrong]) };
  });
}
type Ans = { act?: string; dx?: string; ms: number };

export default function Emergency() {
  const { plan } = useApp();
  const n = plan === 'pro' ? ROUND : EMERGENCY_SAMPLE;
  const [round, setRound] = React.useState(() => makeRound(n));
  const [i, setI] = React.useState(-1);
  const [ans, setAns] = React.useState<Ans[]>([]);
  const [left, setLeft] = React.useState(SECONDS);
  const t0 = React.useRef(0);
  const cur: Ans = ans[i] || { ms: 0 };

  React.useEffect(() => {
    if (i < 0 || i >= round.length) return;
    t0.current = performance.now(); setLeft(SECONDS);
    const id = setInterval(() => { const l = SECONDS - Math.floor((performance.now() - t0.current) / 1000); setLeft(l); if (l <= 0) { clearInterval(id); advance(); } }, 250);
    return () => clearInterval(id);
  }, [i]); // eslint-disable-line
  function advance() { setAns(a => { const n2 = [...a]; n2[i] = { ...(n2[i] || {}), ms: performance.now() - t0.current }; return n2; }); setI(x => x + 1); }
  const set = (p: Partial<Ans>) => setAns(a => { const n2 = [...a]; n2[i] = { ...(n2[i] || { ms: 0 }), ...p }; return n2; });

  if (i < 0) return (
    <section className="max-w-2xl flex flex-col gap-4">
      <p className="eyebrow eyebrow-dot">Level 3 · Emergency mode</p>
      <h1 className="text-3xl font-display">30 seconds per ECG</h1>
      <p className="text-muted">{n} ECGs, as if handed to you at the bedside. For each, choose what you do now and name the diagnosis before the clock runs out. Some are normal: knowing when not to act counts too.</p>
      {plan !== 'pro' && <p className="text-sm text-muted">You are on a {EMERGENCY_SAMPLE}-ECG sample round. <a className="underline text-ink" href="#/upgrade">Pro</a> gives full 10-ECG rounds.</p>}
      <div><button className="btn-primary" onClick={() => setI(0)}>Start</button></div>
    </section>
  );
  if (i >= round.length) {
    const actRight = round.filter((r, k) => r.e.key.act.includes(ans[k]?.act || '')).length;
    const dxRight = round.filter((r, k) => dxOk(r.e.pattern, ans[k]?.dx)).length;
    const avg = Math.round(ans.reduce((s, a) => s + (a?.ms || SECONDS * 1000), 0) / round.length / 1000);
    return (
      <section className="flex flex-col gap-5">
        <div className="border-l-4 border-accent pl-4">
          <p className="eyebrow">Round complete · average {avg} s per ECG</p>
          <h1 className="text-3xl font-display">Right action {actRight}/{round.length} · right diagnosis {dxRight}/{round.length}</h1>
        </div>
        <ol className="flex flex-col gap-3">
          {round.map((r, k) => { const a = ans[k] || { ms: 0 }, okA = r.e.key.act.includes(a.act || ''), okD = dxOk(r.e.pattern, a.dx);
            return <li key={k} className="card p-4 grid md:grid-cols-[220px_1fr] gap-4">
              <img src={imgOf(r.e.id)} alt={r.e.title} className="w-full border border-line" />
              <div className="text-sm flex flex-col gap-1 min-w-0">
                <p className="font-display text-lg text-ink">{r.e.title}{r.e.model ? <span className="ml-2 text-[10px] font-sans uppercase tracking-wider text-muted">teaching model</span> : null}</p>
                <p><span className={okA ? 'text-ok font-semibold' : 'text-bad font-semibold'}>{okA ? '✓' : '✗'} Action:</span> {a.act ? label(ACTS, a.act) : 'no answer'}{!okA && <> → <b>{r.e.key.act.map(x => label(ACTS, x)).join(' or ')}</b></>}</p>
                <p><span className={okD ? 'text-ok font-semibold' : 'text-bad font-semibold'}>{okD ? '✓' : '✗'} Diagnosis:</span> {a.dx ? (DX.find(d => d[0] === a.dx) || ['', a.dx])[1] : 'no answer'}</p>
                <p className="text-muted">{r.e.teach}</p>
              </div></li>; })}
        </ol>
        <div className="flex gap-3"><button className="btn-primary" onClick={() => { setRound(makeRound(n)); setAns([]); setI(0); }}>New round</button><a href="#/home" className="btn-secondary">Home</a></div>
      </section>
    );
  }
  const r = round[i];
  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-between items-center gap-3">
        <p className="eyebrow">ECG {i + 1} of {round.length}</p>
        <span className={`flex items-center gap-1.5 font-mono text-2xl tabular-nums ${left <= 10 ? 'text-bad' : 'text-ink'}`} aria-live="off"><Timer size={20} />{Math.max(0, left)}s</span>
      </div>
      <div className="h-1 bg-line"><div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${100 * Math.max(0, left) / SECONDS}%` }} /></div>
      <EcgViewer src={imgOf(r.e.id)} alt="ECG handed to you at the bedside" />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5"><p className="font-display text-ink">What do you do now?</p>
          {ACTS.map(([k, l]) => <button key={k} type="button" aria-pressed={cur.act === k} onClick={() => set({ act: k })}
            className={`rounded-md text-left px-3 py-2 text-sm border ${cur.act === k ? 'border-ink bg-ink/5 font-semibold' : 'border-line bg-white'}`}>{l}</button>)}</div>
        <div className="flex flex-col gap-1.5"><p className="font-display text-ink">Diagnosis</p>
          {r.dxOpts.map(k => <button key={k} type="button" aria-pressed={cur.dx === k} onClick={() => set({ dx: k })}
            className={`rounded-md text-left px-3 py-2 text-sm border ${cur.dx === k ? 'border-ink bg-ink/5 font-semibold' : 'border-line bg-white'}`}>{(DX.find(d => d[0] === k) || ['', k])[1]}</button>)}
          <button className="btn-primary mt-2" disabled={!cur.act || !cur.dx} onClick={advance}>{i + 1 < round.length ? 'Next ECG' : 'Finish'}</button></div>
      </div>
    </section>
  );
}
