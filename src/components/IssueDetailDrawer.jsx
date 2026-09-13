import { CheckCircle2, MapPin, Share2, X, FileText, Landmark, Clock, ShieldAlert } from 'lucide-react'
import { useEffect } from 'react'
import { formatDate, statuses } from '../utils/issues'

export default function IssueDetailDrawer({ issue, onClose, onVerify, onShare }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!issue) return null

  const stage = statuses.indexOf(issue.status)

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-none flex justify-end"
      onMouseDown={onClose}
    >
      <aside
        className="w-full max-w-lg bg-white h-full overflow-y-auto border-l border-slate-300 shadow-2xl p-6 sm:p-8 flex flex-col justify-between"
        role="dialog"
        aria-modal="true"
        aria-label={`Official Docket ${issue.id}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div>
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-govblue" />
              <span className="font-mono text-xs font-bold text-slate-800">{issue.id}</span>
              <span className="text-[10px] font-mono font-bold bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-slate-700">
                {issue.status}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {onShare && (
                <button
                  onClick={() => onShare(issue)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition"
                  title="Share docket link"
                >
                  <Share2 size={16} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Grievance Title & Metadata */}
          <h2 className="heading text-xl sm:text-2xl text-slate-900 font-extrabold mt-4 leading-snug">
            {issue.title}
          </h2>
          <p className="font-mono text-[11px] text-slate-500 mt-1">
            Registered: {formatDate(issue.createdAt)} &bull; Source: Citizen Mobile Portal
          </p>

          {/* Photo if available */}
          {issue.image && (
            <div className="mt-4 rounded-lg overflow-hidden border border-slate-200">
              <img src={issue.image} alt={issue.title} className="h-48 w-full object-cover" />
            </div>
          )}

          {/* AI Municipal Analysis Box */}
          <section className="mt-5 rounded-lg border border-slate-300 bg-slate-50 p-4">
            <div className="flex items-center justify-between font-mono text-xs font-bold mb-3">
              <span className="text-govblue flex items-center gap-1.5">
                <Landmark size={14} /> BBMP Automated Triage
              </span>
              <span className="text-slate-800 font-black">
                Urgency: {issue.urgencyScore} / 100
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Defect Classification</span>
                <span className="font-bold text-slate-900">{issue.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Assigned Department</span>
                <span className="font-bold text-govblue">{issue.department}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Resolution Timeframe</span>
                <span className="font-bold text-slate-900">{issue.ai?.estimatedResolutionTime || 'Within 48h'}</span>
              </div>
            </div>

            {/* Action Checklist */}
            <div className="mt-3 pt-3 border-t border-slate-200">
              <span className="font-mono text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                Standard Engineering Action Plan:
              </span>
              <ul className="space-y-1 text-xs text-slate-700">
                {issue.ai?.actionPlan?.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="font-mono text-govblue font-bold">0{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Location & Jurisdiction */}
          <section className="mt-5 text-xs text-slate-700">
            <span className="font-mono text-[11px] font-bold uppercase text-slate-500 block mb-1">
              Location &amp; Ward Boundary
            </span>
            <div className="flex items-start gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50">
              <MapPin size={16} className="text-govblue shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">{issue.location}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">BBMP Ward Jurisdiction: {issue.area || 'Bengaluru Ward'}</p>
              </div>
            </div>
          </section>

          {/* Resolution Timeline */}
          <section className="mt-6">
            <span className="font-mono text-[11px] font-bold uppercase text-slate-500 block mb-3">
              Statutory Redressal Milestones
            </span>
            <div className="space-y-3">
              {statuses.map((status, index) => (
                <div className="flex items-center gap-3 text-xs" key={status}>
                  <span className={`h-4 w-4 rounded-full flex items-center justify-center border-2 ${
                    index <= stage
                      ? 'bg-civic border-civic text-white'
                      : 'border-slate-300 bg-white'
                  }`}>
                    {index <= stage && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  <span className={`font-semibold ${index <= stage ? 'text-slate-900' : 'text-slate-500'}`}>
                    {status}
                  </span>
                  {index === stage && (
                    <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">
                      Current Milestone
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Verification Action Bottom */}
        <div className="pt-6 mt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-slate-600 font-bold">
              Citizen Validations: <strong className="text-slate-900">{issue.verifications}</strong>
            </span>
            <span className="text-emerald-800 font-bold">● Active Docket</span>
          </div>
          <button
            onClick={() => onVerify(issue.id)}
            className="btn-primary w-full text-xs font-bold !py-3 flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} /> Endorse &amp; Verify Issue Ground-Truth
          </button>
        </div>
      </aside>
    </div>
  )
}
