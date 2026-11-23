import * as React from 'react';
import { analyzeSepsisTherapy, PatientData } from './services/geminiService';
import { AlertTriangle, Check, ChevronDown, ClipboardCopy, Loader2, LogOut, RotateCcw, Sparkles } from 'lucide-react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import AuthScreen from './components/AuthScreen';

/* MedWise sepsis antibiotics (/app): an AI-written empiric antibiotic suggestion, labelled as such,
   with the guideline source, what it covers, and what this patient needs. Design: DESIGN.md. */

const GUIDELINES = 'Surviving Sepsis Campaign 2021 and IDSA 2024 guidance';
const DRAFT_KEY = 'medwise-sepsis-draft';

type Form = PatientData & { creatUnit: string; egfr: string };
const BLANK: Form = {
  age: '', sex: '', weight: '', icuDay: '1', diagnosis: '', infectionSource: '', ventilated: '', hemodynamics: '',
  mdrRisk: '', recentHospitalization: '', priorAntibiotics: '', priorAntibioticsDetails: '', immunocompromised: '',
  indwellingDevices: '', travelHistory: '', comorbidities: '', wbcTrend: '', procalcitonin: '', lactate: '',
  creatinine: '', creatUnit: 'mg/dL', egfr: '', cultureStatus: 'Pending', organism: '', sensitivity: '', selectedAntibiotic: '',
};

const RISKS: { id: keyof Form; label: string; desc: string; required?: boolean }[] = [
  { id: 'mdrRisk', label: 'MDR risk', desc: 'Prior colonisation, or high local prevalence', required: true },
  { id: 'recentHospitalization', label: 'Recent hospitalisation', desc: 'Admitted in the last 90 days' },
  { id: 'priorAntibiotics', label: 'Prior antibiotics', desc: 'Broad-spectrum use in the last 30 days' },
  { id: 'immunocompromised', label: 'Immunocompromised', desc: 'Chemotherapy, transplant or high-dose steroids' },
  { id: 'indwellingDevices', label: 'Indwelling devices', desc: 'CVC, urinary catheter, EVD or recent surgery' },
  { id: 'travelHistory', label: 'Recent travel', desc: 'To areas with high antimicrobial resistance' },
];

const ASSUMED: [keyof Form, string][] = [
  ['sex', 'Sex'], ['ventilated', 'Ventilation'], ['recentHospitalization', 'Recent hospitalisation'], ['priorAntibiotics', 'Prior antibiotics'],
  ['immunocompromised', 'Immune status'], ['indwellingDevices', 'Indwelling devices'], ['travelHistory', 'Travel'], ['comorbidities', 'Comorbidities'],
  ['wbcTrend', 'WBC trend'], ['procalcitonin', 'Procalcitonin'], ['lactate', 'Lactate'], ['creatinine', 'Creatinine'],
];

const CATS: [string, string][] = [
  ['gram_positive', 'Gram-positive'], ['gram_negative', 'Gram-negative'], ['pseudomonas', 'Pseudomonas'], ['mrsa', 'MRSA'],
  ['esbl', 'ESBL producers'], ['anaerobes', 'Anaerobes'], ['atypicals', 'Atypicals'], ['vre', 'VRE'], ['tropical_rickettsial', 'Tropical and rickettsial'],
];

const load = (): Form => { try { const s = sessionStorage.getItem(DRAFT_KEY); return s ? { ...BLANK, ...JSON.parse(s) } : BLANK; } catch { return BLANK; } };
const save = (f: Form | null) => { try { f ? sessionStorage.setItem(DRAFT_KEY, JSON.stringify(f)) : sessionStorage.removeItem(DRAFT_KEY); } catch { /* storage unavailable */ } };

/** What the model receives: diagnosis follows haemodynamics, creatinine carries its unit. */
function toPatient(f: Form): PatientData {
  const { creatUnit, egfr, ...p } = f;
  return {
    ...p,
    diagnosis: f.hemodynamics.startsWith('Shock') ? 'Septic shock' : 'Sepsis',
    creatinine: [f.creatinine && `${f.creatinine} ${creatUnit}`, egfr && `eGFR ${egfr} mL/min/1.73 m²`].filter(Boolean).join('; '),
    ventilated: f.ventilated === 'Not known' ? '' : f.ventilated,
  };
}

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {};
  const age = Number(f.age), wt = Number(f.weight);
  if (!f.age) e.age = 'Enter the age.'; else if (!(age >= 12 && age <= 120)) e.age = 'Age must be 12 to 120 years.';
  if (!f.weight) e.weight = 'Enter the weight.'; else if (!(wt >= 20 && wt <= 350)) e.weight = 'Weight must be 20 to 350 kg.';
  if (f.icuDay && !(Number(f.icuDay) >= 1 && Number(f.icuDay) <= 365)) e.icuDay = 'ICU day must be 1 or more.';
  if (!f.infectionSource) e.infectionSource = 'Choose the likely source.';
  if (!f.hemodynamics) e.hemodynamics = 'Choose the haemodynamic state.';
  if (!f.mdrRisk) e.mdrRisk = 'Answer MDR risk: it changes the regimen.';
  if (f.creatinine && !(Number(f.creatinine) > 0)) e.creatinine = 'Enter a number.';
  return e;
}

