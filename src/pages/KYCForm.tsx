import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

import { mockProperties } from '../data';

export default function KYCForm() {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    async function fetchProperty() {
      if (!propertyId) return;
      try {
        const propDoc = await getDoc(doc(db, 'properties', propertyId));
        if (propDoc.exists()) {
          setProperty(propDoc.data());
        } else {
          // Fallback to mock data if it's a seed property
          const mockProp = mockProperties.find(p => p.id === propertyId);
          if (mockProp) setProperty(mockProp);
        }
      } catch (error) {
        console.error(error);
        const mockProp = mockProperties.find(p => p.id === propertyId);
        if (mockProp) setProperty(mockProp);
      }
    }
    fetchProperty();
  }, [propertyId, user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !propertyId || !property) return;

    const formData = new FormData(e.currentTarget);
    const kycData = {
      fullName: formData.get('fullName') as string,
      phone: formData.get('phone') as string,
      maritalStatus: formData.get('maritalStatus') as string,
      currentAddress: formData.get('currentAddress') as string,
      employmentStatus: formData.get('employmentStatus') as string,
      employerName: formData.get('employerName') as string,
      monthlyIncome: Number(formData.get('monthlyIncome')),
      bvnnin: formData.get('bvnnin') as string,
      nextOfKinName: formData.get('nextOfKinName') as string,
      nextOfKinPhone: formData.get('nextOfKinPhone') as string,
      guarantorName: formData.get('guarantorName') as string,
      guarantorPhone: formData.get('guarantorPhone') as string,
      previousLandlord: formData.get('previousLandlord') as string
    };

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'applications'), {
        propertyId,
        tenantId: user.id,
        landlordId: property.landlordId,
        status: 'pending',
        trustScore: Math.floor(Math.random() * 400) + 500, // Generate dummy trust score for MVP
        kycData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      alert('Application submitted successfully!');
      navigate('/tenant');
    } catch (error) {
       console.error("Error submitting KYC", error);
       handleFirestoreError(error, OperationType.CREATE, 'applications');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!property) return <div className="p-8 text-center">Loading property...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to listings
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-brand-900 p-8 text-white relative flex justify-between items-center overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
             <div className="relative z-10">
                <h1 className="text-2xl font-bold font-heading mb-2">Tenant KYC & Application</h1>
                <p className="text-brand-100">Applying for: <strong>{property.title}</strong></p>
             </div>
             <ShieldCheck className="w-12 h-12 text-brand-400 relative z-10" />
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <input name="fullName" type="text" required placeholder="John Doe" defaultValue={user.firstName + ' ' + user.lastName} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Phone Number</label>
                  <input name="phone" type="tel" required placeholder="08012345678" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Marital Status</label>
                  <select name="maritalStatus" required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                     <option value="">Select status</option>
                     <option value="Single">Single</option>
                     <option value="Married">Married</option>
                     <option value="Divorced">Divorced</option>
                     <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Current Address</label>
                  <input name="currentAddress" type="text" required placeholder="House number, Street, Area, State" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Employment & Financial Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Employment Status</label>
                  <select name="employmentStatus" required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                     <option value="">Select status</option>
                     <option value="Employed">Employed (Full-time)</option>
                     <option value="Self-Employed">Self-Employed</option>
                     <option value="Business Owner">Business Owner</option>
                     <option value="Unemployed">Unemployed</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Employer / Business Name</label>
                  <input name="employerName" type="text" placeholder="Company XYZ" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Monthly Income (₦)</label>
                  <input name="monthlyIncome" type="number" required placeholder="e.g. 500000" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Identity & Background</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">BVN or NIN</label>
                    <input name="bvnnin" type="text" required placeholder="11-digit verification number" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Previous Landlord Name & Contact (Optional)</label>
                    <input name="previousLandlord" type="text" placeholder="John Doe, 08012345678" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Emergency Contacts & Guarantor</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Next of Kin Full Name</label>
                    <input name="nextOfKinName" type="text" required placeholder="Jane Doe" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Next of Kin Phone</label>
                    <input name="nextOfKinPhone" type="tel" required placeholder="08023456789" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Guarantor Full Name</label>
                    <input name="guarantorName" type="text" required placeholder="Mr. Smith" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Guarantor Phone</label>
                    <input name="guarantorPhone" type="tel" required placeholder="08034567890" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  </div>
               </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-8 rounded-xl text-white font-bold flex justify-center items-center gap-2 transition-all shadow-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-75 disabled:cursor-not-allowed">
              {isSubmitting ? 'Verifying & Submitting...' : 'Submit Application'} <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-center text-slate-500 mt-4">
              By submitting this form, you consent to TenTrust verifying your identity and creditworthiness using Casiec APIs.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
