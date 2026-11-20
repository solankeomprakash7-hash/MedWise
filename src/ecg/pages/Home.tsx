import * as React from 'react';
import { useApp } from '../EcgApp';
import { LEVELS, UNITS } from '../data/curriculum';
import { dailyEcg, dueCards, nextUnit, readsLeft, skillPct } from '../lib/logic';
import { today } from '../lib/progress';
import { Flame, CalendarCheck, Repeat, BookOpen, ArrowRight, Timer, GraduationCap } from 'lucide-react';

const SKILLS: [string, string][] = [['rate', 'Rate'], ['rhythm', 'Rhythm'], ['axis', 'Axis'], ['pr', 'PR'], ['qrs', 'QRS'], ['qt', 'QT'], ['tags', 'ST–T'], ['dx', 'Diagnosis'], ['act', 'Next step']];

export default function Home() {
  const { p, plan, user, signIn } = useApp();
  if (p.level == null) return (
    <section className="flex flex-col gap-8">
      <div className="max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-nejm-red">For students, interns and residents</p>
        <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mt-2">Learn ECG from zero to ward-ready.</h1>
        <p className="text-lg text-nejm-text/80 mt-4">Watch the heart write each wave, then read real 12-lead ECGs with calipers and get every step marked. Start with a 10-minute placement test so you begin at your level.</p>
        <div className="flex flex-wrap gap-3 mt-6">
          <a href="#/placement" className="nejm-btn inline-flex items-center gap-2">Find my level <ArrowRight size={16} /></a>
          <a href="#/learn" className="px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] border border-nejm-border text-nejm-blue">Start from the basics</a>
        </div>
        {!user && <p className="text-xs text-slate-500 mt-4">No account needed to try. <button className="underline text-nejm-blue" onClick={signIn}>Sign in</button> to keep your progress on every device.</p>}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {LEVELS.map(l => <div key={l.n} className="border border-nejm-border bg-white p-4">
          <p className="font-mono text-xs text-nejm-red">Level {l.n}{l.ready ? '' : ' · coming soon'}</p>
          <p className="font-serif font-bold text-lg text-nejm-blue">{l.name}</p>
          <p className="text-sm text-slate-600 mt-1">{l.outcome}</p>
        </div>)}
      </div>
    </section>
  );

  const nu = nextUnit(p), due = dueCards(p).length, daily = dailyEcg(p), doneToday = p.daily.last === today();
  const left = readsLeft(plan, p);
  const lvl = LEVELS[(p.level ?? 1) - 1];
  const done = UNITS.filter(u => p.units[u.id]?.done).length;
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">You are on Level {lvl.n} · {lvl.name}</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">{user?.displayName ? `Welcome back, ${user.displayName.split(' ')[0]}.` : 'Welcome back.'}</h1>
        </div>
        <div className="flex gap-6 font-mono text-sm tabular-nums">
          <span className="flex items-center gap-1.5"><Flame size={16} className="text-nejm-red" /> {p.daily.streak} day streak</span>
          <span className="flex items-center gap-1.5"><BookOpen size={16} className="text-nejm-blue" /> {done}/{UNITS.length} units</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <a href="#/practice/daily" className={`p-5 border bg-white flex flex-col gap-2 ${doneToday ? 'border-nejm-border' : 'border-nejm-blue shadow-[inset_0_3px_0_#991b1b]'}`}>
          <CalendarCheck className="text-nejm-blue" size={22} />
          <span className="font-serif font-bold text-lg text-nejm-blue">Today's ECG</span>
          <span className="text-sm text-slate-600">{doneToday ? 'Done for today. Come back tomorrow to keep your streak.' : `One real ECG, about 2 minutes. Level ${daily.level}.`}</span>
        </a>
        <a href={nu ? `#/unit/${nu.id}` : '#/learn'} className="p-5 border border-nejm-border bg-white flex flex-col gap-2">
          <BookOpen className="text-nejm-blue" size={22} />
          <span className="font-serif font-bold text-lg text-nejm-blue">{nu ? 'Continue learning' : 'All written units done'}</span>
          <span className="text-sm text-slate-600">{nu ? `${nu.title} · ${nu.minutes} min` : 'Levels 3 and 4 are on the way.'}</span>
        </a>
        <a href="#/practice" className="p-5 border border-nejm-border bg-white flex flex-col gap-2">
          <Repeat className="text-nejm-blue" size={22} />
          <span className="font-serif font-bold text-lg text-nejm-blue">Practise reading</span>
          <span className="text-sm text-slate-600">{due ? `${due} ECG${due > 1 ? 's' : ''} due for review.` : 'Read a new real 12-lead.'}{left !== Infinity ? ` ${left} free read${left === 1 ? '' : 's'} left this week.` : ''}</span>
        </a>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <a href="#/emergency" className="p-5 border border-nejm-border bg-white flex gap-4 items-start">
          <Timer className="text-nejm-red shrink-0" size={22} /><span><span className="font-serif font-bold text-lg text-nejm-blue block">Emergency mode</span>
            <span className="text-sm text-slate-600">30 seconds per ECG: choose the action and the diagnosis.</span></span></a>
        <a href="#/exam" className="p-5 border border-nejm-border bg-white flex gap-4 items-start">
          <GraduationCap className="text-nejm-blue shrink-0" size={22} /><span><span className="font-serif font-bold text-lg text-nejm-blue block">Exam mode</span>
            <span className="text-sm text-slate-600">A timed paper of ECG and theory questions, marked at the end.</span></span></a>
      </div>

      <div>
        <h2 className="text-xl font-serif font-bold mb-3">Your reading skills</h2>
        <div className="grid sm:grid-cols-3 gap-x-8 gap-y-2">
          {SKILLS.map(([k, l]) => { const v = skillPct(p, k);
            return <div key={k} className="grid grid-cols-[6rem_1fr_3rem] items-center gap-2 text-xs font-mono">
              <span>{l}</span><span className="h-1.5 bg-nejm-border"><span className={`block h-full ${v == null ? '' : v < 50 ? 'bg-nejm-red' : v < 75 ? 'bg-amber-600' : 'bg-green-700'}`} style={{ width: `${v ?? 0}%` }} /></span>
              <span className="text-right text-slate-500">{v == null ? '—' : v + '%'}</span></div>; })}
        </div>
        {p.placement && <p className="text-xs text-slate-500 mt-3">Placement score {p.placement.total}/12. <a className="underline" href="#/placement">Retake</a></p>}
      </div>
    </section>
  );
}
