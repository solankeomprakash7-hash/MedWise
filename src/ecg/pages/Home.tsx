import * as React from 'react';
import { useApp } from '../EcgApp';
import { LEVELS, UNITS, unitsFor } from '../data/curriculum';
import { ECGS, dailyEcg, dueCards, imgOf, nextUnit, readsLeft, skillPct } from '../lib/logic';
import { today } from '../lib/progress';
import Monitor from '../components/Monitor';
import { LAB_MODULES, labOpen, moduleStatus } from '../data/labModules';
import { Flame, BookOpen, Activity, Target, Check, Timer, GraduationCap, CalendarCheck, Repeat, FlaskConical } from 'lucide-react';

const SKILLS: [string, string][] = [['rate', 'Rate'], ['rhythm', 'Rhythm'], ['axis', 'Axis'], ['pr', 'PR'], ['qrs', 'QRS'], ['qt', 'QT'], ['tags', 'ST–T'], ['dx', 'Diagnosis'], ['act', 'Next step']];
const REAL = ECGS.filter(e => !e.model).length, MODELS = ECGS.length - REAL;

type BIP = Event & { prompt: () => Promise<void> };
let deferred: BIP | null = null;
if (typeof window !== 'undefined') addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e as BIP; });
function InstallButton() {
  const [can, setCan] = React.useState(!!deferred);
  React.useEffect(() => { const f = () => setCan(true); addEventListener('beforeinstallprompt', f); return () => removeEventListener('beforeinstallprompt', f); }, []);
  if (!can) return null;
  return <button className="btn-secondary" onClick={async () => { await deferred?.prompt(); deferred = null; setCan(false); }}>Install the app</button>;
}

/** The graded read beside the monitor: what the drill marks, step by step. */
const READ: [string, string, boolean | null][] = [['Rate', '86/min', true], ['Rhythm', 'Sinus', true], ['Axis', 'Normal', true], ['PR', '160 ms', true], ['QRS', '88 ms', true], ['ST–T', 'No change', true], ['Diagnosis', 'Normal ECG', true], ['Next step', '?', null]];

function Hero({ signedIn, signIn }: { signedIn: boolean; signIn: () => void }) {
  return (
    <section className="grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-14 items-center">
      <div className="flex flex-col gap-6">
        <p className="eyebrow eyebrow-dot">For medical students, interns and residents</p>
        <h1 className="text-[40px] leading-[1.04] md:text-[56px] tracking-[-0.035em] font-display">Learn ECG from zero to ward-ready</h1>
        <p className="text-lg text-muted max-w-[34rem]">Watch the heart write each wave, then read {REAL} real 12-lead ECGs with calipers and get every step marked, from rate to what you do next.</p>
        <div className="flex flex-wrap gap-3">
          <a href="#/placement" className="btn-primary btn-arrow max-sm:w-full">Find my level, free</a>
          <a href="#/learn" className="btn-secondary max-sm:w-full">Start from the basics</a>
        </div>
        <p className="text-sm text-muted">10-minute placement test, no account needed. {!signedIn && <><button className="link" onClick={signIn}>Sign in</button> to keep progress on every device.</>}</p>
      </div>
      <div className="card p-3 sm:p-4">
        <div className="flex items-center justify-between px-1 pb-3">
          <span className="flex items-center gap-2 text-sm font-medium"><span className="w-2 h-2 rounded-full bg-accent animate-pulse" />Lead II · real patient ECG</span>
          <span className="font-mono text-xs text-muted">25 mm/s · 10 mm/mV</span>
        </div>
        <div className="paper rounded-md overflow-hidden border border-line"><Monitor className="h-40 sm:h-48" /></div>
        <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          {READ.map(([k, v, ok], i) => (
            <li key={k} className={`rounded-sm border px-2.5 py-2 ${ok == null ? 'border-dashed border-line-strong bg-gold-soft/60' : 'border-line bg-surface'}`}>
              <span className="flex items-center justify-between text-[11px] text-muted"><span>{i + 1} · {k}</span>{ok && <Check size={13} className="text-ok" />}</span>
              <span className="block text-sm font-medium mt-0.5 truncate">{v}</span>
            </li>))}
        </ol>
      </div>
    </section>
  );
}

