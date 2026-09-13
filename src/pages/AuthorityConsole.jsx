import { CheckCheck, ClipboardList, Search, ShieldAlert, Building2, Phone, ArrowUpRight, FileText, CheckCircle2, Flame, Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'
import { categories, statuses } from '../utils/issues'
import { use3DTilt } from '../hooks/use3DTilt'

function KpiCard3D({ label, value, subtext, alert = false, icon: Icon }) {
  const tilt = use3DTilt(6, 800)
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={tilt.style}
      className={`card-3d-wrapper rounded-xl border p-5 shadow-sm bg-white ${
        alert ? 'border-rose-300' : 'border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between text-slate-500 mb-1">
        <span className="font-mono text-[11px] uppercase font-bold tracking-wider">{label}</span>
        {Icon && <Icon size={16} className={alert ? 'text-rose-600' : 'text-slate-400'} />}
      </div>
      <div className={`font-display text-2xl sm:text-3xl font-black ${alert ? 'text-rose-700' : 'text-slate-900'} layer-z-2 mt-1`}>
        {value}
      </div>
      <span className="text-[11px] text-slate-500 font-medium block mt-1">{subtext}</span>
    </div>
  )
}

export default function AuthorityConsole({ issues, onUpdate }) {
  const [filters, setFilters] = useState({ severity: 'All', category: 'All', status: 'All' })
  const [search, setSearch] = useState('')
  const [notes, setNotes] = useState({})

  const criticalIssues = useMemo(() => issues.filter(i => i.severity === 'Critical' && i.status !== 'Resolved'), [issues])
  const assignedCount = useMemo(() => issues.filter(i => i.status === 'Assigned' || i.status === 'In Progress').length, [issues])
  const resolvedCount = useMemo(() => issues.filter(i => i.status === 'Resolved').length, [issues])

  const filtered = useMemo(() =>
    issues.filter((issue) => {
      const matchesSearch = `${issue.title} ${issue.location} ${issue.department} ${issue.id}`.toLowerCase().includes(search.toLowerCase())
      const matchesSev = filters.severity === 'All' || issue.severity === filters.severity
      const matchesCat = filters.category === 'All' || issue.category === filters.category
      const matchesStat = filters.status === 'All' || issue.status === filters.status
      return matchesSearch && matchesSev && matchesCat && matchesStat
    }).sort((a, b) => b.urgencyScore - a.urgencyScore),
    [issues, filters, search]
  )

  const handleQuickDispatch = (issueId) => {
    onUpdate(issueId, { status: 'In Progress' })
  }

  const handleQuickResolve = (issueId) => {
    onUpdate(issueId, { status: 'Resolved' })
  }

  return (
    <main className="shell py-10 sm:py-14">
      {/* Official Operations Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1 font-mono text-xs font-bold text-slate-800 shadow-sm mb-3">
            <Building2 size={14} className="text-govblue" />
            BBMP ASSISTANT EXECUTIVE ENGINEER (AEE) DISPATCH CONSOLE
          </div>
          <h1 className="heading text-3xl sm:text-4xl text-slate-900 font-black">
            Municipal Grievance Operations Terminal
          </h1>
          <p className="font-kannada text-sm font-semibold text-slate-700 mt-1">
            ಬಿಬಿಎಂಪಿ ಸಹಾಯಕ ಕಾರ್ಯಪಾಲಕ ಎಂಜಿನಿಯರ್ ಕಾರ್ಯಾಚರಣೆ ನಿಯಂತ್ರಣ ಕೊಠಡಿ
          </p>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
            Statutory municipal workflow console for Bruhat Bengaluru Mahanagara Palike and BWSSB engineering divisions. Assign field repair squads, monitor resolution SLAs, and record completion certificates.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3.5 py-2 rounded-lg">
          <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>BBMP Zonal Node &bull; 198 Wards Synced</span>
        </div>
      </div>

      {/* 4 Operations KPI Pods */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        <KpiCard3D
          label="Critical Safety Queue"
          value={criticalIssues.length}
          subtext="Urgent 24h SLA Breaches"
          alert={true}
          icon={Flame}
        />
        <KpiCard3D
          label="Active Field Squads"
          value={assignedCount}
          subtext="Contractors On-Ground"
          icon={Wrench}
        />
        <KpiCard3D
          label="Certified Restored"
          value={resolvedCount}
          subtext="Inspection Closed (7 Days)"
          icon={CheckCheck}
        />
        <KpiCard3D
          label="Total Municipal Load"
          value={issues.length}
          subtext="Registered Inquiries"
          icon={FileText}
        />
      </div>

      {/* Urgent Hazard Priority Banner */}
      {criticalIssues.length > 0 && (
        <div className="mb-8 rounded-xl border-2 border-rose-300 bg-rose-50 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert size={24} className="text-rose-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display font-bold text-base text-rose-950">
                  {criticalIssues.length} High-Risk Hazardous Conditions Require Immediate Executive Work Order
                </h3>
                <p className="text-xs text-rose-800 mt-0.5">
                  High-traffic cratering or water pipeline fractures flagged by automated AI triage with scores &ge; 85/100.
                </p>
              </div>
            </div>
            <button
              onClick={() => setFilters(prev => ({ ...prev, severity: 'Critical' }))}
              className="btn-primary !bg-rose-700 hover:!bg-rose-800 text-xs font-bold shrink-0"
            >
              Filter Critical Queue &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="rounded-xl border border-slate-300 bg-white p-5 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Docket ID, location, department, or street name…"
              className="input pl-10 text-xs font-sans"
            />
          </div>

          <select
            value={filters.severity}
            onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
            className="input sm:w-44 text-xs font-semibold text-slate-700"
          >
            <option value="All">All Priority Levels</option>
            <option value="Critical">Critical Priority</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="input sm:w-44 text-xs font-semibold text-slate-700"
          >
            <option value="All">All Milestones</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Triage Matrix Table */}
      <div className="rounded-xl border border-slate-300 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-mono uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">Docket ID</th>
                <th className="py-3.5 px-4 font-bold">Grievance &amp; Location</th>
                <th className="py-3.5 px-4 font-bold">Urgency Index</th>
                <th className="py-3.5 px-4 font-bold">Assigned Division</th>
                <th className="py-3.5 px-4 font-bold">Municipal Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Work Order Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {issue.id}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-display font-bold text-slate-900 text-sm line-clamp-1">{issue.title}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{issue.location}</p>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{issue.urgencyScore}/100</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        issue.severity === 'Critical' ? 'bg-rose-100 text-rose-900 border-rose-300 font-bold' :
                        issue.severity === 'High' ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' :
                        'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {issue.severity}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                    {issue.department || 'BBMP Engineering'}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <select
                      value={issue.status}
                      onChange={(e) => onUpdate(issue.id, { status: e.target.value })}
                      className="input !py-1 !px-2 text-xs font-bold"
                    >
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {issue.status !== 'Resolved' ? (
                      <button
                        onClick={() => handleQuickDispatch(issue.id)}
                        className="btn-secondary !py-1 !px-2.5 text-xs font-bold text-govblue border-govblue/40"
                      >
                        Dispatch Crew
                      </button>
                    ) : (
                      <span className="text-emerald-800 font-bold text-xs flex items-center justify-end gap-1 font-mono">
                        <CheckCircle2 size={13} /> Certified Closed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
