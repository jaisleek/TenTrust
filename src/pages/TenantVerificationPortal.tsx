import { FormEvent, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BadgeCheck, CheckCircle2, Info, LoaderCircle, ShieldCheck, XCircle } from '../lib/icons';
import { ReadinessScore, ScreeningPackage, formatScreeningError, screeningApi } from '../lib/screeningApi';

interface PublicScreening {
  tenant_name: string;
  property_title: string;
  package: ScreeningPackage;
}

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15';
const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600';

export default function TenantVerificationPortal() {
  const { token = '' } = useParams<{ token: string }>();
  const [screening, setScreening] = useState<PublicScreening | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [score, setScore] = useState<ReadinessScore | null>(null);
  const [checkStatus, setCheckStatus] = useState<Record<string, string>>({});
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [rent, setRent] = useState('');
  const [income, setIncome] = useState('');
  const [onTimePayments, setOnTimePayments] = useState('');
  const [totalPayments, setTotalPayments] = useState('');
  const [incomeEvidence, setIncomeEvidence] = useState(false);
  const [rentalReference, setRentalReference] = useState(false);
  const [bvn, setBvn] = useState('');
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('This tenant screening link is missing or invalid.');
      setLoading(false);
      return;
    }
    screeningApi<PublicScreening>(`/api/public/screenings/${encodeURIComponent(token)}`, {}, false)
      .then((data) => { setScreening(data); setFullName(data.tenant_name); })
      .catch((requestError) => setError(formatScreeningError(requestError)))
      .finally(() => setLoading(false));
  }, [token]);

  const packageChecks = screening?.package.checks || [];
  const needsBvn = packageChecks.includes('identity') || packageChecks.includes('credit_bureau') || packageChecks.includes('3_premium_checks');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!consent) { setError('Please give or decline consent before this information is processed.'); return; }
    if ((onTimePayments && !totalPayments) || Number(onTimePayments) > Number(totalPayments)) { setError('Enter a valid on-time and total rental payment count.'); return; }
    setSubmitting(true);
    try {
      const result = await screeningApi<{ status: string; score: ReadinessScore; check_status: Record<string, string> }>(
        `/api/public/screenings/${encodeURIComponent(token)}/complete`,
        { method: 'POST', body: JSON.stringify({
          tenant_name: fullName,
          tenant_phone: phone,
          tenant_email: email || null,
          monthly_rent: rent ? Number(rent) : null,
          monthly_income: Number(income),
          on_time_payments: totalPayments ? Number(onTimePayments || 0) : null,
          total_payments: totalPayments ? Number(totalPayments) : null,
          income_evidence: incomeEvidence,
          rental_reference: rentalReference,
          bvn: bvn || null,
          consent,
        }) },
        false,
      );
      setScore(result.score);
      setCheckStatus(result.check_status);
      setDone(true);
    } catch (requestError) {
      setError(formatScreeningError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="min-h-screen bg-slate-50 px-4 py-10 font-sans">
    <div className="mx-auto max-w-2xl">
      <header className="mb-6 flex items-center gap-3"><div className="rounded-xl bg-blue-800 p-2 text-white"><ShieldCheck className="h-5 w-5" /></div><div><div className="font-black text-slate-900">TenTrust</div><div className="text-xs text-slate-500">Tenant screening</div></div><span className="ml-auto rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800">Private screening link</span></header>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="brand-banner-art px-6 py-7 text-white md:px-9"><h1 className="text-2xl font-extrabold">Complete your tenant screening</h1>{screening && <p className="mt-2 text-sm text-blue-100">Requested for <strong>{screening.property_title}</strong> · {screening.package.name}</p>}</div>
        <div className="p-6 md:p-9">
          {loading && <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-600"><LoaderCircle className="h-5 w-5 animate-spin" />Checking this private link…</div>}
          {!loading && error && !screening && <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><XCircle className="h-5 w-5 shrink-0" />{error}<Link className="ml-auto font-bold underline" to="/">Home</Link></div>}
          {error && screening && <div role="alert" className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><XCircle className="h-5 w-5 shrink-0" />{error}</div>}

          {screening && !done && <>
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-900"><Info className="mt-0.5 h-4 w-4 shrink-0" /><span>TenTrust calculates a transparent advisory score from rental affordability, rental-payment history, and evidence completeness. Identity and credit checks are shown separately.</span></div>
            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelClass}>Full name *</label><input required minLength={2} value={fullName} onChange={(event) => setFullName(event.target.value)} className={inputClass} autoComplete="name" /></div>
                <div><label className={labelClass}>Phone *</label><input required value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} autoComplete="tel" /></div>
                <div><label className={labelClass}>Email (optional)</label><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} autoComplete="email" /></div>
                <div><label className={labelClass}>Monthly rent (₦) *</label><input required type="number" min="1" value={rent} onChange={(event) => setRent(event.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Monthly income (₦) *</label><input required type="number" min="1" value={income} onChange={(event) => setIncome(event.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>On-time rent payments (past 12)</label><input type="number" min="0" max="12" value={onTimePayments} onChange={(event) => setOnTimePayments(event.target.value)} className={inputClass} placeholder="Optional" /></div>
                <div><label className={labelClass}>Total rent payments (past 12)</label><input type="number" min="0" max="12" value={totalPayments} onChange={(event) => setTotalPayments(event.target.value)} className={inputClass} placeholder="Optional" /></div>
              </div>

              {needsBvn && <div><label className={labelClass}>11-digit BVN *</label><input required inputMode="numeric" maxLength={11} value={bvn} onChange={(event) => setBvn(event.target.value.replace(/\D/g, ''))} className={inputClass} placeholder="Used only to request the included provider check" /><p className="mt-1 text-[11px] text-slate-500">Your BVN is sent to the verification provider for this request and is not kept in the screening record.</p></div>}

              <div className="grid gap-3 sm:grid-cols-2"><label className="flex items-start gap-2 rounded-xl border border-slate-200 p-3 text-xs text-slate-700"><input type="checkbox" checked={incomeEvidence} onChange={(event) => setIncomeEvidence(event.target.checked)} className="mt-0.5 accent-blue-700" />I can provide income evidence</label><label className="flex items-start gap-2 rounded-xl border border-slate-200 p-3 text-xs text-slate-700"><input type="checkbox" checked={rentalReference} onChange={(event) => setRentalReference(event.target.checked)} className="mt-0.5 accent-blue-700" />A rental reference is available</label></div>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-xs leading-5 text-slate-700"><input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 accent-blue-700" /><span>I authorize TenTrust to process the information I provide for this rental screening, including the checks listed in the selected package. I understand the readiness score is advisory, can be reviewed, and is not an automatic rental decision.</span></label>
              <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-4 text-sm font-bold text-white hover:bg-blue-900 disabled:cursor-wait disabled:opacity-50"><BadgeCheck className="h-4 w-4" />{submitting ? 'Submitting screening…' : 'Consent and submit screening'}</button>
            </form>
          </>}

          {done && score && <div className="space-y-5"><div className="text-center"><div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-8 w-8" /></div><h2 className="text-xl font-extrabold text-slate-900">Screening submitted</h2><p className="mt-1 text-sm text-slate-600">Your landlord can review the screening result.</p></div><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center"><div className="text-xs font-bold uppercase tracking-wide text-emerald-800">{score.label}</div><div className="mt-1 text-5xl font-black text-emerald-800">{score.score}<span className="text-lg"> / 100</span></div><div className="mt-2 text-xs font-semibold capitalize text-emerald-800">{score.confidence} confidence · {score.evidence_coverage}% evidence</div><p className="mt-3 text-xs leading-5 text-emerald-950">{score.disclaimer}</p></div><div className="grid gap-3 sm:grid-cols-2">{score.factors.map((factor) => <div key={factor.key} className="rounded-xl border border-slate-200 p-4"><div className="flex justify-between gap-2 text-sm font-semibold"><span>{factor.label}</span><span>{factor.score}/100</span></div><p className="mt-1 text-xs text-slate-500">Weight {Math.round(factor.weight * 100)}%</p></div>)}</div>{Object.keys(checkStatus).length > 0 && <div className="rounded-xl border border-slate-200 p-4"><h3 className="mb-2 text-sm font-bold">Identity and credit checks</h3>{Object.entries(checkStatus).map(([key, status]) => <div key={key} className="flex justify-between border-t border-slate-100 py-2 text-xs capitalize"><span>{key.replaceAll('_', ' ')}</span><span className="font-semibold">{status}</span></div>)}</div>}<p className="text-center text-xs leading-5 text-slate-500">Your readiness score is advisory and does not automatically approve or reject a rental application.</p></div>}
        </div>
      </section>
      <p className="mt-4 text-center text-[11px] text-slate-500">This private link expires after seven days or successful submission.</p>
    </div>
  </main>;
}
