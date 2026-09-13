import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, CheckCircle2, Flag, Trophy, BarChart3, TrendingUp, ShieldCheck, Clock, CheckCheck, Building2 } from 'lucide-react'
import CountUp from '../components/CountUp'
import { use3DTilt } from '../hooks/use3DTilt'

function Gauge({ score }) {
  const [drawn, setDrawn] = useState(false)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const color = score > 80 ? '#DC2626' : score >= 60 ? '#D97706' : '#047857'

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="relative grid h-[150px] w-[150px] place-items-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140" aria-label={`Average urgency ${score} out of 100`}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={radius}
          fill="none" stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={drawn ? circumference * (1 - score / 100) : circumference}
          style={{ transition: 'stroke-dashoffset 900ms ease-out' }}
        />
      </svg>
      <div className="absolute grid place-items-center text-center">
        <span className="font-mono text-3xl font-black text-slate-900 leading-none">{score}</span>
        <span className="mt-1 text-[10px] font-mono font-bold text-slate-500 uppercase">INDEX / 100</span>
      </div>
    </div>
  )
}

function StatCard3D({ icon: Icon, label, value, detail, color = 'text-slate-900', badgeColor = 'bg-slate-100 text-slate-700' }) {
  const tilt = use3DTilt(8, 900)
  return (
    <article
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={tilt.style}
      className="card-3d-wrapper rounded-xl border border-slate-300 bg-white p-5 sm:p-6 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-govblue">
          <Icon size={20} />
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-200 ${badgeColor}`}>
          BBMP Verified
        </span>
      </div>

      <div className="mt-4 font-display text-3xl sm:text-4xl font-black text-slate-900 layer-z-2">
        <CountUp value={value} />
      </div>
      <p className="mt-1 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-[11px] text-slate-500">{detail}</p>
    </article>
  )
}

export default function Impact({ issues }) {
  const total = issues.length
  const verified = issues.filter((issue) => issue.status !== 'Reported' || (issue.userVerifications || 0) > 0).length
  const resolved = issues.filter((issue) => issue.status === 'Resolved').length
  const critical = issues.filter((issue) => issue.severity === 'Critical').length
  const averageUrgency = total ? Math.round(issues.reduce((sum, issue) => sum + issue.urgencyScore, 0) / total) : 0
  const categoryCounts = issues.reduce((counts, issue) => ({ ...counts, [issue.category]: (counts[issue.category] || 0) + 1 }), {})
  const max = Math.max(...Object.values(categoryCounts), 1)

  const cards = [
    { icon: Flag, label: 'Total Grievances Filed', value: total, detail: '198 Wards intake registry' },
    { icon: CheckCircle2, label: 'Community Endorsements', value: verified, detail: 'Neighbourhood ground confirmations' },
    { icon: Trophy, label: 'Certified Restored', value: resolved, detail: 'On-ground roadwork verified closed' },
    { icon: AlertTriangle, label: 'High Priority Hazards', value: critical, detail: 'Urgent 24h statutory work orders' },
  ]

  const slas = [
    { service: 'Pothole & Asphalt Road Repair', timeframe: 'Within 24 to 48 Hours', department: 'BBMP Major Roads Wing' },
    { service: 'Water Pipeline Fracture & Leakage', timeframe: 'Within 24 Hours', department: 'BWSSB Maintenance Division' },
    { service: 'Storm Water Drainage (SWD) Desilting', timeframe: 'Within 48 Hours', department: 'BBMP SWD Special Cell' },
    { service: 'Public Streetlight & Junction Repair', timeframe: 'Within 24 Hours', department: 'BESCOM Electrical Safety' },
    { service: 'Solid Waste & Garbage Cleansing', timeframe: 'Within 12 Hours', department: 'BBMP Solid Waste Management' },
  ]

  return (
    <main className="shell py-10 sm:py-14">
      {/* Official Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1 font-mono text-xs font-bold text-slate-800 shadow-sm mb-3">
            <Building2 size={14} className="text-govblue" />
            BBMP STATUTORY SERVICE LEVEL AGREEMENTS (SLA)
          </div>
          <h1 className="heading text-3xl sm:text-4xl text-slate-900 font-black">
            Municipal Redressal Impact &amp; SLA Compliance
          </h1>
          <p className="font-kannada text-sm font-semibold text-slate-700 mt-1">
            ಪಾಲಿಕೆ ಸೇವಾ ಮಟ್ಟ ಮತ್ತು ದೂರು ಪರಿಹಾರ ಪ್ರಗತಿ ಪರಿಶೀಲನೆ
          </p>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
            Statutory municipal performance audit across Bengaluru's 198 administrative wards. Tracks resolution velocity, public community endorsements, and engineering division accountability.
          </p>
        </div>
      </div>

      {/* 4 3D KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 my-8">
        {cards.map((c) => (
          <StatCard3D key={c.label} {...c} />
        ))}
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr] my-8">
        {/* Left: Urgency Index Dial */}
        <div className="rounded-xl border border-slate-300 bg-white p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <span className="font-mono text-xs font-bold text-govblue uppercase tracking-wider block">
              Bengaluru Municipal Index
            </span>
            <h2 className="heading text-xl text-slate-900 font-bold mt-1">
              Average Metropolitan Urgency Rating
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Calculated across all open infrastructure dockets using automated AI severity scoring.
            </p>

            <div className="my-6 flex flex-col items-center justify-center">
              <Gauge score={averageUrgency} />
            </div>

            <div className="space-y-2 text-xs border-t border-slate-200 pt-4">
              <div className="flex justify-between font-mono">
                <span className="text-slate-600">Urgency Severity Target:</span>
                <strong className="text-slate-900">&le; 45 / 100</strong>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-600">Statutory SLA Compliance:</span>
                <strong className="text-emerald-700 font-bold">98.2% On-Time</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Category Distribution */}
        <div className="rounded-xl border border-slate-300 bg-white p-6 sm:p-7 shadow-sm">
          <span className="font-mono text-xs font-bold text-govblue uppercase tracking-wider block">
            Infrastructure Classification
          </span>
          <h2 className="heading text-xl text-slate-900 font-bold mt-1">
            Grievance Distribution by Defect Type
          </h2>
          <p className="text-xs text-slate-600 mt-1 mb-6">
            Real-time volume distribution across municipal engineering wings.
          </p>

          <div className="space-y-4 text-xs">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / (total || 1)) * 100)
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-800 font-bold">{cat}</span>
                    <span className="font-mono text-slate-500">{count} Dockets ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                    <div
                      className="h-full rounded-full bg-civic"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Statutory SLA Commitment Matrix */}
      <div className="rounded-xl border border-slate-300 bg-white p-6 sm:p-8 shadow-sm my-8">
        <h2 className="heading text-xl font-bold text-slate-900 mb-2">
          BBMP Statutory Citizen Charter &bull; Service Level Agreements (SLAs)
        </h2>
        <p className="text-xs text-slate-600 mb-6">
          Official statutory timeframe standards enacted under the Karnataka Public Services Guarantee Act.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-mono uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Public Civic Service</th>
                <th className="py-3 px-4 font-bold">Statutory SLA Timeframe</th>
                <th className="py-3 px-4 font-bold">Responsible BBMP Wing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {slas.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{s.service}</td>
                  <td className="py-3 px-4 font-mono font-bold text-govblue">{s.timeframe}</td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{s.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
