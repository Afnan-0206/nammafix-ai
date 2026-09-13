import { CheckCircle2, MapPin, Share2, Users, ArrowUpRight, ShieldAlert, FileText } from 'lucide-react'
import { formatDate } from '../utils/issues'
import { use3DTilt } from '../hooks/use3DTilt'

function statusBadgeClass(status) {
  switch (status) {
    case 'Resolved':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300'
    case 'In Progress':
      return 'bg-blue-100 text-blue-900 border-blue-300'
    case 'Verified':
      return 'bg-indigo-100 text-indigo-900 border-indigo-300'
    default:
      return 'bg-amber-100 text-amber-900 border-amber-300'
  }
}

function priorityBadgeClass(severity) {
  switch (severity) {
    case 'Critical':
      return 'bg-rose-100 text-rose-900 border-rose-300 font-bold'
    case 'High':
      return 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300'
  }
}

export default function IssueCard({ issue, onVerify, onView, onShare, compact = false, animationIndex = 0 }) {
  const area = issue.area || issue.location.split(',').at(-1)?.trim() || issue.location
  const tilt = use3DTilt(8, 1000)

  const verify = (event) => {
    event.stopPropagation()
    onVerify(issue.id)
  }

  return (
    <article
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={tilt.style}
      className="card-3d-wrapper rounded-xl border border-slate-300 bg-white shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-400"
    >
      <div>
        {/* Official Header Strip */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between layer-z-1">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-amber-400">
            <FileText size={13} />
            <span>{issue.id}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${priorityBadgeClass(issue.severity)}`}>
              {issue.severity}
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${statusBadgeClass(issue.status)}`}>
              {issue.status}
            </span>
          </div>
        </div>

        {/* Real Civic Evidence Photograph */}
        {issue.image && (
          <div
            className="relative h-40 w-full bg-slate-900 overflow-hidden cursor-pointer group"
            onClick={() => onView(issue.id)}
          >
            <img
              src={issue.image}
              alt={issue.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/90 border border-emerald-500/40 text-[9px] font-mono font-semibold text-emerald-300 flex items-center gap-1.5 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              AUTHENTIC BBMP FIELD EVIDENCE
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2 layer-z-2">
            <h3
              onClick={() => onView(issue.id)}
              className="font-display font-bold text-base text-slate-900 leading-snug line-clamp-2 hover:text-govblue cursor-pointer transition"
            >
              {issue.title}
            </h3>
            {onShare && (
              <button
                onClick={(e) => { e.stopPropagation(); onShare(issue); }}
                className="shrink-0 p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition"
                title="Share official grievance docket"
                aria-label="Share official grievance docket"
              >
                <Share2 size={15} />
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex rounded bg-slate-100 border border-slate-200 px-2 py-0.5 font-medium text-slate-700">
              {issue.category}
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <MapPin size={13} className="text-govblue shrink-0" />
              <span className="truncate max-w-[170px] font-medium">{area}</span>
            </span>
          </div>

          {/* Department & Urgency SLA Bar */}
          {!compact && (
            <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-2.5 layer-z-1">
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span className="font-bold text-slate-600 uppercase">Urgency Score</span>
                <span className="font-bold text-slate-900">{issue.urgencyScore} / 100</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    issue.urgencyScore >= 80 ? 'bg-rose-600' : issue.urgencyScore >= 60 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${issue.urgencyScore}%` }}
                />
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Dept: <strong className="text-slate-700">{issue.department || 'BBMP'}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Details & Verification Action */}
      <div className="border-t border-slate-200 bg-slate-50/80 p-4 pt-3 layer-z-1">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-3 font-mono">
          <span className="flex items-center gap-1.5 font-bold text-emerald-800">
            <Users size={13} className="text-emerald-700" />
            <span>{issue.verifications} Verifications</span>
          </span>
          <span className="text-[11px] text-slate-500">
            {formatDate(issue.createdAt)}
          </span>
        </div>

        {!compact && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={verify}
              className="btn-secondary text-xs !py-2 flex items-center justify-center gap-1 font-bold"
            >
              <CheckCircle2 size={14} className="text-emerald-700" /> Verify
            </button>
            <button
              onClick={() => onView(issue.id)}
              className="btn-primary text-xs !py-2 flex items-center justify-center gap-1 font-bold"
            >
              Inspect <ArrowUpRight size={14} />
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
