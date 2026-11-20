import * as React from 'react';
import { useApp } from '../EcgApp';
import Quiz from '../components/Quiz';
import { PLACEMENT, placeLevel } from '../data/placement';
import { LEVELS } from '../data/curriculum';

export default function Placement() {
  const { update, go, user, signIn } = useApp();
  const [res, setRes] = React.useState<ReturnType<typeof placeLevel> | null>(null);
  if (!res) return (
    <section className="flex flex-col gap-5 max-w-3xl">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-nejm-red">Placement test · 12 questions · about 10 minutes</p>
        <h1 className="text-3xl font-serif font-bold">Find your level</h1>
        <p className="text-slate-600 mt-1">Four questions on the basics, four real ECGs to read, four emergencies. Answer honestly; a lower start costs you nothing.</p>
      </div>
      <Quiz qs={PLACEMENT} finishLabel="See my level" onFinish={ans => {
        const r = placeLevel(ans); setRes(r);
        update(p => ({ ...p, level: r.level, placement: { sec: r.sec, total: r.total, at: new Date().toISOString() } }));
      }} />
    </section>
  );
  const lv = LEVELS[res.level - 1];
  const names = ['Basics', 'Reading', 'Emergencies'];
  return (
    <section className="flex flex-col gap-6 max-w-2xl">
      <div className="border-l-4 border-nejm-red pl-4">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Your result · {res.total} of 12</p>
        <h1 className="text-3xl font-serif font-bold">Start at Level {lv.n}: {lv.name}</h1>
        <p className="text-slate-600 mt-1">{lv.forWho}. By the end you will {lv.outcome.charAt(0).toLowerCase() + lv.outcome.slice(1)}.</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {res.sec.map((s, i) => <div key={i} className="border border-nejm-border bg-white p-3">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{names[i]}</p>
          <p className="font-mono text-2xl tabular-nums">{s}/4</p></div>)}
      </div>
      {res.level >= 3 && <p className="text-sm text-slate-600">Try emergency mode next: 30 seconds per ECG to choose the action.</p>}
      <div className="flex flex-wrap gap-3">
        <button className="nejm-btn" onClick={() => go('learn')}>Go to my path</button>
        <button className="px-5 py-3 text-xs font-bold uppercase tracking-widest border border-nejm-border text-nejm-blue" onClick={() => go('practice')}>Read a real ECG</button>
      </div>
      {!user && <p className="text-xs text-slate-500"><button className="underline text-nejm-blue" onClick={signIn}>Create a free account</button> to keep this result and your progress.</p>}
    </section>
  );
}
