import * as React from 'react';
import { useApp } from '../EcgApp';
import { UNITS, type Question } from '../data/curriculum';
import { DX, ECGS, EXAM_SAMPLE, dxOk, imgOf } from '../lib/logic';
import EcgViewer from '../components/EcgViewer';
import { Timer } from 'lucide-react';

const N = 20, MINUTES = 20;
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/** Half image questions ("what is this ECG?"), half concept questions from the units, up to the learner's level + 1. */
function makeExam(level: number, n: number): (Question & { id?: string })[] {
  const top = Math.min(4, level + 1);
  const byPat = new Map<string, typeof ECGS>(); ECGS.filter(e => e.level <= top).forEach(e => byPat.set(e.pattern, [...(byPat.get(e.pattern) || []), e]));
  const imgQs = shuffle([...byPat.values()]).slice(0, Math.ceil(n / 2)).map(list => {
    const e = list[Math.floor(Math.random() * list.length)];
    const opts = shuffle([e.pattern, ...shuffle(DX.filter(([k]) => k !== e.pattern && !dxOk(e.pattern, k))).slice(0, 3).map(d => d[0])]);
    return { id: e.id, img: imgOf(e.id), q: 'What does this ECG show?', o: opts.map(k => (DX.find(d => d[0] === k) || ['', k])[1]), a: opts.indexOf(e.pattern), why: e.teach };
  });
  const conQs = shuffle(UNITS.filter(u => u.level <= top).flatMap(u => u.quiz)).slice(0, n - imgQs.length).map(q => {
    const order = shuffle(q.o.map((_, k) => k)); return { ...q, o: order.map(k => q.o[k]), a: order.indexOf(q.a) };
  });
  return shuffle([...imgQs, ...conQs]);
}

export default function Exam() {
  const { p, plan } = useApp();
  const n = plan === 'free' ? EXAM_SAMPLE : N, mins = Math.round(MINUTES * n / N);
  const [qs, setQs] = React.useState<ReturnType<typeof makeExam> | null>(null);
  const [ans, setAns] = React.useState<(number | undefined)[]>([]);
  const [i, setI] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [left, setLeft] = React.useState(mins * 60);
  const end = React.useRef(0);
  React.useEffect(() => {
    if (!qs || done) return;
    const id = setInterval(() => { const l = Math.round((end.current - Date.now()) / 1000); setLeft(l); if (l <= 0) { clearInterval(id); setDone(true); } }, 500);
    return () => clearInterval(id);
  }, [qs, done]);
  const start = () => { setQs(makeExam(p.level ?? 1, n)); setAns([]); setI(0); setDone(false); end.current = Date.now() + mins * 60000; setLeft(mins * 60); };

  if (!qs) return (
    <section className="max-w-2xl flex flex-col gap-4">
      <p className="eyebrow eyebrow-dot">Exam mode</p>
      <h1 className="text-3xl font-display">{n} questions in {mins} minutes</h1>
      <p className="text-muted">University and PG-entrance style: half are ECGs to identify, half are questions on mechanism, criteria and management. No feedback until the end, as in the real exam. Questions go up to one level above yours.</p>
      {plan === 'free' && <p className="text-sm text-muted">This is a {EXAM_SAMPLE}-question sample. <a className="underline text-ink" href="#/upgrade">Student or Pro</a> gives full {N}-question papers.</p>}
      <div><button className="btn-primary" onClick={start}>Start the paper</button></div>
    </section>
  );
  if (done) {
    const right = qs.filter((q, k) => ans[k] === q.a).length, pct = Math.round(100 * right / qs.length);
    return (
      <section className="flex flex-col gap-5">
        <div className="border-l-4 border-accent pl-4">
          <p className="eyebrow">Paper complete</p>
          <h1 className="text-3xl font-display">{right}/{qs.length} · {pct}%</h1>
          <p className="text-muted">{pct >= 80 ? 'Exam-ready on this material.' : pct >= 60 ? 'A pass, with gaps to close. Review the red ones below.' : 'Go back to the units for the topics you missed, then try another paper.'}</p>
        </div>
        <ol className="flex flex-col gap-3">
          {qs.map((q, k) => <li key={k} className={`card p-4 flex flex-col gap-2 ${ans[k] === q.a ? 'border-line' : 'border-bad/40'}`}>
            {q.img && <img src={q.img} alt="" className="w-full max-w-md border border-line" />}
            <p className="font-semibold">{k + 1}. {q.q}</p>
            <p className="text-sm">{ans[k] === q.a ? <span className="text-ok">✓ {q.o[q.a]}</span> : <><span className="text-bad">✗ {ans[k] == null ? 'not answered' : q.o[ans[k]!]}</span> · correct: <b>{q.o[q.a]}</b></>}</p>
            <p className="text-sm text-muted">{q.why}</p></li>)}
        </ol>
        <div><button className="btn-primary" onClick={start}>New paper</button></div>
      </section>
    );
  }
  const q = qs[i];
  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-between items-center gap-3">
        <p className="eyebrow">Question {i + 1} of {qs.length} · {ans.filter(x => x != null).length} answered</p>
        <span className={`flex items-center gap-1.5 font-mono text-xl tabular-nums ${left < 120 ? 'text-bad' : 'text-ink'}`}><Timer size={18} />{Math.floor(Math.max(0, left) / 60)}:{String(Math.max(0, left) % 60).padStart(2, '0')}</span>
      </div>
      <div className="flex flex-wrap gap-1">{qs.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Question ${k + 1}`}
        className={`w-8 h-8 rounded-sm text-xs font-mono border ${k === i ? 'border-ink text-ink font-bold' : ans[k] != null ? 'bg-ink text-white border-ink' : 'border-line bg-white'}`}>{k + 1}</button>)}</div>
      {q.img && <EcgViewer src={q.img} alt="ECG for this question" />}
      <h2 className="text-xl font-display">{q.q}</h2>
      <div className="grid gap-2">{q.o.map((o, k) => <button key={k} type="button" aria-pressed={ans[i] === k} onClick={() => setAns(a => { const b = [...a]; b[i] = k; return b; })}
        className={`rounded-md text-left px-4 py-3 border text-sm ${ans[i] === k ? 'border-ink bg-ink/5 font-semibold' : 'border-line bg-white'}`}>{String.fromCharCode(65 + k)}. {o}</button>)}</div>
      <div className="flex flex-wrap gap-3">
        <button className="btn-secondary" disabled={i === 0} onClick={() => setI(i - 1)}>Previous</button>
        {i + 1 < qs.length ? <button className="btn-primary" onClick={() => setI(i + 1)}>Next</button> : null}
        <button className="btn-secondary !text-bad" onClick={() => setDone(true)}>Submit paper</button>
      </div>
    </section>
  );
}
