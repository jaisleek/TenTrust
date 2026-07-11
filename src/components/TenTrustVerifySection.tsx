import { useState } from 'react';
import { ShieldCheck, CheckCircle2, UserCheck, AlertTriangle, FileText, ArrowRight, Lock, Award, Sparkles } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const packages: Package[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 3000,
    description: 'Essential identity verification for quick screening.',
    features: ['BVN Verification', 'Government ID Check', 'Basic Name & Phone Match']
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 7000,
    description: 'Recommended for standard residential rentals.',
    features: ['BVN Verification', 'Government ID Check', 'Bank Statement Analysis', 'Credit Check & Past Defaults'],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 12000,
    description: 'Comprehensive risk assessment and employment verification.',
    features: ['Full Multi-Bureau Report', 'Employment & Salary Verification', 'Previous Landlord Reference Check', 'Credit Check & Risk Score']
  },
  {
    id: 'founding',
    name: 'Founding Member',
    price: 25000,
    description: 'Value pack for landlords managing multiple units.',
    features: ['3 Full Premium Verifications', 'Priority Support', 'Casiec Upfront Rent Access', 'Lifetime Verified Landlord Badge']
  }
];

export default function TenTrustVerifySection() {
  const [selectedPackage, setSelectedPackage] = useState<Package>(packages[1]);
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantBvn, setTenantBvn] = useState('');
  const [tenantIncome, setTenantIncome] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !tenantBvn) {
      alert('Please provide the prospective tenant\'s name and BVN/NIN.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      // Generate a realistic score based on name length or fixed seed for demo, or random 30-95
      const randomScore = Math.floor(Math.random() * 50) + 48; // e.g. 48 to 97
      let rating = '';
      let recommendation = '';
      let colorClass = '';

      if (randomScore >= 75) {
        rating = 'EXCELLENT';
        recommendation = 'Strongly Recommended. Tenant shows excellent financial standing and verified identity.';
        colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      } else if (randomScore >= 60) {
        rating = 'GOOD';
        recommendation = 'Recommended. Stable income and reliable credit history.';
        colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
      } else if (randomScore >= 45) {
        rating = 'FAIR';
        recommendation = 'Proceed with Caution. Consider requesting an upfront guarantor or security deposit.';
        colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
      } else if (randomScore >= 30) {
        rating = 'POOR';
        recommendation = 'Not Recommended. Irregular past payment indicators detected.';
        colorClass = 'bg-orange-50 text-orange-700 border-orange-200';
      } else {
        rating = 'HIGH RISK';
        recommendation = 'Do Not Proceed. Multiple red flags or invalid identification markers found.';
        colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
      }

      setReport({
        tenantName,
        tenantPhone,
        tenantBvn,
        tenantIncome: tenantIncome ? Number(tenantIncome).toLocaleString() : '550,000',
        score: randomScore,
        rating,
        recommendation,
        colorClass,
        packageName: selectedPackage.name,
        pricePaid: selectedPackage.price,
        verifiedAt: new Date().toLocaleDateString('en-NG', { dateStyle: 'long' })
      });
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <section id="verify" className="py-20 px-4 sm:px-6 bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header tailored for 45+ users (Clear, large, reassuring) */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-sm font-bold uppercase tracking-wider mb-4 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-brand-600" /> TenTrust Official Verify Service
          </div>
          <h2 className="text-4xl sm:text-5xl font-heading font-extrabold text-slate-900 tracking-tight mb-4">
            Protect Your Property Before You Rent
          </h2>
          <p className="text-xl text-slate-700 leading-relaxed font-medium">
            Landlords pay a one-time fee to verify prospective tenants instantly. Get accurate BVN, ID checks, bank history, and a clear <strong className="text-slate-900">TenTrust Score (0–100)</strong> to make confident decisions.
          </p>
        </div>

        {/* Pricing Packages Grid */}
        <div className="mb-20">
          <h3 className="text-2xl font-heading font-bold text-slate-900 text-center mb-8">Select Your Verification Package</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => {
              const isSelected = selectedPackage.id === pkg.id;
              return (
                <div 
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`cursor-pointer rounded-3xl p-6 transition-all duration-300 relative flex flex-col justify-between border-2 ${
                    isSelected 
                      ? 'bg-white border-brand-600 shadow-xl ring-4 ring-brand-500/20 scale-102' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                      Most Popular
                    </span>
                  )}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-heading font-bold text-2xl text-slate-900">{pkg.name}</h4>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${isSelected ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300'}`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">₦{pkg.price.toLocaleString()}</span>
                      <span className="text-slate-500 text-sm ml-1 font-medium">{pkg.id === 'founding' ? ' / bundle' : ' / tenant'}</span>
                    </div>
                    <p className="text-slate-600 text-sm mb-6 min-h-[40px]">{pkg.description}</p>
                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="font-medium">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button 
                    type="button"
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-base transition-all shadow-sm ${
                      isSelected 
                        ? 'bg-brand-600 hover:bg-brand-700 text-white' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {isSelected ? 'Selected Package' : 'Choose Package'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verification Form & Live Report Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="bg-brand-100 p-3 rounded-2xl">
                <UserCheck className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h3 className="text-2xl font-heading font-bold text-slate-900">Run Verification</h3>
                <p className="text-sm text-slate-600">Selected: <strong className="text-brand-600">{selectedPackage.name} Package (₦{selectedPackage.price.toLocaleString()})</strong></p>
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-base font-bold text-slate-800 mb-2">Prospective Tenant Full Name *</label>
                <input 
                  type="text" 
                  required 
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="e.g. Olusegun Adebayo"
                  className="w-full px-5 py-4 text-lg rounded-2xl bg-slate-50 border-2 border-slate-200 focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-bold text-slate-800 mb-2">BVN or NIN *</label>
                  <input 
                    type="text" 
                    required 
                    value={tenantBvn}
                    onChange={(e) => setTenantBvn(e.target.value)}
                    placeholder="11 digits BVN / NIN"
                    maxLength={11}
                    className="w-full px-5 py-4 text-lg rounded-2xl bg-slate-50 border-2 border-slate-200 focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-base font-bold text-slate-800 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                    placeholder="08030000000"
                    className="w-full px-5 py-4 text-lg rounded-2xl bg-slate-50 border-2 border-slate-200 focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-bold text-slate-800 mb-2">Estimated Monthly Income (₦)</label>
                <input 
                  type="number" 
                  value={tenantIncome}
                  onChange={(e) => setTenantIncome(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full px-5 py-4 text-lg rounded-2xl bg-slate-50 border-2 border-slate-200 focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  By clicking verify below, you authorize TenTrust to securely pull encrypted identity and financial risk signals in compliance with Nigerian Data Protection Regulation (NDPR).
                </p>
              </div>

              <button 
                type="submit" 
                disabled={isVerifying}
                className="w-full py-5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xl shadow-xl hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
                    Running Secure BVN & Credit Check...
                  </>
                ) : (
                  <>
                    Verify Tenant Now (₦{selectedPackage.price.toLocaleString()}) <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Report Display or Score Interpretation Table */}
          <div className="lg:col-span-6 space-y-6">
            
            {report ? (
              <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border-2 border-emerald-500 relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest px-6 py-2 rounded-bl-2xl">
                  Official TenTrust Report
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center font-heading font-black text-2xl text-slate-800">
                    {report.score}
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-bold text-slate-900">{report.tenantName}</h3>
                    <p className="text-sm text-slate-500">BVN: {report.tenantBvn.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')} | Verified: {report.verifiedAt}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border mb-6 ${report.colorClass}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black uppercase tracking-wider">TenTrust Risk Rating</span>
                    <span className="text-xl font-extrabold font-heading">{report.rating}</span>
                  </div>
                  <p className="text-sm font-semibold">{report.recommendation}</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between py-2.5 border-b border-slate-100 text-sm">
                    <span className="text-slate-500">Verification Package:</span>
                    <span className="font-bold text-slate-900">{report.packageName} (₦{report.pricePaid.toLocaleString()})</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-slate-100 text-sm">
                    <span className="text-slate-500">Declared Monthly Income:</span>
                    <span className="font-bold text-slate-900">₦{report.tenantIncome}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-slate-100 text-sm">
                    <span className="text-slate-500">Identity Status:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Verified Match</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-slate-100 text-sm">
                    <span className="text-slate-500">Credit Default History:</span>
                    <span className="font-bold text-emerald-600">0 Active Defaults Recorded</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => window.print()}
                    className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" /> Download Full PDF Report
                  </button>
                  <button 
                    onClick={() => setReport(null)}
                    className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                  >
                    Verify Another
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="bg-emerald-100 p-3 rounded-2xl">
                    <Award className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-bold text-slate-900">Score Interpretation Guide</h3>
                    <p className="text-sm text-slate-600">How TenTrust scores translate to landlord decisions</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-black uppercase mb-1">75 – 100</span>
                      <h4 className="font-bold text-emerald-900">EXCELLENT</h4>
                    </div>
                    <span className="text-sm font-bold text-emerald-800 text-right">Strongly Recommended</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex justify-between items-center">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-black uppercase mb-1">60 – 74</span>
                      <h4 className="font-bold text-blue-900">GOOD</h4>
                    </div>
                    <span className="text-sm font-bold text-blue-800 text-right">Recommended</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex justify-between items-center">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-600 text-white text-xs font-black uppercase mb-1">45 – 59</span>
                      <h4 className="font-bold text-amber-900">FAIR</h4>
                    </div>
                    <span className="text-sm font-bold text-amber-800 text-right">Proceed with Caution</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex justify-between items-center">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-orange-600 text-white text-xs font-black uppercase mb-1">30 – 44</span>
                      <h4 className="font-bold text-orange-900">POOR</h4>
                    </div>
                    <span className="text-sm font-bold text-orange-800 text-right">Not Recommended</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex justify-between items-center">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black uppercase mb-1">0 – 29</span>
                      <h4 className="font-bold text-rose-900">HIGH RISK</h4>
                    </div>
                    <span className="text-sm font-bold text-rose-800 text-right">Do Not Proceed</span>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-brand-600 shrink-0" />
                  <p className="text-sm text-slate-600 font-medium">
                    Enter the prospective tenant's details on the left and click verify to generate an instant report.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
