import { useEffect, useMemo, useRef, useState } from 'react';
import { EcgStream, rhythms, type Rhythm } from './ecg';
import SweepCanvas from './SweepCanvas';

/* Small, honest interactive previews of each MedWise module.
   Every number shown follows the published rule it names. */

/* ---------- ECG lab ---------- */

export function EcgDemo() {
  const stream = useMemo(() => new EcgStream('sinus', 5), []);
  const [rhythm, setRhythm] = useState<Rhythm>('sinus');
  const hrRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    stream.onBeat = (rr) => {
      if (hrRef.current) hrRef.current.textContent = String(Math.round(60 / rr));
    };
    return () => {
      stream.onBeat = undefined;
    };
  }, [stream]);

  const label = rhythms.find((r) => r.id === rhythm)!.label;

  return (
    <div className="demo">
      <div className="ecg-box ecg-paper">
        <SweepCanvas
          stream={stream}
          channels={[{ color: '#14213d', gain: 52, baseline: 0.62, width: 2, read: (s) => s.ecg() }]}
          speed={160}
          className="ecg-canvas"
          label={`Live lead II trace showing ${label}`}
          version={rhythm}
        />
        <span className="ecg-lead">II</span>
        <span className="ecg-hr">
          <span ref={hrRef}>72</span> bpm
        </span>
      </div>
      <div className="demo-controls">
        <span className="demo-q" id="rq">
          Rhythm
        </span>
        <div className="seg" role="radiogroup" aria-labelledby="rq">
          {rhythms.map((r) => (
            <button
              key={r.id}
              role="radio"
              aria-checked={rhythm === r.id}
              className={rhythm === r.id ? 'on' : ''}
              onClick={() => {
                setRhythm(r.id);
                stream.setRhythm(r.id);
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Antibiotic stewardship ---------- */

const sources = [
  {
    id: 'lung',
    label: 'Pneumonia',
    empiric:
      'Severe community-acquired pneumonia: a beta-lactam such as ceftriaxone plus a macrolide. Add MRSA or Pseudomonas cover only when risk factors are present.',
    review:
      'Cultures grew S. pneumoniae sensitive to ceftriaxone. Stop the broader agents and plan a 5 to 7 day course if the patient is improving.',
  },
  {
    id: 'urine',
    label: 'Urinary',
    empiric:
      'Urosepsis: ceftriaxone is a common empiric choice. Use a carbapenem when ESBL risk is high, guided by your local antibiogram.',
    review:
      'E. coli sensitive to ceftriaxone. Continue the narrowest active agent and consider an oral switch once afebrile and haemodynamically stable.',
  },
  {
    id: 'abdo',
    label: 'Intra-abdominal',
    empiric:
      'Source control comes first. Piperacillin-tazobactam is a common empiric choice for severe community-acquired intra-abdominal infection.',
    review:
      'Source controlled and improving. A fixed course of about 4 days after source control is often sufficient.',
  },
];

export function AbxDemo() {
  const [src, setSrc] = useState(sources[0].id);
  const s = sources.find((x) => x.id === src)!;
  return (
    <div className="demo">
      <div className="demo-controls">
        <span className="demo-q" id="sq">
          Suspected source
        </span>
        <div className="seg" role="radiogroup" aria-labelledby="sq">
          {sources.map((x) => (
            <button
              key={x.id}
              role="radio"
              aria-checked={src === x.id}
              className={src === x.id ? 'on' : ''}
              onClick={() => setSrc(x.id)}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>
      <ol className="timeline">
        <li>
          <span className="tl-when">Hour 0</span>
          <p>{s.empiric}</p>
        </li>
        <li>
          <span className="tl-when">Day 3 review</span>
          <p>{s.review}</p>
        </li>
      </ol>
    </div>
  );
}

/* ---------- Hypertension (ACC/AHA 2017) ---------- */

function bpCategory(sys: number, dia: number) {
  if (sys > 180 || dia > 120)
    return { i: 4, name: 'Hypertensive crisis range', note: 'Look for acute target-organ damage before anything else.' };
  if (sys >= 140 || dia >= 90)
    return { i: 3, name: 'Stage 2 hypertension', note: 'Usually lifestyle change plus drug therapy.' };
  if (sys >= 130 || dia >= 80)
    return { i: 2, name: 'Stage 1 hypertension', note: 'Treatment depends on cardiovascular risk.' };
  if (sys >= 120) return { i: 1, name: 'Elevated', note: 'Lifestyle change and recheck.' };
  return { i: 0, name: 'Normal', note: 'Recheck at routine visits.' };
}

export function BpDemo() {
  const [sys, setSys] = useState(138);
  const [dia, setDia] = useState(86);
  const c = bpCategory(sys, dia);
  return (
    <div className="demo">
      <div className="readout">
        <span className="big">
          {sys}/{dia}
        </span>
        <span className="unit">mmHg</span>
      </div>
      <div className="scale" aria-hidden="true">
        {['Normal', 'Elevated', 'Stage 1', 'Stage 2', 'Crisis'].map((n, i) => (
          <span key={n} className={i === c.i ? 'on' : ''}>
            {n}
          </span>
        ))}
      </div>
      <p className="verdict" aria-live="polite">
        <strong>{c.name}.</strong> {c.note}
      </p>
      <div className="sliders">
        <label>
          Systolic
          <input type="range" min={90} max={210} value={sys} onChange={(e) => setSys(+e.target.value)} />
        </label>
        <label>
          Diastolic
          <input type="range" min={50} max={130} value={dia} onChange={(e) => setDia(+e.target.value)} />
        </label>
      </div>
    </div>
  );
}

/* ---------- Diabetes (ADA; ADAG eAG formula) ---------- */

export function DmDemo() {
  const [a1c, setA1c] = useState(7.8);
  const eag = 28.7 * a1c - 46.7;
  const cat =
    a1c >= 6.5 ? { i: 2, name: 'Diabetes range' } : a1c >= 5.7 ? { i: 1, name: 'Prediabetes range' } : { i: 0, name: 'Normal range' };
  return (
    <div className="demo">
      <div className="readout">
        <span className="big">{a1c.toFixed(1)}%</span>
        <span className="unit">HbA1c</span>
      </div>
      <div className="scale scale-3" aria-hidden="true">
        {['Below 5.7%', '5.7 to 6.4%', '6.5% and above'].map((n, i) => (
          <span key={n} className={i === cat.i ? 'on' : ''}>
            {n}
          </span>
        ))}
      </div>
      <p className="verdict" aria-live="polite">
        <strong>{cat.name}.</strong> Estimated average glucose is {Math.round(eag)} mg/dL (
        {(eag / 18).toFixed(1)} mmol/L).
        {a1c >= 7 && ' Above the under-7% target that suits many non-pregnant adults.'}
      </p>
      <div className="sliders">
        <label>
          HbA1c
          <input
            type="range"
            min={4.5}
            max={13}
            step={0.1}
            value={a1c}
            onChange={(e) => setA1c(+e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

/* ---------- Pre-operative evaluation (RCRI; risks per Duceppe 2017) ---------- */

const rcriItems = [
  'High-risk surgery (intraperitoneal, intrathoracic or suprainguinal vascular)',
  'History of ischaemic heart disease',
  'History of heart failure',
  'History of stroke or TIA',
  'Diabetes treated with insulin',
  'Creatinine above 2 mg/dL (177 µmol/L)',
];
const rcriRisk = ['3.9%', '6.0%', '10.1%', '15.0%'];

export function PreopDemo() {
  const [on, setOn] = useState<boolean[]>([true, false, false, false, true, false]);
  const score = on.filter(Boolean).length;
  return (
    <div className="demo demo-preop">
      <fieldset className="checks">
        <legend className="demo-q">Revised Cardiac Risk Index</legend>
        {rcriItems.map((t, i) => (
          <label key={t} className="check">
            <input
              type="checkbox"
              checked={on[i]}
              onChange={() => setOn((p) => p.map((v, j) => (j === i ? !v : v)))}
            />
            <span>{t}</span>
          </label>
        ))}
      </fieldset>
      <div className="preop-out" aria-live="polite">
        <span className="big">{score}</span>
        <span className="unit">RCRI points</span>
        <p className="verdict">
          Estimated 30-day risk of death, myocardial infarction or cardiac arrest:{' '}
          <strong>{rcriRisk[Math.min(score, 3)]}</strong>
        </p>
      </div>
    </div>
  );
}
