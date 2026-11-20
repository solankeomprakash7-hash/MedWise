import * as React from 'react';
import { useApp } from '../EcgApp';
import Drill, { Results } from '../components/Drill';
import { type RealEcg, type Row, bumpDaily, dailyEcg, dueCards, nextEcg, passed, readsLeft, review } from '../lib/logic';
import { today, weekKey } from '../lib/progress';
import { ECGS } from '../lib/logic';
import { UNITS } from '../data/curriculum';

export default function Practice({ mode, topic }: { mode: 'practice' | 'daily'; topic?: string }) {
  const { p, update, plan, user, signIn } = useApp();
  const unit = topic ? UNITS.find(u => u.id === topic) : undefined;
  const topicPool = unit ? ECGS.filter(e => unit.practice.includes(e.pattern)) : [];
  const pick = (avoid?: string) => {
    if (mode === 'daily') return dailyEcg(p);
    if (topicPool.length) { const l = topicPool.filter(e => e.id !== avoid); return l[Math.floor(Math.random() * l.length)] || topicPool[0]; }
    return nextEcg(p, avoid);
  };
  const [ecg, setEcg] = React.useState<RealEcg>(() => pick());
  const [rows, setRows] = React.useState<Row[] | null>(null);
  const [isReview, setIsReview] = React.useState(() => !!p.cards[ecg.id]);
  React.useEffect(() => { setIsReview(!!p.cards[ecg.id]); }, [ecg.id]); // eslint-disable-line
  React.useEffect(() => { setEcg(pick()); setRows(null); }, [mode]); // eslint-disable-line
  const left = readsLeft(plan, p), daily = mode === 'daily', dailyDone = p.daily.last === today();

  if (!daily && left <= 0 && !rows) return (
    <section className="max-w-xl flex flex-col gap-4">
      <h1 className="text-3xl font-serif font-bold">You've used this week's free reads</h1>
      <p className="text-slate-600">Free accounts get 5 real-ECG reads a week, plus today's ECG. Upgrade for unlimited reads with spaced repetition, or come back on Monday.</p>
      <div className="flex gap-3"><a className="nejm-btn" href="#/upgrade">See plans</a><a className="px-5 py-3 text-xs font-bold uppercase tracking-widest border border-nejm-border text-nejm-blue" href="#/practice/daily">Today's ECG</a></div>
    </section>
  );
  const due = dueCards(p).length;
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap justify-between items-end gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
            {daily ? `Today's ECG · ${p.daily.streak} day streak` : unit ? `Topic practice · ${unit.title}` : isReview ? 'Review · spaced repetition' : 'New ECG'}</p>
          <h1 className="text-3xl font-serif font-bold">{rows ? 'Your read' : 'Read this 12-lead'}</h1>
        </div>
        <p className="text-xs font-mono text-slate-500 tabular-nums">{!daily && (left === Infinity ? `${due} due for review` : `${left} free read${left === 1 ? '' : 's'} left this week`)}{daily && dailyDone && !rows ? 'Already done today; this one will not change your streak.' : ''}</p>
      </div>
      {rows ? <>
        <Results ecg={ecg} rows={rows} />
        <div className="flex flex-wrap gap-3">
          {daily ? <a className="nejm-btn" href="#/practice">Keep practising</a> : <button className="nejm-btn" onClick={() => { setEcg(pick(ecg.id)); setRows(null); window.scrollTo(0, 0); }}>Next ECG</button>}
          <a className="px-5 py-3 text-xs font-bold uppercase tracking-widest border border-nejm-border text-nejm-blue" href="#/home">Home</a>
        </div>
        {!user && <p className="text-xs text-slate-500"><button className="underline text-nejm-blue" onClick={signIn}>Sign in</button> to save your reads and reviews across devices.</p>}
      </> : <Drill ecg={ecg} onDone={r => {
        setRows(r); const ok = passed(r);
        update(pr => {
          const skills = { ...pr.skills };
          r.forEach(x => { if (x.ok == null) return; const v = skills[x.key] || [0, 0]; skills[x.key] = [v[0] + (x.ok ? 1 : 0), v[1] + 1]; });
          const wk = weekKey(), week = pr.week.key === wk ? pr.week : { key: wk, reads: 0 };
          return { ...pr, level: pr.level ?? 1, skills, cards: { ...pr.cards, [ecg.id]: review(pr.cards[ecg.id], ok) },
            daily: daily ? bumpDaily(pr) : pr.daily, week: daily ? week : { key: wk, reads: week.reads + 1 } };
        });
        window.scrollTo(0, 0);
      }} />}
    </section>
  );
}
