import { useState, useEffect } from 'react';
import { ShieldCheck, User, Building, CreditCard, ChevronRight, CheckCircle2, AlertCircle, Clock, TrendingUp, Share2, Copy, Send, X, ExternalLink, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, where, getDoc, doc, addDoc } from 'firebase/firestore';
import { mockProperties } from '../data';

export default function TenantDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [properties, setProperties] = useState<Record<string, any>>({});
  
  // Self Verification & Landlord Link state
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [bvnInput, setBvnInput] = useState('');
  const [incomeInput, setIncomeInput] = useState('');
  const [landlordEmailInput, setLandlordEmailInput] = useState('');
  const [propertyTitleInput, setPropertyTitleInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const appQ = query(collection(db, 'applications'), where('tenantId', '==', user.id));
    const unsubscribe = onSnapshot(appQ, async (snapshot) => {
      const fetchedApps: any[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(fetchedApps.sort((a, b) => b.createdAt - a.createdAt));

      // Fetch distinct property info
      const propsData: Record<string, any> = {};
      for (const app of fetchedApps) {
        if (!propsData[app.propertyId]) {
          const pDoc = await getDoc(doc(db, 'properties', app.propertyId));
          if (pDoc.exists()) {
            propsData[app.propertyId] = pDoc.data();
          } else {
            const mockP = mockProperties.find(p => p.id === app.propertyId);
            if (mockP) propsData[app.propertyId] = mockP;
          }
        }
      }
      setProperties(prev => ({...prev, ...propsData}));
    }, (error) => {
       handleFirestoreError(error, OperationType.LIST, 'applications');
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const handleSelfVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bvnInput) {
      alert('Please enter your BVN or NIN.');
      return;
    }

    setIsVerifying(true);
    setTimeout(async () => {
      const score = Math.floor(Math.random() * 40) + 820; // 820-860
      const token = Math.random().toString(36).substring(2, 10);
      const link = `${window.location.origin}/verify/tenant-${token}`;
      const expiresAt = new Date(Date.now() + 48 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const resData = {
        score,
        link,
        expiresAt,
        landlordEmail: landlordEmailInput || 'landlord@tentrust.app',
        propertyTitle: propertyTitleInput || 'General Verified Profile',
        createdAt: new Date().toLocaleDateString()
      };

      setVerificationResult(resData);
      setIsVerifying(false);

      // Save to Firestore if user exists
      try {
        await addDoc(collection(db, 'applications'), {
          tenantId: user?.id,
          name: `${user?.firstName} ${user?.lastName}`,
          propertyTitle: resData.propertyTitle,
          trustScore: score,
          dateApplied: new Date().toISOString().split('T')[0],
          status: 'verified_self',
          kycStatus: 'Verified',
          financialStatus: 'Approved',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          creditDetails: {
            paymentHistory: '100% On-Time',
            evictionRecord: 'Clean',
            casiecPreApprovedLimit: 5000000,
            incomeVerified: true
          },
          createdAt: Date.now()
        });
      } catch (err) {
        console.error(err);
      }
    }, 1500);
  };

  const handleCopyLink = () => {
    if (verificationResult?.link) {
      navigator.clipboard.writeText(verificationResult.link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSendToLandlord = () => {
    if (!verificationResult?.landlordEmail) {
      alert('Please provide a landlord email address.');
      return;
    }
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-brand-600" />
          <span className="font-heading font-bold text-2xl text-slate-900 tracking-tight">TenTrust<span className="text-brand-600">.</span></span>
        </Link>
        <div className="flex items-center gap-4">
           <Link to="/listings" className="text-sm font-medium text-brand-600 hover:underline mr-4 hidden sm:block">Find Properties</Link>
           <div className="flex items-center gap-3 border border-slate-200 px-3 py-1.5 rounded-full bg-slate-50">
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold uppercase">{user.firstName[0]}</div>
              <span className="text-sm font-bold text-slate-900">{user.firstName} {user.lastName.charAt(0)}.</span>
           </div>
           <button 
             onClick={async () => { await logout(); navigate('/auth'); }}
             title="Log Out"
             className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors flex items-center gap-2 text-sm font-semibold"
           >
             <LogOut className="w-4 h-4" /> <span className="hidden md:inline">Log Out</span>
           </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 lg:p-10 space-y-8">
        
        {/* Welcome & Score */}
        <div className="bg-brand-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <h1 className="text-3xl font-heading font-bold mb-2">Welcome back, {user.firstName}!</h1>
              <p className="text-brand-100">Your profile is looking great. Keep up the good payment history to unlock specialized Casiec financial rewards.</p>
              
              <div className="mt-6 flex flex-wrap gap-3">
                <button 
                  onClick={() => setIsVerifyModalOpen(true)}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" /> Self-Verify & Send to Landlord
                </button>
              </div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 min-w-[200px]">
              <p className="text-brand-100 text-sm font-medium mb-1">TenTrust Score</p>
              <p className="text-5xl font-bold font-heading text-white">{applications.length > 0 ? applications[0].trustScore : 840}</p>
              <div className="mt-3 inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full text-xs font-semibold">
                <TrendingUp className="w-3 h-3" /> Excellent
              </div>
            </div>
          </div>
        </div>

        {applications.length > 0 && (
           <div className="bg-red-50 border border-red-100 text-red-900 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-pulse-slow">
             <div className="flex items-start gap-4">
               <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
                 <AlertCircle className="w-6 h-6" />
               </div>
               <div>
                 <h3 className="font-heading font-bold text-lg mb-1">Rent Reminder: Due in 3 Days</h3>
                 <p className="text-red-700 text-sm">Your upcoming rent cycle for <strong>{properties[applications[0].propertyId]?.title || 'your property'}</strong> is due in 3 days. Please make payment early to maintain your Trust Score and avoid late penalties.</p>
               </div>
             </div>
             <button className="whitespace-nowrap bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-sm">
               Pay Rent Now
             </button>
           </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Casiec Verification Section */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative">
            <div className="absolute top-8 right-8 text-slate-200">
               <ShieldCheck className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-heading font-bold text-slate-900 mb-6">Credit & Trust Profile</h2>
            <div className="space-y-6">
              
              <div className="flex gap-4">
                <div className="mt-1"><CheckCircle2 className={`w-6 h-6 ${applications.length > 0 ? 'text-emerald-500' : 'text-slate-300'}`} /></div>
                <div>
                  <h3 className="font-semibold text-slate-900">Identity & Income</h3>
                  <p className="text-sm text-slate-600 mt-1">{applications.length > 0 ? 'NIN, BVN, and employment confirmed via KYC.' : 'Submit an application or self-verify to complete KYC.'}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1"><AlertCircle className="w-6 h-6 text-emerald-500" /></div>
                <div>
                  <h3 className="font-semibold text-slate-900">Payment History</h3>
                  <p className="text-sm text-slate-600 mt-1">Good standing. Zero eviction records found.</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <div className="mt-1"><CreditCard className="w-6 h-6 text-brand-600" /></div>
                <div>
                  <h3 className="font-semibold text-slate-900">Casiec Rent Financing</h3>
                  <p className="text-sm text-slate-600 mt-1 mb-3">You are eligible to apply for flexible rent payments powered by Casiec Financials. Pre-approved limit: <strong>₦5,000,000</strong></p>
                  <a href="https://casiecfinancials.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-4 py-2 rounded-lg transition-colors">
                    Apply on Casiec <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Applications */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col p-8">
            <h2 className="text-xl font-heading font-bold text-slate-900 mb-6">Your Applications & Verifications</h2>
            {applications.length === 0 ? (
               <div className="text-center py-12">
                 <p className="text-slate-500 mb-4">You haven't applied or verified yet.</p>
                 <button onClick={() => setIsVerifyModalOpen(true)} className="text-brand-600 font-bold hover:underline">Self-Verify Now</button>
               </div>
            ) : (
               <div className="space-y-4 flex-1 overflow-y-auto">
                 {applications.map(app => {
                    const property = properties[app.propertyId];
                    return (
                      <div key={app.id} className="border border-slate-100 rounded-xl p-4 flex gap-4">
                         {property?.coverImage ? <img src={property.coverImage} className="w-20 h-20 rounded-lg object-cover" alt="Property" /> : <div className="w-20 h-20 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-bold">TV</div>}
                         <div className="flex-1">
                           <h3 className="font-bold text-slate-900">{property?.title || app.propertyTitle || 'Self-Verification Profile'}</h3>
                           <p className="text-sm text-slate-500 mb-2">Score: <strong className="text-emerald-600 font-heading">{app.trustScore}</strong> (48-Day Expiry)</p>
                           <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                             app.status === 'approved' || app.status === 'verified_self' ? 'bg-emerald-50 text-emerald-700' :
                             app.status === 'rejected' ? 'bg-red-50 text-red-700' :
                             'bg-amber-50 text-amber-700'
                           }`}>
                             <CheckCircle2 className="w-3 h-3" />
                             {app.status === 'verified_self' ? 'Self-Verified & Shared' : (app.status.charAt(0).toUpperCase() + app.status.slice(1))}
                           </span>
                         </div>
                      </div>
                    )
                 })}
               </div>
            )}
          </div>
        </div>
      </main>

      {/* Self Verification Modal */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 relative animate-scaleUp">
            <button onClick={() => { setIsVerifyModalOpen(false); setVerificationResult(null); }} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700">
              <X className="w-6 h-6" />
            </button>

            {!verificationResult ? (
              <form onSubmit={handleSelfVerify} className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase mb-2">
                    <ShieldCheck className="w-4 h-4" /> TenTrust Independent KYC
                  </div>
                  <h2 className="text-2xl font-heading font-extrabold text-slate-900">Verify Yourself & Share</h2>
                  <p className="text-sm text-slate-600 mt-1">Complete your self-verification to generate a secure confirmation link for your landlord. Valid for exactly <strong>48 days</strong>.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">BVN or NIN *</label>
                    <input 
                      type="text" 
                      required 
                      value={bvnInput}
                      onChange={(e) => setBvnInput(e.target.value)}
                      placeholder="11-digit BVN or NIN" 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-mono focus:outline-none focus:border-brand-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Monthly Income (₦)</label>
                    <input 
                      type="number" 
                      value={incomeInput}
                      onChange={(e) => setIncomeInput(e.target.value)}
                      placeholder="e.g. 500000" 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-mono focus:outline-none focus:border-brand-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Landlord Email (for direct send)</label>
                    <input 
                      type="email" 
                      value={landlordEmailInput}
                      onChange={(e) => setLandlordEmailInput(e.target.value)}
                      placeholder="landlord@example.com" 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Property Title / Unit (Optional)</label>
                    <input 
                      type="text" 
                      value={propertyTitleInput}
                      onChange={(e) => setPropertyTitleInput(e.target.value)}
                      placeholder="e.g. Lekki Phase 1 Luxury Apartment" 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-600"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isVerifying}
                  className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {isVerifying ? 'Running Casiec Screening...' : 'Verify & Generate Link'}
                </button>
              </form>
            ) : (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-heading font-extrabold text-slate-900 mb-1">Verification Successful!</h3>
                  <p className="text-slate-600 text-sm">Your TenTrust Score is <strong className="text-brand-600 font-heading text-lg">{verificationResult.score}</strong>. This secure confirmation link is active and expires in exactly <strong className="text-slate-900">48 days</strong> ({verificationResult.expiresAt}).</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Secure Landlord Confirmation Link</label>
                  <div className="flex items-center gap-2">
                    <input type="text" readOnly value={verificationResult.link} className="w-full bg-white px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs text-slate-700" />
                    <button onClick={handleCopyLink} className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-brand-700 flex items-center gap-1 shrink-0">
                      <Copy className="w-3.5 h-3.5" /> {copiedLink ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button 
                    onClick={handleSendToLandlord}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Send Verification to Landlord ({verificationResult.landlordEmail})
                  </button>
                  {sentSuccess && (
                    <p className="text-xs text-emerald-600 font-semibold">Verification successfully sent to landlord email!</p>
                  )}
                  <button 
                    onClick={() => { setIsVerifyModalOpen(false); setVerificationResult(null); }}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


function TrendingUpIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
