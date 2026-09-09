import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  UserCheck,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { UserProfile } from '../types';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  sendPasswordReset,
  fetchUserProfileFromFirestore,
  saveUserProfileToFirestore,
  buildActualUserProfile,
} from '../services/firebase';
import { storageService } from '../services/storageService';
import { autoDetectAndApplyLocation } from '../services/locationService';
import { isNative } from '../services/nativeService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onContinueAsGuest?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
  onContinueAsGuest,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCopyDomain = () => {
    const domain = unauthorizedDomain || (typeof window !== 'undefined' ? window.location.hostname : '');
    if (domain && navigator.clipboard) {
      navigator.clipboard.writeText(domain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2200);
    }
  };

  const formatFirebaseError = (error: any): string => {
    const code = error?.code || '';
    const msg = error?.message || '';

    if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
      return 'This app domain is not yet authorized for Google Sign-In in your Firebase Project (noor-5cee7). Follow the quick steps below, or use Email/Password.';
    }
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return 'Google sign-in was cancelled. Please try again.';
    }
    if (code === 'auth/popup-blocked') {
      return 'Sign-in popup was blocked by your browser. Please allow popups or try again.';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Invalid email or password. If you do not have an account yet, switch to "Sign up free" below.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An account already exists with this email address. Please switch to "Sign In".';
    }
    if (code === 'auth/weak-password') {
      return 'Password should be at least 6 characters long.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address (e.g., name@example.com).';
    }
    if (code === 'auth/network-request-failed') {
      return 'Network connection issue. Please check your internet connection.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'Email authentication is disabled or not yet enabled in Firebase Console. You can enable it in Authentication > Sign-in method, or continue in Guest Mode.';
    }
    return msg || 'Authentication could not be completed. You may continue in Guest Mode.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanName = name.trim();

    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (mode !== 'forgot' && cleanPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'forgot') {
        await sendPasswordReset(cleanEmail);
        setSuccessMessage(`Password recovery link sent to ${cleanEmail}. Please check your inbox.`);
        return;
      }

      let firebaseUser;
      if (mode === 'signup') {
        firebaseUser = await signUpWithEmail(cleanName || '', cleanEmail, cleanPassword);
      } else {
        firebaseUser = await signInWithEmail(cleanEmail, cleanPassword);
      }

      // 1. Immediately create local user profile and authenticate UI
      const initialProfile = buildActualUserProfile(firebaseUser, null, cleanName || undefined);
      storageService.setActiveUser(firebaseUser.uid);
      storageService.saveProfile(initialProfile, false);
      onSaveProfile(initialProfile);

      // 2. Immediately stop loading spinner and show success
      setLoading(false);
      setSuccessMessage(
        mode === 'signup'
          ? 'Account successfully created! Welcome to Noor.'
          : 'Welcome back! Signed in successfully.'
      );

      // 3. Immediately schedule closing modal
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 800);

      // 4. Safely perform Firestore profile sync and location detection in background (non-blocking)
      (async () => {
        try {
          const existingDoc = await fetchUserProfileFromFirestore(firebaseUser.uid).catch((e) => {
            console.warn('[AuthModal] Background Firestore fetch note:', e);
            return null;
          });

          const targetProfile = buildActualUserProfile(
            firebaseUser,
            existingDoc,
            cleanName || undefined
          );

          storageService.saveProfile(targetProfile, false);
          onSaveProfile(targetProfile);

          saveUserProfileToFirestore(firebaseUser.uid, targetProfile).catch((err) => {
            console.warn('[AuthModal] Background Firestore save note:', err);
          });

          autoDetectAndApplyLocation(targetProfile, onSaveProfile).catch((err) => {
            console.info('[AuthModal] Auto location detection notice:', err);
          });
        } catch (bgErr) {
          console.warn('[AuthModal] Post-auth background sync issue:', bgErr);
        }
      })();
    } catch (err: any) {
      setErrorMessage(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setErrorMessage(null);
    setLoading(true);

    try {
      const firebaseUser = await signInWithGoogle();

      // 1. Immediately create local user profile and authenticate UI
      const initialProfile = buildActualUserProfile(firebaseUser, null);
      storageService.setActiveUser(firebaseUser.uid);
      storageService.saveProfile(initialProfile, false);
      onSaveProfile(initialProfile);

      // 2. Immediately stop loading spinner and show success
      setLoading(false);
      setSuccessMessage('Signed in with Google! Welcome to Noor.');

      // 3. Immediately schedule closing modal
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 800);

      // 4. Safely perform Firestore profile sync and location detection in background (non-blocking)
      (async () => {
        try {
          const existingDoc = await fetchUserProfileFromFirestore(firebaseUser.uid).catch((e) => {
            console.warn('[AuthModal] Background Google Firestore fetch note:', e);
            return null;
          });

          const targetProfile = buildActualUserProfile(firebaseUser, existingDoc);

          storageService.saveProfile(targetProfile, false);
          onSaveProfile(targetProfile);

          saveUserProfileToFirestore(firebaseUser.uid, targetProfile).catch((err) => {
            console.warn('[AuthModal] Background Google Firestore save note:', err);
          });

          autoDetectAndApplyLocation(targetProfile, onSaveProfile).catch((err) => {
            console.info('[AuthModal] Auto location detection for Google user notice:', err);
          });
        } catch (bgErr) {
          console.warn('[AuthModal] Post-auth Google background sync issue:', bgErr);
        }
      })();
    } catch (err: any) {
      const isUnauthorized =
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('unauthorized-domain');

      if (isUnauthorized) {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        setUnauthorizedDomain(host);
        setErrorMessage(null);
      } else {
        setErrorMessage(formatFirebaseError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestChoice = () => {
    if (onContinueAsGuest) {
      onContinueAsGuest();
    }
    // Automatically detect and apply location on entering guest mode
    autoDetectAndApplyLocation(currentProfile, onSaveProfile).catch((err) => {
      console.info('[AuthModal] Auto location detection for guest notice:', err);
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {mode === 'login' && 'Sign in to Noor'}
              {mode === 'signup' && 'Create Free Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {mode === 'login' && 'Sync bookmarks, reading progress & daily dhikr'}
              {mode === 'signup' && 'Preserve your Quran reading & prayer streaks'}
              {mode === 'forgot' && 'Enter your email to receive recovery instructions'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {unauthorizedDomain && (
            <div className="mb-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/70 space-y-2.5 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-100">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Domain Authorization Required in Firebase</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUnauthorizedDomain(null)}
                  className="text-amber-500 hover:text-amber-700 dark:text-amber-400 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                Google Sign-In requires your app domain to be added to Authorized Domains in your Firebase Console project (<strong>noor-5cee7</strong>).
              </p>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200/80 dark:border-amber-900/60 font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                <span className="truncate mr-2 select-all font-semibold">{unauthorizedDomain}</span>
                <button
                  type="button"
                  onClick={handleCopyDomain}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-sans font-bold text-[10px] flex items-center gap-1 transition-colors"
                >
                  {copiedDomain ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Domain</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] space-y-1 text-amber-900 dark:text-amber-300">
                <p className="font-semibold text-amber-950 dark:text-amber-100">How to authorize in 30 seconds:</p>
                <ol className="list-decimal list-inside space-y-0.5 pl-0.5 text-[11px] text-amber-800 dark:text-amber-300">
                  <li>Click <strong>Copy Domain</strong> above (or add <code>run.app</code> to authorize all preview instances)</li>
                  <li>In Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</li>
                  <li>Click <strong>Add domain</strong>, paste, and save</li>
                </ol>
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-2">
                <a
                  href="https://console.firebase.google.com/project/noor-5cee7/authentication/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Firebase Settings</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setUnauthorizedDomain(null);
                    setMode('signup');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold text-[11px] hover:bg-amber-100/50"
                >
                  Use Email / Password Instead
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="w-full">
                <p className="font-semibold">Notice</p>
                <p className="mt-0.5 text-[11px] leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {successMessage}
              </p>
            </div>
          ) : (
            <>
              {/* Google Button */}
              {mode !== 'forgot' && (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full mb-3 py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-sm font-semibold flex items-center justify-center gap-2.5 transition-all shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              )}

              {mode !== 'forgot' && (
                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
                  <span className="bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-400 font-medium uppercase">
                    Or with email
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Tariq Mansoor"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Password
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {mode === 'login' && 'Sign In'}
                        {mode === 'signup' && 'Create Account'}
                        {mode === 'forgot' && 'Send Recovery Email'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Guest Mode Option */}
              <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={handleGuestChoice}
                  className="w-full py-2.5 px-3 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <UserCheck className="w-4 h-4 text-zinc-500" />
                  <span>Continue as Guest (Use Without Sign In)</span>
                </button>
                <p className="text-[10px] text-center text-zinc-400 mt-1">
                  Enjoy complete Quran, prayer times, dhikr & duas without an account.
                </p>
              </div>

              {/* Mode toggles */}
              <div className="mt-3 text-center text-xs text-zinc-500">
                {mode === 'login' && (
                  <p>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setMode('signup');
                      }}
                      className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Sign up free
                    </button>
                  </p>
                )}
                {mode === 'signup' && (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setMode('login');
                      }}
                      className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                )}
                {mode === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setMode('login');
                    }}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Back to Sign in
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
