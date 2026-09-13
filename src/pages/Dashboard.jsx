import { Filter, Inbox, Search, SlidersHorizontal, ShieldAlert, CheckCircle2, Building2, X, FileText, CheckCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import IssueCard from '../components/IssueCard'
import IssueDetailDrawer from '../components/IssueDetailDrawer'
import { useToast } from '../components/Toast'
import { categories, statuses } from '../utils/issues'
import { use3DTilt } from '../hooks/use3DTilt'

const ZONES = [
  'All Zones',
  'Mahadevapura Zone (Whitefield, Bellandur, Varthur)',
  'Bommanahalli Zone (HSR Layout, Begur)',
  'East Zone (Indiranagar, Halasuru)',
  'West Zone (Malleshwaram, Rajajinagar)',
  'South Zone (Jayanagar, JP Nagar)',
  'Yelahanka Zone',
  'Dasarahalli Zone',
  'RR Nagar Zone',
]

function KpiCard3D({ label, value, subtext, color = 'text-slate-900', icon: Icon }) {
  const tilt = use3DTilt(6, 800)
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={tilt.style}
      className="card-3d-wrapper rounded-xl border border-slate-300 bg-white p-4 sm:p-5 shadow-sm"
    >
      <div className="flex items-center justify-between text-slate-500 mb-1">
        <span className="font-mono text-[11px] uppercase font-bold tracking-wider">{label}</span>
        {Icon && <Icon size={16} className="text-slate-400" />}
      </div>
      <div className={`font-display text-2xl sm:text-3xl font-black ${color} layer-z-2 mt-0.5`}>
        {value}
      </div>
      <span className="text-[11px] text-slate-500 font-medium block mt-1">{subtext}</span>
    </div>
  )
}

