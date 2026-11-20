import * as React from 'react';
import { useApp } from '../EcgApp';
import { LEVELS, unitsFor } from '../data/curriculum';
import { unitOpen } from '../lib/logic';
import { CheckCircle2, Lock, Circle } from 'lucide-react';

export default function Learn() {
  const { p, plan } = useApp();
  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Your learning path</h1>
        <p className="text-slate-600 mt-1">Four levels. Each unit takes 10–15 minutes and ends with three questions. {p.level ? `You were placed at Level ${p.level}; earlier levels stay open for revision.` : <a className="underline text-nejm-blue" href="#/placement">Take the placement test</a>}</p>
      </div>
      {LEVELS.map(l => {
        const us = unitsFor(l.n);
        return (
          <div key={l.n} className={`border border-nejm-border bg-white ${p.level === l.n ? 'shadow-[inset_4px_0_0_#991b1b]' : ''}`}>
            <div className="px-5 py-4 border-b border-nejm-border flex flex-wrap justify-between gap-2 items-baseline">
              <div><p className="font-mono text-xs text-nejm-red">Level {l.n}</p><h2 className="text-xl font-serif font-bold">{l.name}</h2></div>
              <p className="text-sm text-slate-500">{l.forWho}</p>
            </div>
            {us.length ? <ol>
              {us.map((u, i) => { const open = unitOpen(plan, u.id), st = p.units[u.id];
                return <li key={u.id} className="border-b border-nejm-border last:border-b-0">
                  <a href={open ? `#/unit/${u.id}` : '#/upgrade'} className="flex items-center gap-3 px-5 py-3 hover:bg-nejm-gray">
                    {st?.done ? <CheckCircle2 size={18} className="text-green-700 shrink-0" /> : open ? <Circle size={18} className="text-slate-300 shrink-0" /> : <Lock size={16} className="text-slate-400 shrink-0" />}
                    <span className="flex-1 min-w-0"><span className="font-semibold text-nejm-blue">{i + 1}. {u.title}</span>
                      <span className="block text-xs text-slate-500">{u.minutes} min{st ? ` · quiz ${st.score}/3` : ''}{!open ? (u.level >= 3 ? ' · Pro' : ' · Student or Pro') : ''}</span></span>
                  </a></li>; })}
            </ol> : <p className="px-5 py-4 text-sm text-slate-500">Coming soon: {l.outcome.toLowerCase()}.</p>}
          </div>);
      })}
    </section>
  );
}
