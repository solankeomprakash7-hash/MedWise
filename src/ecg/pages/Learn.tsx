import * as React from 'react';
import { useApp } from '../EcgApp';
import { LEVELS, unitsFor } from '../data/curriculum';
import { ECGS, unitOpen } from '../lib/logic';
import { Check, Lock, ChevronRight } from 'lucide-react';
import { UNIT_TO_MODULE } from '../data/course';
import { LAB_MODULES } from '../data/labModules';

export default function Learn() {
  const { p, plan } = useApp();
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 max-w-2xl">
        <p className="eyebrow eyebrow-dot">Learning path</p>
        <h1 className="text-3xl md:text-[44px] leading-tight">Four levels, 24 short units</h1>
        <p className="text-muted">Each unit takes 10 to 15 minutes, ends with three questions, and opens real ECGs on the same topic. {p.level ? `You were placed at Level ${p.level}; earlier levels stay open for revision.` : <a className="link" href="#/placement">Take the placement test</a>}</p>
      </div>
      {LEVELS.map(l => {
        const us = unitsFor(l.n), done = us.filter(u => p.units[u.id]?.done).length, here = p.level === l.n;
        const locked = us.every(u => !unitOpen(plan, u.id));
        return (
          <div key={l.n} className={`card overflow-hidden ${here ? 'ring-2 ring-accent/60' : ''}`}>
            <div className="px-5 md:px-6 py-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line">
              <span className={`w-11 h-11 rounded-md flex items-center justify-center font-mono text-lg shrink-0 ${done === us.length ? 'bg-ok text-white' : here ? 'bg-ink text-white' : 'bg-surface border border-line text-ink'}`}>{done === us.length ? <Check size={20} /> : l.n}</span>
              <div className="flex-1 min-w-[12rem]">
                <div className="flex flex-wrap items-center gap-2"><h2 className="text-xl">{l.name}</h2>{here && <span className="chip-accent">You are here</span>}{locked && <span className="chip-gold"><Lock size={12} />{l.n >= 3 ? 'Pro' : 'Student or Pro'}</span>}</div>
                <p className="text-sm text-muted mt-0.5">{l.forWho}. {l.outcome}.</p>
              </div>
              <div className="w-full sm:w-40">
                <span className="flex justify-between text-xs text-muted mb-1.5"><span>Progress</span><span className="font-mono">{done}/{us.length}</span></span>
                <span className="block h-1.5 rounded-full bg-line overflow-hidden"><span className="block h-full rounded-full bg-accent" style={{ width: `${100 * done / us.length}%` }} /></span>
              </div>
            </div>
            <ol>
              {us.map((u, i) => {
                const open = unitOpen(plan, u.id), st = p.units[u.id];
                const n = ECGS.filter(e => u.practice.includes(e.pattern)).length;
                return <li key={u.id} className="border-b border-line last:border-b-0">
                  <a href={open ? `#/unit/${u.id}` : '#/upgrade'} className="group flex items-center gap-4 px-5 md:px-6 py-3.5 transition-colors hover:bg-surface">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono shrink-0 ${st?.done ? 'bg-ok text-white' : open ? 'border border-line-strong text-ink' : 'bg-surface text-muted'}`}>{st?.done ? <Check size={14} /> : open ? i + 1 : <Lock size={12} />}</span>
                    <span className="flex-1 min-w-0">
                      <span className={`block font-medium ${open ? 'text-ink' : 'text-muted'}`}>{u.title}</span>
                      <span className="block text-xs text-muted mt-0.5">{u.minutes} min{n ? ` · ${n} practice ECGs` : ''}{st ? ` · quiz ${st.score}/3` : ''}{UNIT_TO_MODULE[u.id] ? ` · full lesson in Lab Module ${LAB_MODULES.find(x => x.id === UNIT_TO_MODULE[u.id])?.n}` : ''}</span>
                    </span>
                    <ChevronRight size={18} className="text-line-strong shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                  </a></li>;
              })}
            </ol>
          </div>);
      })}
    </section>
  );
}