export default function Dashboard({ issues, onVerify }) {
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [filters, setFilters] = useState({ status: 'All', severity: 'All', category: 'All', zone: 'All Zones' })
  const [onlyCritical, setOnlyCritical] = useState(false)

  useEffect(() => {
    const shared = searchParams.get('report')
    if (shared) setSelected(issues.find((issue) => issue.id === shared) || null)
  }, [searchParams, issues])

  const criticalCount = useMemo(() => issues.filter(i => i.severity === 'Critical').length, [issues])
  const totalVerifications = useMemo(() => issues.reduce((sum, item) => sum + item.verifications, 0), [issues])
  const resolvedCount = useMemo(() => issues.filter(i => i.status === 'Resolved').length, [issues])

  const filtered = useMemo(() =>
    issues.filter((issue) => {
      const haystack = `${issue.title} ${issue.location} ${issue.area || ''} ${issue.category} ${issue.id}`.toLowerCase()
      const matchesQuery = haystack.includes(query.toLowerCase())
      const matchesStatus = filters.status === 'All' || issue.status === filters.status
      const matchesSeverity = onlyCritical ? issue.severity === 'Critical' : (filters.severity === 'All' || issue.severity === filters.severity)
      const matchesCategory = filters.category === 'All' || issue.category === filters.category
      const matchesZone = filters.zone === 'All Zones' || (issue.location && issue.location.toLowerCase().includes(filters.zone.split(' ')[0].toLowerCase()))
      return matchesQuery && matchesStatus && matchesSeverity && matchesCategory && matchesZone
    }).sort((a, b) => b.urgencyScore - a.urgencyScore),
    [issues, query, filters, onlyCritical]
  )

  const open = (id) => {
    const issue = issues.find((item) => item.id === id)
    setSelected(issue || null)
  }

  const close = () => {
    setSelected(null)
    if (searchParams.get('report')) setSearchParams({})
  }

  const share = async (issue) => {
    const url = new URL(window.location.href)
    url.pathname = '/dashboard'
    url.searchParams.set('report', issue.id)
    try {
      await navigator.clipboard.writeText(url.toString())
      showToast({ type: 'success', title: 'Docket link copied', body: `Share official docket ${issue.id} with neighbours.` })
    } catch {
      showToast({ type: 'info', title: 'Docket link', body: url.toString() })
    }
  }

  const resetFilters = () => {
    setFilters({ status: 'All', severity: 'All', category: 'All', zone: 'All Zones' })
    setOnlyCritical(false)
    setQuery('')
  }

  return (
    <main className="shell py-10 sm:py-14">
      {/* Header with Title and Bilingual Text */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1 font-mono text-xs font-bold text-slate-800 shadow-sm mb-3">
            <Building2 size={14} className="text-govblue" />
            BBMP PUBLIC CITIZEN REGISTRY &bull; 198 WARDS
          </div>
          <h1 className="heading text-3xl sm:text-4xl text-slate-900 font-extrabold">
            Public Ward Grievance Registry
          </h1>
          <p className="font-kannada text-sm font-semibold text-slate-600 mt-1">
            ಸಾರ್ವಜನಿಕ ವಾರ್ಡ್ ದೂರು ನೋಂದಣಿ ಮತ್ತು ಪ್ರಗತಿ ಪರಿಶೀಲನೆ
          </p>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
            Live public ledger of municipal grievances filed across Bruhat Bengaluru Mahanagara Palike. Track docket triage stages, contractor assignments, and citizen verifications in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOnlyCritical(!onlyCritical)}
            className={`px-4 py-2 rounded-lg font-display text-xs font-bold border transition flex items-center gap-1.5 shadow-sm ${
              onlyCritical
                ? 'bg-rose-700 text-white border-rose-800'
                : 'bg-white border-rose-300 text-rose-800 hover:bg-rose-50'
            }`}
          >
            <ShieldAlert size={14} />
            {onlyCritical ? 'Showing Urgent Hazards Only' : `Filter Urgent Hazards (${criticalCount})`}
          </button>
        </div>
      </div>

      {/* 4 3D KPI Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        <KpiCard3D
          label="Total Grievances"
          value={issues.length}
          subtext="Active Municipal Dockets"
          icon={FileText}
        />
        <KpiCard3D
          label="Citizen Verifications"
          value={totalVerifications}
          subtext="Community Sign-offs"
          color="text-emerald-700"
          icon={CheckCircle2}
        />
        <KpiCard3D
          label="Certified Resolved"
          value={resolvedCount}
          subtext="Completed Roadworks"
          color="text-govblue"
          icon={CheckCheck}
        />
        <KpiCard3D
          label="Critical Hazards"
          value={criticalCount}
          subtext="Immediate Safety Alerts"
          color="text-rose-700"
          icon={ShieldAlert}
        />
      </div>

      {/* Search and Filter Controls */}
      <div className="rounded-xl border border-slate-300 bg-white p-5 shadow-sm mb-8 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Docket ID (e.g. BBMP-GRV-...), location, street name, or defect type..."
              className="input pl-10 text-sm font-sans"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Zone Selector */}
          <select
            value={filters.zone}
            onChange={(e) => setFilters(prev => ({ ...prev, zone: e.target.value }))}
            className="input md:w-64 text-xs font-semibold text-slate-700"
          >
            {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
          </select>

          {/* Category Selector */}
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="input md:w-48 text-xs font-semibold text-slate-700"
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-slate-500 uppercase mr-2">
              Status Filter:
            </span>
            {['All', ...statuses].map((status) => (
              <button
                key={status}
                onClick={() => setFilters(prev => ({ ...prev, status }))}
                className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                  filters.status === status
                    ? 'bg-civic text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status === 'All' ? 'All Dockets' : status}
              </button>
            ))}
          </div>

          {(filters.status !== 'All' || filters.category !== 'All' || filters.zone !== 'All Zones' || onlyCritical || query) && (
            <button
              onClick={resetFilters}
              className="text-xs font-mono font-bold text-govblue hover:underline flex items-center gap-1"
            >
              <X size={13} /> Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Grievance Docket Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((issue, idx) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onVerify={onVerify}
              onView={open}
              onShare={share}
              animationIndex={idx}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-300 bg-white p-12 text-center">
          <Inbox size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="heading text-xl text-slate-800 font-bold">No Grievances Match Your Search</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Try resetting your search query, selecting "All Zones", or clearing the active filters.
          </p>
          <button onClick={resetFilters} className="btn-primary text-xs font-bold mt-4">
            Reset Filters
          </button>
        </div>
      )}

      {/* Slide-over Inspection Drawer */}
      <IssueDetailDrawer
        issue={selected}
        onClose={close}
        onVerify={onVerify}
      />
    </main>
  )
}
