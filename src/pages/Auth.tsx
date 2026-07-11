import { useState, useEffect } from 'react';
import { ShieldCheck, Building, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [authType, setAuthType] = useState<'landlord' | 'tenant'>('landlord');
  const navigate = useNavigate();
  const { loginWithGoogle, loginAsDemo, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'landlord') {
        navigate('/dashboard');
      } else {
        navigate('/tenant');
      }
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setIsProcessing(true);
    try {
      await loginWithGoogle(authType);
    } catch (error) {
      console.error(error);
      // fallback to demo login if google popup fails
      await loginAsDemo(authType);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsProcessing(true);
    try {
      await loginAsDemo(authType);
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
              Welcome to TenTrust
            </h2>
            <p className="text-slate-500">
              Please sign in with Google to continue
            </p>
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

          <div className="space-y-4">
            <button 
              type="button" 
              onClick={handleGoogleSignIn}
              disabled={isProcessing}
              className={`w-full py-3.5 rounded-xl text-white font-bold flex justify-center items-center gap-2 transition-all shadow-sm disabled:opacity-75 disabled:cursor-not-allowed ${authType === 'landlord' ? 'bg-brand-600 hover:bg-brand-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
               {isProcessing ? 'Please wait...' : 'Continue with Google'} <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              onClick={handleDemoSignIn}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex justify-center items-center gap-2 transition-all border border-slate-200"
            >
               Instant Access (Demo {authType === 'landlord' ? 'Landlord' : 'Tenant'} Sign-in)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
