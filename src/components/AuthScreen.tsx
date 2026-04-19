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
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, AlertCircle, Loader2, Stethoscope, Mail, CheckCircle2, Key } from 'lucide-react';

export default function AuthScreen() {
  const { useState } = React;
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      // Google users are usually automatically verified, 
      // but Firebase handles that. If the user state changes in App.tsx, 
      // the verification check there will block them if not verified.
      // Most Google accounts are pre-verified.
    } catch (err: any) {
      console.error('Google Auth error:', err);
      setError('An error occurred during Google Sign In');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isForgotPassword) {
        if (!email) {
          throw new Error('Please enter your email address');
        }
        await sendPasswordResetEmail(auth, email);
        setShowResetSuccess(true);
        return;
      }

      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          await signOut(auth);
          setShowVerification(true);
        }
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        setShowVerification(true);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const authErr = err as AuthError;
      
      if (isLogin) {
        if (authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/user-not-found' || authErr.code === 'auth/wrong-password') {
          setError('Password or Email Incorrect');
        } else {
          setError(err.message || 'An error occurred during sign in');
        }
      } else {
        if (authErr.code === 'auth/email-already-in-use') {
          setError('user already exists. Sign in?');
        } else {
          setError(err.message || 'An error occurred during registration');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (showResetSuccess) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-nejm-blue/10 rounded-full mb-4 text-nejm-blue">
              <Key size={48} />
            </div>
            <h1 className="text-4xl font-serif font-bold text-nejm-blue mb-2">Reset Password</h1>
            <p className="text-nejm-text/60 italic font-serif">Link Sent Successfully</p>
          </div>

          <div className="nejm-card shadow-xl border-t-4 border-t-nejm-blue p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h2 className="text-xl font-serif font-bold mb-4">Email Sent</h2>
            <p className="text-sm text-nejm-text/70 mb-8 leading-relaxed">
              We sent you a password change link to <span className="font-bold text-nejm-blue">{email}</span>!
            </p>

            <button 
              onClick={() => {
                setShowResetSuccess(false);
                setIsForgotPassword(false);
                setIsLogin(true);
              }}
              className="nejm-btn w-full flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              Sign In
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showVerification) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-nejm-blue/10 rounded-full mb-4 text-nejm-blue">
              <Mail size={48} />
            </div>
            <h1 className="text-4xl font-serif font-bold text-nejm-blue mb-2">Check Email</h1>
            <p className="text-nejm-text/60 italic font-serif">Verification Required</p>
          </div>

          <div className="nejm-card shadow-xl border-t-4 border-t-nejm-blue p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h2 className="text-xl font-serif font-bold mb-4">Verification Sent</h2>
            <p className="text-sm text-nejm-text/70 mb-8 leading-relaxed">
              We have sent you a verification email to <span className="font-bold text-nejm-blue">{email}</span>. 
              Verify it and log in to access the system.
            </p>

            <button 
              onClick={() => {
                setShowVerification(false);
                setIsLogin(true);
                setPassword('');
                setConfirmPassword('');
              }}
              className="nejm-btn w-full flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              Return to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-nejm-blue/10 rounded-full mb-4 text-nejm-blue">
            <Stethoscope size={48} />
          </div>
          <h1 className="text-4xl font-serif font-bold text-nejm-blue mb-2">MedWise</h1>
          <p className="text-nejm-text/60 italic font-serif">Clinical Decision Support System</p>
        </div>

          <div className="nejm-card shadow-xl border-t-4 border-t-nejm-blue">
            {!isForgotPassword && (
              <div className="flex border-b border-nejm-border mb-8">
                <button 
                  onClick={() => { setIsLogin(true); setError(null); setIsForgotPassword(false); }}
                  className={`flex-1 py-4 text-xs uppercase font-bold tracking-widest transition-colors ${isLogin ? 'text-nejm-blue border-b-2 border-nejm-blue bg-nejm-gray/30' : 'text-nejm-text/40 hover:text-nejm-blue'}`}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setIsLogin(false); setError(null); setIsForgotPassword(false); }}
                  className={`flex-1 py-4 text-xs uppercase font-bold tracking-widest transition-colors ${!isLogin ? 'text-nejm-blue border-b-2 border-nejm-blue bg-nejm-gray/30' : 'text-nejm-text/40 hover:text-nejm-blue'}`}
                >
                  Register
                </button>
              </div>
            )}

            {isForgotPassword && (
              <div className="p-6 border-b border-nejm-border mb-4">
                <h2 className="text-lg font-serif font-bold text-nejm-blue">Reset Your Password</h2>
                <p className="text-xs text-nejm-text/60 mt-1 italic">Enter your clinical email address below.</p>
              </div>
            )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  key="name-field"
                >
                  <label className="nejm-label block">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="nejm-input" 
                    placeholder="Dr. John Doe"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="nejm-label block">Email</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="nejm-input" 
                placeholder="clinician@hospital.org"
              />
            </div>

            {!isForgotPassword && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="nejm-label block mb-0">Password</label>
                  {isLogin && (
                    <button 
                      type="button"
                      onClick={() => { setIsForgotPassword(true); setError(null); }}
                      className="text-[10px] text-nejm-blue hover:underline font-bold uppercase tracking-tighter"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="nejm-input" 
                  placeholder="••••••••"
                />
              </div>
            )}

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  key="confirm-password-field"
                >
                  <label className="nejm-label block">Repeat Password</label>
                  <input 
                    type="password" 
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="nejm-input" 
                    placeholder="••••••••"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-50 border border-red-200 text-nejm-red text-xs flex items-center gap-2"
              >
                <AlertCircle size={14} />
                <span>{error}</span>
                {error.includes('Sign in?') && (
                  <button 
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="ml-auto font-bold underline"
                  >
                    Sign In
                  </button>
                )}
              </motion.div>
            )}

            <button 
              disabled={loading}
              type="submit" 
              className="nejm-btn w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isForgotPassword ? (
                <>
                  <Mail size={20} />
                  Get Reset Link
                </>
              ) : isLogin ? (
                <>
                  <LogIn size={20} />
                  Access MedWise
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Create Account
                </>
              )}
            </button>

            {isForgotPassword && (
              <button 
                type="button"
                onClick={() => { setIsForgotPassword(false); setIsLogin(true); setError(null); }}
                className="w-full text-center text-[10px] uppercase font-bold text-nejm-text/40 hover:text-nejm-blue transition-colors mt-2"
              >
                Return to Sign In
              </button>
            )}
          </form>

          {!isForgotPassword && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-nejm-border"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                  <span className="bg-white px-4 text-nejm-text/30">Or Continue With</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-nejm-border bg-white text-sm font-medium text-nejm-text hover:bg-nejm-gray/20 transition-all rounded-sm shadow-sm active:scale-[0.98] disabled:opacity-50"
              >
                <img 
                  src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" 
                  alt="Google Logo" 
                  className="w-5 h-5 object-contain"
                  referrerPolicy="no-referrer"
                />
                <span className="font-sans font-semibold">Clinician Google Account</span>
              </button>
            </>
          )}

          <p className="mt-8 text-[10px] text-center text-nejm-text/40 leading-relaxed uppercase tracking-widest">
            Restricted to medical professionals. <br />
            Subject to institutional audit.
          </p>
        </div>

        <div className="mt-12 text-center opacity-30 text-[10px] uppercase tracking-tighter">
          © 2026 Medical Decision Support Systems
        </div>
      </motion.div>
    </div>
  );
}
