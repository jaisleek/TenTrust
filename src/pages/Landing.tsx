import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';
import TenTrustVerifySection from '../components/TenTrustVerifySection';
import ComingSoonSection from '../components/ComingSoonSection';

export default function Landing() {
  return (
    <div className="min-h-screen font-sans bg-white text-slate-900">
      {/* Navigation - High contrast, large text for 45+ accessibility */}
      <nav className="sticky top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 p-2.5 rounded-2xl text-white shadow-md">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="font-heading font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">TenTrust<span className="text-brand-600">.</span></span>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tenant Verification & Trust</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-base font-bold text-slate-700">
            <a href="#verify" className="hover:text-brand-600 transition-colors">TenTrust Verify</a>
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">How It Works</a>
            <a href="#roadmap" className="hover:text-brand-600 transition-colors">Coming Soon</a>
            <Link to="/chat" className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              AI Assistant
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/auth" className="text-base font-bold text-slate-800 hover:text-brand-600 px-6 py-3 rounded-full border-2 border-slate-200 hover:border-brand-600 transition-all bg-white shadow-sm">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-brand-50/50 to-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 border border-brand-200 text-brand-900 text-sm font-extrabold uppercase tracking-wide shadow-sm">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              Trusted Tenant Verification in Nigeria
            </div>
            <h1 className="text-4xl sm:text-6xl font-heading font-black text-slate-900 leading-[1.1] tracking-tight">
              Know Your Tenant Before You Hand Over the Keys.
            </h1>
            <p className="text-xl sm:text-2xl text-slate-700 font-medium leading-relaxed max-w-2xl">
              Landlords pay to verify prospective tenants instantly. Get accurate BVN checks, credit reports, and a clear <strong className="text-slate-900 underline">TenTrust Score (0–100)</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a href="#verify" className="inline-flex justify-center items-center gap-3 bg-brand-600 text-white px-8 py-5 rounded-2xl font-black text-xl hover:bg-brand-700 transition-all shadow-xl hover:shadow-brand-500/25">
                Start Tenant Verification <ArrowRight className="w-6 h-6" />
              </a>
              <Link to="/auth" className="inline-flex justify-center items-center gap-3 bg-white text-slate-900 px-8 py-5 rounded-2xl font-black text-xl border-2 border-slate-300 hover:border-slate-900 transition-all shadow-sm">
                Landlord / Tenant Portal
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-brand-200 rounded-[2.55rem] transform rotate-2 scale-105 -z-10 opacity-50"></div>
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000" 
              alt="Secure property verification" 
              className="rounded-[2.5rem] shadow-2xl border-4 border-white w-full object-cover aspect-[4/3]"
            />
            <div className="absolute -bottom-8 -left-6 bg-white p-6 rounded-3xl shadow-2xl border-2 border-slate-100 flex items-center gap-4">
              <div className="bg-emerald-100 p-4 rounded-2xl">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold uppercase">Verification Status</p>
                <p className="text-lg font-black text-emerald-700">100% Secure & Verified</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TenTrust Verify Core Section */}
      <TenTrustVerifySection />

      {/* How It Works for Landlords 45+ */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 mb-4">
              How TenTrust Verify Works
            </h2>
            <p className="text-xl text-slate-600">
              Three simple steps designed for absolute clarity and peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border-2 border-slate-200 flex flex-col justify-between">
              <div>
                <span className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-black text-xl flex items-center justify-center mb-6 shadow-md">1</span>
                <h3 className="text-2xl font-heading font-bold text-slate-900 mb-3">Choose Package</h3>
                <p className="text-slate-700 text-lg leading-relaxed">
                  Select from our Basic (₦3k), Standard (₦7k), Premium (₦12k) or Founding Member package based on your screening depth.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-200 text-sm font-bold text-brand-600">
                Instant Processing
              </div>
            </div>

            <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border-2 border-slate-200 flex flex-col justify-between">
              <div>
                <span className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-black text-xl flex items-center justify-center mb-6 shadow-md">2</span>
                <h3 className="text-2xl font-heading font-bold text-slate-900 mb-3">Enter Tenant Details</h3>
                <p className="text-slate-700 text-lg leading-relaxed">
                  Provide the prospective tenant's full name, BVN/NIN, and phone number securely into our verification gateway.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-200 text-sm font-bold text-brand-600">
                NDPR Compliant
              </div>
            </div>

            <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border-2 border-slate-200 flex flex-col justify-between">
              <div>
                <span className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center mb-6 shadow-md">3</span>
                <h3 className="text-2xl font-heading font-bold text-slate-900 mb-3">Get Score & Report</h3>
                <p className="text-slate-700 text-lg leading-relaxed">
                  Receive an instant Tentrust Score (0–100) and actionable recommendation (Excellent, Good, Fair, Poor, or High Risk).
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-200 text-sm font-bold text-emerald-600">
                Make Confident Decisions
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Roadmap Section */}
      <div id="roadmap">
        <ComingSoonSection />
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-brand-600 p-2.5 rounded-2xl text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="font-heading font-black text-2xl text-white">TenTrust<span className="text-brand-500">.</span></span>
            </div>
            <p className="text-slate-400 text-base max-w-md leading-relaxed">
              Empowering landlords across Africa with verified tenant intelligence, secure credit reports, and reliable rent management solutions.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3 text-slate-400 text-base">
              <li><a href="#verify" className="hover:text-white transition-colors">TenTrust Verify</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#roadmap" className="hover:text-white transition-colors">Coming Soon</a></li>
              <li><Link to="/auth" className="hover:text-white transition-colors">Sign In / Register</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white text-lg mb-4">Support & Contact</h4>
            <ul className="space-y-3 text-slate-400 text-base">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-400" /> +234 800 123 4567</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-brand-400" /> support@tentrust.ng</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-400" /> Victoria Island, Lagos, Nigeria</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} TenTrust Technologies Ltd. All rights reserved. Powered by Casiec Financials partnership.
        </div>
      </footer>
    </div>
  );
}
