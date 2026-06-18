import { useState, useEffect, FormEvent } from 'react';
import { ShieldCheck, LayoutDashboard, Building, Users, Wallet, Bell, Search, Plus, MapPin, MoreVertical, CheckCircle2, Clock, TrendingUp, UploadCloud, FileText, Camera, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockApplications, mockFinancials } from '../data';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, where, getDoc, doc } from 'firebase/firestore';
import NotificationsPopover from '../components/NotificationsPopover';
import RecentActivityFeed from '../components/RecentActivityFeed';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [properties, setProperties] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [pooledTenants, setPooledTenants] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimationResult, setEstimationResult] = useState<any>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const propQ = query(collection(db, 'properties'), where('landlordId', '==', user.id));
    const unsubscribeProp = onSnapshot(propQ, (snapshot) => {
      const fetchedProperties = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProperties(fetchedProperties.sort((a: any, b: any) => b.createdAt - a.createdAt));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'properties');
    });

    const appQ = query(collection(db, 'applications'), where('landlordId', '==', user.id));
    const unsubscribeApp = onSnapshot(appQ, (snapshot) => {
      const fetchedApps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(fetchedApps.sort((a: any, b: any) => b.createdAt - a.createdAt));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'applications');
    });

    const poolQ = query(collection(db, 'applications'), where('propertyId', '==', 'pre-approval'));
    const unsubscribePool = onSnapshot(poolQ, (snapshot) => {
      const fetchedPool = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPooledTenants(fetchedPool.sort((a: any, b: any) => b.createdAt - a.createdAt));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pooled_tenants');
    });

    return () => {
      unsubscribeProp();
      unsubscribeApp();
      unsubscribePool();
    };
  }, [user, navigate]);

  const handleAddProperty = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const type = formData.get('type') as string;
    const rentAmount = Number(formData.get('rentAmount'));
    const location = formData.get('location') as string;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'properties'), {
        landlordId: user.id,
        title,
        location,
        type: type === 'rent' ? 'Rent' : type === 'sale' ? 'Sale' : 'Shortlet',
        rentAmount,
        currency: 'NGN',
        status: 'Vacant',
        coverImage: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=600',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      setActiveTab('properties');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
       console.error("Error adding property: ", error);
       handleFirestoreError(error, OperationType.CREATE, 'properties');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEstimateRent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEstimating(true);
    setEstimationResult(null);
    const formData = new FormData(e.currentTarget);
    const propertyDetails = `Property Type: ${formData.get('propertyType')}, Location: ${formData.get('location')}, Bedrooms: ${formData.get('bedrooms')}, Amenities: ${formData.get('amenities')}`;
    
    try {
      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyDetails })
      });
      const data = await res.json();
      if (!res.ok) {
         throw new Error(data.error || 'Server error');
      }
      setEstimationResult(data);
    } catch (error: any) {
      console.error(error);
      setEstimationResult({
         estimatedRange: 'Error',
         analysis: error.message || 'We encountered an issue estimating rent. Please try again.',
         confidence: 0
      });
    } finally {
      setIsEstimating(false);
    }
  };

  const handleUpdateAppStatus = async (appId: string, status: string, tenantId: string, propertyName: string) => {
    try {
      // @ts-ignore
      await import('firebase/firestore').then(async ({ updateDoc, doc, addDoc, collection }) => {
        await updateDoc(doc(db, 'applications', appId), { status, updatedAt: Date.now() });
        await addDoc(collection(db, 'notifications'), {
          userId: tenantId,
          title: 'Application Update',
          body: `Your application for ${propertyName} has been ${status}.`,
          read: false,
          type: 'update',
          createdAt: Date.now()
        });
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="relative flex-1 max-w-[280px] w-full bg-white h-full flex flex-col shadow-2xl animate-fade-in-up">
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
              <Link to="/" className="flex items-center gap-2">
                <ShieldCheck className="w-7 h-7 text-brand-600" />
                <span className="font-heading font-bold text-xl tracking-tight">TenTrust<span className="text-brand-600">.</span></span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-1 flex-1 overflow-y-auto">
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-2">Landlord Menu</p>
              {[
                { id: 'overview', label: 'My Dashboard', icon: LayoutDashboard },
                { id: 'properties', label: 'My Properties', icon: Building },
                { id: 'add-property', label: 'List Property', icon: Plus },
                { id: 'applications', label: 'Review Tenants', icon: Users },
                { id: 'tenant-pool', label: 'Verified Tenants', icon: Search },
                { id: 'reminders', label: 'Automated Reminders', icon: Bell },
                { id: 'estimator', label: 'AI Rent Estimator', icon: TrendingUp },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all ${
                    activeTab === item.id 
                      ? 'bg-brand-50 text-brand-700 border border-brand-100' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-brand-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold uppercase shrink-0">
                  {(user?.firstName || 'U')[0]}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.firstName || 'User'} {(user?.lastName || '').charAt(0)}.</p>
                  <p className="text-xs text-slate-500 truncate">Verified Landlord</p>
                </div>
              </div>
              <div className="flex flex-col gap-1 mt-3 px-3">
                <Link to="/profile" className="text-left text-xs font-medium text-slate-600 hover:text-brand-600 py-2 transition-colors">Profile Settings</Link>
                <button onClick={() => logout()} className="text-left text-xs font-medium text-red-600 hover:text-red-700 py-2 transition-colors">Log Out</button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-brand-600" />
            <span className="font-heading font-bold text-xl text-slate-900 tracking-tight">TenTrust<span className="text-brand-600">.</span></span>
          </Link>
        </div>
        <div className="p-4 space-y-1 flex-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-2">Landlord Menu</p>
          {[
            { id: 'overview', label: 'My Dashboard', icon: LayoutDashboard },
            { id: 'properties', label: 'My Properties', icon: Building },
            { id: 'add-property', label: 'List Property', icon: Plus },
            { id: 'applications', label: 'Review Tenants', icon: Users },
            { id: 'tenant-pool', label: 'Verified Tenants', icon: Search },
            { id: 'reminders', label: 'Automated Reminders', icon: Bell },
            { id: 'estimator', label: 'AI Rent Estimator', icon: TrendingUp },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-brand-50 text-brand-700 border border-brand-100' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-brand-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold uppercase">
              {(user?.firstName || 'U')[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{user?.firstName || 'User'} {(user?.lastName || '').charAt(0)}.</p>
              <p className="text-xs text-slate-500">Verified Landlord</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-3 px-3">
            <Link to="/profile" className="text-left text-xs font-medium text-slate-600 hover:text-brand-600 py-1 transition-colors">Profile Settings</Link>
            <button onClick={() => logout()} className="text-left text-xs font-medium text-red-600 hover:text-red-700 py-1 transition-colors">Log Out</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl lg:text-2xl font-heading font-bold text-slate-900 capitalize truncate max-w-[150px] sm:max-w-xs">
              {activeTab.replace('-', ' ')}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationsPopover />
            <Link to="/listings" className="text-sm font-medium text-brand-600 hover:text-brand-700 underline hidden sm:block mr-2">View Public Listings</Link>
            <button onClick={() => setActiveTab('add-property')} className="bg-slate-900 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 sm:gap-2 shadow-sm">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">List New Property</span><span className="sm:hidden">List</span>
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 bg-slate-50">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {activeTab === 'add-property' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 bg-brand-900 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative z-10">
                    <h2 className="text-2xl font-heading font-bold mb-2">List a New Property</h2>
                    <p className="text-brand-100 max-w-2xl">
                      Provide accurate details. All properties are verified for ownership and physical condition before going live to ensure trust in the TenTrust ecosystem.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAddProperty} className="p-6 md:p-8 space-y-10">
                  {/* Basic Details */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                      <Building className="w-5 h-5 text-brand-600" />
                      <h3 className="text-lg font-bold text-slate-900">1. Property Details</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Property Title</label>
                        <input name="title" type="text" required placeholder="e.g. Luxury 2 Bedroom Apartment" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Listing Type</label>
                        <select name="type" required className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                          <option value="">Select Type</option>
                          <option value="rent">Rent (Yearly)</option>
                          <option value="shortlet">Shortlet (Daily/Monthly)</option>
                          <option value="sale">For Sale</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Price (₦)</label>
                        <input name="rentAmount" type="number" required placeholder="e.g. 5000000" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Location / Address</label>
                        <input name="location" type="text" required placeholder="Full street address, LGA, State" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                      </div>
                    </div>
                  </div>

                  {/* Media Uploads */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                      <Camera className="w-5 h-5 text-brand-600" />
                      <h3 className="text-lg font-bold text-slate-900">2. Pictures & Media</h3>
                    </div>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3">
                      <div className="bg-white p-4 rounded-full shadow-sm">
                        <UploadCloud className="w-8 h-8 text-brand-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Click to upload property photos</p>
                        <p className="text-sm text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                      </div>
                    </div>
                  </div>

                  {/* KYC & Verification */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                      <FileText className="w-5 h-5 text-brand-600" />
                      <h3 className="text-lg font-bold text-slate-900">3. Ownership Verification (KYC)</h3>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm mb-4">
                      <ShieldCheck className="w-5 h-5 shrink-0" />
                      <p>To maintain platform trust, we require proof of ownership. These documents are kept strictly confidential and never shared publicly.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Proof of Ownership Document</label>
                          <select required className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                            <option value="">Select Document Type</option>
                            <option value="c-of-o">Certificate of Occupancy (C of O)</option>
                            <option value="governors-consent">Governor's Consent</option>
                            <option value="deed">Deed of Assignment</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Upload Document Extract</label>
                          <input type="file" required className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer" />
                       </div>
                       <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium text-slate-700">Agent/Landlord Contact Numbers</label>
                          <input type="text" required placeholder="Phone numbers separated by commas" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                       </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                    <button type="button" onClick={() => setActiveTab('overview')} className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-700 transition-all shadow-sm disabled:opacity-75 disabled:cursor-not-allowed">
                      {isSubmitting ? (
                        <><Clock className="w-5 h-5 animate-spin" /> Submitting for Review</>
                      ) : (
                        <><CheckCircle2 className="w-5 h-5" /> Submit Listing</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab !== 'add-property' && activeTab !== 'reminders' && activeTab !== 'estimator' && activeTab !== 'tenant-pool' && (
              <>
                {/* Friendly Alert */}
                <div className="bg-brand-900/5 border border-brand-200 rounded-2xl p-6 flex items-start gap-4">
                   <div className="bg-brand-100 p-2 rounded-full text-brand-600 shrink-0">
                     <ShieldCheck className="w-6 h-6" />
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-900 text-lg">Peace of Mind for your Rentals</h4>
                     <p className="text-slate-600 mt-1">Review tenant applications easily. Focus on their <strong>Trust Score</strong>. Casiec Financials ensures you get guaranteed payments for verified tenants.</p>
                   </div>
                </div>
                
                {/* KPI Cards */}
                {(activeTab === 'overview' || activeTab === 'properties') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">Total Portfolio Value (Yr)</p>
                          <h3 className="text-2xl font-bold font-heading text-slate-900">₦24,700,000</h3>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                        100% Guaranteed via Casiec Financials
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">Active Properties</p>
                          <h3 className="text-2xl font-bold font-heading text-slate-900">{properties.length} <span className="text-lg text-slate-400 font-normal">Units</span></h3>
                        </div>
                        <div className="bg-brand-50 p-2 rounded-lg text-brand-600">
                          <Building className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
                        <div className="bg-brand-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">85% Occupancy Rate</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">Safe Tenants (Identity Verified)</p>
                          <h3 className="text-2xl font-bold font-heading text-slate-900 text-emerald-600">100%</h3>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 tracking-wide font-medium">All tenant backgrounds are checked.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Financial Chart */}
                  {activeTab === 'overview' && (
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-heading font-bold text-slate-900">Money In vs Expected (Millions ₦)</h3>
                        <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none">
                          <option>Last 6 Months</option>
                        </select>
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={mockFinancials} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              formatter={(value, name) => [`₦${value}M`, name === 'paid' ? 'Money Received' : 'Money Expected']}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="expected" fill="#94a3b8" name="Money Expected" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="paid" fill="#10b981" name="Money Received" radius={[4, 4, 0, 0]} maxBarSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Pending Applications */}
                  {(activeTab === 'overview' || activeTab === 'applications') && (
                    <div className={`${activeTab === 'applications' ? 'lg:col-span-3' : 'lg:col-span-1'} bg-white rounded-2xl border border-slate-200 shadow-sm p-0 overflow-hidden flex flex-col`}>
                      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-lg font-heading font-bold text-slate-900">Tenant Reviews</h3>
                      </div>
                      <div className="flex-1 overflow-auto divide-y divide-slate-100">
                        {applications.map((app) => {
                          const propertyInfo = properties.find(p => p.id === app.propertyId);
                          return (
                          <div key={app.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                              {(app.kycData?.bvn || app.kycData?.nin) ? 'V' : '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-slate-900 truncate">Application for {propertyInfo?.title || 'Property'}</h4>
                                    {app.kycData?.casiecConsent && (
                                       <span className="inline-flex items-center gap-1 text-[10px] bg-brand-50 text-brand-700 font-bold px-1.5 py-0.5 rounded border border-brand-200 shadow-sm">
                                         <ShieldCheck className="w-3 h-3" /> Casiec Verified
                                       </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 truncate">Income: ₦{Number(app.kycData?.monthlyIncome || 0).toLocaleString()} | {app.kycData?.employmentStatus}</p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 ${app.trustScore > 600 ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                                  {app.trustScore > 600 ? 'Safe Tenant' : 'Risky Tenant'}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 mt-3 mb-2">
                                <div className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col justify-center">
                                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Job / Work</span>
                                  <span className="text-xs font-bold text-slate-900">{app.kycData?.employerName || app.kycData?.employmentStatus || 'Unknown'}</span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col justify-center">
                                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Next of Kin</span>
                                  <span className="text-xs font-bold text-slate-900 truncate">{app.kycData?.nextOfKinName || 'None'}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2 mt-1">
                                <div>
                                  {(app.kycData?.bvn || app.kycData?.nin) ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Government ID Checked
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                      <Clock className="w-3 h-3 text-amber-600" /> ID Missing
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  {app.status === 'pending' ? (
                                    <>
                                      <button onClick={() => handleUpdateAppStatus(app.id, 'rejected', app.tenantId, propertyInfo?.title || 'Property')} className="text-[10px] font-bold px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200">Reject</button>
                                      <button onClick={() => handleUpdateAppStatus(app.id, 'approved', app.tenantId, propertyInfo?.title || 'Property')} className="text-[10px] font-bold px-3 py-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm">Approve</button>
                                    </>
                                  ) : (
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${app.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} capitalize`}>{app.status}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )})}
                      </div>
                    </div>
                  )}
                </div>

                {activeTab === 'overview' && (
                  <div className="mt-8 mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="lg:col-span-1 h-[400px]">
                      <RecentActivityFeed userId={user.id} role={user.role} />
                    </div>
                  </div>
                )}

                {/* Properties List */}
                {(activeTab === 'overview' || activeTab === 'properties') && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden pb-4">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-lg font-heading font-bold text-slate-900">Your Properties</h3>
                      <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Property</th>
                            <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                            <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price Details</th>
                            <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="py-3 px-6"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {properties.map((property) => (
                            <tr key={property.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-6 flex items-center gap-4">
                                <img src={property.coverImage} alt={property.title} className="w-16 h-12 rounded-lg object-cover bg-slate-200" />
                                <div>
                                  <p className="font-semibold text-slate-900 text-sm">{property.title}</p>
                                  <p className="text-xs text-slate-500">{property.type}</p>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <p className="text-sm font-medium text-slate-600 flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {property.location}
                                </p>
                              </td>
                              <td className="py-4 px-6">
                                <p className="text-sm font-bold text-slate-900">₦{(property.rentAmount / 1000000).toFixed(2)}M</p>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  property.status === 'Occupied' 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                }`}>
                                  {property.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <button className="text-brand-600 text-sm font-medium hover:underline">Manage</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'reminders' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
                 <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                       <Bell className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-bold font-heading text-slate-900">Automated Rent Reminders</h2>
                       <p className="text-slate-500 text-sm">Configure how and when your tenants are notified about upcoming rent payments.</p>
                    </div>
                 </div>

                 <div className="space-y-6 max-w-3xl">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                       <div>
                          <h4 className="font-bold text-slate-900">3 Days Before Due Date</h4>
                          <p className="text-sm text-slate-500 mt-1">Send an email and push notification reminder 72 hours before the rent is due. Highly recommended.</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer shrink-0">
                         <input type="checkbox" className="sr-only peer" defaultChecked />
                         <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                       </label>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                       <div>
                          <h4 className="font-bold text-slate-900">7 Days Before Due Date</h4>
                          <p className="text-sm text-slate-500 mt-1">Send an early email reminder one week before the rent is due.</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer shrink-0">
                         <input type="checkbox" className="sr-only peer" />
                         <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                       </label>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                       <div>
                          <h4 className="font-bold text-slate-900">On Due Date</h4>
                          <p className="text-sm text-slate-500 mt-1">Send a final push notification and SMS if rent is not yet paid on the exact due date.</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer shrink-0">
                         <input type="checkbox" className="sr-only peer" defaultChecked />
                         <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                       </label>
                    </div>

                    <button className="mt-4 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center w-full sm:w-auto hover:bg-slate-800 transition-colors shadow-sm">
                       Save Notification Preferences
                    </button>
                    
                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                           <ShieldCheck className="w-5 h-5 text-brand-600" /> Reminder System Logs
                        </h3>
                        <div className="space-y-3">
                           <div className="bg-white border border-slate-100 p-4 rounded-lg flex items-center justify-between">
                              <div>
                                 <p className="font-semibold text-slate-800 text-sm">Automated Email & Push Sent - Tenant Chukwudi O.</p>
                                 <p className="text-xs text-slate-500 mt-0.5">Luxury 2 Bedroom Apartment</p>
                              </div>
                              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Success</span>
                           </div>
                           <div className="bg-white border border-slate-100 p-4 rounded-lg flex items-center justify-between">
                              <div>
                                 <p className="font-semibold text-slate-800 text-sm">Automated SMS Sent - Tenant Jane D.</p>
                                 <p className="text-xs text-slate-500 mt-0.5">3 Bedroom Duplex - Lekki</p>
                              </div>
                              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Success</span>
                           </div>
                        </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'tenant-pool' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
                 <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                       <Search className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-bold font-heading text-slate-900">Pre-Verified Tenant Pool</h2>
                       <p className="text-slate-500 text-sm">Find reliable tenants who have already completed their KYC and credit checks.</p>
                    </div>
                 </div>

                 {pooledTenants.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No pre-verified tenants available yet.</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {pooledTenants.map((tenant) => (
                        <div key={tenant.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                           <div className="flex justify-between items-start mb-4">
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-slate-900">{tenant.kycData?.fullName || 'Anonymous User'}</h3>
                                  {tenant.kycData?.casiecConsent && (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-brand-50 text-brand-700 font-bold px-1.5 py-0.5 rounded border border-brand-200" title="Financial history explicitly verified by Casiec">
                                      <ShieldCheck className="w-3 h-3" /> Casiec Verified
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-500">{tenant.kycData?.employmentStatus}</p>
                             </div>
                             <span className={`text-xs font-bold px-2 py-1 rounded shadow-sm ${tenant.trustScore > 600 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                Score: {tenant.trustScore}
                             </span>
                           </div>
                           <div className="space-y-2 text-sm text-slate-600 mb-4">
                             <p><span className="font-medium">Income:</span> ₦{Number(tenant.kycData?.monthlyIncome || 0).toLocaleString()}/mo</p>
                             <p><span className="font-medium">Address:</span> {tenant.kycData?.currentAddress || 'N/A'}</p>
                           </div>
                           <button className="w-full text-center bg-slate-900 text-white rounded-lg py-2 text-sm font-bold hover:bg-slate-800 transition-colors">
                             Invite to Apply
                           </button>
                        </div>
                      ))}
                    </div>
                 )}
              </div>
            )}

            {activeTab === 'estimator' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
                 <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
                       <TrendingUp className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-bold font-heading text-slate-900">AI Rent Estimator</h2>
                       <p className="text-slate-500 text-sm">Use local market data to find the best rental price for your property.</p>
                    </div>
                 </div>

                 <form onSubmit={handleEstimateRent} className="space-y-6 max-w-2xl mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-slate-700">Location / Neighborhood</label>
                         <input name="location" type="text" required placeholder="e.g. Lekki Phase 1" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-slate-700">Property Type</label>
                         <select name="propertyType" required className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                            <option value="">Select type...</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Duplex">Duplex</option>
                            <option value="Bungalow">Bungalow</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-slate-700">Number of Bedrooms</label>
                         <input name="bedrooms" type="number" required placeholder="e.g. 3" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-slate-700">Key Amenities</label>
                         <input name="amenities" type="text" placeholder="e.g. Pool, 24/7 Power" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                      </div>
                    </div>
                    <button type="submit" disabled={isEstimating} className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 w-full md:w-auto hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-75 disabled:cursor-not-allowed">
                       {isEstimating ? 'Analyzing Market Data...' : 'Estimate Optimal Rent'}
                    </button>
                 </form>

                 {estimationResult && (
                   <div className="bg-brand-900/5 border border-brand-200 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-heading font-bold text-slate-900 mb-4">Estimation Results</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                           <p className="text-sm font-medium text-slate-500 mb-1">Recommended Annual Rent</p>
                           <p className="text-2xl font-bold font-heading text-emerald-600">{estimationResult.estimatedRange}</p>
                           <div className="mt-2 inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-semibold">
                             Data Confidence: {estimationResult.confidence}%
                           </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                           <p className="text-sm font-medium text-slate-500 mb-1">AI Market Analysis</p>
                           <p className="text-sm text-slate-700 leading-relaxed">{estimationResult.analysis}</p>
                        </div>
                      </div>
                   </div>
                 )}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