function Welcome() {
  const { signIn, user } = useApp();
  return (
    <div className="flex flex-col gap-20 md:gap-24">
      <Hero signedIn={!!user} signIn={signIn} />

      <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line rounded-lg overflow-hidden">
        {[[`${REAL}`, 'real 12-lead ECGs, read step by step'], [`${UNITS.length}`, 'short units in four levels'], [`${MODELS}`, 'animated emergency tracings'], ['30s', 'per ECG in emergency mode']].map(([n, l], i) => (
          <div key={l} className="bg-card py-6 px-5">
            <dt className="font-mono text-3xl md:text-4xl tabular-nums tracking-tight">{n}</dt><dd className="text-sm text-muted mt-1">{l}</dd></div>))}
      </dl>

      <section className="flex flex-col gap-8">
        <div className="max-w-2xl"><h2 className="text-3xl md:text-[40px] leading-tight">How you learn</h2>
          <p className="text-muted mt-2">Each level is a few short units. Every unit ends with real ECGs of the same pattern, so the idea turns into a reading skill.</p></div>
        <div className="grid md:grid-cols-3 gap-4">
          <a href="#/placement" className="card overflow-hidden flex flex-col">
            <div className="h-44 bg-surface border-b border-line p-5 flex flex-col justify-center gap-2">
              {['Lead II, about +60°', 'Atrial fibrillation', 'Pacing pads on'].map((t, i) => (
                <span key={t} className={`rounded-sm border px-3 py-2 text-sm ${i === 1 ? 'border-ok bg-card text-ok font-medium' : 'border-line bg-card text-muted'}`}>{t}</span>))}
            </div>
            <div className="p-5"><p className="eyebrow">1 · Place</p><h3 className="text-xl mt-1">Find your level in 10 minutes</h3><p className="text-sm text-muted mt-1">Basics, real ECGs and emergencies. Start where you are, not at page one.</p></div>
          </a>
          <a href="#/lab" className="card overflow-hidden flex flex-col">
            <div className="h-44 bg-[#f3eee3] border-b border-line overflow-hidden"><img src="/ecg/ui/lab-heart.webp" alt="The animated heart with its conduction system and the limb leads" className="w-full h-full object-cover object-top" loading="lazy" /></div>
            <div className="p-5"><p className="eyebrow">2 · Understand</p><h3 className="text-xl mt-1">Watch the heart write each wave</h3><p className="text-sm text-muted mt-1">{LAB_MODULES.length} lab modules, the first two free. Slow a beat, step through it and see why each lead goes up or down.</p></div>
          </a>
          <a href="#/practice" className="card overflow-hidden flex flex-col">
            <div className="h-44 paper border-b border-line overflow-hidden"><img src="/ecg/ui/ecg-crop.webp" alt="Part of a real 12-lead ECG showing right bundle branch block" className="w-full h-full object-cover object-left-top" loading="lazy" /></div>
            <div className="p-5"><p className="eyebrow">3 · Read</p><h3 className="text-xl mt-1">Read real ECGs, marked step by step</h3><p className="text-sm text-muted mt-1">Calipers on the tracing, nine steps, and a reason for every mark.</p></div>
          </a>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <div className="max-w-2xl"><h2 className="text-3xl md:text-[40px] leading-tight">Four levels, one reading habit</h2>
          <p className="text-muted mt-2">The placement test drops you in at the right one. Earlier levels stay open for revision.</p></div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LEVELS.map(l => (
            <li key={l.n} className="card p-5 flex flex-col gap-3">
              <span className="flex items-center justify-between"><span className="font-mono text-sm text-accent-ink">Level {l.n}</span><span className="text-xs text-muted">{unitsFor(l.n).length} units</span></span>
              <h3 className="text-xl">{l.name}</h3>
              <p className="text-sm text-muted">{l.outcome}.</p>
              <p className="text-xs text-muted mt-auto pt-3 border-t border-line">{l.forWho}</p>
            </li>))}
        </ol>
      </section>

      <section className="grid md:grid-cols-[1.2fr_1fr] gap-6 items-center card p-6 md:p-10">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl leading-tight">Built by a doctor, on real patient ECGs</h2>
          <p className="text-muted">MedWise ECG is made by Dr. Omprakash Solanke for the ward and the night on call. The real ECGs come from PTB-XL and the Chapman–Shaoxing database on PhysioNet, with every answer key checked by a doctor. Emergencies the datasets lack are drawn by the same heart model you learn from, and labelled as teaching models.</p>
          <div className="flex flex-wrap gap-3 pt-2"><a href="#/placement" className="btn-primary btn-arrow">Find my level, free</a><a href="#/upgrade" className="btn-secondary">See plans</a></div>
        </div>
        <ul className="flex flex-col gap-3 text-sm">
          {['Answer keys reviewed by a doctor', 'Works on your phone, even offline', 'No account needed to start', 'Student plan from ₹199 a month'].map(t => (
            <li key={t} className="flex items-center gap-3"><span className="w-7 h-7 rounded-full bg-accent-soft text-accent-ink flex items-center justify-center shrink-0"><Check size={15} /></span>{t}</li>))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, n, l, children }: { icon: React.ElementType; n: React.ReactNode; l: string; children?: React.ReactNode }) {
  return <div className="card p-4 flex flex-col gap-2">
    <span className="flex items-center gap-2 text-sm text-muted"><Icon size={16} className="text-accent-ink" />{l}</span>
    <span className="font-mono text-3xl tabular-nums tracking-tight">{n}</span>{children}</div>;
}

