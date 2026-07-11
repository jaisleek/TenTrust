import { Building2, CreditCard, Home, FileSpreadsheet, Landmark, Clock } from 'lucide-react';

const upcomingFeatures = [
  {
    title: 'Verified Listings',
    description: 'Browse verified apartments, shortlets, and properties with escrow protection.',
    icon: Home,
    tag: 'Coming Soon'
  },
  {
    title: 'Tenant & Rent Management',
    description: 'Automated rent collection, digital receipts, and lease renewals for landlords.',
    icon: FileSpreadsheet,
    tag: 'Coming Soon'
  },
  {
    title: 'Pay Government Bills',
    description: 'Settle land use charge, tenement rates, and utility bills directly from your wallet.',
    icon: Landmark,
    tag: 'Coming Soon'
  },
  {
    title: 'Apply for Co-Ownership',
    description: 'Fractional real estate co-ownership opportunities backed by trusted developers.',
    icon: Building2,
    tag: 'Coming Soon'
  },
  {
    title: 'Tenant Credit Facilities',
    description: 'Flexible rent financing and repayment structures powered by Casiec Financials.',
    icon: CreditCard,
    tag: 'Coming Soon'
  }
];

export default function ComingSoonSection() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-white border-t border-slate-100 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Clock className="w-4 h-4 text-brand-600" /> Platform Roadmap
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight mb-4">
            Coming Soon to TenTrust
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed font-medium">
            We are progressively rolling out advanced prop-tech modules to make property management in Africa seamless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingFeatures.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div 
                key={index} 
                className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="absolute top-6 right-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wide">
                    <Clock className="w-3.5 h-3.5" /> {feat.tag}
                  </span>
                </div>
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                    <Icon className="w-7 h-7 text-brand-600" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-slate-600 text-base leading-relaxed mb-6">{feat.description}</p>
                </div>
                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-sm font-semibold text-slate-400">
                  <span>In Development</span>
                  <span className="text-brand-600">Notify Me</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
