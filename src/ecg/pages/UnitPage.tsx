import * as React from 'react';
import { useApp } from '../EcgApp';
import { UNITS } from '../data/curriculum';
import { ECGS, unitOpen } from '../lib/logic';
import Quiz from '../components/Quiz';
import { PlayCircle } from 'lucide-react';

export default function UnitPage({ id }: { id: string }) {
  const { p, update, plan, go } = useApp();
  const u = UNITS.find(x => x.id === id);
  const [lab, setLab] = React.useState(false);
  const [score, setScore] = React.useState<number | null>(null);
  React.useEffect(() => { setLab(false); setScore(null); }, [id]);
  if (!u) return <p>Unit not found. <a className="underline" href="#/learn">Back to the path</a></p>;
  if (!unitOpen(plan, u.id)) { go('upgrade'); return null; }
  const idx = UNITS.indexOf(u), next = UNITS[idx + 1];
  const reals = ECGS.filter(e => u.practice.includes(e.pattern)).length;
  return (
    <article className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Level {u.level} · {u.minutes} min</p>
        <h1 className="text-3xl md:text-4xl font-serif font-bold">{u.title}</h1>
        <p className="text-lg text-nejm-text/80 mt-2 max-w-prose">{u.summary}</p>
      </div>
      <ul className="flex flex-col gap-3 max-w-prose">
        {u.points.map((t, i) => <li key={i} className="flex gap-3"><span className="h-1.5 w-1.5 bg-nejm-red mt-2.5 shrink-0" /><span>{t}</span></li>)}
      </ul>
      <div className="border border-nejm-border bg-white">
        {lab ? <iframe title="Interactive ECG lab" src={`/ecg-lab.html?embed=1#${u.lab}`} className="w-full block" style={{ height: '82vh', minHeight: 640, border: 0 }} />
          : <button type="button" onClick={() => setLab(true)} className="w-full flex items-center gap-3 p-5 text-left hover:bg-nejm-gray">
            <PlayCircle size={28} className="text-nejm-red shrink-0" /><span><span className="font-serif font-bold text-lg text-nejm-blue block">{u.labLabel}</span>
              <span className="text-sm text-slate-500">Opens the interactive heart and tracing. Slow it to 0.1×, step through, and tap leads.</span></span></button>}
      </div>
      <div>
        <h2 className="text-xl font-serif font-bold mb-3">Check yourself</h2>
        {score == null ? <Quiz qs={u.quiz} finishLabel="Finish unit" onFinish={ans => {
          const s = ans.filter((a, i) => a === u.quiz[i].a).length; setScore(s);
          update(pr => ({ ...pr, level: pr.level ?? 1, units: { ...pr.units, [u.id]: { done: s >= 2 || !!pr.units[u.id]?.done, score: Math.max(s, pr.units[u.id]?.score ?? 0), at: new Date().toISOString() } } }));
        }} /> : <div className="nejm-card flex flex-col gap-3">
          <p className="font-serif text-xl font-bold">{score}/3 {score >= 2 ? '· Unit complete' : '· Review the points and try again'}</p>
          <div className="flex flex-wrap gap-3">
            {score < 2 && <button className="nejm-btn" onClick={() => setScore(null)}>Try again</button>}
            {reals > 0 && <a className="px-5 py-3 text-xs font-bold uppercase tracking-widest border border-nejm-border text-nejm-blue" href="#/practice">Read real ECGs ({reals} on this topic)</a>}
            {next && score >= 2 && <a className="nejm-btn" href={unitOpen(plan, next.id) ? `#/unit/${next.id}` : '#/upgrade'}>Next: {next.title}</a>}
          </div>
        </div>}
      </div>
      <p className="text-xs text-slate-400">{p.units[u.id]?.done ? 'Completed.' : ''}</p>
    </article>
  );
}
