import * as React from 'react';
import type { Question } from '../data/curriculum';
import EcgViewer from './EcgViewer';

/** Runs a list of MCQs one at a time and reports the chosen answers. */
export default function Quiz({ qs, onFinish, finishLabel = 'Finish' }: { qs: Question[]; onFinish: (answers: number[]) => void; finishLabel?: string }) {
  const [i, setI] = React.useState(0);
  const [ans, setAns] = React.useState<number[]>([]);
  const q = qs[i], chosen = ans[i];
  return (
    <div className="nejm-card !p-5 md:!p-7 flex flex-col gap-4">
      <div className="flex items-center gap-1.5" aria-label={`Question ${i + 1} of ${qs.length}`}>
        {qs.map((x, k) => <span key={k} className={`h-1.5 flex-1 ${k < i ? (ans[k] === qs[k].a ? 'bg-green-700' : 'bg-nejm-red') : k === i ? 'bg-nejm-blue' : 'bg-nejm-border'}`} />)}
      </div>
      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-slate-500">Question {i + 1} of {qs.length}</p>
      {q.img && <EcgViewer src={q.img} alt="ECG for this question" />}
      <h3 className="text-xl font-serif font-bold">{q.q}</h3>
      <div className="grid gap-2">
        {q.o.map((o, k) => {
          const st = chosen == null ? '' : k === q.a ? 'border-green-700 text-green-800 font-semibold' : k === chosen ? 'border-nejm-red text-nejm-red line-through' : 'opacity-60';
          return <button key={k} type="button" disabled={chosen != null} onClick={() => setAns(a => { const n = [...a]; n[i] = k; return n; })}
            className={`text-left px-4 py-3 border bg-white text-sm ${st || 'border-nejm-border hover:border-nejm-blue'}`}>{o}</button>;
        })}
      </div>
      {chosen != null && <>
        <p className="text-sm"><b className={chosen === q.a ? 'text-green-800' : 'text-nejm-red'}>{chosen === q.a ? 'Correct.' : 'Not quite.'}</b> {q.why}</p>
        <div><button type="button" className="nejm-btn" onClick={() => (i + 1 < qs.length ? setI(i + 1) : onFinish(ans))}>{i + 1 < qs.length ? 'Next question' : finishLabel}</button></div>
      </>}
    </div>
  );
}
