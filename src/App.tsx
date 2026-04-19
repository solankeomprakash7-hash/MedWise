import * as React from 'react';
import { analyzeSepsisTherapy, PatientData } from './services/geminiService';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  ClipboardList, 
  FlaskConical, 
  Info, 
  Microscope, 
  ShieldAlert, 
  Stethoscope,
  Loader2,
  FileText,
  TrendingUp,
  AlertTriangle,
  LogOut,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import AuthScreen from './components/AuthScreen';

export default function App() {
  const { useState, useEffect } = React;
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{ recIndex: number, category: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Only set user if email is verified
      if (firebaseUser && firebaseUser.emailVerified) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Close tooltip on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActiveTooltip(null);
    if (activeTooltip) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [activeTooltip]);

  const [formData, setFormData] = useState<PatientData>({
    age: '',
    sex: 'Male',
    weight: '',
    icuDay: '1',
    diagnosis: 'Sepsis',
    infectionSource: 'Lung',
    ventilated: 'No',
    hemodynamics: 'Stable',
    mdrRisk: 'No',
    recentHospitalization: 'No',
    priorAntibiotics: 'No',
    priorAntibioticsDetails: '',
    immunocompromised: 'No',
    indwellingDevices: 'No',
    travelHistory: 'No',
    comorbidities: 'None',
    wbcTrend: 'Same',
    procalcitonin: 'Not available',
    lactate: 'Normal',
    creatinine: '',
    cultureStatus: 'Pending',
    organism: '',
    sensitivity: '',
    selectedAntibiotic: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeSepsisTherapy(formData);
      setResult(analysis);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      let errorMessage = 'An unexpected error occurred during clinical analysis.';
      if (err.message && err.message.includes('Rpc failed')) {
        errorMessage = 'The clinical analysis engine is temporarily unavailable due to a network error. Please try again in a moment.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center">
        <Loader2 className="animate-spin text-nejm-blue" size={40} />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-20">
      {/* NEJM Style Top Header */}
      <header className="bg-white border-b border-nejm-border px-4 md:px-8 py-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-nejm-blue text-white rounded-sm p-2 shadow-sm">
              <Stethoscope size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-nejm-blue leading-none">
                MedWise
              </h1>
              <p className="text-[11px] font-sans uppercase tracking-[0.2em] font-bold text-nejm-red mt-1">
                Precision Antimicrobial Stewardship in Sepsis
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-6 text-[10px] font-sans font-bold uppercase tracking-widest text-nejm-text/60">
              <div className="flex flex-col items-end">
                <span>Current Protocol</span>
                <span className="text-nejm-blue">SSC 2026 / IDSA 2024</span>
              </div>
              <div className="h-8 w-[1px] bg-nejm-border"></div>
              <div className="flex flex-col items-end">
                <span>Last Updated</span>
                <span className="text-nejm-blue">March 2026</span>
              </div>
            </div>

            <div className="flex items-center gap-4 border-l border-nejm-border pl-6">
              <div className="flex flex-col items-end text-right">
                <span className="text-[10px] uppercase font-bold text-nejm-blue flex items-center gap-1">
                  <User size={10} /> {user.displayName || 'Authorized User'}
                </span>
                <button 
                  onClick={handleSignOut}
                  className="text-[9px] uppercase tracking-tighter text-nejm-red hover:underline flex items-center gap-1 font-bold"
                >
                  <LogOut size={10} /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-5">
            <div className="nejm-header">
              <h2 className="text-xl font-serif font-bold">Patient Presentation</h2>
              <p className="text-sm text-nejm-text/70 mt-1">Complete all relevant clinical parameters for analysis.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Patient Demographics */}
              <section>
                <h3 className="nejm-section-title">
                  <Stethoscope size={18} className="text-nejm-blue" />
                  Demographics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="nejm-label">Age (Years)</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="nejm-input" required />
                  </div>
                  <div>
                    <label className="nejm-label">Sex</label>
                    <select name="sex" value={formData.sex} onChange={handleChange} className="nejm-input">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="nejm-label">Weight (kg)</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="nejm-input" required />
                  </div>
                </div>
              </section>

              {/* Clinical Status */}
              <section>
                <h3 className="nejm-section-title">
                  <Activity size={18} className="text-nejm-blue" />
                  Clinical Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="nejm-label">ICU Day</label>
                    <input type="number" name="icuDay" value={formData.icuDay} onChange={handleChange} className="nejm-input" />
                  </div>
                  <div>
                    <label className="nejm-label">Diagnosis</label>
                    <select name="diagnosis" value={formData.diagnosis} onChange={handleChange} className="nejm-input">
                      <option>Sepsis</option>
                      <option>Septic Shock</option>
                    </select>
                  </div>
                  <div>
                    <label className="nejm-label">Infection Source</label>
                    <select name="infectionSource" value={formData.infectionSource} onChange={handleChange} className="nejm-input">
                      <option>Lung</option>
                      <option>Urinary</option>
                      <option>Intra-abdominal</option>
                      <option>CNS</option>
                      <option>Skin</option>
                      <option>Bloodstream</option>
                      <option>Unknown</option>
                    </select>
                  </div>
                  <div>
                    <label className="nejm-label">Hemodynamics</label>
                    <select name="hemodynamics" value={formData.hemodynamics} onChange={handleChange} className="nejm-input">
                      <option>Stable</option>
                      <option>Shock</option>
                      <option>Worsening</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Risk Factors */}
              <section>
                <h3 className="nejm-section-title">
                  <ShieldAlert size={18} className="text-nejm-blue" />
                  Risk Factors & Comorbidities
                </h3>
                <div className="bg-nejm-gray/10 border border-nejm-border/30 rounded-sm overflow-hidden">
                  <div className="grid grid-cols-1">
                    {[
                      { id: 'mdrRisk', label: 'MDR Risk', desc: 'Prior colonization or high local prevalence' },
                      { id: 'recentHospitalization', label: 'Recent Hospitalization', desc: 'Within the last 90 days' },
                      { id: 'priorAntibiotics', label: 'Prior Antibiotics', desc: 'Broad-spectrum use in last 30 days' },
                    ].map((item) => (
                      <div key={item.id} className="flex flex-col border-b border-nejm-border/20 last:border-b-0">
                        <div className="p-3 flex items-center justify-between hover:bg-white/50 transition-colors">
                          <div>
                            <p className="text-[11px] font-bold text-nejm-text uppercase tracking-wider">{item.label}</p>
                            <p className="text-[10px] text-nejm-text/60 italic">{item.desc}</p>
                          </div>
                          <div className="flex bg-white border border-nejm-border/40 rounded-sm p-0.5">
                            {['No', 'Yes'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, [item.id]: opt }))}
                                className={`px-3 py-1 text-[10px] font-bold uppercase transition-all ${
                                  (formData as any)[item.id] === opt 
                                    ? 'bg-nejm-blue text-white shadow-sm' 
                                    : 'text-nejm-text/40 hover:text-nejm-text/70'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                        {item.id === 'priorAntibiotics' && formData.priorAntibiotics === 'Yes' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            className="px-3 pb-3"
                          >
                            <input 
                              type="text" 
                              name="priorAntibioticsDetails" 
                              value={formData.priorAntibioticsDetails} 
                              onChange={handleChange} 
                              placeholder="Specify agents (e.g. Pip/Tazo, Meropenem)"
                              className="nejm-input text-[10px] py-1"
                            />
                          </motion.div>
                        )}
                      </div>
                    ))}
                    {[
                      { id: 'immunocompromised', label: 'Immunocompromised', desc: 'Chemo, transplant, or high-dose steroids' },
                      { id: 'indwellingDevices', label: 'Indwelling Devices', desc: 'CVC, Foley, EVD, or recent surgery' },
                      { id: 'travelHistory', label: 'Recent Travel', desc: 'International travel to high-resistance areas' }
                    ].map((item) => (
                      <div key={item.id} className="p-3 flex items-center justify-between hover:bg-white/50 transition-colors border-b border-nejm-border/20 last:border-b-0">
                        <div>
                          <p className="text-[11px] font-bold text-nejm-text uppercase tracking-wider">{item.label}</p>
                          <p className="text-[10px] text-nejm-text/60 italic">{item.desc}</p>
                        </div>
                        <div className="flex bg-white border border-nejm-border/40 rounded-sm p-0.5">
                          {['No', 'Yes'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, [item.id]: opt }))}
                              className={`px-3 py-1 text-[10px] font-bold uppercase transition-all ${
                                (formData as any)[item.id] === opt 
                                  ? 'bg-nejm-blue text-white shadow-sm' 
                                  : 'text-nejm-text/40 hover:text-nejm-text/70'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-white/40 border-t border-nejm-border/20">
                    <label className="nejm-label mb-1">Significant Comorbidities</label>
                    <input 
                      type="text" 
                      name="comorbidities" 
                      value={formData.comorbidities} 
                      onChange={handleChange} 
                      placeholder="e.g. DM, CKD, COPD, HF"
                      className="nejm-input text-xs"
                    />
                  </div>
                </div>
              </section>

              {/* Labs & Microbiology */}
              <section>
                <h3 className="nejm-section-title">
                  <FlaskConical size={18} className="text-nejm-blue" />
                  Laboratory Data
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="nejm-label">Lactate Trend</label>
                    <select name="lactate" value={formData.lactate} onChange={handleChange} className="nejm-input">
                      <option>Normal</option>
                      <option>Increasing</option>
                      <option>Decreasing</option>
                    </select>
                  </div>
                  <div>
                    <label className="nejm-label">Creatinine / eGFR</label>
                    <input type="text" name="creatinine" value={formData.creatinine} onChange={handleChange} className="nejm-input" placeholder="e.g. 1.2 / 65" />
                  </div>
                  <div className="col-span-2">
                    <label className="nejm-label">Culture Status</label>
                    <select name="cultureStatus" value={formData.cultureStatus} onChange={handleChange} className="nejm-input">
                      <option>Pending</option>
                      <option>Positive</option>
                      <option>Negative</option>
                    </select>
                  </div>
                  {formData.cultureStatus === 'Positive' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="col-span-2 space-y-4 pt-2">
                      <div>
                        <label className="nejm-label">Organism Identified</label>
                        <input type="text" name="organism" value={formData.organism} onChange={handleChange} className="nejm-input" />
                      </div>
                      <div>
                        <label className="nejm-label">Sensitivity Profile</label>
                        <textarea name="sensitivity" value={formData.sensitivity} onChange={handleChange} className="nejm-input min-h-[80px]" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </section>

              {/* Clinician Input */}
              <section className="border-t border-nejm-border pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardList size={18} className="text-nejm-blue" />
                  <h3 className="font-serif text-lg">Clinician Selection</h3>
                </div>
                <div>
                  <label className="nejm-label">Proposed Antibiotic Therapy</label>
                  <input 
                    type="text" 
                    name="selectedAntibiotic" 
                    value={formData.selectedAntibiotic} 
                    onChange={handleChange} 
                    className="nejm-input border-nejm-blue/30" 
                    placeholder="e.g. Meropenem + Vancomycin"
                  />
                </div>
              </section>

              <button 
                type="submit" 
                disabled={loading}
                className="nejm-btn w-full flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Generate Clinical Analysis'}
              </button>
            </form>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-nejm-border rounded-lg bg-white"
                >
                  <Microscope size={64} strokeWidth={1} className="text-nejm-blue/20 mb-6" />
                  <h3 className="font-serif text-2xl text-nejm-blue/40 mb-2">Awaiting Clinical Parameters</h3>
                  <p className="text-sm text-nejm-text/40 max-w-xs mx-auto">
                    Please complete the patient presentation form to receive a systematic evidence-based analysis.
                  </p>
                </motion.div>
              )}

              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 bg-white border border-nejm-border"
                >
                  <Loader2 size={64} strokeWidth={1} className="text-nejm-blue mb-6 animate-spin" />
                  <h3 className="font-serif text-2xl text-nejm-blue mb-2">Analyzing Evidence</h3>
                  <p className="text-sm font-sans uppercase tracking-widest text-nejm-text/60">
                    Cross-referencing SSC 2026 and IDSA Guidelines...
                  </p>
                </motion.div>
              )}

              {error && !loading && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 bg-red-50 border-2 border-nejm-red/20 rounded-lg"
                >
                  <AlertTriangle size={64} strokeWidth={1} className="text-nejm-red mb-6" />
                  <h3 className="font-serif text-2xl text-nejm-red mb-2">Analysis Interrupted</h3>
                  <p className="text-sm text-nejm-text/70 max-w-md mx-auto mb-8">
                    {error}
                  </p>
                  <button 
                    onClick={(e) => handleSubmit(e as any)}
                    className="nejm-btn bg-nejm-red hover:bg-red-800 text-white border-none"
                  >
                    Retry Clinical Analysis
                  </button>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  {/* Executive Summary */}
                  <div className="bg-nejm-blue text-white p-8 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <FileText size={120} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={20} />
                        <h3 className="text-[11px] uppercase font-bold tracking-[0.3em]">Clinical Summary</h3>
                      </div>
                      <p className="font-serif text-xl leading-relaxed italic">
                        "{result.summary}"
                      </p>
                    </div>
                  </div>

                  {/* Global Coverage Summary */}
                  <div className="nejm-card bg-white">
                    <div className="flex items-center justify-between mb-6 border-b border-nejm-gray pb-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert size={18} className="text-nejm-blue" />
                        <div className="flex flex-col">
                          <h3 className="font-serif text-lg leading-tight">Global Coverage Profile</h3>
                          <p className="text-[9px] text-nejm-text/50 font-sans uppercase tracking-widest font-bold">Aggregate Regimen Spectrum</p>
                        </div>
                      </div>
                      <div className="group relative">
                        <Info size={14} className="text-nejm-blue/40 cursor-help" />
                        <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-nejm-blue text-white text-[10px] rounded-sm shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          <p className="font-bold mb-1 uppercase tracking-wider">Regimen Aggregate Coverage</p>
                          <p className="opacity-80 leading-relaxed">
                            This represents the combined antimicrobial spectrum of all recommended agents in the regimen. 
                            "Covered" indicates the regimen provides adequate empiric activity against the specified pathogen class.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {result.coverage_summary && Object.entries(result.coverage_summary).map(([key, val]) => (
                        <div 
                          key={key} 
                          onClick={() => setActiveTooltip({ recIndex: -1, category: key })}
                          className="flex flex-col items-center text-center p-3 rounded-sm bg-nejm-gray/10 border border-nejm-border/20 transition-all hover:bg-nejm-gray/20 cursor-help relative"
                        >
                          <p className="text-[9px] uppercase font-bold text-nejm-blue/60 mb-2 leading-tight">
                            {key.replace('_', ' ')}
                          </p>
                          <div className="flex items-center gap-2">
                            {val === 'Yes' || val === 'Covered' || val === 'Strong' ? (
                              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                                <CheckCircle2 size={12} />
                              </div>
                            ) : val === 'No' || val === 'Not covered' || val === 'None' ? (
                              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-nejm-red">
                                <AlertTriangle size={12} />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                                <Info size={12} />
                              </div>
                            )}
                            <span className={`text-[11px] font-bold uppercase ${
                              val === 'Yes' || val === 'Covered' || val === 'Strong' ? 'text-green-700' : 
                              val === 'No' || val === 'Not covered' || val === 'None' ? 'text-nejm-red' : 
                              'text-amber-700'
                            }`}>
                              {val as string}
                            </span>
                          </div>

                          {/* Global Tooltip */}
                          <AnimatePresence>
                            {activeTooltip?.recIndex === -1 && activeTooltip?.category === key && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 bg-white border-2 border-nejm-blue shadow-2xl z-[100] p-4 text-left pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-between mb-3 border-b border-nejm-gray pb-1">
                                  <div className="flex items-center gap-2">
                                    <ShieldAlert size={12} className="text-nejm-blue" />
                                    <p className="text-[10px] font-bold uppercase text-nejm-blue">
                                      Global {key.replace('_', ' ')} Profile
                                    </p>
                                  </div>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveTooltip(null); }}
                                    className="text-nejm-text/40 hover:text-nejm-red transition-colors"
                                  >
                                    <Activity size={12} />
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  <p className="text-xs text-nejm-text leading-relaxed font-serif italic">
                                    {result.coverage_summary_details?.[key] || "Aggregate coverage information for this category."}
                                  </p>

                                  {result.pathogen_summary_details?.[key] && result.pathogen_summary_details[key].length > 0 && (
                                    <div className="space-y-1">
                                      <p className="text-[9px] uppercase font-bold text-nejm-blue/60">Regimen-Wide Pathogen Coverage</p>
                                      <ul className="space-y-1">
                                        {result.pathogen_summary_details[key].map((pathogen: string, idx: number) => (
                                          <li key={idx} className="text-[10px] leading-tight flex gap-1.5">
                                            <span className="text-nejm-blue mt-0.5">•</span>
                                            <span>{pathogen}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-nejm-blue"></div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations Cards */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="nejm-accent-line !mb-0"></div>
                      <h3 className="font-serif text-2xl">Empiric Recommendations</h3>
                    </div>
                    
                    {result.empiric_recommendation?.map((rec: any, i: number) => (
                      <div key={i} className="nejm-card p-0 overflow-hidden border-nejm-blue/30 shadow-md">
                        <div className="bg-nejm-blue text-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <p className="font-serif text-2xl font-bold leading-tight">{rec.antibiotic}</p>
                            <p className="text-[10px] font-sans uppercase tracking-widest opacity-80 mt-1">
                              Standard ICU Dosing: <span className="font-mono">{rec.dose}</span>
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <p className="text-[9px] uppercase font-bold opacity-60 mb-1">Alternatives</p>
                            <div className="flex flex-wrap justify-end gap-1">
                              {rec.alternatives?.map((alt: string, j: number) => (
                                <span key={j} className="text-[9px] bg-white/10 border border-white/20 px-2 py-0.5 rounded-sm">{alt}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Specific Coverage Matrix for this antibiotic */}
                        <div className="p-6 bg-white">
                          <div className="flex items-center justify-between mb-4 border-b border-nejm-gray pb-1">
                            <p className="nejm-label text-[10px] mb-0">Antimicrobial Spectrum Profile</p>
                            <p className="text-[8px] uppercase font-bold text-nejm-blue opacity-60 flex items-center gap-1">
                              <Info size={10} /> Click category for clinical detail
                            </p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {rec.coverage && Object.entries(rec.coverage).map(([key, val]) => {
                              return (
                                <div 
                                  key={key} 
                                  onClick={() => setActiveTooltip({ recIndex: i, category: key })}
                                  className={`flex flex-col items-center text-center p-3 rounded-sm transition-all duration-300 cursor-help relative bg-nejm-gray/20 border border-nejm-border/30 hover:bg-nejm-gray/40`}
                                >
                                  <p className={`text-[8px] uppercase font-bold mb-2 leading-tight h-4 text-nejm-blue/60`}>
                                    {key.replace('_', ' ')}
                                  </p>
                                  <div className={`flex flex-col items-center gap-1`}>
                                    {val === 'Yes' || val === 'Covered' || val === 'Strong' ? (
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-green-100 text-green-700`}>
                                        <CheckCircle2 size={14} />
                                      </div>
                                    ) : val === 'No' || val === 'Not covered' || val === 'None' ? (
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-red-100 text-nejm-red`}>
                                        <AlertTriangle size={14} />
                                      </div>
                                    ) : (
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-amber-100 text-amber-700`}>
                                        <Info size={14} />
                                      </div>
                                    )}
                                    <span className={`text-[10px] font-bold uppercase mt-1 ${
                                      val === 'Yes' || val === 'Covered' || val === 'Strong' ? 'text-green-700' : 
                                      val === 'No' || val === 'Not covered' || val === 'None' ? 'text-nejm-red' : 
                                      'text-amber-700'
                                    }`}>
                                      {val as string}
                                    </span>
                                  </div>

                                  {/* Tooltip/Popover */}
                                  <AnimatePresence>
                                    {activeTooltip?.recIndex === i && activeTooltip?.category === key && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 bg-white border-2 border-nejm-blue shadow-2xl z-[100] p-4 text-left pointer-events-auto"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="flex items-center justify-between mb-3 border-b border-nejm-gray pb-1">
                                          <div className="flex items-center gap-2">
                                            <FlaskConical size={12} className="text-nejm-blue" />
                                            <p className="text-[10px] font-bold uppercase text-nejm-blue">
                                              {key.replace('_', ' ')} Spectrum
                                            </p>
                                          </div>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); setActiveTooltip(null); }}
                                            className="text-nejm-text/40 hover:text-nejm-red transition-colors"
                                          >
                                            <Activity size={12} />
                                          </button>
                                        </div>
                                        <div className="space-y-3">
                                          <p className="text-xs text-nejm-text leading-relaxed font-serif italic">
                                            {rec.coverage_details?.[key] || "Detailed coverage information not available for this agent."}
                                          </p>

                                          {rec.pathogen_details?.[key] && rec.pathogen_details[key].length > 0 && (
                                            <div className="space-y-1">
                                              <p className="text-[9px] uppercase font-bold text-nejm-blue/60">Typical ICU Pathogens & Sensitivities</p>
                                              <ul className="space-y-1">
                                                {rec.pathogen_details[key].map((pathogen: string, idx: number) => (
                                                  <li key={idx} className="text-[10px] leading-tight flex gap-1.5">
                                                    <span className="text-nejm-blue mt-0.5">•</span>
                                                    <span>{pathogen}</span>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}

                                          <div className="bg-nejm-gray/10 p-2 border-l-2 border-nejm-blue/30">
                                            <p className="text-[9px] uppercase font-bold text-nejm-blue/60 mb-1">Clinical Context & Resistance</p>
                                            <p className="text-[10px] text-nejm-text/80 leading-tight">
                                              Assessed per SSC 2026/IDSA 2024. Considers local resistance patterns and patient-specific risk factors (MDR, prior antibiotics).
                                            </p>
                                          </div>
                                        </div>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-nejm-blue"></div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Rationale Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="nejm-card">
                      <h3 className="nejm-section-title">
                        <Info size={18} className="text-nejm-blue" />
                        Clinical Rationale
                      </h3>
                      <ul className="space-y-4">
                        {result.why_this_antibiotic?.map((point: string, i: number) => (
                          <li key={i} className="flex gap-3 text-sm leading-relaxed">
                            <span className="text-nejm-blue font-serif font-bold">{i + 1}.</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pharmacology Section */}
                    {result.pharmacology_analysis && (
                      <div className="nejm-card border-t-4 border-t-amber-600 bg-amber-50/10">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="bg-amber-600/10 p-2 rounded-full">
                            <FlaskConical size={20} className="text-amber-700" />
                          </div>
                          <div>
                            <h3 className="font-serif text-xl leading-none mb-1">Pharmacology & Dose Optimization</h3>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-amber-700/60">Expert Pharmacologist Protocol</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <p className="nejm-label text-amber-800">Optimal Dosing Strategy</p>
                              <p className="text-sm font-mono font-bold text-nejm-blue bg-white p-2 border border-nejm-border">
                                {result.pharmacology_analysis.recommended_dose}
                              </p>
                            </div>
                            <div>
                              <p className="nejm-label text-amber-800">Infusion Strategy</p>
                              <div className="flex items-center gap-2">
                                <Activity size={14} className="text-amber-700" />
                                <span className="text-xs font-bold uppercase tracking-tight text-nejm-text">
                                  {result.pharmacology_analysis.infusion_strategy}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="nejm-label text-amber-800">Renal Adjustment (eGFR based)</p>
                              <p className="text-xs italic text-nejm-text/80">{result.pharmacology_analysis.renal_adjustment}</p>
                            </div>
                            <div className="pt-2 border-t border-amber-200">
                              <p className="nejm-label text-amber-800">PK/PD Rationale</p>
                              <p className="text-[11px] leading-relaxed opacity-70 italic font-serif">
                                "{result.pharmacology_analysis.pk_pd_rationale}"
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="nejm-card bg-nejm-gray/10">
                      <h3 className="nejm-section-title">
                        <ShieldAlert size={18} className="text-nejm-blue" />
                        Safety & Stewardship
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <p className="nejm-label">Renal Adjustment</p>
                          <p className="text-sm font-serif italic text-nejm-blue">{result.dose_adjustment?.renal}</p>
                        </div>
                        <div>
                          <p className="nejm-label">Critical Warnings</p>
                          <ul className="space-y-2">
                            {result.dose_adjustment?.warnings?.map((w: string, i: number) => (
                              <li key={i} className="text-xs flex gap-2 text-nejm-red/80">
                                <span className="font-bold">!</span>
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-4 border-t border-nejm-border">
                          <p className="nejm-label">De-escalation Strategy</p>
                          <p className="text-xs leading-relaxed opacity-80">{result.deescalation_advice}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clinician Choice Validation */}
                  {result.user_antibiotic_assessment?.selected_antibiotic && (
                    <div className="nejm-card border-t-4 border-t-nejm-blue overflow-hidden">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="bg-nejm-blue/10 p-2 rounded-full">
                            <Stethoscope size={24} className="text-nejm-blue" />
                          </div>
                          <div>
                            <h3 className="font-serif text-2xl leading-none mb-1">Empiric Therapy Validation</h3>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-nejm-text/40">ID Consultant Assessment</p>
                          </div>
                        </div>
                        <div className={`nejm-badge px-6 py-2 text-sm ${
                          result.user_antibiotic_assessment?.decision === 'ADEQUATE' ? 'bg-green-50 border-green-200 text-green-700' :
                          result.user_antibiotic_assessment?.decision === 'INADEQUATE' ? 'bg-red-50 border-red-200 text-nejm-red' :
                          'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                          {result.user_antibiotic_assessment?.decision}
                        </div>
                      </div>
                      
                      <div className="space-y-8">
                        {/* Summary & Risk */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="lg:col-span-2 bg-nejm-gray/10 p-6 border-l-4 border-nejm-blue">
                             <h4 className="text-[10px] uppercase font-bold text-nejm-blue/60 mb-2 tracking-widest">Clinical Reasoning</h4>
                            <p className="font-serif text-lg italic leading-relaxed text-nejm-text">
                              "{result.user_antibiotic_assessment?.clinical_reasoning}"
                            </p>
                          </div>
                          <div className="bg-nejm-blue text-white p-6 rounded-sm flex flex-col items-center justify-center text-center shadow-md">
                            <h4 className="text-[10px] uppercase font-bold opacity-60 mb-1 tracking-widest">Risk of Treatment Failure</h4>
                            <div className="text-5xl font-serif mb-2">
                              {result.user_antibiotic_assessment?.failure_risk_percentage}%
                            </div>
                            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mt-2">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${result.user_antibiotic_assessment?.failure_risk_percentage}%` }}
                                transition={{ duration: 1 }}
                                className={`h-full ${
                                  (result.user_antibiotic_assessment?.failure_risk_percentage || 0) > 40 ? 'bg-nejm-red' : 'bg-green-400'
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Analysis Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-nejm-border/40">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle size={16} className="text-nejm-red" />
                              <h4 className="text-[11px] uppercase font-bold tracking-wider">Key Contributors to Risk</h4>
                            </div>
                            <ul className="space-y-3">
                              {result.user_antibiotic_assessment?.key_reasons?.map((reason: string, i: number) => (
                                <li key={i} className="text-xs flex gap-3 p-3 bg-red-50/50 border border-red-100/50 rounded-sm">
                                  <span className="font-bold text-nejm-red font-serif">0{i+1}.</span>
                                  <span className="text-nejm-text/80">{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-4 md:pl-8">
                            <div className="flex items-center gap-2 mb-2 pt-6 md:pt-0">
                              <CheckCircle2 size={16} className="text-green-600" />
                              <h4 className="text-[11px] uppercase font-bold tracking-wider">Recommended Regimen</h4>
                            </div>
                            <div className="bg-green-50/50 border border-green-100/50 p-4 rounded-sm mb-4">
                              <p className="text-sm font-mono font-bold text-green-800 leading-relaxed uppercase tracking-tight">
                                {result.user_antibiotic_assessment?.recommended_regimen}
                              </p>
                              <p className="text-[10px] mt-2 opacity-60 italic">Optimize dose based on PK/PD and weight ({formData.weight}kg)</p>
                            </div>

                            <div className="pt-4 border-t border-nejm-border/20">
                              <h4 className="text-[11px] uppercase font-bold tracking-wider text-nejm-blue/60 mb-3 flex items-center gap-2">
                                <FlaskConical size={14} /> Critical Coverage Gaps Identified
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {result.user_antibiotic_assessment?.coverage_gaps?.map((gap: string, i: number) => (
                                  <span key={i} className="text-[10px] font-bold bg-nejm-red/10 text-nejm-red px-2.5 py-1 border border-nejm-red/20 rounded-full uppercase tracking-tighter">
                                    {gap}
                                  </span>
                                ))}
                                {(!result.user_antibiotic_assessment?.coverage_gaps || result.user_antibiotic_assessment?.coverage_gaps.length === 0) && (
                                  <span className="text-xs italic opacity-40">None identified in proposed regimen</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                         <div className="pt-6 border-t border-nejm-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div className="flex items-center gap-4">
                             <div className="flex -space-x-2">
                               {[1, 2].map(i => (
                                 <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-nejm-gray overflow-hidden">
                                   <img 
                                     src={`https://picsum.photos/seed/doc${i}/100/100`} 
                                     alt="Consultant" 
                                     className="w-full h-full object-cover grayscale opacity-80"
                                     referrerPolicy="no-referrer"
                                   />
                                 </div>
                               ))}
                             </div>
                             <p className="text-[10px] italic opacity-50 font-serif">
                               Multi-expert analysis (ID, ICU, Pharmacology) based on latest protocols.
                             </p>
                           </div>
                           <div className="flex gap-3">
                              {result.user_antibiotic_assessment?.suggested_alternatives?.slice(0, 2).map((alt: string, i: number) => (
                                <button key={i} className="text-[10px] h-8 px-4 bg-white border border-nejm-border text-nejm-blue hover:bg-nejm-blue hover:text-white transition-all uppercase font-bold tracking-tight">
                                  Alt: {alt}
                                </button>
                              ))}
                           </div>
                         </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 md:px-8 mt-20 pt-12 border-t border-nejm-border">
        <div className="mb-12">
          <div className="flex items-center gap-2">
            <div className="bg-nejm-blue text-white p-2 rounded-sm">
              <Stethoscope size={24} />
            </div>
            <span className="font-serif font-bold text-nejm-blue text-2xl tracking-tighter">MedWise</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-nejm-blue">About MedWise</h4>
            <p className="text-xs leading-relaxed opacity-60">
              This decision-support tool is designed to bridge the gap between complex clinical guidelines and bedside practice. 
              It utilizes the latest evidence from the Surviving Sepsis Campaign and IDSA to provide systematic, 
              patient-specific antibiotic recommendations.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-nejm-blue">Clinical Standards</h4>
            <ul className="text-xs space-y-2 opacity-60">
              <li>• Surviving Sepsis Campaign: International Guidelines (2021)</li>
              <li>• IDSA/SHEA/PIDS Clinical Practice Guidelines (2024)</li>
              <li>• PK/PD Optimization in Critical Illness Protocols</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-nejm-blue">Legal Disclaimer</h4>
            <p className="text-[10px] leading-relaxed opacity-40">
              MedWise is an educational and decision-support resource. It does not constitute medical advice. 
              Clinicians must exercise independent professional judgment. Final therapeutic decisions are the responsibility 
              of the treating physician.
            </p>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-nejm-gray flex justify-between items-center text-[10px] uppercase tracking-widest opacity-30">
          <span>© 2026 Medical Decision Support Systems</span>
          <span>Digital Publication ID: 4EX-ENG-PYQ</span>
        </div>
      </footer>
    </div>
  );
}
