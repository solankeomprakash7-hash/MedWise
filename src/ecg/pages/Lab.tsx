import * as React from 'react';
import { useApp } from '../EcgApp';
import { LAB_MODULES, TIER_LABEL, labOpen, moduleStatus, type LabModule, type Tier } from '../data/labModules';
import { PRICE, inr } from '../data/plans';
import { Check, Lock, ChevronRight } from 'lucide-react';
import ProgressRing from '../components/ProgressRing';
import SpotIt from '../components/SpotIt';

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
        <p className="text-sm text-muted lg:text-right">{done} of {LAB_MODULES.length} modules complete · {open.length} open to you</p>
      </div>

      <ModulePath />

      <SpotIt />

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
          <ProgressRing pct={st.pct} done={st.done} size={36}>{st.pct}</ProgressRing>
          <span className="text-sm text-muted flex-1">{st.done ? 'Complete' : st.pct ? 'In progress' : 'Not started'}</span>
          <ChevronRight size={18} className="text-line-strong transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
        </span> : <span className="text-sm font-medium text-gold-ink flex items-center gap-1">See what's inside <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" /></span>}
      </div>
    </a>
  );
}

/** The whole course as one path. Hover, focus or tap a stop to preview it; open it from the preview. */
function ModulePath() {
  const { p, plan } = useApp();
  const states = LAB_MODULES.map(m => ({ m, open: labOpen(plan, m.tier), st: moduleStatus(m, p.lab?.[m.id]) }));
  const cur = states.find(x => x.open && !x.st.done) ?? states[0];
  const [sel, setSel] = React.useState(cur.m.id);
  const s = states.find(x => x.m.id === sel)!;
  const doneN = states.filter(x => x.st.done).length;
  return (
    <div className="card p-5 md:p-6 flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl">Your path through the lab</h2>
        <span className="text-sm text-muted font-mono tabular-nums">{doneN}/{LAB_MODULES.length} complete</span>
      </div>
      <div className="relative -mx-2 overflow-x-auto pb-1">
        <ol className="relative flex items-center justify-between gap-1 min-w-[620px] px-2" aria-label="Lab modules">
          <span className="absolute left-6 right-6 top-1/2 h-0.5 -translate-y-1/2 bg-line" aria-hidden="true" />
          <span className="absolute left-6 top-1/2 h-0.5 -translate-y-1/2 bg-accent transition-[width] duration-700"
            style={{ width: `calc((100% - 3rem) * ${Math.max(0, states.findIndex(x => x.m.id === cur.m.id)) / (LAB_MODULES.length - 1)})` }} aria-hidden="true" />
          {states.map(({ m, open, st }) => {
            const here = m.id === cur.m.id && !st.done, on = m.id === sel;
            return <li key={m.id} className="relative">
              <button onMouseEnter={() => setSel(m.id)} onFocus={() => setSel(m.id)} onClick={() => setSel(m.id)}
                aria-pressed={on} aria-label={`Module ${m.n}, ${m.title}: ${st.done ? 'complete' : open ? `${st.pct}% done` : `locked, ${TIER_LABEL[m.tier]}`}`}
                className={`path-stop relative rounded-full bg-card p-0.5 transition-transform duration-200 ${on ? 'scale-110' : 'hover:scale-105'} ${here ? 'path-here' : ''}`}>
                <ProgressRing pct={st.pct} done={st.done} locked={!open} size={40}>{m.n}</ProgressRing>
                {on && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-ink" aria-hidden="true" />}
              </button>
            </li>;
          })}
        </ol>
      </div>
      <div key={s.m.id} className="path-preview grid md:grid-cols-[1fr_auto] gap-4 items-center rounded-md bg-surface border border-line p-4" aria-live="polite">
        <div className="min-w-0">
          <p className="eyebrow">Module {s.m.n} · {TIER_LABEL[s.m.tier]} · about {s.m.minutes} min{s.m.id === cur.m.id && !s.st.done ? ' · Up next' : ''}</p>
          <h3 className="text-lg mt-1">{s.m.title}</h3>
          <p className="text-sm text-muted mt-1">{s.st.done ? 'Complete. Revisit it any time.' : s.open ? s.st.todo : s.m.summary}</p>
        </div>
        <a href={`#/lab/${s.m.id}`} className={`${s.open ? 'btn-primary btn-arrow' : 'btn-secondary'} max-md:w-full`}>
          {!s.open ? <><Lock size={14} />See what's inside</> : s.st.done ? 'Revisit' : s.st.pct ? 'Continue' : 'Start'}</a>
      </div>
    </div>
  );
}
