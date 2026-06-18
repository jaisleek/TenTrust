import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ShieldCheck, ArrowRight, ArrowLeft, Upload, File } from 'lucide-react';
import confetti from 'canvas-confetti';

import { mockProperties } from '../data';

export default function KYCForm() {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    async function fetchProperty() {
      if (!propertyId || propertyId === 'pre-approval') return;
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
    if (!propertyId) return;
    if (propertyId !== 'pre-approval' && !property) return;

    const formData = new FormData(e.currentTarget);
    const kycData = {
      fullName: formData.get('fullName') as string,
      phone: formData.get('phone') as string,
      maritalStatus: formData.get('maritalStatus') as string,
      currentAddress: formData.get('currentAddress') as string,
      livingWith: formData.get('livingWith') as string,
      pets: formData.get('pets') as string,
      employmentStatus: formData.get('employmentStatus') as string,
      employerName: formData.get('employerName') as string,
      workEmail: formData.get('workEmail') as string,
      workPosition: formData.get('workPosition') as string,
      monthlyIncome: Number(formData.get('monthlyIncome')),
      bankName: formData.get('bankName') as string,
      accountNumber: formData.get('accountNumber') as string,
      bvn: formData.get('bvn') as string,
      nin: formData.get('nin') as string,
      casiecConsent: true,
      nextOfKinName: formData.get('nextOfKinName') as string,
      nextOfKinRelationship: formData.get('nextOfKinRelationship') as string,
      nextOfKinPhone: formData.get('nextOfKinPhone') as string,
      previousLandlord: formData.get('previousLandlord') as string
    };

    setIsSubmitting(true);
    try {
      let idProofUrl = '';
      if (idDocument) {
        const fileRef = ref(storage, `kyc_documents/${Date.now()}_${idDocument.name}`);
        await uploadBytes(fileRef, idDocument);
        idProofUrl = await getDownloadURL(fileRef);
      }

      const finalKycData = {
        ...kycData,
        idProofUrl
      };

      const landlordId = propertyId === 'pre-approval' ? 'pool' : property.landlordId;
      await addDoc(collection(db, 'applications'), {
        propertyId,
        tenantId: user ? user.id : 'unregistered',
        landlordId,
        status: propertyId === 'pre-approval' ? 'approved' : 'pending',
        trustScore: Math.floor(Math.random() * 400) + 500, // Generate dummy trust score for MVP
        kycData: finalKycData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      if (landlordId !== 'pool') {
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: landlordId,
            title: 'New KYC Submission',
            body: `${kycData.fullName} has applied for ${property?.title || 'your property'}.`,
            read: false,
            type: 'kyc_submission',
            createdAt: Date.now()
          });
        } catch (notifErr) {
          console.error("Failed to create notification", notifErr);
        }
      }

      setIsSubmitted(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#34d399', '#6ee7b7'] // Emerald theme colors
      });
    } catch (error) {
       console.error("Error submitting KYC", error);
       handleFirestoreError(error, OperationType.CREATE, 'applications');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (formRef.current) {
      const currentStepEl = document.getElementById(`step-${currentStep}`);
      if (currentStepEl) {
        const inputs = currentStepEl.querySelectorAll('input, select');
        let isValid = true;
        inputs.forEach((input: any) => {
          if (!input.checkValidity()) {
            input.reportValidity();
            isValid = false;
          }
        });
        if (isValid) {
          setCurrentStep(prev => Math.min(prev + 1, totalSteps));
          // Scroll to top of form
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (propertyId !== 'pre-approval' && !property) return <div className="p-8 text-center">Loading property...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {isSubmitted ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-slate-900 mb-4">Submission Successful!</h2>
              <p className="text-slate-600 max-w-sm mb-8">
                Your application has been securely submitted and is now under review. We'll notify you once the background verifications are complete.
              </p>
              <button 
                onClick={() => navigate('/listings')} 
                className="bg-brand-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-700 transition-colors"
               >
                Browse More Listings
              </button>
            </div>
          ) : (
            <>
              <div className="bg-brand-900 p-8 text-white relative flex justify-between items-center overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <h1 className="text-2xl font-bold font-heading mb-2">
                    {propertyId === 'pre-approval' ? 'Tenant Pre-Verification Request' : 'Tenant KYC & Application'}
                  </h1>
                  <p className="text-brand-100">
                    {propertyId === 'pre-approval' ? 'Get verified to stand out to landlords.' : <>Applying for: <strong>{property?.title || 'Property'}</strong></>}
                  </p>
                </div>
                <ShieldCheck className="w-12 h-12 text-brand-400 relative z-10" />
              </div>
              <div className="p-8 pb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-slate-500">Step {currentStep} of {totalSteps}</span>
                  <span className="text-sm font-bold text-brand-600">
                    {currentStep === 1 && 'Personal Info'}
                    {currentStep === 2 && 'Employment'}
                    {currentStep === 3 && 'Identity'}
                    {currentStep === 4 && 'Financial'}
                    {currentStep === 5 && 'Emergency Contacts'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div className="bg-brand-500 h-full transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
                </div>
              </div>
              <form ref={formRef} onSubmit={handleSubmit} className="p-8 pt-4 space-y-8">
            
            <div id="step-1" className={`space-y-4 ${currentStep === 1 ? 'block' : 'hidden'}`}>
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <input name="fullName" type="text" required placeholder="John Doe" defaultValue={user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
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
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Previous or Current Address</label>
                  <input name="currentAddress" type="text" required placeholder="House number, Street, Area, State" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Who will you live with?</label>
                  <select name="livingWith" required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                     <option value="">Select option</option>
                     <option value="Alone">Alone</option>
                     <option value="Spouse">Spouse</option>
                     <option value="Family">Family / Children</option>
                     <option value="Friends/Roommates">Friends / Roommates</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Do you own pets?</label>
                  <select name="pets" required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                     <option value="">Select option</option>
                     <option value="No">No</option>
                     <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            <div id="step-2" className={`space-y-4 ${currentStep === 2 ? 'block' : 'hidden'}`}>
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Employment Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Work Type</label>
                  <select name="employmentStatus" required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                     <option value="">Select status</option>
                     <option value="Employee">Employee</option>
                     <option value="Self-Employed">Self-Employed</option>
                     <option value="Business Owner">Business Owner</option>
                     <option value="Student">Student</option>
                     <option value="Unemployed">Unemployed</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Where do you work?</label>
                  <input name="employerName" type="text" placeholder="Company Name" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Work Position</label>
                  <input name="workPosition" type="text" placeholder="e.g. Associate, Manager" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Work Email (Optional)</label>
                  <input name="workEmail" type="email" placeholder="name@company.com" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Monthly Income (₦)</label>
                  <input name="monthlyIncome" type="number" required placeholder="e.g. 500000" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono" />
                </div>
              </div>
            </div>

            <div id="step-3" className={`space-y-4 ${currentStep === 3 ? 'block' : 'hidden'}`}>
               <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Identity Verification</h2>
               <div className="space-y-3">
                 <label className="text-sm font-medium text-slate-700">Upload Valid ID (National ID, Passport, Driver's License)</label>
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors"
                 >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setIdDocument(e.target.files[0]);
                        }
                      }}
                    />
                    {idDocument ? (
                      <div className="flex flex-col items-center gap-2">
                        <File className="w-8 h-8 text-brand-500" />
                        <span className="text-sm font-medium text-slate-700">{idDocument.name}</span>
                        <span className="text-xs text-brand-600 font-bold mt-1">Tap to change file</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">Click to upload your ID document</span>
                        <span className="text-xs text-slate-400">PDF, JPG, PNG (Max 5MB)</span>
                      </div>
                    )}
                 </div>
               </div>
            </div>

            <div id="step-4" className={`space-y-4 ${currentStep === 4 ? 'block' : 'hidden'}`}>
               <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Financial Verification</h2>
               <p className="text-sm text-slate-500 mb-4">
                 Provide your details to help us establish your profile. Your information is securely encrypted.
               </p>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Bank Name</label>
                    <input name="bankName" type="text" required placeholder="e.g. Access Bank" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Account Number (Salary account preferred)</label>
                    <input name="accountNumber" type="text" required placeholder="10-digit number" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Bank Verification Number (BVN)</label>
                    <input name="bvn" type="text" required placeholder="11-digit BVN" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">National Identity Number (NIN)</label>
                    <input name="nin" type="text" required placeholder="11-digit NIN" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Previous Landlord Name & Contact (Optional)</label>
                    <input name="previousLandlord" type="text" placeholder="John Doe, 08012345678" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  </div>
               </div>
            </div>

            <div id="step-5" className={`space-y-4 ${currentStep === 5 ? 'block' : 'hidden'}`}>
               <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Emergency Contacts</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <h3 className="font-bold text-sm text-slate-900">Next of Kin</h3>
                  </div>
                  <div className="space-y-1.5 border-t border-slate-100 pt-2 sm:col-span-2"></div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Next of Kin Full Name</label>
                    <input name="nextOfKinName" type="text" required placeholder="Jane Doe" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Next of Kin Relationship</label>
                    <input name="nextOfKinRelationship" type="text" required placeholder="e.g. Sibling, Spouse" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Next of Kin Phone</label>
                    <input name="nextOfKinPhone" type="tel" required placeholder="08023456789" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  </div>
               </div>
            </div>

            <div className={`space-y-6 ${currentStep === 5 ? 'block' : 'hidden'}`}>
              <div className="text-sm text-slate-500 text-center px-4">
                 By submitting this application, you agree to TenTrust's <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>, which include standard background and verification checks to establish tenancy eligibility.
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={handlePrevStep} className="flex-1 py-4 rounded-xl text-slate-700 font-bold bg-slate-100 hover:bg-slate-200 transition-all">
                  Back
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 rounded-xl text-white font-bold flex justify-center items-center gap-2 transition-all shadow-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-75 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Verifying & Submitting...' : 'Submit Form'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-center text-slate-500 mt-4">
                Your financial and identity data is processed securely through our verified partners.
              </p>
            </div>

            {currentStep < 5 && (
              <div className="flex gap-4 mt-8 pt-4 border-t border-slate-100">
                {currentStep > 1 && (
                  <button type="button" onClick={handlePrevStep} className="py-4 px-6 rounded-xl text-slate-700 font-bold bg-slate-100 hover:bg-slate-200 transition-all">
                    Back
                  </button>
                )}
                <button type="button" onClick={handleNextStep} className="flex-1 py-4 rounded-xl text-white font-bold flex justify-center items-center gap-2 transition-all shadow-sm bg-slate-900 hover:bg-slate-800">
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
