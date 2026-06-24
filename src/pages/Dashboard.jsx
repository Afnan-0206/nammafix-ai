import { Filter, Inbox, Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import IssueCard from '../components/IssueCard'
import IssueDetailDrawer from '../components/IssueDetailDrawer'
import ActivityTicker from '../components/ActivityTicker'
import { useToast } from '../components/Toast'
import { categories, statuses } from '../utils/issues'

export default function Dashboard({ issues, onVerify }) {
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [filters, setFilters] = useState({ status: 'All', severity: 'All', category: 'All' })

  useEffect(() => {
    const shared = searchParams.get('report')
    if (shared) setSelected(issues.find((issue) => issue.id === shared) || null)
  }, [searchParams, issues])

  const filtered = useMemo(() =>
    issues.filter((issue) => {
      const haystack = `${issue.title} ${issue.location} ${issue.area || ''} ${issue.category}`.toLowerCase()
      return haystack.includes(query.toLowerCase())
        && (filters.status === 'All' || issue.status === filters.status)
        && (filters.severity === 'All' || issue.severity === filters.severity)
        && (filters.category === 'All' || issue.category === filters.category)
    }).sort((a, b) => b.urgencyScore - a.urgencyScore),
    [issues, query, filters]
  )

  const select = (key, values) => (
    <select
      aria-label={`Filter by ${key}`}
      className="filter-select"
      value={filters[key]}
      onChange={(event) => setFilters({ ...filters, [key]: event.target.value })}
    >
      <option>All</option>
      {values.map((value) => <option key={value}>{value}</option>)}
    </select>
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
      showToast({ type: 'success', title: 'Link copied to clipboard', body: `Share ${issue.id} with your demo audience.` })
    } catch {
      showToast({ type: 'info', title: 'Share link ready', body: url.toString() })
    }
  }

  return (
    <main className="shell py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="section-label"><Inbox size={14} />Local report workspace</p>
          <h1 className="heading text-3xl sm:text-[32px]">Issue dashboard</h1>
          <p className="muted mt-2">Your local workspace. Reports live in this browser — not with any authority.</p>
        </div>
        <div className="rounded-full border border-amber/35 bg-amber/10 px-4 py-2.5 text-right">
          <p className="data-mono text-[11px] font-bold uppercase tracking-wider text-amber">Demo browser count</p>
          <p className="data-mono mt-1 text-lg font-bold text-amber">{issues.reduce((sum, item) => sum + item.verifications, 0)} verifications</p>
        </div>
      </div>

      <section className="panel mt-8 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
            <input
              className="input !py-2.5 pl-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search place, issue or category…"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="hidden text-civic sm:block" size={17} />
            {select('status', statuses)}
            {select('severity', ['Low', 'Medium', 'High', 'Critical'])}
            {select('category', categories)}
          </div>
        </div>
      </section>

      <ActivityTicker />

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-400">
          <Filter className="mr-1 inline" size={15} />
          Showing <b className="text-slate-200">{filtered.length}</b> reports
        </p>
        {Object.values(filters).some((value) => value !== 'All') && (
          <button
            onClick={() => setFilters({ status: 'All', severity: 'All', category: 'All' })}
            className="text-sm font-semibold text-civic hover:text-white"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((issue, index) => (
            <IssueCard animationIndex={index} key={issue.id} issue={issue} onVerify={onVerify} onView={open} onShare={share} />
          ))}
        </div>
      ) : (
        <div className="panel mt-5 py-16 text-center">
          <Search className="mx-auto text-slate-600" size={32} />
          <h2 className="mt-4 text-lg font-bold">No reports match that filter</h2>
          <p className="muted mt-1">Try a different area or category, or clear all filters.</p>
        </div>
      )}

      {selected && (
        <IssueDetailDrawer issue={selected} onClose={close} onVerify={onVerify} onShare={share} />
      )}
    </main>
  )
}
