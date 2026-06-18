import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Building, Users, ArrowRight, CheckCircle2, Mail, Phone, MapPin, Twitter, Linkedin, Instagram, MessageSquare, Star, Sun, Moon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { mockProperties } from '../data';

export default function Landing() {
  const [faqQuestion, setFaqQuestion] = useState<string>('');
  const [faqAnswer, setFaqAnswer] = useState<string>('');
  const [isFaqLoading, setIsFaqLoading] = useState<boolean>(false);

  const askFaq = async (question: string) => {
    setFaqQuestion(question);
    setFaqAnswer('');
    setIsFaqLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: question, 
          context: "You are the TenTrust FAQ Assistant. Keep answers brief (under 3 sentences), very helpful, and strictly related to real estate, rentals, Casiec Financials, and TenTrust."
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error');
      setFaqAnswer(data.reply);
    } catch (error: any) {
      setFaqAnswer("I'm sorry, I couldn't fetch an answer right now. Please try again or contact support.");
    } finally {
      setIsFaqLoading(false);
    }
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Navigation */}
      <nav className="fixed top-4 inset-x-0 mx-auto w-[calc(100%-2rem)] max-w-6xl z-50 transition-all duration-500">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-full px-4 py-3 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-2 pl-2">
            <ShieldCheck className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            <span className="font-heading font-bold text-xl text-slate-900 dark:text-white tracking-tight">TenTrust<span className="text-brand-600 dark:text-brand-400">.</span></span>
          </div>
          <div className="hidden lg:flex items-center gap-1 p-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-full border border-slate-200/50 dark:border-slate-700/50 transition-colors">
            <Link to="/chat" className="relative px-5 py-2 group text-sm font-semibold text-emerald-600 dark:text-emerald-400 transition-colors flex items-center gap-1.5 overflow-hidden rounded-full">
              <span className="relative z-10 flex items-center gap-1.5 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                Chat AI
              </span>
              <span className="absolute inset-0 bg-emerald-50/80 dark:bg-emerald-950/80 rounded-full translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.2,1,0.2,1)]"></span>
            </Link>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({behavior: 'smooth'}) }} className="relative px-5 py-2 group text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors overflow-hidden rounded-full">
              <span className="relative z-10 group-hover:text-white transition-colors">How it Works</span>
              <span className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-full translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.2,1,0.2,1)] shadow-sm"></span>
            </a>
            <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({behavior: 'smooth'}) }} className="relative px-5 py-2 group text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors overflow-hidden rounded-full">
              <span className="relative z-10 group-hover:text-white transition-colors">For Landlords</span>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.2,1,0.2,1)] shadow-sm"></span>
            </a>
            <a href="#tenants" onClick={(e) => { e.preventDefault(); document.getElementById('tenants')?.scrollIntoView({behavior: 'smooth'}) }} className="relative px-5 py-2 group text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors overflow-hidden rounded-full">
              <span className="relative z-10 group-hover:text-white transition-colors">For Tenants</span>
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-500 to-green-500 rounded-full translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.2,1,0.2,1)] shadow-sm"></span>
            </a>
            <Link to="/listings" className="relative px-5 py-2 group text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors overflow-hidden rounded-full">
              <span className="relative z-10 group-hover:text-white transition-colors">Browse</span>
              <span className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.2,1,0.2,1)] shadow-sm"></span>
            </Link>
          </div>
          <div className="flex items-center gap-3 pr-1">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 mr-1 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Toggle dark mode">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/auth?type=landlord" className="hidden lg:flex relative overflow-hidden group px-6 py-2.5 rounded-full text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-brand-200 dark:hover:border-brand-500 hover:shadow-brand-100 dark:hover:shadow-brand-900/20 transition-all">
              <span className="relative z-10 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">Landlord Login</span>
              <span className="absolute inset-0 w-full h-full bg-brand-50 dark:bg-brand-900/30 origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-[cubic-bezier(0.2,1,0.2,1)]"></span>
            </Link>
            <Link to="/auth?type=tenant" className="hidden lg:flex relative overflow-hidden group px-6 py-2.5 rounded-full text-sm font-bold text-white bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 shadow-md hover:shadow-emerald-500/20 transition-all">
              <span className="relative z-10 flex items-center gap-2">Tenant Login <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
              <span className="absolute inset-0 w-full h-full bg-emerald-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.2,1,0.2,1)]"></span>
            </Link>
            
            {/* Mobile menu button */}
            <button className="lg:hidden p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold tracking-wide uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              Solving the African Real Estate Gap
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              Verified Tenants. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400">Guaranteed Rent.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              TenTrust uses verifiable credentials and partners with <a href="https://casiecfinancials.com/" target="_blank" rel="noopener noreferrer" className="font-bold underline text-slate-900 dark:text-white">Casiec Financials</a> to protect landlords while making rent accessible for verified tenants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth" className="inline-flex justify-center items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-full font-bold hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-500/25">
                I'm a Landlord <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/apply/pre-approval" className="inline-flex justify-center items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-full font-bold border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all shadow-sm">
                Verify Tenant
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-100 to-indigo-50 rounded-[2rem] transform rotate-3 scale-105 -z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000" 
              alt="Modern property" 
              className="rounded-[2rem] shadow-2xl border border-white/50 w-full object-cover aspect-square md:aspect-[4/3]"
            />
            {/* Floating Trust Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce" style={{animationDuration: '3s'}}>
              <div className="bg-emerald-100 p-3 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Tenant Status</p>
                <p className="text-sm font-bold text-emerald-600">100% KYC Verified</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Developed for African Markets</p>
            <p className="font-heading font-semibold text-xl text-slate-900">Partnering with CDAs, Govt & Diaspora</p>
          </div>
          <div className="flex gap-12 opacity-60 grayscale flex-wrap justify-center">
            {/* Mock logos text */}
            <h3 className="text-2xl font-black font-heading tracking-tighter">CASIEC FINANCIALS</h3>
            <h3 className="text-2xl font-black font-heading tracking-tighter">LAGOS STATE</h3>
            <h3 className="text-2xl font-black font-heading tracking-tighter">PROP-TECH NG</h3>
          </div>
        </div>
      </section>

      {/* Value Prop */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">Building an Ecosystem of Trust</h2>
            <p className="text-lg text-slate-600">We don't just list properties. We fundamentally solve the verification and financial gap holding back the rental market.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="bg-brand-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-brand-600" />
              </div>
              <h3 className="font-heading font-bold text-xl text-slate-900 mb-3">Strong KYC & Identity</h3>
              <p className="text-slate-600 leading-relaxed">
                We integrate with NIN and BVN systems to verify identity, employment history, and past rental behaviors before a tenant ever steps foot in your property.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-heading font-bold text-xl text-slate-900 mb-3">The TenTrust Score</h3>
              <p className="text-slate-600 leading-relaxed">
                A proprietary credit reporting system. Good tenants build their score over time through reliable payments, unlocking better housing and financial opportunities.
              </p>
            </div>

            <div className="bg-brand-950 p-8 rounded-3xl shadow-xl border border-brand-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-800 rounded-bl-full opacity-50"></div>
              <div className="bg-brand-800/50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10 backdrop-blur-sm">
                <Building className="w-7 h-7 text-brand-300" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white mb-3 relative z-10">Casiec Financials Partnership</h3>
              <p className="text-brand-100 leading-relaxed relative z-10">
                Landlords get paid upfront reliably. Tenants gain flexible, financed payment options. It's affordable, scalable, and completely unique to the market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Landlords */}
      <section id="features" className="py-24 px-6 bg-white outline outline-1 outline-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 w-full order-2 md:order-1">
            <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800" alt="Landlord checking dashboard" className="rounded-3xl shadow-xl border border-slate-100" />
          </div>
          <div className="flex-1 order-1 md:order-2">
            <div className="bg-brand-50 w-12 h-12 rounded-full flex items-center justify-center mb-6">
               <Building className="w-6 h-6 text-brand-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-6">Designed Specifically for African Landlords</h2>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">List Rent, Shortlets & Sales easily</h4>
                  <p className="text-slate-600">A clean, intuitive dashboard anyone can use to securely list their portfolio without technical skills.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">No more guessing tenant reliability</h4>
                  <p className="text-slate-600">Review standardized KYC reports and TenTrust credit scores directly in the app before accepting a tenant.</p>
                </div>
              </li>
            </ul>
            <Link to="/auth" className="mt-8 inline-flex justify-center items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-md hover:shadow-brand-500/25">
              Join as a Landlord
            </Link>
          </div>
        </div>
      </section>

      {/* For Tenants */}
      <section id="tenants" className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=2000')] opacity-5 bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
          <div className="flex-1">
            <div className="bg-white/10 w-12 h-12 rounded-full flex items-center justify-center mb-6 border border-white/20">
               <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">A New Era for Young Tenants</h2>
            <p className="text-brand-100 text-lg mb-8 leading-relaxed">
              Paying upfront rent is hard. By keeping a good TenTrust score and applying through Casiec Financials, you get access to flexible, structured rent payment options. Build your profile, build your trust.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
               <p className="font-bold text-xl mb-2 flex items-center gap-2"><img src="https://casiecfinancials.com/favicon.ico" className="w-5 h-5 rounded-sm bg-white" alt="" onError={(e) => (e.currentTarget.style.display='none')} /> Powered by Casiec</p>
               <p className="text-slate-300 text-sm">We provide the verifiable credit scores that Casiec Financials uses to finance and reward your reliable payments.</p>
            </div>
            <Link to="/auth" className="inline-flex justify-center items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-emerald-500 hover:text-white transition-all shadow-lg">
              Join as a Tenant
            </Link>
          </div>
          <div className="flex-1 w-full">
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl skew-y-3 transform hover:skew-y-0 transition-transform duration-500">
               <div className="flex justify-between items-center mb-6">
                 <div>
                   <p className="text-slate-400 text-sm">Your TenTrust Score</p>
                   <p className="text-5xl font-heading font-bold font-mono">840</p>
                 </div>
                 <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center">
                   <ShieldCheck className="w-8 h-8 text-emerald-500" />
                 </div>
               </div>
               <div className="h-2 w-full bg-slate-700 rounded-full mb-2"><div className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full w-[84%]"></div></div>
               <p className="text-emerald-400 text-sm font-semibold mb-8">Top 5% · Excellent Status</p>
               
               <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                 <p className="text-white font-bold mb-1">Casiec Rent Approval limit</p>
                 <p className="text-2xl font-mono text-brand-400">₦2,500,000</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-brand-600 font-bold mb-3 uppercase tracking-wider text-sm"><MapPin className="w-4 h-4" /> Lagos, Nigeria</div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Featured Properties in Lagos</h2>
            </div>
            <Link to="/listings" className="text-brand-600 font-bold hover:text-brand-700 flex items-center gap-2 transition-colors">
              View All Listings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockProperties.slice(0, 3).map(property => (
              <div key={property.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
                  <img 
                    src={property.coverImage} 
                    alt={property.title}
                    className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      {property.type}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${property.status === 'Vacant' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}>
                      {property.status}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-heading font-bold text-lg text-slate-900 mb-1 line-clamp-1 group-hover:text-brand-600 transition-colors">{property.title}</h3>
                  <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{property.location}</span>
                  </div>
                  <div className="flex items-end justify-between pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-0.5">Rent / Year</p>
                      <p className="font-mono text-xl font-bold text-brand-600 line-clamp-1">
                        ₦{property.rentAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 shrink-0">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">Success Stories</h2>
            <p className="text-slate-600">
              Hear from verified tenants who found their perfect home and landlords who secured reliable occupants through TenTrust.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full hover:-translate-y-1 transition-transform">
              <div className="flex text-amber-400 mb-6">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-slate-700 italic mb-6 flex-grow">
                "The verified tenant badge made all the difference. I was struggling to stand out to landlords in Lagos, but once I completed my TenTrust profile, I got approved for an apartment in days."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center font-bold text-brand-700">
                  OA
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Oluwaseun A.</h4>
                  <p className="text-xs text-slate-500">Verified Tenant, Lagos</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full hover:-translate-y-1 transition-transform">
              <div className="flex text-amber-400 mb-6">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-slate-700 italic mb-6 flex-grow">
                "As a landlord, I used to worry about late payments and fraudulent tenants. Casiec Financials integration guarantees my rent, and the comprehensive KYC gives me total peace of mind."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700">
                  MC
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Michael C.</h4>
                  <p className="text-xs text-slate-500">Property Owner, Abuja</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full hover:-translate-y-1 transition-transform">
              <div className="flex text-amber-400 mb-6">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-slate-700 italic mb-6 flex-grow">
                "The process was completely frictionless. No more tedious paper forms. I filled out my application on my phone, and everything was verified instantly. TenTrust is the future."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
                  CN
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Chioma N.</h4>
                  <p className="text-xs text-slate-500">Verified Tenant, Port Harcourt</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section with AI */}
      <section className="py-24 px-6 bg-white border-t border-slate-200" id="faq">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 text-slate-900">
          <div className="md:w-1/3">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600 mb-8">
              Have questions? Our AI assistant is trained on everything about TenTrust, Casiec Financials, and our verified rental process. Select a common question or visit our full chat to ask anything.
            </p>
            <div className="space-y-3">
              {[
                "What is a TenTrust score?",
                "How does Casiec Financials help me pay rent?",
                "Is the BVN and NIN verification secure?",
                "How do I list my property as a landlord?"
              ].map((q, idx) => (
                <button 
                  key={idx}
                  onClick={() => askFaq(q)}
                  className={`w-full text-left px-5 py-4 rounded-xl border font-bold transition-all ${faqQuestion === q ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50 text-slate-700'}`}
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="mt-8">
               <Link to="/chat" className="text-brand-600 font-bold hover:text-brand-700 flex items-center gap-2 transition-colors">
                  Ask specific questions in AI Chat <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
          </div>
          <div className="md:w-2/3">
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 h-full min-h-[400px] flex flex-col relative overflow-hidden">
               <div className="flex items-center gap-3 mb-6 bg-white px-4 py-3 rounded-2xl w-max shadow-sm border border-slate-100 relative z-10">
                 <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                   <MessageSquare className="w-5 h-5 text-brand-600" />
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">AI Assistant</p>
                   <p className="font-bold text-slate-900">Instant Answers</p>
                 </div>
               </div>
               
               <div className="flex-1 relative z-10 flex flex-col justify-end min-h-[300px]">
                 {faqQuestion ? (
                   <div className="space-y-6 flex flex-col justify-end">
                      <div className="bg-brand-600 text-white p-5 rounded-2xl rounded-tr-md max-w-[85%] ml-auto font-medium shadow-sm">
                        {faqQuestion}
                      </div>
                      {isFaqLoading ? (
                         <div className="bg-white p-5 rounded-2xl rounded-tl-md max-w-[85%] border border-slate-200 shadow-sm flex gap-2 w-max">
                            <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                         </div>
                      ) : (
                         <div className="bg-white p-5 rounded-2xl rounded-tl-md max-w-[85%] border border-slate-200 shadow-sm prose prose-sm prose-slate">
                            <ReactMarkdown>{faqAnswer}</ReactMarkdown>
                         </div>
                      )}
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 m-auto">
                     <ShieldCheck className="w-16 h-16 mb-4" />
                     <p className="font-bold text-lg text-center">Select a question to get an instant answer.</p>
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us */}
      <section id="contact" className="py-24 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-heading font-bold text-slate-900 mb-4">Get in Touch</h2>
          <p className="text-slate-600 mb-12 max-w-2xl mx-auto">Have questions about our verification process or how Casiec financing works? Our team is available to help you navigate the future of real estate.</p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <Mail className="w-8 h-8 text-brand-600 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Email Us</h3>
              <p className="text-slate-600 font-medium hover:text-brand-600 transition-colors"><a href="mailto:hello@tentrust.africa">hello@tentrust.africa</a></p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <Phone className="w-8 h-8 text-brand-600 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Call Us</h3>
              <p className="text-slate-600 font-medium hover:text-brand-600 transition-colors"><a href="tel:+2348001234567">+234 (0) 800 123 4567</a></p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <MapPin className="w-8 h-8 text-brand-600 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Visit Us</h3>
              <p className="text-slate-600 font-medium">Landmark Towers, Victoria Island, Lagos</p>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <a href="#" aria-label="Twitter" className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-colors shadow-sm"><Twitter className="w-5 h-5" /></a>
            <a href="#" aria-label="LinkedIn" className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-colors shadow-sm"><Linkedin className="w-5 h-5" /></a>
            <a href="#" aria-label="Instagram" className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-colors shadow-sm"><Instagram className="w-5 h-5" /></a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-600" />
            <span className="font-heading font-bold text-xl text-slate-900 tracking-tight">TenTrust.</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 TenTrust Africa. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-brand-600">Privacy Policy</a>
            <a href="#" className="hover:text-brand-600">Terms of Service</a>
            <a href="#" className="hover:text-brand-600">Contact Sales</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
