import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, RefreshCw, Smartphone, CheckCircle2, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

export default function ProfileSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [tin, setTin] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [accountantEmail, setAccountantEmail] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('profileSaved') === 'true') {
      setSuccessMsg('Changes have been updated and saved!');
      sessionStorage.removeItem('profileSaved');
      setTimeout(() => {
        setSuccessMsg(null);
      }, 5000);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Load existing specific properties
    const loadProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setFirstName(data.firstName || user.firstName || '');
          setLastName(data.lastName || user.lastName || '');
          setPhone(data.phone || '');
          setBusinessName(data.businessName || '');
          setAddress(data.address || '');
          setTin(data.tin || '');
          setWhatsappNumber(data.whatsappNumber || '');
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadProfile();
  }, [user, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'users', user.id);
      await updateDoc(docRef, {
        firstName,
        lastName,
        phone,
        businessName,
        address,
        tin,
        whatsappNumber,
        updatedAt: Date.now()
      });
      sessionStorage.setItem('profileSaved', 'true');
      window.location.reload();
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 lg:p-10 relative">
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 w-80"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium flex-1">{successMsg}</p>
            <button 
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-500 hover:text-emerald-700 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to={user.role === 'landlord' ? '/dashboard' : '/tenant'} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-heading font-bold text-slate-900">Profile Settings</h1>
          <p className="text-slate-500 mt-2">Manage your personal details, profile image, and tax identification.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Cover / Profile */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Profile</h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md flex justify-center items-center overflow-hidden shrink-0">
                 {/* Placeholder for uploaded photo */}
                 <span className="text-3xl font-bold text-slate-300">{(firstName || 'U')[0]}</span>
              </div>
              <div className="flex-1 space-y-2">
                <p className="font-semibold text-slate-900">Profile Photo</p>
                <p className="text-sm text-slate-500">Upload a clear photo to help verify your identity. You can crop your face specifically. (Max 2MB)</p>
                <div className="flex items-center gap-3 mt-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    <Upload className="w-4 h-4" /> Change Photo
                    <input type="file" className="hidden" accept="image/*" />
                  </label>
                  <span className="text-sm text-slate-400">No file chosen</span>
                </div>
              </div>
            </div>
          </section>

          {/* Details */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Personal & Business Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" 
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Business Name (Optional)</label>
                <input 
                  type="text" 
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Address</label>
                <textarea 
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                ></textarea>
              </div>
            </div>
          </section>

          {/* Tax Information */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Tax Information</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-3xl">If you already have a Tax Identification Number (TIN), enter it below. If you don't have one, you can generate a new one instantly using our integrated NRS system.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-bold text-slate-700 mb-1">Tax Identification Number (TIN)</label>
                <input 
                  type="text" 
                  value={tin}
                  onChange={e => setTin(e.target.value)}
                  placeholder="e.g. TIN-12345678"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-mono" 
                />
              </div>
              <button type="button" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors whitespace-nowrap hidden sm:block">
                Generate/Link TIN via NRS
              </button>
            </div>
            <button type="button" className="w-full mt-4 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors whitespace-nowrap sm:hidden">
              Generate/Link TIN via NRS
            </button>
          </section>

          {/* Accountant Access */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-slate-100 pb-3 gap-4">
              <h2 className="text-xl font-bold text-slate-900">Accountant Access</h2>
              <button type="button" className="text-sm border border-slate-200 py-1.5 px-3 rounded-lg font-medium text-slate-600 hover:bg-slate-50 transition-colors">Demo: Login as Accountant</button>
            </div>
            <p className="text-sm text-slate-500 mb-6 max-w-3xl">Invite a certified accountant or tax consultant to view your books and file taxes on your behalf. They will not have access to your raw bank login details, only the transaction history and receipts.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input 
                type="email" 
                value={accountantEmail}
                onChange={e => setAccountantEmail(e.target.value)}
                placeholder="accountant@example.com"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" 
              />
              <button type="button" className="px-6 py-3 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl font-bold hover:bg-brand-100 hover:border-brand-300 transition-all whitespace-nowrap">
                Send Invitation
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-900">Adebayo Ogunlesi <span className="text-xs font-mono text-slate-500 font-normal ml-2">(CITN-102934)</span></p>
                <p className="text-sm text-amber-600 font-medium">Pending acceptance...</p>
              </div>
              <button type="button" className="text-sm text-red-600 font-medium hover:text-red-700">Revoke Access</button>
            </div>
          </section>

          {/* WhatsApp TaxBuddy */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-bl-lg">FREE</div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Smartphone className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">WhatsApp TaxBuddy AI</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6 max-w-3xl">Connect your WhatsApp number to chat with TaxBuddy AI directly from your phone. Ask tax questions, generate simple invoices, and get payment links on the go.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 w-full">
                <label className="block text-sm font-bold text-slate-700 mb-1">WhatsApp Number</label>
                <input 
                  type="tel" 
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. 09058284054"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
                />
              </div>
              <div className="sm:self-end">
                <button type="button" className="w-full sm:w-auto px-6 py-3 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#128C7E] transition-colors whitespace-nowrap shadow-sm">
                  Connect Bot
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-600 space-y-2">
              <p className="font-bold text-slate-900">Official Meta WhatsApp Cloud API (Recommended & Free):</p>
              <p>How to set up for free (1,000 monthly conversations):</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Go to developers.facebook.com and Create an App.</li>
                <li>Important (New Meta UI): In the left menu, click Use cases (or click "Customize the Connect with customers through WhatsApp use case" on your Dashboard).</li>
                <li>Expand Basic setup and click Step 1. Try it out.</li>
                <li>Copy your Access token and save it securely.</li>
              </ol>
            </div>
          </section>

          {/* Backup & Export */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Data Backup & Export</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-3xl">Download a complete copy of your profile data to avoid vendor lock-in. Keep control of your business information.</p>
            
            <div className="flex flex-wrap gap-4">
              <button type="button" className="px-6 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors bg-white">Export JSON</button>
              <button type="button" className="px-6 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors bg-white">Export CSV</button>
            </div>
          </section>

          {/* Digital Signature */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Digital Signature</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-3xl">Draw your signature below. This will be used to auto-sign your tax returns and documents.</p>
            
            <div className="border-2 border-dashed border-slate-300 rounded-xl h-40 bg-slate-50 flex items-center justify-center mb-4 relative cursor-crosshair">
               <span className="text-slate-400 font-medium pointer-events-none">Saved Signature</span>
            </div>
            
            <div className="flex justify-end">
              <button type="button" className="text-sm text-red-600 font-medium hover:text-red-700">Remove</button>
            </div>
          </section>

          <div className="flex justify-end pt-4 border-t border-slate-200">
             <button 
                type="submit" 
                disabled={isSaving}
                className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-md hover:shadow-brand-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {isSaving ? 'Saving...' : 'Save Changes'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
