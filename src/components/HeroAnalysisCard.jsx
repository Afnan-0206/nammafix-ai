import { Landmark, MapPin, Tags, CheckCircle2, ShieldAlert, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { use3DTilt } from '../hooks/use3DTilt'

const samples = [
  {
    docket: 'BBMP-GRV-2026-8819',
    title: 'Severe cratering on Whitefield Main Road junction',
    location: 'Ward 84 (Hagadur), Whitefield Main Rd at Agara Farm',
    category: 'Road Infrastructure · Crater / Pothole',
    department: 'BBMP Major Roads & Infrastructure Wing',
    score: 94,
    sla: 'Within 24 Hours (Urgent Hazard)',
    verified: 72,
    officer: 'AEE Sri. R. Venkatesh',
  },
  {
    docket: 'BBMP-GRV-2026-8820',
    title: 'Underground water pipeline fracture & surface leakage',
    location: 'Ward 150 (Bellandur), Outer Ring Road Service Lane',
    category: 'Water Supply / Pipeline Leakage',
    department: 'BWSSB East Maintenance Division',
    score: 82,
    sla: 'Within 48 Hours',
    verified: 46,
    officer: 'Assistant Engineer Smt. Anitha',
  },
  {
    docket: 'BBMP-GRV-2026-8821',
    title: 'Uncovered storm water drainage slab near market',
    location: 'Ward 149 (Varthur), Market Main Road entrance',
    category: 'Storm Water Drainage (SWD)',
    department: 'BBMP SWD Special Division',
    score: 89,
    sla: 'Within 24 Hours (Safety Hazard)',
    verified: 58,
    officer: 'Ward Superintendent K. Kumar',
  },
]

function TypeText({ text, delay, speed, run }) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    let interval
    const timer = setTimeout(() => {
      let index = 0
      interval = setInterval(() => {
        index += 1
        setShown(text.slice(0, index))
        if (index >= text.length) clearInterval(interval)
      }, speed)
    }, delay)
    return () => { clearTimeout(timer); clearInterval(interval) }
  }, [text, delay, speed, run])
  return <>{shown}</>
}

function CountScore(target, run) {
  const [score, setScore] = useState(0)
  useEffect(() => {
    let frame
    const timer = setTimeout(() => {
      const start = performance.now()
      const step = (time) => {
        const progress = Math.min((time - start) / 700, 1)
        setScore(Math.round(target * (1 - (1 - progress) ** 3)))
        if (progress < 1) frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    }, 800)
    return () => { clearTimeout(timer); cancelAnimationFrame(frame) }
  }, [target, run])
  return score
}

export default function HeroAnalysisCard() {
  const [run, setRun] = useState(0)
  const sample = samples[run % samples.length]
  const score = CountScore(sample.score, run)
  const tilt = use3DTilt(10, 1000)

  useEffect(() => {
    const timer = setInterval(() => setRun((value) => value + 1), 9000)
    return () => clearInterval(timer)
  }, [])

  return (
    <article
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={tilt.style}
      className="card-3d-wrapper rounded-xl border border-slate-300 bg-white shadow-lg overflow-hidden"
    >
      {/* Official Government Docket Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between layer-z-1">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-amber-400" />
          <span className="font-mono text-xs font-bold tracking-wider">
            {sample.docket}
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
          BBMP LIVE DISPATCH
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Title */}
        <div className="layer-z-2 min-h-[48px]">
          <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
            Grievance Description
          </span>
          <h3 className="font-display font-bold text-base text-slate-900 leading-snug">
            <TypeText text={sample.title} delay={300} speed={20} run={run} />
          </h3>
        </div>

        {/* Urgency SLA Gauge */}
        <div className="layer-z-3 rounded-lg bg-slate-50 border border-slate-200 p-3">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-rose-600" /> Municipal Urgency Index
            </span>
            <span className="font-bold text-rose-700">{score} / 100</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-600 transition-all duration-700 ease-out"
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="mt-1.5 font-mono text-[11px] text-slate-600">
            Official Resolution SLA: <strong className="text-slate-900">{sample.sla}</strong>
          </p>
        </div>

        {/* Field Details */}
        <div className="grid gap-2.5 pt-1 text-xs border-t border-slate-200 layer-z-1">
          <div className="flex items-start gap-2">
            <MapPin size={15} className="mt-0.5 shrink-0 text-slate-600" />
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-500 uppercase block">Location</span>
              <span className="text-slate-800 font-medium">{sample.location}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Tags size={15} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-500 uppercase block">Category</span>
              <span className="text-slate-800 font-medium">{sample.category}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Landmark size={15} className="mt-0.5 shrink-0 text-govblue" />
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-500 uppercase block">Assigned Municipal Authority</span>
              <span className="text-govblue font-bold">{sample.department}</span>
              <span className="text-[11px] text-slate-500 block">Lead Officer: {sample.officer}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Verification Stamp */}
      <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex items-center justify-between layer-z-2">
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-800">
          <CheckCircle2 size={15} className="text-emerald-700" />
          <span>{sample.verified} Citizen Verifications</span>
        </div>
        <span className="font-mono text-[11px] text-slate-600">
          Sec. 4(1)(b) RTI Compliant
        </span>
      </div>
    </article>
  )
}
