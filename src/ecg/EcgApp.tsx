import * as React from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import AuthScreen from '../components/AuthScreen';
import { Activity, LogOut, Loader2, BookOpen, Timer, GraduationCap, House as HomeIcon } from 'lucide-react';
import { type Plan, type Progress, cloudLoad, cloudSave, empty, localLoad, localSave, merge, watchPlan } from './lib/progress';
import Home from './pages/Home';
import Placement from './pages/Placement';
import Learn from './pages/Learn';
import UnitPage from './pages/UnitPage';
import Practice from './pages/Practice';
import Upgrade from './pages/Upgrade';
import Emergency from './pages/Emergency';
import Exam from './pages/Exam';
import Legal, { LEGAL_LINKS } from './pages/Legal';

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
  // Offline or slow network: don't block the app on sign-in; continue with local progress.
  React.useEffect(() => { const t = setTimeout(() => setReady(true), 2500); return () => clearTimeout(t); }, []);
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

  if (!ready) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-ink" size={36} /></div>;
  if (wantAuth && !user) return <AuthScreen subtitle="ECG course" onBack={() => setWantAuth(false)} />;

  const [page, arg] = r;
  const active = (h: string) => page === h || (h === 'learn' && page === 'unit');
  const nav: [string, string, React.ElementType][] = [['home', 'Home', HomeIcon], ['learn', 'Learn', BookOpen], ['practice', 'Practise', Activity], ['emergency', 'Emergency', Timer], ['exam', 'Exam', GraduationCap]];
  return (
    <AppCtx.Provider value={{ p, update, plan, user, go, signIn: () => setWantAuth(true), syncNote }}>
      <div className="min-h-screen bg-surface pb-24 md:pb-16">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 btn-primary">Skip to content</a>
        <header className="bg-card/90 backdrop-blur border-b border-line sticky top-0 z-40" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <a href="/" className="flex items-center gap-2 shrink-0" aria-label="MedWise home">
                <img src="/brand/logo-mark.png" alt="" width={252} height={272} className="h-8 w-auto" />
                <img src="/brand/logo-word.png" alt="" width={593} height={150} className="h-6 w-auto hidden sm:block" />
              </a>
              <a href="#/home" className="chip-accent">ECG</a>
            </div>
            <nav className="hidden md:flex items-center gap-1" aria-label="Main">
              {nav.map(([h, l]) => <a key={h} href={`#/${h}`} aria-current={active(h) ? 'page' : undefined}
                className={`h-9 px-3 inline-flex items-center rounded-sm text-[15px] font-medium transition-colors ${active(h) ? 'bg-ink/[.06] text-ink' : 'text-muted hover:text-ink hover:bg-ink/[.04]'}`}>{l}</a>)}
            </nav>
            <div className="flex items-center gap-2">
              <a href="#/upgrade" className={plan === 'free' ? 'chip-gold' : 'chip'}>{plan === 'free' ? 'Upgrade' : plan === 'pro' ? 'Pro' : 'Student'}</a>
              {user ? <>
                <span className="hidden lg:inline text-sm text-muted max-w-40 truncate">{user.displayName || user.email}</span>
                <button onClick={() => signOut(auth)} className="btn-secondary !h-9 !px-3" aria-label="Sign out"><LogOut size={16} /></button>
              </> : <button onClick={() => setWantAuth(true)} className="btn-primary !h-9 !px-4 !text-sm">Sign in</button>}
            </div>
          </div>
        </header>
        {syncNote && <p className="max-w-6xl mx-auto px-4 pt-3 text-sm text-[#8a5a0a]">{syncNote}</p>}
        <main id="main" className="max-w-6xl mx-auto px-4 pt-8 md:pt-10">
          {page === 'placement' ? <Placement /> : page === 'learn' ? <Learn /> : page === 'unit' ? <UnitPage id={arg} />
            : page === 'practice' ? <Practice mode={arg === 'daily' ? 'daily' : 'practice'} topic={arg && arg.startsWith('u-') ? arg.slice(2) : undefined} key={arg || 'p'} />
            : page === 'emergency' ? <Emergency /> : page === 'exam' ? <Exam /> : page === 'legal' ? <Legal doc={arg} /> : page === 'upgrade' ? <Upgrade /> : <Home />}
        </main>
        <footer className="max-w-6xl mx-auto px-4 mt-20 pt-6 border-t border-line text-[13px] text-muted leading-relaxed">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <a href="/" className="flex items-center gap-2" aria-label="MedWise home"><img src="/brand/logo-mark.png" alt="" className="h-6 w-auto" /><span className="text-ink font-medium">MedWise</span></a>
            <nav className="flex flex-wrap gap-x-5 gap-y-1" aria-label="Policies">{LEGAL_LINKS.map(([k, l]) => <a key={k} href={`#/legal/${k}`} className="hover:text-ink underline-offset-4 hover:underline">{l}</a>)}</nav>
          </div>
          <p>© 2026 MedWise Private Limited. For education only, not for clinical decisions. Real ECGs from PTB-XL and the Chapman–Shaoxing database (CC BY 4.0, via PhysioNet), measurements from PTB-XL+. Animated tracings are teaching models.</p>
        </footer>
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-line grid grid-cols-5" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} aria-label="Main">
          {nav.map(([h, l, Icon]) => <a key={h} href={`#/${h}`} aria-current={active(h) ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1 h-16 text-[11px] font-medium ${active(h) ? 'text-ink' : 'text-muted'}`}>
            <span className={`w-12 h-7 rounded-full flex items-center justify-center ${active(h) ? 'bg-accent-soft text-accent-ink' : ''}`}><Icon size={20} /></span>{l}</a>)}
        </nav>
      </div>
    </AppCtx.Provider>
  );
}
