import { useState, useEffect } from 'react';
import { ShieldCheck, Building, User, ArrowRight, CheckCircle2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [authType, setAuthType] = useState<'landlord' | 'tenant'>((searchParams.get('type') as 'landlord' | 'tenant') || 'landlord');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithEmail, signupWithEmail, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user && !message) {
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        navigate(redirectUrl);
      } else if (user.role === 'landlord') {
        navigate('/dashboard');
      } else {
        navigate('/tenant');
      }
    }
  }, [user, navigate, searchParams, message]);

  const handleGoogleSignIn = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await loginWithGoogle(authType);
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'An error occurred with Google Sign-In');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    setMessage(null);
    try {
      if (isSignUp) {
        await signupWithEmail(email, password, firstName, lastName, authType);
        setMessage('Registration successful! A verification email has been sent. Please check your inbox (and Spam/Junk folder) to verify your account.');
        setTimeout(() => setMessage(null), 8000);
      } else {
        await loginWithEmail(email, password, authType);
      }
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Left side - Branding / Info */}
      <div className={`hidden md:flex flex-2 lg:w-5/12 p-12 text-white flex-col justify-between relative overflow-hidden transition-colors duration-500 ${authType === 'landlord' ? 'bg-brand-950' : 'bg-emerald-950'}`}>
        {/* Background Decorative patterns */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className={`absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 ${authType === 'landlord' ? 'bg-brand-500/20' : 'bg-emerald-500/20'}`}></div>

        <div className="relative z-10 w-full">
          <Link to="/" className="flex items-center gap-2 mb-16">
            <ShieldCheck className="w-8 h-8 text-white" />
            <span className="font-heading font-bold text-2xl tracking-tight text-white">TenTrust<span className={authType === 'landlord' ? "text-brand-400" : "text-emerald-400"}>.</span></span>
          </Link>

          <div>
            <div className="inline-block px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm font-semibold tracking-wide text-white mb-6 backdrop-blur-sm">
              {authType === 'landlord' ? 'For Property Owners' : 'For Renters'}
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-heading font-bold mb-6 leading-[1.1]">
              {authType === 'landlord' 
                ? 'Managing your rentals shouldn\'t be a gamble.' 
                : 'Build your trust. Access better housing.'}
            </h1>
            
            <p className="text-lg text-slate-300 mb-12 max-w-md leading-relaxed">
              {authType === 'landlord'
                ? 'Get access to strictly verified tenants, guaranteed rent collections through Casiec Financials, and an automated portfolio dashboard.'
                : 'A strong TenTrust score unlocks prime properties and flexible rent financing via Casiec. Pay how you want.'}
            </p>

            <ul className="space-y-4">
              {[
                authType === 'landlord' ? 'NIN/BVN Verified Tenant Reports' : 'Create your secure rental identity',
                authType === 'landlord' ? 'Guaranteed Payouts with Casiec' : 'Access Casiec Rent Financing',
                authType === 'landlord' ? 'Centralized Portfolio Tracking' : 'Build a portable credit score',
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-200">
                  <CheckCircle2 className={`w-5 h-5 ${authType === 'landlord' ? 'text-brand-400' : 'text-emerald-400'}`} />
                  <span className="font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-400 font-medium pb-4">
          © 2026 TenTrust Africa
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-white relative">
        <Link to="/" className="md:hidden flex items-center gap-2 mb-12 self-start">
          <ShieldCheck className="w-8 h-8 text-brand-600" />
          <span className="font-heading font-bold text-2xl tracking-tight text-slate-900">TenTrust<span className="text-brand-600">.</span></span>
        </Link>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-2">
              {isSignUp ? 'Create your account' : `Sign in to your ${authType === 'landlord' ? 'Landlord' : 'Tenant'} dashboard`}
            </h2>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setAuthType('landlord')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                authType === 'landlord' ? 'bg-white text-brand-700 shadow-sm border-slate-200' : 'text-slate-500 hover:text-brand-600 hover:bg-white/50'
              }`}
            >
              <Building className="w-4 h-4" /> Landlord
            </button>
            <button
              type="button"
              onClick={() => setAuthType('tenant')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                authType === 'tenant' ? 'bg-white text-emerald-700 shadow-sm border-slate-200' : 'text-slate-500 hover:text-emerald-600 hover:bg-white/50'
              }`}
            >
              <User className="w-4 h-4" /> Tenant
            </button>
          </div>

          {error && (
             <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
                {error}
             </div>
          )}

          {message && (
             <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-6 text-sm">
                {message}
             </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-5">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 font-semibold">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium text-slate-900 transition-all placeholder:font-normal"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 font-semibold">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium text-slate-900 transition-all placeholder:font-normal"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 font-semibold">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium text-slate-900 transition-all placeholder:font-normal"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 font-semibold">Password</label>
                {!isSignUp && (
                  <button type="button" className={`text-sm font-bold ${authType === 'landlord' ? 'text-brand-600 hover:text-brand-700' : 'text-emerald-600 hover:text-emerald-700'}`}>
                     Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium text-slate-900 transition-all placeholder:font-normal"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isProcessing}
              className={`w-full py-3.5 mt-2 rounded-xl text-white font-bold flex justify-center items-center gap-2 transition-all shadow-sm disabled:opacity-75 disabled:cursor-not-allowed ${authType === 'landlord' ? 'bg-brand-600 hover:bg-brand-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
               {isProcessing ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative flex items-center py-6 my-2">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-medium text-slate-400">Or continue with</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="space-y-4">
            <button 
              type="button" 
              onClick={handleGoogleSignIn}
              disabled={isProcessing}
              className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl flex justify-center items-center gap-3 transition-all hover:bg-slate-50 shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
               {isProcessing ? 'Please wait...' : `Sign ${isSignUp ? 'Up' : 'In'} with Google`}
            </button>
          </div>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
             {isSignUp ? (
               <>Already have an account? <button type="button" onClick={() => setIsSignUp(false)} className={`font-bold ${authType === 'landlord' ? 'text-brand-600 hover:text-brand-700' : 'text-emerald-600 hover:text-emerald-700'}`}>Sign in</button></>
             ) : (
               <>New to TenTrust? <button type="button" onClick={() => setIsSignUp(true)} className={`font-bold ${authType === 'landlord' ? 'text-brand-600 hover:text-brand-700' : 'text-emerald-600 hover:text-emerald-700'}`}>Create an account</button></>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}
