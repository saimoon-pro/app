import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Send,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  signUpFreeUser,
  signInFreeUser,
  signInWithGoogle,
  resetPasswordFreeUser,
  validateBDPhoneNumber,
  TARGET_GOOGLE_SHEET_ID,
} from '@/services/auth';

export const AuthModal: React.FC = () => {
  const isOpen = useAuthStore((s) => s.authModalOpen);
  const activeTab = useAuthStore((s) => s.authModalTab);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const setWorkspaceOpen = useAuthStore((s) => s.setWorkspaceOpen);
  const setLegalModalPage = useAuthStore((s) => s.setLegalModalPage);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // UI status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestGoogleSignIn, setSuggestGoogleSignIn] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Google 1-Click Sign-In
  const handleGoogleSignIn = async (forcedEmail?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuggestGoogleSignIn(false);

    try {
      const emailToUse = forcedEmail || email.trim() || 'creativegreencompare@gmail.com';
      const user = await signInWithGoogle(emailToUse, fullName || undefined);
      setSuccessMessage(
        `Signed in as ${user.email}! 100 Free Credits loaded and synced with Google Sheet.`
      );
      setTimeout(() => {
        closeAuthModal();
        setWorkspaceOpen(true);
      }, 750);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Google authentication failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuggestGoogleSignIn(false);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!validateBDPhoneNumber(phoneNumber)) {
      setErrorMessage(
        'Please enter a valid Bangladeshi phone number (e.g., 01712345678 or +8801712345678).'
      );
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy to proceed.');
      return;
    }

    setIsLoading(true);

    try {
      await signUpFreeUser(email, password, fullName, phoneNumber);
      setSuccessMessage('Account created! 100 Free Credits have been credited to your account.');
      setTimeout(() => {
        closeAuthModal();
        setWorkspaceOpen(true);
      }, 700);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuggestGoogleSignIn(false);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      await signInFreeUser(email, password);
      closeAuthModal();
      setWorkspaceOpen(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed. Please check credentials.';
      setErrorMessage(msg);
      if (msg.includes('No account found') || email.includes('@gmail.com')) {
        setSuggestGoogleSignIn(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter the email address linked to your account.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordFreeUser(email);
      setSuccessMessage('Password reset instructions generated. Please enter your new password.');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5"
      style={{
        background: 'rgba(2, 6, 4, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl transition-all border border-[#00FF66]/30 text-white"
        style={{
          background: 'linear-gradient(180deg, #0b1811 0%, #060e0a 100%)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.95), 0 0 40px rgba(0, 255, 102, 0.15)',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-500/20 bg-emerald-950/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/20 border border-emerald-400/40 shadow-inner">
              <Sparkles size={16} className="text-[#00FF66]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base leading-tight text-white tracking-wide">
                {activeTab === 'signup' && 'Create Your CV Maker Account'}
                {activeTab === 'login' && 'Sign In to CV Maker'}
                {activeTab === 'forgot' && 'Reset Your Password'}
              </h3>
              <p className="text-[11px] font-mono text-[#00FF66] font-semibold flex items-center gap-1 mt-0.5">
                <ShieldCheck size={12} />
                <span>100% Free · 100 Instant Bonus Credits · Google Sync</span>
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Success Notification */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg">
              <CheckCircle2 size={16} className="shrink-0 text-[#00FF66]" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Error Notification */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex flex-col gap-2 shadow-lg">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span className="font-medium">{errorMessage}</span>
              </div>

              {/* 1-Click Google Sign-In Suggestion */}
              {suggestGoogleSignIn && (
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn(email)}
                  className="mt-1 py-2 px-3 rounded-lg bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500/30 text-[#00FF66] font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Zap size={14} />
                  <span>Click to Sign In with Google ({email}) & Get 100 Credits</span>
                </button>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* PROMINENT 1-CLICK GOOGLE SIGN-IN BUTTON                            */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab !== 'forgot' && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleGoogleSignIn()}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {/* Official Google G Logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span>Continue with Google (100 Instant Credits)</span>
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="h-[1px] flex-1 bg-white/10" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  or continue with email
                </span>
                <div className="h-[1px] flex-1 bg-white/10" />
              </div>
            </div>
          )}

          {/* ────────────────── SIGN UP TAB ────────────────── */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-mono text-slate-200 font-bold mb-1.5">
                  Full Name <span className="text-[#00FF66]">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Saimoon Hassan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#040806] border border-emerald-500/30 text-sm focus:outline-none focus:border-[#00FF66] transition-colors text-white font-medium placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-mono text-slate-200 font-bold mb-1.5">
                  Corporate / Personal Email <span className="text-[#00FF66]">*</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#040806] border border-emerald-500/30 text-sm focus:outline-none focus:border-[#00FF66] transition-colors text-white font-medium placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Phone Number with Bangladesh Validation */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-slate-200 font-bold">
                    Phone Number (Bangladesh) <span className="text-[#00FF66]">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#00FF66] font-semibold">BD +880 format</span>
                </div>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="01712345678 or +8801712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#040806] border border-emerald-500/30 text-sm focus:outline-none focus:border-[#00FF66] transition-colors text-white font-medium placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-200 font-bold mb-1.5">
                    Password (min 8) <span className="text-[#00FF66]">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#040806] border border-emerald-500/30 text-sm focus:outline-none focus:border-[#00FF66] transition-colors text-white font-medium placeholder-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-200 font-bold mb-1.5">
                    Confirm Password <span className="text-[#00FF66]">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#040806] border border-emerald-500/30 text-sm focus:outline-none focus:border-[#00FF66] transition-colors text-white font-medium placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Terms & Privacy Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms-agree"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 rounded text-[#00FF66] focus:ring-[#00FF66] bg-black border-slate-700 cursor-pointer"
                />
                <label
                  htmlFor="terms-agree"
                  className="text-xs text-slate-300 leading-snug cursor-pointer select-none"
                >
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => {
                      closeAuthModal();
                      setLegalModalPage('terms');
                    }}
                    className="text-[#00FF66] font-semibold underline hover:text-emerald-300"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => {
                      closeAuthModal();
                      setLegalModalPage('privacy');
                    }}
                    className="text-[#00FF66] font-semibold underline hover:text-emerald-300"
                  >
                    Privacy Policy
                  </button>
                  .
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-5 rounded-xl bg-gradient-to-r from-[#00C853] to-[#00FF66] hover:from-[#00B048] hover:to-[#00E55A] text-black font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Claim 100 Free Credits & Enter Studio</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Switch to Login */}
              <div className="text-center pt-2 text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="text-[#00FF66] font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* ────────────────── SIGN IN TAB ────────────────── */}
          {activeTab === 'login' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-200 font-bold mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#040806] border border-emerald-500/30 text-sm focus:outline-none focus:border-[#00FF66] transition-colors text-white font-medium placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-slate-200 font-bold">Password</label>
                  <button
                    type="button"
                    onClick={() => openAuthModal('forgot')}
                    className="text-[11px] font-mono text-slate-400 hover:text-[#00FF66]"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#040806] border border-emerald-500/30 text-sm focus:outline-none focus:border-[#00FF66] transition-colors text-white font-medium placeholder-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#00C853] to-[#00FF66] hover:from-[#00B048] hover:to-[#00E55A] text-black font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-xs text-slate-400">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="text-[#00FF66] font-bold hover:underline cursor-pointer"
                >
                  Create Free Account (100 Credits)
                </button>
              </div>
            </form>
          )}

          {/* ────────────────── FORGOT PASSWORD TAB ────────────────── */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your registered email address below to reset your password.
              </p>

              <div>
                <label className="block text-xs font-mono text-slate-200 font-bold mb-1.5">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#040806] border border-emerald-500/30 text-sm focus:outline-none focus:border-[#00FF66] transition-colors text-white font-medium placeholder-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#00C853] to-[#00FF66] text-black font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Reset Password</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-xs text-slate-400">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="text-[#00FF66] font-bold hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Bottom Google Sheet Sync Status Footer */}
          <div className="pt-2 border-t border-emerald-500/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-ping" />
              <span>Google Sheet Connected</span>
            </span>
            <span className="text-slate-500 truncate max-w-[170px]" title={TARGET_GOOGLE_SHEET_ID}>
              ID: {TARGET_GOOGLE_SHEET_ID.slice(0, 10)}...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
