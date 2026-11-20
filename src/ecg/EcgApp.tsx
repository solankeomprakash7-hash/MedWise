import * as React from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import AuthScreen from '../components/AuthScreen';
import { Activity, LogOut, Loader2 } from 'lucide-react';
import { type Plan, type Progress, cloudLoad, cloudSave, empty, localLoad, localSave, merge, watchPlan } from './lib/progress';
import Home from './pages/Home';
import Placement from './pages/Placement';
import Learn from './pages/Learn';
import UnitPage from './pages/UnitPage';
import Practice from './pages/Practice';
import Upgrade from './pages/Upgrade';
import Emergency from './pages/Emergency';
import Exam from './pages/Exam';

type Ctx = { p: Progress; update: (fn: (p: Progress) => Progress) => void; plan: Plan; user: User | null; go: (h: string) => void; signIn: () => void; syncNote: string };
export const AppCtx = React.createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => React.useContext(AppCtx);

const route = () => (location.hash.replace(/^#\/?/, '') || 'home').split('/');

export default function EcgApp() {
  const [user, setUser] = React.useState<User | null>(null);
  const [ready, setReady] = React.useState(false);
  const [wantAuth, setWantAuth] = React.useState(false);
  const [p, setP] = React.useState<Progress>(localLoad);
  const [plan, setPlan] = React.useState<Plan>('free');
  const [syncNote, setSyncNote] = React.useState('');
  const [r, setR] = React.useState(route);
  const cloudOk = React.useRef(false);

  React.useEffect(() => { const f = () => { setR(route()); window.scrollTo(0, 0); }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  React.useEffect(() => onAuthStateChanged(auth, async u => {
    const ok = u && u.emailVerified ? u : null;
    setUser(ok); setReady(true);
    if (!ok) { cloudOk.current = false; return; }
    setWantAuth(false);
    try {
      const remote = await cloudLoad(ok.uid);
      const merged = merge(remote || empty(), localLoad());
      await cloudSave(ok.uid, merged); cloudOk.current = true; setP(merged); setSyncNote('');
    } catch {
      cloudOk.current = false; setSyncNote('Progress is saved on this device only (cloud sync unavailable).');
    }
  }), []);
  React.useEffect(() => (user ? watchPlan(user.uid, setPlan) : (setPlan('free'), undefined)), [user]);

  const timer = React.useRef<number | undefined>(undefined);
  const update = React.useCallback((fn: (p: Progress) => Progress) => {
    setP(prev => {
      const next = fn(prev); localSave(next);
      if (user && cloudOk.current) { clearTimeout(timer.current); timer.current = window.setTimeout(() => cloudSave(user.uid, next).catch(() => setSyncNote('Last change saved on this device only.')), 600); }
      return next;
    });
  }, [user]);
  const go = (h: string) => { location.hash = '#/' + h; };

  if (!ready) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-nejm-blue" size={36} /></div>;
  if (wantAuth && !user) return <AuthScreen subtitle="ECG" onBack={() => setWantAuth(false)} />;

  const [page, arg] = r;
  const nav: [string, string][] = [['home', 'Home'], ['learn', 'Learn'], ['practice', 'Practise'], ['emergency', 'Emergency'], ['exam', 'Exam'], ['upgrade', plan === 'free' ? 'Upgrade' : 'Plan']];
  return (
    <AppCtx.Provider value={{ p, update, plan, user, go, signIn: () => setWantAuth(true), syncNote }}>
      <div className="min-h-screen bg-[#fcfcfc] pb-16">
        <header className="bg-white border-b border-nejm-border sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <a href="#/home" className="flex items-center gap-3">
              <span className="w-9 h-9 flex items-center justify-center bg-nejm-blue text-white"><Activity size={20} /></span>
              <span className="leading-none"><span className="block font-serif font-bold text-xl text-nejm-blue">MedWise ECG</span>
                <span className="block text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 mt-1">From zero to ward-ready</span></span>
            </a>
            <nav className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest order-3 w-full sm:order-none sm:w-auto overflow-x-auto">
              {nav.map(([h, l]) => <a key={h} href={`#/${h}`} aria-current={page === h ? 'page' : undefined}
                className={`px-3 py-2 whitespace-nowrap ${page === h || (h === 'learn' && page === 'unit') ? 'text-nejm-blue border-b-2 border-nejm-red' : 'text-slate-500 hover:text-nejm-blue'}`}>{l}</a>)}
            </nav>
            <div className="flex items-center gap-3 text-xs">
              {user ? <>
                <span className="hidden md:inline text-slate-500">{user.displayName || user.email}</span>
                <span className="px-2 py-0.5 border border-nejm-border font-bold uppercase text-[10px] tracking-wider text-nejm-blue">{plan}</span>
                <button onClick={() => signOut(auth)} className="text-nejm-red flex items-center gap-1 font-bold" aria-label="Sign out"><LogOut size={14} /></button>
              </> : <button onClick={() => setWantAuth(true)} className="nejm-btn !px-4 !py-2">Sign in</button>}
            </div>
          </div>
        </header>
        {syncNote && <p className="max-w-5xl mx-auto px-4 pt-3 text-xs text-amber-700">{syncNote}</p>}
        <main className="max-w-5xl mx-auto px-4 pt-8">
          {page === 'placement' ? <Placement /> : page === 'learn' ? <Learn /> : page === 'unit' ? <UnitPage id={arg} />
            : page === 'practice' ? <Practice mode={arg === 'daily' ? 'daily' : 'practice'} topic={arg && arg.startsWith('u-') ? arg.slice(2) : undefined} key={arg || 'p'} />
            : page === 'emergency' ? <Emergency /> : page === 'exam' ? <Exam /> : page === 'upgrade' ? <Upgrade /> : <Home />}
        </main>
        <footer className="max-w-5xl mx-auto px-4 mt-16 pt-4 border-t border-nejm-border text-[11px] text-slate-400 leading-relaxed">
          For education only; not for clinical decisions. Real ECGs from PTB-XL and the Chapman–Shaoxing database (CC BY 4.0, via PhysioNet); measurements from PTB-XL+. Interactive tracings are teaching models.
        </footer>
      </div>
    </AppCtx.Provider>
  );
}
