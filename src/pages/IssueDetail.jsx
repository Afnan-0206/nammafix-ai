import { AlertTriangle, ArrowLeft, CheckCircle2, ClipboardCheck, Clock3, MapPin, ShieldAlert, Users, FileText, Building2, Printer } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { formatDate, statuses } from '../utils/issues'
import { use3DTilt } from '../hooks/use3DTilt'

export default function IssueDetail({ issues, onVerify, onUpdate }) {
  const { issueId } = useParams()
  const issue = issues.find((item) => item.id === issueId)
  const tilt = use3DTilt(6, 1000)

  if (!issue) return (
    <main className="shell py-20 text-center">
      <div className="mx-auto max-w-md p-8 rounded-xl border border-slate-300 bg-white shadow-sm">
        <h1 className="heading text-2xl font-bold text-slate-900">Official Docket Not Found</h1>
        <p className="text-sm text-slate-500 mt-2">
          This municipal grievance record may have been consolidated, resolved, or archived.
        </p>
        <Link className="btn-primary mt-6 text-xs font-bold" to="/dashboard">
          Return to Grievance Registry
        </Link>
      </div>
    </main>
  )

  const currentStep = statuses.indexOf(issue.status)

  return (
    <main className="shell max-w-6xl py-10 sm:py-14">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-600 hover:text-govblue transition"
        >
          <ArrowLeft size={16} /> RETURN TO PUBLIC WARD REGISTRY
        </Link>

        <button
          onClick={() => window.print()}
          className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5 font-bold"
        >
          <Printer size={14} /> Print Docket Record
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        {/* Left Column: Case Record & AI Inspection */}
        <section className="space-y-6">
          <div className="rounded-xl border border-slate-300 bg-white shadow-sm overflow-hidden">
            {issue.image && (
              <img src={issue.image} alt={issue.title} className="h-64 sm:h-80 w-full object-cover" />
            )}

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded">
                  {issue.id}
                </span>
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                  issue.severity === 'Critical' ? 'bg-rose-100 text-rose-900 border-rose-300' :
                  issue.severity === 'High' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                  'bg-slate-100 text-slate-800 border-slate-300'
                }`}>
                  {issue.severity} Priority
                </span>
                <span className="text-xs font-mono font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded">
                  {issue.status}
                </span>
              </div>

              <h1 className="heading mt-4 text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {issue.title}
              </h1>

              <div className="mt-3 flex items-start gap-2 text-sm text-slate-700 font-medium">
                <MapPin size={17} className="text-govblue shrink-0 mt-0.5" />
                <span>{issue.location}</span>
              </div>

              <p className="mt-4 text-sm sm:text-base text-slate-700 leading-relaxed">
                {issue.description}
              </p>

              <div className="mt-6 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">Department</span>
                  <span className="font-bold text-govblue mt-0.5 block">{issue.department}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">Date Filed</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{formatDate(issue.createdAt)}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">Verifications</span>
                  <span className="font-bold text-emerald-800 mt-0.5 flex items-center gap-1">
                    <Users size={14} /> {issue.verifications} Endorsements
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Municipal Analysis */}
          <section className="rounded-xl border border-slate-300 bg-white p-6 sm:p-8 shadow-sm">
            <span className="font-mono text-xs font-bold text-govblue uppercase tracking-wider block mb-1">
              Automated Triage Assessment
            </span>
            <h2 className="heading text-xl font-bold text-slate-900">
              Statutory Civil Engineering Brief
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {issue.ai?.complaintSummary || issue.description}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <Clock3 size={16} className="text-govblue mb-1" />
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">Statutory Resolution SLA</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{issue.ai?.estimatedResolutionTime || 'Within 48 Hours'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <ClipboardCheck size={16} className="text-emerald-700 mb-1" />
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">Duplicate Cluster Signals</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{issue.ai?.duplicateKeywords?.join(' &bull; ') || 'None Detected'}</span>
              </div>
            </div>

            {/* Action Plan */}
            <div className="mt-5 pt-4 border-t border-slate-200">
              <span className="font-mono text-xs font-bold uppercase text-slate-700 block mb-3">
                BBMP Engineering Standard Action Protocol:
              </span>
              <div className="space-y-2 text-xs text-slate-700">
                {issue.ai?.actionPlan?.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-md border border-slate-200">
                    <span className="font-mono text-govblue font-bold">0{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </section>

        {/* Right Column: Urgency Meter, Timeline & Actions */}
        <aside className="space-y-5">
          {/* Urgency Meter */}
          <section className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold uppercase text-slate-600">Urgency Severity Score</span>
              <span className="font-mono text-xs font-bold text-slate-900">{issue.urgencyScore} / 100</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  issue.urgencyScore >= 80 ? 'bg-rose-600' : issue.urgencyScore >= 60 ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${issue.urgencyScore}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-500 font-mono">
              SLA Category: <strong className="text-slate-800">{issue.urgencyScore >= 80 ? 'Immediate 24h Work Order' : 'Standard 48h Maintenance'}</strong>
            </p>
          </section>

          {/* Statutory Milestone Timeline */}
          <section className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm">
            <span className="font-mono text-xs font-bold uppercase text-slate-600 block mb-4">
              Resolution Milestone Timeline
            </span>
            <div className="space-y-4 text-xs">
              {statuses.map((status, index) => (
                <div className="flex items-start gap-3" key={status}>
                  <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center border-2 shrink-0 ${
                    index <= currentStep ? 'bg-civic border-civic text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {index <= currentStep && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className={`font-bold ${index <= currentStep ? 'text-slate-900' : 'text-slate-500'}`}>
                      {status}
                    </span>
                    {index === currentStep && (
                      <p className="font-mono text-[10px] text-amber-700 font-bold mt-0.5">
                        &bull; Active Administrative Stage
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Verification Box */}
          <section className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm">
            <span className="font-mono text-xs font-bold uppercase text-slate-600 block mb-1">
              Public Citizen Endorsement
            </span>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Citizen verifications prevent frivolous reporting and escalate urgent community priorities to ward engineers.
            </p>
            <button
              onClick={() => onVerify(issue.id)}
              className="btn-primary w-full text-xs font-bold !py-3 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} /> Endorse Issue ({issue.verifications})
            </button>
          </section>

          {/* Administrative Dispatch Box */}
          <section className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm">
            <span className="font-mono text-xs font-bold uppercase text-slate-600 block mb-1">
              BBMP Municipal Officer Dispatch
            </span>
            <label className="block text-xs font-bold text-slate-700 mt-2">
              Update Administrative Status
              <select
                value={issue.status}
                onChange={(e) => onUpdate(issue.id, { status: e.target.value })}
                className="input mt-1.5 text-xs font-bold"
              >
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </section>
        </aside>
      </div>
    </main>
  )
}
