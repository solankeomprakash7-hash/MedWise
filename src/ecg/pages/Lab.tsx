import * as React from 'react';
import { useApp } from '../EcgApp';
import { LAB_MODULES, TIER_LABEL, labOpen, moduleStatus, type LabModule, type Tier } from '../data/labModules';
import { PRICE, inr } from '../data/plans';
import { Check, Lock, ChevronRight } from 'lucide-react';

const TIERS: { t: Tier; title: string; note: string }[] = [
  { t: 'free', title: 'Free modules', note: 'Open to everyone. No account or card needed; sign in only to keep progress across devices.' },
  { t: 'student', title: 'Student modules', note: `Included in Student (${inr(PRICE.student.month)}/month or ${inr(PRICE.student.year)}/year) and Pro.` },
  { t: 'pro', title: 'Pro modules', note: `Included in Pro (${inr(PRICE.pro.month)}/month or ${inr(PRICE.pro.year)}/year).` },
];

export default function Lab() {
  const { p, plan } = useApp();
  const open = LAB_MODULES.filter(m => labOpen(plan, m.tier));
  const done = LAB_MODULES.filter(m => p.lab?.[m.id]?.done).length;
  const next = open.find(m => !p.lab?.[m.id]?.done);
  return (
    <section className="flex flex-col gap-10">
      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 items-end">
        <div className="flex flex-col gap-3 max-w-2xl">
          <p className="eyebrow eyebrow-dot">Interactive lab</p>
          <h1 className="text-3xl md:text-[44px] leading-tight">Watch the heart write its own ECG</h1>
          <p className="text-muted">{LAB_MODULES.length} modules, from the first P wave to bedside cases. Each module runs a live heart model: the conduction system fires, the vector swings, and all twelve leads draw it in step. Slow it down, step 20 ms at a time, measure with calipers, then test yourself.</p>
          <div className="flex flex-wrap gap-3 pt-1">
            {next && <a href={`#/lab/${next.id}`} className="btn-primary btn-arrow max-sm:w-full">{p.lab?.[next.id] ? 'Continue' : 'Start'}: {next.title}</a>}
            {plan === 'free' && <a href="#/upgrade" className="btn-secondary max-sm:w-full">Compare plans</a>}
          </div>
        </div>
        <div className="card p-5 grid grid-cols-3 gap-3 text-center">
          {(['free', 'student', 'pro'] as Tier[]).map(t => {
            const n = LAB_MODULES.filter(m => m.tier === t).length, mine = labOpen(plan, t);
            return <div key={t} className="flex flex-col gap-1">
              <span className="font-mono text-2xl tabular-nums">{n}</span>
              <span className="text-xs text-muted">{TIER_LABEL[t]} module{n > 1 ? 's' : ''}</span>
              <span className={`text-[11px] font-medium ${mine ? 'text-ok' : 'text-gold-ink'}`}>{mine ? 'Open to you' : 'Locked'}</span>
            </div>;
          })}
          <p className="col-span-3 text-xs text-muted border-t border-line pt-3">{done} of {LAB_MODULES.length} modules complete</p>
        </div>
      </div>

      {TIERS.map(({ t, title, note }) => (
        <div key={t} className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl flex items-center gap-2">{title}{!labOpen(plan, t) && <span className="chip-gold"><Lock size={12} />{TIER_LABEL[t]}</span>}</h2>
            <p className="text-sm text-muted max-w-xl">{note}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LAB_MODULES.filter(m => m.tier === t).map(m => <ModuleCard key={m.id} m={m} />)}
          </div>
        </div>
      ))}

      <p className="text-xs text-muted">The lab draws teaching models from one moving heart vector, so every lead stays consistent with the anatomy on screen. They are not patient recordings; practise on real ECGs in <a className="underline" href="#/practice">Practise</a>.</p>
    </section>
  );
}

function ModuleCard({ m }: { m: LabModule }) {
  const { p, plan } = useApp();
  const open = labOpen(plan, m.tier), st = moduleStatus(m, p.lab?.[m.id]);
  return (
    <a href={`#/lab/${m.id}`} className="card p-5 flex flex-col gap-3 group">
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow">Module {m.n}</span>
        {st.done ? <span className="chip-accent"><Check size={12} />Complete</span>
          : open ? (m.tier === 'free' ? <span className="chip">Free</span> : <span className="chip">{TIER_LABEL[m.tier]}</span>)
          : <span className="chip-gold"><Lock size={12} />{TIER_LABEL[m.tier]}</span>}
      </div>
      <div>
        <h3 className={`text-lg leading-snug ${open ? '' : 'text-ink/70'}`}>{m.title}</h3>
        <p className="text-sm text-muted mt-1">{m.summary}</p>
      </div>
      <div className="mt-auto flex flex-col gap-2">
        <span className="text-xs text-muted">{m.stations.length ? `${m.stations.length} ${m.stationKind === 'case' ? 'cases' : 'stations'} · ` : ''}about {m.minutes} min</span>
        {open ? <span className="flex items-center gap-3">
          <span className="flex-1 h-1.5 rounded-full bg-line overflow-hidden"><span className={`block h-full rounded-full ${st.done ? 'bg-ok' : 'bg-accent'}`} style={{ width: `${st.pct}%` }} /></span>
          <span className="font-mono text-xs tabular-nums text-muted w-9 text-right">{st.pct}%</span>
        </span> : <span className="text-sm font-medium text-gold-ink flex items-center gap-1">See what's inside <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" /></span>}
      </div>
    </a>
  );
}