export default function App() {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [form, setForm] = React.useState<Form>(load);
  const [errors, setErrors] = React.useState<Partial<Record<keyof Form, string>>>({});
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [sentForm, setSentForm] = React.useState<Form | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => onAuthStateChanged(auth, u => { setUser(u && u.emailVerified ? u : null); setAuthLoading(false); }), []);
  React.useEffect(() => { save(form); }, [form]);
  React.useEffect(() => {
    if (!result) return;
    headingRef.current?.focus({ preventScroll: true });
    if (window.innerWidth < 1024) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [result]);

  const set = (k: keyof Form, v: string) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: undefined })); };
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(e.target.name as keyof Form, e.target.value);

  async function run() {
    const e = validate(form);
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) { document.getElementById(`f-${first}`)?.focus(); return; }
    setLoading(true); setError(null);
    if (window.innerWidth < 1024) setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    try {
      const r = await analyzeSepsisTherapy(toPatient(form));
      setResult(r); setSentForm(form);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      const msg = String(err?.message || '');
      setError(/fetch|network|rpc|failed to/i.test(msg)
        ? 'Could not reach the analysis service. Check your connection and try again.'
        : 'The suggestion did not finish. Try again; if it keeps failing, the service may be down.');
    } finally { setLoading(false); }
  }

  function newPatient() {
    const touched = JSON.stringify(form) !== JSON.stringify(BLANK);
    if (touched && !window.confirm('Clear this patient\'s details and start a new patient?')) return;
    setForm(BLANK); setErrors({}); setResult(null); setSentForm(null); setError(null); save(null);
    document.getElementById('f-age')?.focus();
  }

  if (authLoading) return <div className="min-h-screen bg-surface flex items-center justify-center" role="status"><Loader2 className="animate-spin text-ink" size={32} aria-label="Loading" /></div>;
  if (!user) return <AuthScreen subtitle="Sepsis antibiotics" />;

  const stale = !!result && !!sentForm && JSON.stringify(sentForm) !== JSON.stringify(form);
  const errCount = Object.values(errors).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-surface">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 btn-secondary z-50">Skip to content</a>
      <header className="bg-card border-b border-line">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <a href="/" className="flex items-center gap-2 h-11 shrink-0" aria-label="MedWise home">
              <img src="/brand/logo-mark.png" alt="" width={32} height={32} className="h-8 w-8" />
              <img src="/brand/logo-word.png" alt="MedWise" height={20} className="h-5 w-auto hidden sm:block" />
            </a>
            <span className="h-6 w-px bg-line hidden sm:block" />
            <span className="text-base font-medium text-ink truncate">Sepsis antibiotics</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-sm text-muted max-w-48 truncate">{user.displayName || user.email}</span>
            <button type="button" onClick={() => signOut(auth).catch(console.error)} className="inline-flex items-center gap-2 h-11 px-3 rounded-sm text-base font-medium text-ink hover:bg-surface transition-colors">
              <LogOut size={18} aria-hidden="true" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="max-w-6xl mx-auto px-4 pt-8 md:pt-10 pb-16">
        <div className="max-w-2xl mb-8">
          <h1 className="text-3xl md:text-4xl leading-tight">Empiric antibiotics for sepsis</h1>
          <p className="text-muted mt-2 leading-relaxed">Enter the patient's findings to get an AI-written regimen suggestion, the guideline it rests on, and what it covers against what this patient needs. Reference guidance: {GUIDELINES}.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 lg:gap-8 items-start">
          {/* ---------- the patient ---------- */}
          <form noValidate onSubmit={e => { e.preventDefault(); run(); }} className="card p-5 md:p-6 flex flex-col gap-7" aria-label="Patient details">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl">Patient</h2>
              <button type="button" onClick={newPatient} className="inline-flex items-center gap-1.5 h-11 px-3 -mr-3 rounded-sm text-sm font-medium text-ink hover:bg-surface transition-colors">
                <RotateCcw size={16} aria-hidden="true" /> New patient
              </button>
            </div>

            <Section title="Patient and status">
              <div className="grid grid-cols-2 gap-4">
                <Num id="age" label="Age (years)" value={form.age} onChange={onChange} error={errors.age} min={12} max={120} required />
                <Num id="weight" label="Weight (kg)" value={form.weight} onChange={onChange} error={errors.weight} min={20} max={350} required />
                <Sel id="sex" label="Sex" value={form.sex} onChange={onChange} options={['Male', 'Female']} placeholder="Not stated" />
                <Num id="icuDay" label="ICU day" value={form.icuDay} onChange={onChange} error={errors.icuDay} min={1} max={365} />
                <div className="col-span-2">
                  <Sel id="infectionSource" label="Likely source" required value={form.infectionSource} onChange={onChange} error={errors.infectionSource}
                    options={['Lung', 'Urinary', 'Intra-abdominal', 'Skin and soft tissue', 'CNS', 'Bloodstream or line', 'Unknown']} placeholder="Choose the source" />
                </div>
                <div className="col-span-2">
                  <Sel id="hemodynamics" label="Haemodynamics" required value={form.hemodynamics} onChange={onChange} error={errors.hemodynamics}
                    options={['Stable', 'Worsening, no vasopressors', 'Shock, on vasopressors']} placeholder="Choose the state"
                    hint={form.hemodynamics ? `Sent as ${form.hemodynamics.startsWith('Shock') ? 'septic shock' : 'sepsis'}.` : undefined} />
                </div>
              </div>
            </Section>

            <Section title="Risk factors" hint="Leave a row blank if you have not assessed it; it is sent as “not assessed”, never as no.">
              <div className="flex flex-col">
                <Tri id="ventilated" label="Mechanically ventilated" desc="Changes cover for ventilator-associated pneumonia" value={form.ventilated} onPick={v => set('ventilated', v)} />
                {RISKS.map(r => (
                  <React.Fragment key={r.id}>
                    <Tri id={r.id} label={r.label} desc={r.desc} required={r.required} value={form[r.id] as string} onPick={v => set(r.id, v)} error={errors[r.id]} />
                    {r.id === 'priorAntibiotics' && form.priorAntibiotics === 'Yes' && (
                      <div className="pb-4"><Txt id="priorAntibioticsDetails" label="Which agents?" value={form.priorAntibioticsDetails} onChange={onChange} placeholder="For example piperacillin-tazobactam, meropenem" /></div>
                    )}
                  </React.Fragment>
                ))}
                <div className="pt-4"><Txt id="comorbidities" label="Significant comorbidities" value={form.comorbidities} onChange={onChange} placeholder="For example diabetes, CKD, COPD, heart failure" /></div>
              </div>
            </Section>

            <Section title="Laboratory and microbiology">
              <div className="grid grid-cols-2 gap-4">
                <Sel id="lactate" label="Lactate" value={form.lactate} onChange={onChange} options={['Normal', 'Rising', 'Falling', 'Raised, stable']} placeholder="Not known" />
                <Sel id="wbcTrend" label="WBC trend" value={form.wbcTrend} onChange={onChange} options={['Rising', 'Stable', 'Falling']} placeholder="Not known" />
                <Sel id="procalcitonin" label="Procalcitonin" value={form.procalcitonin} onChange={onChange} options={['Low', 'High', 'Rising', 'Falling']} placeholder="Not available" />
                <Num id="egfr" label="eGFR (mL/min)" value={form.egfr} onChange={onChange} min={0} max={200} />
                <div className="col-span-2">
                  <label className="label" htmlFor="f-creatinine">Creatinine</label>
                  <div className="flex gap-2">
                    <input id="f-creatinine" name="creatinine" type="number" inputMode="decimal" step="any" min={0} value={form.creatinine} onChange={onChange}
                      className="input flex-1 font-mono tabular-nums" aria-invalid={!!errors.creatinine} aria-describedby={errors.creatinine ? 'f-creatinine-err' : undefined} />
                    <select name="creatUnit" aria-label="Creatinine unit" value={form.creatUnit} onChange={onChange} className="input w-32 shrink-0">
                      <option>mg/dL</option><option>µmol/L</option>
                    </select>
                  </div>
                  {errors.creatinine && <p id="f-creatinine-err" className="text-sm text-bad mt-1">{errors.creatinine}</p>}
                </div>
                <div className="col-span-2">
                  <Sel id="cultureStatus" label="Cultures" value={form.cultureStatus} onChange={onChange} options={['Pending', 'Positive', 'Negative', 'Not sent']} />
                </div>
                {form.cultureStatus === 'Positive' && <>
                  <div className="col-span-2"><Txt id="organism" label="Organism" value={form.organism} onChange={onChange} placeholder="For example E. coli" /></div>
                  <div className="col-span-2">
                    <label className="label" htmlFor="f-sensitivity">Sensitivities</label>
                    <textarea id="f-sensitivity" name="sensitivity" value={form.sensitivity} onChange={onChange} className="input min-h-24" placeholder="For example sensitive to ceftriaxone, resistant to ampicillin" />
                  </div>
                </>}
              </div>
            </Section>

            <Section title="Your proposed regimen">
              <Txt id="selectedAntibiotic" label="Regimen you are considering" value={form.selectedAntibiotic || ''} onChange={onChange} placeholder="For example meropenem plus vancomycin"
                hint="Optional. You get a verdict on it next to the suggestion." />
            </Section>

            <div className="flex flex-col gap-3 pt-1">
              {errCount > 0 && <p role="alert" className="text-sm text-bad">Complete {errCount} {errCount === 1 ? 'field' : 'fields'} marked above.</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full h-12">
                {loading ? <><Loader2 className="animate-spin" size={18} aria-hidden="true" /> Writing the suggestion…</> : stale ? 'Update suggestion' : 'Get antibiotic suggestion'}
              </button>
              <p className="hint">The suggestion is written by an AI model. Check it against your local antibiogram; the prescribing decision is yours.</p>
            </div>
          </form>

          {/* ---------- the suggestion ---------- */}
          <div ref={resultRef} className={`scroll-mt-4 flex flex-col gap-6 ${result && !loading ? '' : 'lg:sticky lg:top-6'}`} aria-live="polite" aria-busy={loading}>
            {loading && <Loading />}
            {!loading && error && (
              <div role="alert" className="card p-6 flex flex-col gap-3">
                <h2 className="text-xl flex items-center gap-2"><AlertTriangle size={20} className="text-bad" aria-hidden="true" /> No suggestion yet</h2>
                <p className="text-muted">{error} Your inputs are kept.</p>
                <div><button type="button" onClick={run} className="btn-primary">Try again</button></div>
              </div>
            )}
            {!loading && !error && !result && <Empty />}
            {!loading && !error && result && sentForm && (
              <Result r={result} f={sentForm} stale={stale} onUpdate={run} headingRef={headingRef} />
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-line bg-card">
        <div className="max-w-6xl mx-auto px-4 py-8 grid gap-4 md:grid-cols-[2fr_1fr] text-sm text-muted leading-relaxed">
          <p className="max-w-[70ch]">MedWise is a decision-support and education tool. Suggestions are written by an AI model from the details you enter and can be wrong. They are not medical advice; the treating doctor is responsible for every prescription. Reference guidance: {GUIDELINES}.</p>
          <p className="md:text-right">© 2026 MedWise Private Limited<br />
            <a className="link text-sm py-2.5" href="/ecg#/legal/terms">Terms</a> · <a className="link text-sm py-2.5" href="/ecg#/legal/privacy">Privacy</a> · <a className="link text-sm py-2.5" href="/ecg#/legal/contact">Contact</a></p>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ form parts */

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3 border-t border-line pt-6 first-of-type:border-0 first-of-type:pt-0">
      <legend className="text-lg font-medium text-ink float-left w-full">{title}</legend>
      {hint && <p className="hint -mt-1 clear-both">{hint}</p>}
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

type FieldProps = { id: string; label: string; value: string; onChange: React.ChangeEventHandler<any>; error?: string; hint?: string; required?: boolean };
const describe = (id: string, error?: string, hint?: string) => [error && `f-${id}-err`, hint && `f-${id}-hint`].filter(Boolean).join(' ') || undefined;
function Msg({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  return <>{error && <p id={`f-${id}-err`} className="text-sm text-bad mt-1">{error}</p>}{hint && <p id={`f-${id}-hint`} className="hint mt-1">{hint}</p>}</>;
}
function Req() { return <span className="text-muted font-normal"> (required)</span>; }

function Num({ id, label, value, onChange, error, hint, required, min, max }: FieldProps & { min?: number; max?: number }) {
  return (
    <div>
      <label className="label" htmlFor={`f-${id}`}>{label}{required && <Req />}</label>
      <input id={`f-${id}`} name={id} type="number" inputMode="decimal" step="any" min={min} max={max} value={value} onChange={onChange}
        className="input font-mono tabular-nums" aria-invalid={!!error} aria-required={required} aria-describedby={describe(id, error, hint)} />
      <Msg id={id} error={error} hint={hint} />
    </div>
  );
}
function Txt({ id, label, value, onChange, error, hint, placeholder }: FieldProps & { placeholder?: string }) {
  return (
    <div>
      <label className="label" htmlFor={`f-${id}`}>{label}</label>
      <input id={`f-${id}`} name={id} type="text" value={value} onChange={onChange} placeholder={placeholder} className="input" aria-describedby={describe(id, error, hint)} />
      <Msg id={id} error={error} hint={hint} />
    </div>
  );
}
function Sel({ id, label, value, onChange, error, hint, required, options, placeholder }: FieldProps & { options: string[]; placeholder?: string }) {
  return (
    <div>
      <label className="label" htmlFor={`f-${id}`}>{label}{required && <Req />}</label>
      <select id={`f-${id}`} name={id} value={value} onChange={onChange} className="input" aria-invalid={!!error} aria-required={required} aria-describedby={describe(id, error, hint)}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <Msg id={id} error={error} hint={hint} />
    </div>
  );
}
/** One risk factor: No / Yes / Not known, nothing chosen until the doctor answers. */
function Tri({ id, label, desc, value, onPick, required, error }: { id: string; label: string; desc: string; value: string; onPick: (v: string) => void; required?: boolean; error?: string }) {
  return (
    <div role="radiogroup" aria-labelledby={`f-${id}-l`} aria-describedby={`f-${id}-d${error ? ` f-${id}-err` : ''}`} aria-required={required}
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 border-b border-line">
      <div className="min-w-0 flex-1 basis-48">
        <p id={`f-${id}-l`} className="text-base font-medium text-ink">{label}{required && <Req />}</p>
        <p id={`f-${id}-d`} className="hint">{desc}</p>
        {error && <p id={`f-${id}-err`} className="text-sm text-bad mt-0.5">{error}</p>}
      </div>
      <div className={`seg ${error ? '!border-bad' : ''}`}>
        {['No', 'Yes', 'Not known'].map((o, i) => (
          <label key={o}>
            <input type="radio" name={id} value={o} checked={value === o} onChange={() => onPick(o)} id={i === 0 ? `f-${id}` : undefined} />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ result states */

function Empty() {
  return (
    <div className="card p-6 md:p-8 flex flex-col gap-4">
      <h2 className="text-xl">The suggestion appears here</h2>
      <ul className="flex flex-col gap-3 text-base text-ink">
        {['A suggested regimen and dose, with the guideline it rests on',
          'What the regimen covers, set against what this patient needs',
          'Renal dosing, warnings and when to review or de-escalate',
          'A verdict on your own proposed regimen, if you enter one'].map(t =>
          <li key={t} className="flex gap-3"><Check size={18} className="text-accent-ink mt-0.5 shrink-0" aria-hidden="true" />{t}</li>)}
      </ul>
      <p className="hint">Required: age, weight, likely source, haemodynamics and MDR risk.</p>
    </div>
  );
}

function Loading() {
  return (
    <div className="card p-6 flex flex-col gap-4" role="status">
      <p className="flex items-center gap-2 text-base font-medium text-ink"><Loader2 className="animate-spin" size={18} aria-hidden="true" /> Writing the suggestion. This usually takes 10 to 30 seconds.</p>
      {[70, 45, 90, 60].map((w, i) => <span key={i} className="block h-3 rounded-full bg-line animate-pulse" style={{ width: `${w}%` }} />)}
    </div>
  );
}

/* ------------------------------------------------------------------ the result */

type Cite = { guideline?: string; year?: string; section?: string; statement?: string };
const citeText = (c?: Cite) => c?.guideline ? [c.guideline, c.year, c.section].filter(Boolean).join(', ') : '';
const isYes = (v?: string) => /^(yes|covered|strong)/i.test(v || '');
const isNo = (v?: string) => /^(no|not covered|none)/i.test(v || '');

function CiteLine({ c }: { c?: Cite }) {
  const t = citeText(c);
  return t
    ? <p className="text-sm text-muted">Source: <span className="text-ink">{t}</span></p>
    : <p className="text-sm text-[#7a5410] flex items-start gap-1.5"><AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />No guideline source returned. Check this against {GUIDELINES} before acting.</p>;
}

function Result({ r, f, stale, onUpdate, headingRef }: { r: any; f: Form; stale: boolean; onUpdate: () => void; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  const recs: any[] = r.empiric_recommendation || [];
  const top = recs[0];
  const assumed = ASSUMED.filter(([k]) => !f[k] || f[k] === 'Not known').map(([, l]) => l);
  const ua = r.user_antibiotic_assessment;
  const sources: Cite[] = [...(r.sources || []), ...recs.map(x => x.citation)].filter(c => c?.guideline)
    .filter((c, i, a) => a.findIndex(d => citeText(d) === citeText(c)) === i);
  const ph = r.pharmacology_analysis || {}, da = r.dose_adjustment || {};
  const [copied, setCopied] = React.useState(false);

  if (!top && !r.summary) {
    return (
      <div role="alert" className="card p-6 flex flex-col gap-3">
        <h2 ref={headingRef} tabIndex={-1} className="text-xl outline-none">The model returned no plan</h2>
        <p className="text-muted">Nothing usable came back for these inputs. Try again, or check the source and risk factors.</p>
        <div><button type="button" onClick={onUpdate} className="btn-primary">Try again</button></div>
      </div>
    );
  }

  const copy = async () => {
    const lines = [
      'MedWise sepsis antibiotics: AI-generated suggestion (check before prescribing)',
      `Patient: ${f.age} y, ${f.weight} kg, source ${f.infectionSource}, ${f.hemodynamics}, MDR risk ${f.mdrRisk}`,
      ...recs.map((x, i) => `${i === 0 ? 'Suggested' : 'Alternative'}: ${x.antibiotic}: ${x.dose}${citeText(x.citation) ? ` [${citeText(x.citation)}]` : ''}`),
      r.deescalation_advice && `Review: ${r.deescalation_advice}`,
      assumed.length ? `Not assessed: ${assumed.join(', ')}` : '',
    ].filter(Boolean);
    try { await navigator.clipboard.writeText(lines.join('\n')); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
  };

  return (
    <div className="flex flex-col gap-6 mw-rise">
      {stale && (
        <div role="status" className="rounded-md border border-gold bg-gold-soft p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-base text-[#7a5410]">You changed the inputs. This suggestion is for the earlier details.</p>
          <button type="button" onClick={onUpdate} className="btn-primary">Update suggestion</button>
        </div>
      )}

      {/* the answer first */}
      <section className="card p-5 md:p-6 flex flex-col gap-4" aria-labelledby="res-h">
        <div className="flex items-center justify-between gap-3">
          <span className="chip"><Sparkles size={13} aria-hidden="true" /> AI-generated suggestion</span>
          <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 h-11 px-3 -mr-3 rounded-sm text-sm font-medium text-ink hover:bg-surface transition-colors">
            {copied ? <Check size={16} aria-hidden="true" /> : <ClipboardCopy size={16} aria-hidden="true" />}{copied ? 'Copied' : <><span className="sm:hidden">Copy</span><span className="hidden sm:inline">Copy for notes</span></>}
          </button>
        </div>
        <div>
          <h2 id="res-h" ref={headingRef} tabIndex={-1} className="text-2xl leading-tight outline-none">{top?.antibiotic || 'Suggested plan'}</h2>
          {top?.dose && <p className="font-mono tabular-nums text-base text-ink mt-2 leading-relaxed">{top.dose}</p>}
        </div>
        <CiteLine c={top?.citation} />
        {r.summary && <p className="text-base leading-relaxed text-ink border-t border-line pt-4">{r.summary}</p>}
        {r.deescalation_advice && <p className="text-base leading-relaxed"><span className="font-medium">Review: </span>{r.deescalation_advice}</p>}
        <p className="hint">Written by an AI model from your inputs, not reviewed by a clinician. Check it against your local antibiogram and the source above.</p>
        {assumed.length > 0 && (
          <div className="rounded-sm bg-surface p-3 text-sm">
            <span className="font-medium text-ink">Not assessed, sent as unknown: </span><span className="text-muted">{assumed.join(', ')}.</span>
          </div>
        )}
      </section>

      {/* each regimen with its coverage */}
      {recs.map((x, i) => (
        <section key={i} className="card p-5 md:p-6 flex flex-col gap-4" aria-label={`${i === 0 ? 'Suggested regimen' : 'Alternative regimen'}: ${x.antibiotic}`}>
          <div>
            <p className="text-sm text-muted">{i === 0 ? 'Suggested regimen' : `Alternative ${i}`}</p>
            <h3 className="text-xl mt-0.5">{x.antibiotic}</h3>
            {i > 0 && x.dose && <p className="font-mono tabular-nums text-sm mt-1">{x.dose}</p>}
            {i > 0 && <div className="mt-2"><CiteLine c={x.citation} /></div>}
            {x.alternatives?.length > 0 && <p className="text-sm text-muted mt-2">If unavailable or allergic: <span className="text-ink">{x.alternatives.join('; ')}</span></p>}
          </div>
          {x.coverage && <Coverage rec={x} needed={r.coverage_needed} />}
        </section>
      ))}

      {/* why, dosing and safety in one place */}
      {(r.why_this_antibiotic?.length > 0 || ph.recommended_dose || da.warnings?.length > 0) && (
        <section className="card p-5 md:p-6 flex flex-col gap-5" aria-labelledby="why-h">
          {r.why_this_antibiotic?.length > 0 && <div>
            <h3 id="why-h" className="text-xl">Why this plan</h3>
            <ol className="mt-3 flex flex-col gap-2 list-decimal pl-5 text-base leading-relaxed marker:text-muted">{r.why_this_antibiotic.map((p: string, k: number) => <li key={k}>{p}</li>)}</ol>
          </div>}
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 border-t border-line pt-5">
            {ph.recommended_dose && <Def t="Dose"><span className="font-mono tabular-nums">{ph.recommended_dose}</span></Def>}
            {ph.infusion_strategy && <Def t="Infusion">{ph.infusion_strategy}</Def>}
            {(ph.renal_adjustment || da.renal) && <Def t="Renal adjustment">{ph.renal_adjustment || da.renal}{f.creatinine ? <span className="block text-muted text-sm mt-0.5">For creatinine {f.creatinine} {f.creatUnit}{f.egfr ? `, eGFR ${f.egfr}` : ''}</span> : <span className="block text-muted text-sm mt-0.5">No creatinine entered.</span>}</Def>}
            {ph.pk_pd_rationale && <Def t="PK/PD">{ph.pk_pd_rationale}</Def>}
          </dl>
          {da.warnings?.length > 0 && <div className="border-t border-line pt-5">
            <h4 className="text-base font-medium flex items-center gap-2"><AlertTriangle size={16} className="text-bad" aria-hidden="true" /> Warnings</h4>
            <ul className="mt-2 flex flex-col gap-1.5 text-base list-disc pl-5 marker:text-bad">{da.warnings.map((w: string, k: number) => <li key={k}>{w}</li>)}</ul>
          </div>}
        </section>
      )}

      {/* verdict on the doctor's own regimen */}
      {ua?.selected_antibiotic && ua?.decision && (
        <section className="card p-5 md:p-6 flex flex-col gap-4" aria-labelledby="ua-h">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Your proposed regimen</p>
              <h3 id="ua-h" className="text-xl mt-0.5">{ua.selected_antibiotic}</h3>
            </div>
            <Verdict d={ua.decision} />
          </div>
          {ua.clinical_reasoning && <p className="text-base leading-relaxed">{ua.clinical_reasoning}</p>}
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {ua.risk_of_failure && <Def t="Risk of failure">{ua.risk_of_failure}</Def>}
            {ua.recommended_regimen && <Def t="Suggested instead"><span className="font-mono tabular-nums">{ua.recommended_regimen}</span></Def>}
          </dl>
          {ua.key_reasons?.length > 0 && <div><h4 className="text-base font-medium">What drives the risk</h4>
            <ul className="mt-2 flex flex-col gap-1.5 text-base list-disc pl-5 marker:text-muted">{ua.key_reasons.map((k: string, i: number) => <li key={i}>{k}</li>)}</ul></div>}
          <div><h4 className="text-base font-medium">Coverage gaps</h4>
            {ua.coverage_gaps?.length > 0
              ? <ul className="mt-2 flex flex-wrap gap-2">{ua.coverage_gaps.map((g: string, i: number) => <li key={i} className="chip !border-bad/30 !text-bad">{g}</li>)}</ul>
              : <p className="text-base text-muted mt-1">None identified.</p>}
          </div>
          {ua.suggested_alternatives?.length > 0 && <p className="text-sm text-muted">Other options: <span className="text-ink">{ua.suggested_alternatives.join('; ')}</span></p>}
        </section>
      )}

      {/* sources */}
      <section className="card p-5 md:p-6 flex flex-col gap-3" aria-labelledby="src-h">
        <h3 id="src-h" className="text-xl">Sources cited</h3>
        {sources.length > 0
          ? <ul className="flex flex-col gap-3">{sources.map((c, i) => <li key={i} className="text-base leading-relaxed"><span className="font-medium">{citeText(c)}</span>{c.statement && <span className="block text-muted text-sm">{c.statement}</span>}</li>)}</ul>
          : <p className="text-base text-[#7a5410]">The model cited no sources for this plan. Check it against {GUIDELINES} before acting.</p>}
        <p className="hint">Citations come from the AI model. Open the guideline to confirm the section before relying on it.</p>
      </section>
    </div>
  );
}

function Def({ t, children }: { t: string; children: React.ReactNode }) {
  return <div><dt className="text-sm text-muted">{t}</dt><dd className="text-base text-ink mt-0.5 leading-relaxed">{children}</dd></div>;
}

function Verdict({ d }: { d: string }) {
  const k = d.toUpperCase();
  const [cls, text] = k === 'ADEQUATE' ? ['bg-ok/10 text-ok', 'Adequate'] : k === 'INADEQUATE' ? ['bg-bad/10 text-bad', 'Inadequate'] : ['bg-gold-soft text-[#7a5410]', 'Borderline'];
  return <span className={`inline-flex items-center h-8 px-3 rounded-full text-sm font-medium ${cls}`}>{text}</span>;
}

/** What the regimen covers, against what this patient needs. Red only for a real gap. */
function Coverage({ rec, needed }: { rec: any; needed?: Record<string, string> }) {
  const [all, setAll] = React.useState(false);
  const [open, setOpen] = React.useState<string | null>(null);
  const rows = CATS.map(([k, label]) => {
    const v = rec.coverage?.[k] as string | undefined;
    const cov = isYes(v) ? 'yes' : isNo(v) ? 'no' : v ? 'partial' : 'unknown';
    const need = needed?.[k] ? isYes(needed[k]) : null;
    const [tone, text] =
      cov === 'no' && need === true ? ['gap', 'Gap: needed, not covered'] :
      cov === 'yes' && need !== false ? ['ok', 'Covered'] :
      cov === 'yes' ? ['muted', 'Covered, not needed'] :
      cov === 'partial' && need === true ? ['warn', 'Partly covered, needed'] :
      cov === 'partial' ? ['muted', 'Partly covered'] :
      need === false ? ['muted', 'Not needed'] : ['muted', 'Not covered'];
    return { k, label, tone, text, show: !needed || need === true || cov === 'yes' || cov === 'partial' };
  });
  const shown = all ? rows : rows.filter(x => x.show);
  const hidden = rows.length - rows.filter(x => x.show).length;
  const gaps = rows.filter(x => x.tone === 'gap').length;
  const toneCls: Record<string, string> = { ok: 'text-ok', gap: 'text-bad font-medium', warn: 'text-[#7a5410] font-medium', muted: 'text-muted' };
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-base font-medium">Coverage for this patient</h4>
        <p className={`text-sm ${gaps ? 'text-bad' : 'text-muted'}`}>{gaps ? `${gaps} ${gaps === 1 ? 'gap' : 'gaps'}` : needed ? 'No gaps for this patient' : 'Patient needs not returned'}</p>
      </div>
      <ul className="mt-2 rounded-md border border-line divide-y divide-line">
        {shown.map(x => {
          const det = rec.coverage_details?.[x.k], pats: string[] = rec.pathogen_details?.[x.k] || [];
          const can = !!det || pats.length > 0, isOpen = open === x.k;
          return (
            <li key={x.k}>
              <button type="button" disabled={!can} aria-expanded={can ? isOpen : undefined} onClick={() => setOpen(isOpen ? null : x.k)}
                className="w-full min-h-11 px-3 py-2 flex items-center gap-3 text-left enabled:hover:bg-surface transition-colors disabled:cursor-default disabled:opacity-100 rounded-md">
                <span className="flex-1 text-base text-ink">{x.label}</span>
                <span className={`text-sm text-right ${toneCls[x.tone]}`}>{x.tone === 'gap' && <AlertTriangle size={14} className="inline mr-1 -mt-0.5" aria-hidden="true" />}{x.text}</span>
                {can ? <ChevronDown size={16} className={`text-muted shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" /> : <span className="w-4 shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-3 pb-3 text-sm text-ink leading-relaxed">
                  {det && <p>{det}</p>}
                  {pats.length > 0 && <p className="text-muted mt-1">Pathogens: <span className="text-ink">{pats.join(', ')}</span></p>}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {hidden > 0 && <button type="button" onClick={() => setAll(!all)} className="link text-sm mt-2 min-h-11">{all ? 'Show only what matters for this patient' : `Show all ${rows.length} categories`}</button>}
    </div>
  );
}
