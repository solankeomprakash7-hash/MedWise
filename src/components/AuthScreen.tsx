import * as React from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  AuthError
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AlertCircle, Loader2, MailCheck } from 'lucide-react';

type Mode = 'signin' | 'register' | 'reset';

/** Shared sign-in screen for the clinical app (/app) and the ECG course (/ecg), on the MedWise design system. */
export default function AuthScreen({ subtitle = 'Sepsis antibiotics', onBack }: { subtitle?: string; onBack?: () => void } = {}) {
  const { useState } = React;
  const [mode, setMode] = useState<Mode>('signin');
  const [sent, setSent] = useState<null | 'verify' | 'reset'>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const go = (m: Mode) => { setMode(m); setError(null); };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/popup-blocked') setError('Your browser blocked the Google window. Allow pop-ups for this site and try again.');
      else if (err.code === 'auth/popup-closed-by-user') setError('The Google window was closed before sign-in finished.');
      else setError('Google sign-in is not available right now. Use your email and password instead.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email);
        setSent('reset');
        return;
      }
      if (mode === 'signin') {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        if (!cred.user.emailVerified) {
          await signOut(auth);
          setSent('verify');
        }
        return;
      }
      if (password !== confirmPassword) throw new Error('The two passwords do not match.');
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      try {
        await sendEmailVerification(cred.user);
      } catch (verifyErr) {
        console.error('Verification email failed:', verifyErr);
        setError('Your account was created, but the confirmation email did not send. Sign in later to send it again.');
      }
      await signOut(auth);
      setSent('verify');
    } catch (err: any) {
      console.error('Auth error:', err);
      const code = (err as AuthError).code;
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') setError('That email and password do not match an account.');
      else if (code === 'auth/email-already-in-use') setError('An account with this email already exists.');
      else if (code === 'auth/weak-password') setError('Use a password of at least 6 characters.');
      else if (code === 'auth/invalid-email') setError('Enter a valid email address.');
      else if (code === 'auth/network-request-failed') setError('No connection. Check your internet and try again.');
      else setError(err.message && !code ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const Brand = (
    <div className="flex flex-col items-center gap-3 mb-8 text-center">
      <span className="flex items-center gap-2.5">
        <img src="/brand/logo-mark.png" alt="" width={40} height={40} className="h-10 w-10" />
        <img src="/brand/logo-word.png" alt="MedWise" height={24} className="h-6 w-auto" />
      </span>
      <p className="text-base text-muted">{subtitle}</p>
    </div>
  );

  if (sent) {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {Brand}
          <div className="card p-6 md:p-8 text-center flex flex-col items-center gap-4" role="status">
            <span className="w-12 h-12 rounded-full bg-accent-soft text-accent-ink flex items-center justify-center"><MailCheck size={24} /></span>
            <h1 className="text-2xl">{sent === 'reset' ? 'Check your email' : 'Confirm your email'}</h1>
            <p className="text-base text-muted leading-relaxed">
              {sent === 'reset'
                ? <>We sent a link to reset your password to <b className="text-ink font-medium break-all">{email}</b>.</>
                : <>We sent a confirmation link to <b className="text-ink font-medium break-all">{email}</b>. Open it, then sign in.</>}
            </p>
            {error && <p className="text-sm text-bad">{error}</p>}
            <button type="button" className="btn-primary w-full" onClick={() => { setSent(null); go('signin'); setPassword(''); setConfirmPassword(''); }}>
              Back to sign in
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        {Brand}
        <div className="card p-6 md:p-8">
          {mode !== 'reset' ? (
            <div className="grid grid-cols-2 gap-1 p-1 mb-6 rounded-md bg-surface" role="group" aria-label="Account">
              {(['signin', 'register'] as const).map(m => (
                <button key={m} type="button" aria-pressed={mode === m} onClick={() => go(m)}
                  className={`h-10 rounded-sm text-base font-medium transition-colors ${mode === m ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink'}`}>
                  {m === 'signin' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>
          ) : (
            <div className="mb-6">
              <h1 className="text-2xl">Reset your password</h1>
              <p className="hint mt-1">Enter the email you signed up with and we will send you a reset link.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate={false}>
            {mode === 'register' && (
              <div>
                <label className="label" htmlFor="auth-name">Full name</label>
                <input id="auth-name" type="text" required autoComplete="name" value={name} onChange={e => setName(e.target.value)} className="input" />
              </div>
            )}
            <div>
              <label className="label" htmlFor="auth-email">Email</label>
              <input id="auth-email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="input" />
            </div>
            {mode !== 'reset' && (
              <div>
                <div className="flex justify-between items-baseline gap-3">
                  <label className="label" htmlFor="auth-password">Password</label>
                  {mode === 'signin' && <button type="button" onClick={() => go('reset')} className="link text-sm mb-1.5">Forgot password?</button>}
                </div>
                <input id="auth-password" type="password" required minLength={6} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={password} onChange={e => setPassword(e.target.value)} className="input" />
              </div>
            )}
            {mode === 'register' && (
              <div>
                <label className="label" htmlFor="auth-confirm">Repeat password</label>
                <input id="auth-confirm" type="password" required minLength={6} autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input" />
              </div>
            )}

            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-sm border border-bad/30 bg-bad/5 p-3 text-sm text-bad">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span className="flex-1">{error}</span>
                {error.startsWith('An account with this email') && <button type="button" onClick={() => go('signin')} className="font-medium underline underline-offset-2">Sign in</button>}
              </div>
            )}

            <button disabled={loading} type="submit" className="btn-primary w-full mt-1">
              {loading ? <Loader2 className="animate-spin" size={18} aria-label="Working" /> : mode === 'reset' ? 'Send reset link' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
            {mode === 'reset' && <button type="button" onClick={() => go('signin')} className="btn-secondary w-full">Back to sign in</button>}
          </form>

          {mode !== 'reset' && (
            <>
              <div className="flex items-center gap-3 my-6 text-sm text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
              <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="btn-secondary w-full">
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
                Continue with Google
              </button>
            </>
          )}
        </div>

        {onBack && <p className="mt-5 text-center"><button type="button" onClick={onBack} className="link text-sm">Continue without an account</button></p>}
        <p className="mt-6 text-center text-sm text-muted">For doctors and medical students. © 2026 MedWise Private Limited</p>
      </div>
    </main>
  );
}
