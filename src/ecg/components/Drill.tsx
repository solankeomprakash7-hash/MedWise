import * as React from 'react';
import { ACTS, AXES, RHYTHMS, TAGS } from '../data/options';
import { type Answer, type RealEcg, type Row, DX, grade, imgOf } from '../lib/logic';
import EcgViewer from './EcgViewer';
import { CheckCircle2, XCircle, MinusCircle, Info } from 'lucide-react';

const Chip = ({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) => (
  <button type="button" aria-pressed={on} onClick={onClick}
    className={`px-3 py-1.5 text-xs font-semibold border rounded-full ${on ? 'bg-nejm-blue text-white border-nejm-blue' : 'bg-white text-nejm-text border-nejm-border hover:border-nejm-blue'}`}>{children}</button>
);
const Step = ({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[2rem_1fr] gap-x-3 py-4 border-b border-nejm-border last:border-b-0">
    <span className="font-serif font-bold text-nejm-red text-lg leading-tight">{n}</span>
    <div className="min-w-0">
      <p className="font-serif font-bold text-nejm-blue">{title}</p>
      {hint && <p className="text-xs text-slate-500 italic mb-2">{hint}</p>}
      <div className="flex flex-wrap gap-2 items-center mt-1">{children}</div>
    </div>
  </div>
);
const Num = ({ v, set, unit, ph, id }: { v?: number; set: (n?: number) => void; unit: string; ph: string; id: string }) => (
  <label className="flex items-center gap-2" htmlFor={id}>
    <input id={id} type="number" inputMode="numeric" value={v ?? ''} placeholder={ph} onChange={e => set(e.target.value === '' ? undefined : +e.target.value)}
      className="w-28 border border-nejm-border px-2 py-1.5 font-mono text-sm bg-white focus:outline-none focus:border-nejm-blue" />
    <span className="text-xs font-mono text-slate-500">{unit}</span>
  </label>
);

export function Results({ ecg, rows }: { ecg: RealEcg; rows: Row[] }) {
  const g = rows.filter(r => r.ok != null), right = g.filter(r => r.ok).length;
  return (
    <div className="flex flex-col gap-4">
      <div className="border-l-4 border-nejm-red pl-4">
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-slate-500">Your read · {right} of {g.length} steps</p>
        <h3 className="text-2xl font-serif font-bold">{ecg.title}</h3>
        <p className="text-sm text-nejm-text/80 mt-1 max-w-prose"><span className="font-semibold">Typical pattern:</span> {ecg.teach}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[10px] uppercase tracking-widest text-slate-500 border-b border-nejm-border">
            <th className="py-2 pr-3 font-semibold">Step</th><th className="py-2 pr-3 font-semibold">You</th><th className="py-2 pr-3 font-semibold">Answer</th><th className="py-2 font-semibold"><span className="sr-only">Result</span></th></tr></thead>
          <tbody>{rows.map(r => (
            <tr key={r.key} className="border-b border-nejm-border align-top">
              <td className="py-2 pr-3 font-mono text-xs whitespace-nowrap">{r.label}</td>
              <td className="py-2 pr-3">{r.you}</td>
              <td className="py-2 pr-3">{r.ans}{r.ok === false && <span className="block text-xs italic text-slate-500 mt-1">{r.tip}</span>}</td>
              <td className="py-2">{r.ok == null ? <MinusCircle size={18} className="text-slate-400" aria-label="not graded" /> : r.ok ? <CheckCircle2 size={18} className="text-green-700" aria-label="correct" /> : <XCircle size={18} className="text-nejm-red" aria-label="incorrect" />}</td>
            </tr>))}</tbody>
        </table>
      </div>
      {ecg.draft && <p className="flex gap-2 text-xs text-slate-500"><Info size={14} className="shrink-0 mt-0.5" />Measurements come from the dataset's machine read (PTB-XL+) and the signal; the answer key is awaiting clinical review.</p>}
      <p className="text-[11px] text-slate-400">ECG: {ecg.src} record {ecg.rec.split('/').pop()}, {ecg.sex}{ecg.age ? `, ${parseInt(ecg.age)} y` : ''}. Licensed CC BY 4.0 via PhysioNet.</p>
    </div>
  );
}

export default function Drill({ ecg, onDone, children }: { ecg: RealEcg; onDone: (rows: Row[], a: Answer) => void; children?: React.ReactNode }) {
  const [a, setA] = React.useState<Answer>({ tags: [] });
  const [warn, setWarn] = React.useState('');
  React.useEffect(() => { setA({ tags: [] }); setWarn(''); }, [ecg.id]);
  const set = (p: Partial<Answer>) => setA(x => ({ ...x, ...p }));
  const tog = (t: string) => setA(x => { let tags = x.tags; if (t === 'none') tags = tags.includes('none') ? [] : ['none'];
    else { tags = tags.filter(y => y !== 'none'); tags = tags.includes(t) ? tags.filter(y => y !== t) : [...tags, t]; } return { ...x, tags }; });
  const qtc = a.qt && a.rate ? Math.round(a.qt / Math.sqrt(60 / a.rate)) : null;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const miss = [!a.rate && 'rate', !a.rhythm && 'rhythm', !a.dx && 'diagnosis', !a.act && 'next step'].filter(Boolean);
    if (miss.length && !warn) { setWarn(`Still empty: ${miss.join(', ')}. Press Check again to submit anyway.`); return; }
    onDone(grade(ecg, a), a);
  };
  return (
    <div className="flex flex-col gap-5">
      <EcgViewer src={imgOf(ecg.id)} alt="Unknown 12-lead ECG to read" />
      {children}
      <form onSubmit={submit} className="nejm-card !p-4 md:!p-6" autoComplete="off">
        <Step n={1} title="Rate" hint="Count it yourself."><Num id="d-rate" v={a.rate} set={v => set({ rate: v })} unit="/min" ph="e.g. 75" /></Step>
        <Step n={2} title="Rhythm" hint="Regular or not, then where it starts.">
          <Chip on={a.reg === 'reg'} onClick={() => set({ reg: a.reg === 'reg' ? undefined : 'reg' })}>Regular</Chip>
          <Chip on={a.reg === 'irr'} onClick={() => set({ reg: a.reg === 'irr' ? undefined : 'irr' })}>Irregular</Chip>
          <select aria-label="Rhythm" value={a.rhythm || ''} onChange={e => set({ rhythm: e.target.value || undefined })} className="border border-nejm-border px-2 py-1.5 text-sm bg-white max-w-full">
            <option value="">Choose the rhythm…</option>{RHYTHMS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </Step>
        <Step n={3} title="Axis" hint="Lead I and aVF; check II if they disagree.">{AXES.map(([k, l]) => <Chip key={k} on={a.axis === k} onClick={() => set({ axis: a.axis === k ? undefined : k })}>{l}</Chip>)}</Step>
        <Step n={4} title="PR interval"><Num id="d-pr" v={a.pr} set={v => set({ pr: v })} unit="ms" ph="e.g. 160" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!a.noPR} onChange={e => set({ noPR: e.target.checked })} /> no fixed PR</label></Step>
        <Step n={5} title="QRS width"><Num id="d-qrs" v={a.qrs} set={v => set({ qrs: v })} unit="ms" ph="e.g. 90" /></Step>
        <Step n={6} title="QT interval"><Num id="d-qt" v={a.qt} set={v => set({ qt: v })} unit="ms" ph="e.g. 380" />
          {qtc && <span className="text-xs font-mono text-nejm-blue">QTc ≈ {qtc} ms (Bazett, from your rate)</span>}</Step>
        <Step n={7} title="ST segment, T waves and extras" hint="Tick everything you see.">{TAGS.map(([k, l]) => <Chip key={k} on={a.tags.includes(k)} onClick={() => tog(k)}>{l}</Chip>)}</Step>
        <Step n={8} title="Diagnosis">
          <select aria-label="Diagnosis" value={a.dx || ''} onChange={e => set({ dx: e.target.value || undefined })} className="border border-nejm-border px-2 py-1.5 text-sm bg-white max-w-full">
            <option value="">Choose the best fit…</option>{DX.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </Step>
        <Step n={9} title="What do you do next?">
          <div className="grid gap-1.5 w-full">{ACTS.map(([k, l]) => (
            <button type="button" key={k} aria-pressed={a.act === k} onClick={() => set({ act: a.act === k ? undefined : k })}
              className={`text-left px-3 py-2 text-sm border ${a.act === k ? 'border-nejm-blue bg-nejm-blue/5 font-semibold shadow-[inset_3px_0_0_#991b1b]' : 'border-nejm-border bg-white'}`}>{l}</button>))}</div>
        </Step>
        <div className="flex flex-wrap items-center gap-3 pt-4">
          <button type="submit" className="nejm-btn">Check my read</button>
          {warn && <span className="text-xs text-nejm-red">{warn}</span>}
        </div>
      </form>
    </div>
  );
}
