import { useState, useEffect } from 'react';
import { ShieldCheck, User, Building, CreditCard, ChevronRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, where, getDoc, doc } from 'firebase/firestore';
import { mockProperties } from '../data';
import NotificationsPopover from '../components/NotificationsPopover';
import RecentActivityFeed from '../components/RecentActivityFeed';

export default function TenantDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [properties, setProperties] = useState<Record<string, any>>({});

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-brand-600" />
          <span className="font-heading font-bold text-2xl text-slate-900 tracking-tight">TenTrust<span className="text-brand-600">.</span></span>
        </Link>
        <div className="flex flex-col sm:flex-row items-center gap-4">
           <NotificationsPopover />
           <Link to="/listings" className="text-sm font-medium text-brand-600 hover:underline hidden sm:block">Find Properties</Link>
           <button onClick={() => logout()} className="text-sm font-medium text-red-600 hover:underline mr-4 hidden sm:block">Log Out</button>
           <div className="relative group flex items-center gap-3 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold uppercase">{(user.firstName || 'U')[0]}</div>
              <span className="text-sm font-bold text-slate-900">{user.firstName || 'User'} {(user.lastName || '').charAt(0)}.</span>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-2 flex flex-col gap-1">
                  <Link to="/profile" className="block px-3 py-2 text-sm text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors">Profile Settings</Link>
                  <button onClick={() => logout()} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">Log Out</button>
                </div>
              </div>
           </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 lg:p-10 space-y-8">
        
        {/* Welcome & Score */}
        <div className="bg-brand-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <h1 className="text-3xl font-heading font-bold mb-2">Welcome back, {user.firstName || 'Friend'}!</h1>
              <p className="text-brand-100">Your profile is looking great. Keep up the good payment history to unlock specialized Casiec financial rewards.</p>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 min-w-[200px]">
              <p className="text-brand-100 text-sm font-medium mb-1">TenTrust Score</p>
              <p className="text-5xl font-bold font-heading text-white">{applications.length > 0 ? applications[0].trustScore : 840}</p>
              <div className="mt-3 inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full text-xs font-semibold">
                <TrendingUpIcon className="w-3 h-3" /> Excellent
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
                  <p className="text-sm text-slate-600 mt-1">{applications.length > 0 ? 'NIN, BVN, and employment confirmed via KYC.' : 'Submit an application to complete KYC.'}</p>
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
            <h2 className="text-xl font-heading font-bold text-slate-900 mb-6">Your Applications</h2>
            {applications.length === 0 ? (
               <div className="text-center py-8">
                 <p className="text-slate-500 mb-4">You haven't applied for any properties yet.</p>
                 <div className="flex flex-col gap-3 items-center justify-center">
                    <Link to="/listings" className="text-brand-600 font-bold hover:underline">Browse Listings</Link>
                    <Link to="/apply/pre-approval" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-sm">
                      Get Pre-Approved (KYC)
                    </Link>
                 </div>
               </div>
            ) : (
               <div className="space-y-4 flex-1 overflow-y-auto">
                 <div className="pb-2 mb-2 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500">Recent Applications</span>
                    <Link to="/apply/pre-approval" className="text-xs font-bold bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors">
                      New Pre-Approval KYC
                    </Link>
                 </div>
                 {applications.map(app => {
                    const property = properties[app.propertyId];
                    return (
                      <div key={app.id} className="border border-slate-100 rounded-xl p-4 flex gap-4">
                         {property?.coverImage && <img src={property.coverImage} className="w-20 h-20 rounded-lg object-cover" alt="Property" />}
                         <div className="flex-1">
                           <h3 className="font-bold text-slate-900">{property?.title || 'Pre-Approval Request'}</h3>
                           <p className="text-sm text-slate-500 mb-2">KYC Submitted</p>
                           <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                             app.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                             app.status === 'rejected' ? 'bg-red-50 text-red-700' :
                             'bg-amber-50 text-amber-700'
                           }`}>
                             {app.status === 'approved' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                             {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                           </span>
                         </div>
                      </div>
                    )
                 })}
               </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="h-[400px]">
             <RecentActivityFeed userId={user.id} role={user.role} />
          </div>
        </div>
      </main>
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