export default function Home() {
  const { p, plan, user } = useApp();
  if (p.level == null) return <Welcome />;

  const nu = nextUnit(p), due = dueCards(p).length, daily = dailyEcg(p), doneToday = p.daily.last === today();
  const left = readsLeft(plan, p), lvl = LEVELS[(p.level ?? 1) - 1];
  const done = UNITS.filter(u => p.units[u.id]?.done).length;
  const reads = Object.values(p.cards).reduce((s, c) => s + c.seen, 0);
  const sk = Object.values(p.skills).reduce((a, [r, t]) => [a[0] + r, a[1] + t], [0, 0]);
  const acc = sk[1] ? Math.round(100 * sk[0] / sk[1]) : null;
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="chip-accent self-start">Level {lvl.n} · {lvl.name}</span>
          <h1 className="text-3xl md:text-[44px] leading-tight">{user?.displayName ? `Welcome back, ${user.displayName.split(' ')[0]}` : 'Welcome back'}</h1>
        </div>
        <InstallButton />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Flame} n={p.daily.streak} l="Day streak"><span className="text-xs text-muted">Best {p.daily.best}</span></Stat>
        <Stat icon={BookOpen} n={<>{done}<span className="text-muted text-xl">/{UNITS.length}</span></>} l="Units done">
          <span className="h-1.5 rounded-full bg-line overflow-hidden"><span className="block h-full bg-accent rounded-full" style={{ width: `${100 * done / UNITS.length}%` }} /></span></Stat>
        <Stat icon={Activity} n={reads} l="ECGs read"><span className="text-xs text-muted">{due ? `${due} due for review` : 'Nothing due today'}</span></Stat>
        <Stat icon={Target} n={acc == null ? '—' : `${acc}%`} l="Step accuracy"><span className="text-xs text-muted">Across all graded steps</span></Stat>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <a href="#/practice/daily" className="card overflow-hidden flex flex-col">
          <div className="paper border-b border-line h-48 overflow-hidden"><img src={imgOf(daily.id)} alt="Today's ECG, a real 12-lead" className="w-full h-full object-cover object-left-top" /></div>
          <div className="p-5 flex items-center justify-between gap-4">
            <div><p className="eyebrow flex items-center gap-2"><CalendarCheck size={14} />Today's ECG</p>
              <h2 className="text-xl mt-1">{doneToday ? 'Done for today' : 'One real 12-lead, about 2 minutes'}</h2>
              <p className="text-sm text-muted mt-0.5">{doneToday ? 'Come back tomorrow to keep your streak.' : `Level ${daily.level}. Read it in order, then see how you did.`}</p></div>
            {!doneToday && <span className="btn-primary btn-arrow shrink-0 hidden sm:inline-flex">Read it</span>}
          </div>
        </a>
        <div className="grid gap-4">
          <a href={nu ? `#/unit/${nu.id}` : '#/learn'} className="card p-5 flex flex-col gap-1.5">
            <p className="eyebrow flex items-center gap-2"><BookOpen size={14} />Continue learning</p>
            <h2 className="text-xl">{nu ? nu.title : 'Every unit done'}</h2>
            <p className="text-sm text-muted">{nu ? `Level ${nu.level} · ${nu.minutes} min · ends with real ECGs on the topic` : 'Keep sharp with practice and exam papers.'}</p>
          </a>
          <a href="#/practice" className="card p-5 flex flex-col gap-1.5">
            <p className="eyebrow flex items-center gap-2"><Repeat size={14} />Practise reading</p>
            <h2 className="text-xl">{due ? `${due} ECG${due > 1 ? 's' : ''} due for review` : 'Read a new real ECG'}</h2>
            <p className="text-sm text-muted">{left !== Infinity ? `${left} free read${left === 1 ? '' : 's'} left this week.` : 'Unlimited reads with spaced repetition.'}</p>
          </a>
        </div>
      </div>

      <LabCard />

      <div className="grid md:grid-cols-2 gap-4">
        <a href="#/emergency" className="card p-5 flex gap-4 items-center"><span className="w-11 h-11 rounded-md bg-[#fdecea] text-bad flex items-center justify-center shrink-0"><Timer size={22} /></span>
          <span><span className="text-lg font-medium block">Emergency mode</span><span className="text-sm text-muted">30 seconds per ECG: the action and the diagnosis.</span></span></a>
        <a href="#/exam" className="card p-5 flex gap-4 items-center"><span className="w-11 h-11 rounded-md bg-ink/[.06] text-ink flex items-center justify-center shrink-0"><GraduationCap size={22} /></span>
          <span><span className="text-lg font-medium block">Exam mode</span><span className="text-sm text-muted">A timed paper of ECG and theory questions.</span></span></a>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5 md:p-6">
          <h2 className="text-xl mb-4">Your reading skills</h2>
          <div className="flex flex-col gap-2.5">
            {SKILLS.map(([k, l]) => { const v = skillPct(p, k);
              return <div key={k} className="grid grid-cols-[6.5rem_1fr_3rem] items-center gap-3 text-sm">
                <span>{l}</span><span className="h-2 rounded-full bg-line overflow-hidden"><span className={`block h-full rounded-full ${v == null ? '' : v < 50 ? 'bg-bad' : v < 75 ? 'bg-gold' : 'bg-ok'}`} style={{ width: `${v ?? 0}%` }} /></span>
                <span className="text-right font-mono text-muted tabular-nums">{v == null ? '—' : v + '%'}</span></div>; })}
          </div>
          {p.placement && <p className="text-sm text-muted mt-4">Placement score {p.placement.total}/12 · <a className="link" href="#/placement">Retake</a></p>}
        </div>
        <div className="card p-5 md:p-6">
          <h2 className="text-xl mb-4">Your path</h2>
          <ol className="flex flex-col gap-4">
            {LEVELS.map(l => { const us = unitsFor(l.n), d = us.filter(u => p.units[u.id]?.done).length;
              return <li key={l.n} className="flex items-center gap-4">
                <span className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-sm shrink-0 ${d === us.length && us.length ? 'bg-ok text-white' : l.n === p.level ? 'bg-ink text-white' : 'bg-surface border border-line text-muted'}`}>{d === us.length && us.length ? <Check size={16} /> : l.n}</span>
                <span className="flex-1 min-w-0"><span className="flex justify-between text-sm"><span className="font-medium">{l.name}</span><span className="text-muted font-mono">{d}/{us.length}</span></span>
                  <span className="block h-1.5 rounded-full bg-line overflow-hidden mt-1.5"><span className="block h-full bg-accent rounded-full" style={{ width: `${us.length ? 100 * d / us.length : 0}%` }} /></span></span>
              </li>; })}
          </ol>
        </div>
      </div>
    </section>
  );
}

function LabCard() {
  const { p, plan } = useApp();
  const open = LAB_MODULES.filter(m => labOpen(plan, m.tier));
  const m = open.find(x => !moduleStatus(x, p.lab?.[x.id]).done) || open[0];
  const st = moduleStatus(m, p.lab?.[m.id]), done = LAB_MODULES.filter(x => moduleStatus(x, p.lab?.[x.id]).done).length;
  return (
    <a href={`#/lab/${m.id}`} className="card p-5 flex flex-wrap gap-4 items-center">
      <span className="w-11 h-11 rounded-md bg-accent-soft text-accent-ink flex items-center justify-center shrink-0"><FlaskConical size={22} /></span>
      <span className="flex-1 min-w-[14rem]">
        <span className="eyebrow block">Interactive lab · {done}/{LAB_MODULES.length} modules done · {open.length} open to you</span>
        <span className="text-lg font-medium block mt-0.5">Module {m.n}: {m.title}</span>
        <span className="text-sm text-muted">{st.done ? 'Complete. Revisit any time.' : st.todo}</span>
      </span>
      <span className="btn-primary btn-arrow shrink-0 max-sm:w-full">{st.pct ? 'Continue' : 'Open'}</span>
    </a>
  );
}
