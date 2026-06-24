import {
  AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Crosshair, FileImage,
  MapPin, Share2, Sparkles, UploadCloud, X, Copy, Building2, Zap
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { civicVisual } from '../data/demoIssues'
import { analyzeIssueWithGemini } from '../services/geminiService'
import { categories, findPossibleDuplicates, severityStyles } from '../utils/issues'
import { useToast } from '../components/Toast'

/* ─── Cinematic Phase 1 ─── */
const ANALYSIS_MESSAGES = [
  'Reading issue description…',
  'Identifying location context…',
  'Calculating urgency score…',
  'Routing to BBMP department…',
]

function HexSpinner() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="ai-hex-spinner" aria-hidden="true">
      <path
        d="M32 4 L58 18 L58 46 L32 60 L6 46 L6 18 Z"
        stroke="#00C9A7"
        strokeWidth="2"
        strokeDasharray="140"
        strokeDashoffset="140"
        fill="none"
        className="hex-draw"
      />
      <path
        d="M32 4 L58 18 L58 46 L32 60 L6 46 L6 18 Z"
        stroke="rgba(0,201,167,0.15)"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  )
}

function TypewriterText({ text, speed = 30, className = '' }) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    setDisplayed('')
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++ }
      else clearInterval(timer)
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])
  return <span className={className}>{displayed}</span>
}

function AnalysingPhase() {
  const [msgIndex, setMsgIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const delays = [0, 600, 1100, 1500]
    const timers = delays.map((delay, i) =>
      setTimeout(() => {
        setVisible(false)
        setTimeout(() => { setMsgIndex(i); setVisible(true) }, 200)
      }, delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="ai-phase-loading flex flex-col items-center justify-center gap-5 py-12">
      <HexSpinner />
      <p className="font-display text-base font-medium text-white text-center">NammaFix AI is analysing your report…</p>
      <p
        className="font-mono text-xs text-center transition-opacity duration-200"
        style={{ color: '#8A99B3', opacity: visible ? 1 : 0, minHeight: '1.2em' }}
      >
        {ANALYSIS_MESSAGES[msgIndex]}
      </p>
    </div>
  )
}

/* ─── Circular Urgency Gauge ─── */
function UrgencyGauge({ score, color }) {
  const [drawn, setDrawn] = useState(false)
  const radius = 46
  const circ = 2 * Math.PI * radius
  useEffect(() => { const f = requestAnimationFrame(() => setDrawn(true)); return () => cancelAnimationFrame(f) }, [])
  return (
    <div className="relative inline-grid place-items-center" style={{ width: 116, height: 116 }}>
      <svg className="absolute inset-0 -rotate-90" width="116" height="116" viewBox="0 0 116 116" aria-hidden="true">
        <circle cx="58" cy="58" r={radius} fill="none" stroke="#1E2D42" strokeWidth="10" />
        <circle
          cx="58" cy="58" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={drawn ? circ * (1 - score / 100) : circ}
          style={{ transition: 'stroke-dashoffset 900ms ease-out' }}
        />
      </svg>
      <div className="relative grid place-items-center text-center">
        <span className="font-mono font-bold leading-none" style={{ fontSize: 28, color }}>{score}</span>
        <span className="text-[9px] text-slate-500 mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

/* ─── Count-Up ─── */
function CountUpNumber({ target, duration = 800, className = '' }) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCurrent(Math.round(eased * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return <span className={className}>{current}</span>
}

/* ─── Confidence Bar ─── */
function ConfidenceBar({ label, pct, color = '#00C9A7' }) {
  const [filled, setFilled] = useState(false)
  useEffect(() => { const t = setTimeout(() => setFilled(true), 100); return () => clearTimeout(t) }, [])
  return (
    <div className="mt-3">
      <div className="flex justify-between mb-1.5">
        <span className="font-mono text-[11px] text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="font-mono text-[11px]" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-raised overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            background: color, width: filled ? `${pct}%` : '0%',
            transition: 'width 800ms cubic-bezier(.16,1,.3,1)'
          }}
        />
      </div>
    </div>
  )
}

/* ─── Cinematic Phase 2 — Result ─── */
function CinematicResult({ result, onConfirm, onEdit }) {
  const [checkDrawn, setCheckDrawn] = useState(false)
  const [blockVisible, setBlockVisible] = useState([false, false, false, false, false])
  const [deptTyped, setDeptTyped] = useState('')
  const { showToast } = useToast()
  const navigate = useNavigate()

  const score = result.urgencyScore
  const gaugeColor = score > 80 ? '#E5534B' : score >= 60 ? '#F5A623' : '#00C9A7'
  const severityLabel = score > 80 ? 'Critical' : score >= 60 ? 'High' : 'Medium'
  const severityPillColor = score > 80 ? 'border-danger/40 bg-danger/10 text-danger' : score >= 60 ? 'border-amber/40 bg-amber/10 text-amber' : 'border-mint/40 bg-mint/10 text-mint'

  const whyText = `High-traffic civic area, ${result.category?.toLowerCase() || 'structural damage'}`
  const aiConfidence = Math.min(99, 88 + Math.floor(Math.random() * 10))

  useEffect(() => {
    // Checkmark animation
    const t0 = setTimeout(() => setCheckDrawn(true), 100)
    // Blocks stagger
    const timers = [0, 300, 500, 700, 900].map((delay, i) =>
      setTimeout(() => setBlockVisible(prev => { const n = [...prev]; n[i] = true; return n }), 600 + delay)
    )
    return () => { clearTimeout(t0); timers.forEach(clearTimeout) }
  }, [])

  // Typewriter for "Why" text
  useEffect(() => {
    if (!blockVisible[2]) return
    let i = 0
    const t = setInterval(() => {
      if (i < whyText.length) { setDeptTyped(whyText.slice(0, i + 1)); i++ }
      else clearInterval(t)
    }, 30)
    return () => clearInterval(t)
  }, [blockVisible[2]])

  const handleShare = async () => {
    const url = `${window.location.origin}/issues/${result.id}`
    try { await navigator.clipboard.writeText(url); showToast({ type: 'success', title: 'Link copied!', body: 'Share with neighbours to verify.' }) }
    catch { showToast({ type: 'info', title: 'Share link', body: url }) }
  }

  const handleConfirm = () => {
    onConfirm()
    navigate('/dashboard')
  }

  return (
    <div className="ai-phase-result">
      {/* Header: checkmark + title */}
      <div className="flex flex-col items-center gap-3 py-6 border-b border-line">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="ai-check-svg" aria-hidden="true">
          <circle cx="24" cy="24" r="22" stroke="#00C9A7" strokeWidth="2" opacity="0.3" />
          <path
            d="M14 24 L21 31 L34 17"
            stroke="#00C9A7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="30"
            strokeDashoffset={checkDrawn ? 0 : 30}
            style={{ transition: 'stroke-dashoffset 400ms ease-out' }}
          />
        </svg>
        <p className="font-display text-sm font-semibold" style={{ color: '#00C9A7' }}>Analysis complete</p>
      </div>

      <div className="p-5 sm:p-6 space-y-4">

        {/* Block 1 — Urgency Score */}
        <div className={`ai-result-block ${blockVisible[0] ? 'visible' : ''}`}>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-3">Urgency score</p>
          <div className="flex items-center gap-4">
            <UrgencyGauge score={score} color={gaugeColor} />
            <div>
              <p className="font-mono font-bold leading-none" style={{ fontSize: 56, color: gaugeColor, lineHeight: 1 }}>
                <CountUpNumber target={score} duration={800} />
              </p>
              <span className={`badge mt-2 ${severityPillColor}`}>{severityLabel}</span>
            </div>
          </div>
        </div>

        {/* Block 2 — Category */}
        <div className={`ai-result-block ${blockVisible[1] ? 'visible' : ''}`}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={15} className="text-civic" />
            <span className="font-display font-bold text-slate-100 text-sm">{result.category}</span>
          </div>
          <ConfidenceBar label="AI confidence" pct={aiConfidence} />
        </div>

        {/* Block 3 — Department */}
        <div className={`ai-result-block ${blockVisible[2] ? 'visible' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={15} className="text-sky-400" />
            <span className="font-display font-bold text-slate-100 text-sm">{result.department}</span>
          </div>
          <p className="font-mono text-[11px] text-slate-400">
            Why: <span className="text-slate-300">{deptTyped}</span>
            <span className="inline-block w-0.5 h-3 bg-civic ml-0.5 align-middle animate-pulse" style={{ opacity: deptTyped.length < whyText.length ? 1 : 0 }} />
          </p>
        </div>

        {/* Block 4 — AI Response Workflow */}
        <div className={`ai-result-block ${blockVisible[3] ? 'visible' : ''}`}>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-3">Recommended response workflow</p>
          <div className="space-y-2">
            {result.ai?.actionPlan?.slice(0, 3).map((step, i) => (
              <div
                key={i}
                className="ai-workflow-step"
                style={{ transitionDelay: `${i * 150}ms`, opacity: blockVisible[3] ? 1 : 0, transform: blockVisible[3] ? 'none' : 'translateX(-16px)' }}
              >
                <span className="font-mono text-[10px] font-bold text-civic shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-sm text-slate-300 leading-snug">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Block 5 — Community Call */}
        <div className={`ai-result-block ${blockVisible[4] ? 'visible' : ''}`}>
          <p className="font-display font-semibold text-slate-100 text-sm mb-3">Share this report so neighbours can verify it</p>
          <div className="flex gap-2">
            <button onClick={handleShare} className="btn-secondary !py-2 !px-3 text-xs flex-1">
              <Share2 size={13} /> Share report
            </button>
            <button onClick={handleShare} className="btn-secondary !py-2 !px-3 text-xs flex-1">
              <Copy size={13} /> Copy link
            </button>
          </div>
        </div>

        {/* Duplicate warning */}
        {result.possibleDuplicates?.length > 0 && (
          <div className="flex gap-3 rounded-xl border border-amber-400/25 bg-amber-400/[.07] p-4 text-sm text-amber-100">
            <AlertTriangle className="shrink-0 mt-0.5" size={16} />
            <div>
              <b>Possible duplicate</b>
              <p className="mt-1 text-amber-200/80 text-xs">{result.possibleDuplicates.map(d => d.title).join(' · ')}</p>
            </div>
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="flex gap-3 border-t border-line p-5">
        <button onClick={onEdit} className="btn-secondary flex-1">
          <ArrowLeft size={15} /> Edit details
        </button>
        <button onClick={handleConfirm} className="btn-primary flex-1">
          Confirm & save to dashboard <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}

/* ─── Main Component ─── */
const DEMO_REPORT = {
  title: 'Pothole swallowing two-wheelers near Agara Lake signal',
  description: 'Large pothole approximately 3 feet wide has opened on the approach to the Agara Lake signal. Two-wheelers are swerving into oncoming traffic to avoid it, especially dangerous after rain when it fills with water and depth is hidden.',
  location: 'Whitefield Main Road, near Hope Farm Junction',
  area: 'Whitefield',
  category: 'Pothole / Road Damage',
}

export default function ReportIssue({ onCreate, issues }) {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ title: '', description: '', location: '', area: '', category: '', image: '' })
  const [locationState, setLocationState] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysing, setAnalysing] = useState(false)
  const [result, setResult] = useState(null)
  const [aiError, setAiError] = useState(false)
  const [manualCategory, setManualCategory] = useState('')
  const [manualUrgency, setManualUrgency] = useState(50)
  const [fieldErrors, setFieldErrors] = useState({})
  const [autoFilling, setAutoFilling] = useState(false)
  const reviewBtnRef = useRef(null)
  const { showToast } = useToast()

  const update = (key, value) => {
    setForm(c => ({ ...c, [key]: value }))
    setFieldErrors(c => ({ ...c, [key]: '' }))
  }

  /* ── Auto-fill demo report ── */
  const autofill = useCallback(async () => {
    if (autoFilling) return
    setAutoFilling(true)
    const type = (key, text) => new Promise(res => {
      let i = 0
      const timer = setInterval(() => {
        if (i <= text.length) { update(key, text.slice(0, i)); i++ }
        else { clearInterval(timer); res() }
      }, 22)
    })
    await type('title', DEMO_REPORT.title)
    await new Promise(r => setTimeout(r, 100))
    await type('description', DEMO_REPORT.description)
    await new Promise(r => setTimeout(r, 80))
    await type('location', DEMO_REPORT.location)
    await new Promise(r => setTimeout(r, 60))
    await type('area', DEMO_REPORT.area)
    update('category', DEMO_REPORT.category)
    setAutoFilling(false)
    // Pulse review button
    setTimeout(() => reviewBtnRef.current?.classList.add('review-pulse'), 200)
    setTimeout(() => reviewBtnRef.current?.classList.remove('review-pulse'), 1800)
  }, [autoFilling])

  const pickImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please choose an image file.'); return }
    const reader = new FileReader()
    reader.onload = () => update('image', reader.result)
    reader.readAsDataURL(file)
  }

  const useLocation = () => {
    if (!navigator.geolocation) { setLocationState('Geolocation is not available in this browser.'); return }
    setLocationState('Finding your location…')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        update('location', `Current location (${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`)
        setLocationState('Location added. You can replace it with a nearby landmark if needed.')
      },
      () => setLocationState('We could not access your location. Add a landmark instead.'),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  const review = () => {
    setError('')
    const errors = {}
    if (!form.title.trim()) errors.title = 'This field is required'
    if (!form.description.trim()) errors.description = 'This field is required'
    if (!form.location.trim()) errors.location = 'This field is required'
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      setError('Add an issue title, description and location or landmark before continuing.')
      showToast({ type: 'error', title: 'Add a title and description first', body: 'Location is also required to prepare a report.' })
      return
    }
    setStep(1)
  }

  const submit = async () => {
    setLoading(true)
    setAnalysing(true)
    setAiError(false)
    setError('')
    // Wait for cinematic phase 1 (at least 1.8s)
    const [ai] = await Promise.all([
      analyzeIssueWithGemini({ imageBase64: form.image, title: form.title, description: form.description, location: `${form.location}${form.area ? `, ${form.area}` : ''}` }),
      new Promise(r => setTimeout(r, 1800))
    ])
    if (!ai) {
      setAnalysing(false)
      setLoading(false)
      setAiError(true)
      return
    }
    const category = form.category || ai.category
    const duplicates = findPossibleDuplicates({ ...form, category }, issues)
    const issue = {
      id: `NF-${Math.floor(1000 + Math.random() * 8999)}`,
      title: form.title.trim(), description: form.description.trim(),
      location: form.location.trim(), area: form.area.trim(), category,
      severity: ai.severity, urgencyScore: ai.urgencyScore,
      department: ai.department, image: form.image || civicVisual(category),
      status: 'Reported', verifications: 0, userVerifications: 0,
      createdAt: new Date().toISOString(), source: 'User Report',
      isDuplicate: false,
      possibleDuplicates: duplicates.map(d => ({ id: d.id, title: d.title })),
      ai,
    }
    // Don't call onCreate yet — wait for confirmation
    setAnalysing(false)
    setLoading(false)
    setResult(issue)
  }

  const handleManualSave = () => {
    const category = manualCategory || form.category || 'Public Infrastructure Damage'
    const duplicates = findPossibleDuplicates({ ...form, category }, issues)
    const issue = {
      id: `NF-${Math.floor(1000 + Math.random() * 8999)}`,
      title: form.title.trim(), description: form.description.trim(),
      location: form.location.trim(), area: form.area.trim(), category,
      severity: manualUrgency > 80 ? 'Critical' : manualUrgency >= 60 ? 'High' : manualUrgency >= 40 ? 'Medium' : 'Low',
      urgencyScore: manualUrgency, department: 'BBMP Ward Office',
      image: form.image || civicVisual(category), status: 'Reported',
      verifications: 0, userVerifications: 0,
      createdAt: new Date().toISOString(), source: 'User Report',
      isDuplicate: false,
      possibleDuplicates: duplicates.map(d => ({ id: d.id, title: d.title })),
      ai: {
        complaintSummary: form.description,
        actionPlan: ['Assign to ward team for review.', 'Field inspection required.', 'Document and close.'],
        citizenMessage: 'Your report has been saved manually.',
        authorityNote: 'Manual submission — AI unavailable.',
        isFallback: true,
      },
    }
    onCreate(issue)
    navigate('/dashboard')
  }

  /* ── AI error fallback ── */
  if (aiError) return (
    <main className="shell max-w-2xl py-12">
      <section className="panel p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center mb-6">
          <div className="grid h-12 w-12 place-items-center rounded-full border border-amber/40 bg-amber/10 text-amber">
            <AlertTriangle size={22} />
          </div>
          <h2 className="heading text-2xl">AI analysis unavailable right now</h2>
          <p className="muted max-w-md">You can still save this report manually. Add a category below and we'll skip the AI step.</p>
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-300">
            Category
            <select className="filter-select form-input mt-2 !w-full" value={manualCategory} onChange={e => setManualCategory(e.target.value)}>
              <option value="">Let AI categorise this (recommended)</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-300">
            Urgency estimate: <span className="text-civic font-mono">{manualUrgency}/100</span>
            <input type="range" min="1" max="100" value={manualUrgency} onChange={e => setManualUrgency(+e.target.value)} className="mt-2 w-full accent-teal-400" />
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <button className="btn-secondary flex-1" onClick={() => { setAiError(false); setStep(1) }}><ArrowLeft size={15} /> Back</button>
          <button className="btn-primary flex-1" onClick={handleManualSave}>Save report manually <ArrowRight size={15} /></button>
        </div>
      </section>
    </main>
  )

  /* ── Cinematic result ── */
  if (result) return (
    <main className="shell max-w-xl py-10 sm:py-14">
      <section className="panel overflow-hidden">
        {analysing ? (
          <AnalysingPhase />
        ) : (
          <CinematicResult
            result={result}
            onEdit={() => { setResult(null); setStep(0) }}
            onConfirm={() => { onCreate(result); showToast({ type: 'success', title: 'Report filed · AI analysis ready', body: 'Your report was saved in this browser.' }) }}
          />
        )}
      </section>
    </main>
  )

  /* ── Loading state (while awaiting API) ── */
  if (analysing) return (
    <main className="shell max-w-xl py-10 sm:py-14">
      <section className="panel overflow-hidden">
        <AnalysingPhase />
      </section>
    </main>
  )

  return (
    <main className="shell max-w-2xl py-12 sm:py-16">
      <div className="mb-7">
        <p className="section-label">Prototype civic report</p>
        <h1 className="heading text-3xl sm:text-[36px]">Report a local issue</h1>
        <p className="muted mt-2 max-w-2xl">
          Your local workspace. Reports live in this browser — not with any authority.
        </p>
      </div>
      <div className="mb-7 flex gap-2">
        <span className={`badge ${step === 0 ? 'border-civic/50 bg-civic/10 text-sky-100' : 'border-mint/30 bg-mint/10 text-mint'}`}>1. Details</span>
        <span className={`badge ${step === 1 ? 'border-civic/50 bg-civic/10 text-sky-100' : 'border-line text-slate-500'}`}>2. Review &amp; analyse</span>
      </div>
      <section className="panel p-5 sm:p-8">
        {step === 0 ? (
          <div className="mx-auto max-w-2xl">
            {/* Auto-fill demo button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={autofill}
                disabled={autoFilling}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber/40 bg-amber/[.07] px-3 py-1.5 font-mono text-[11px] font-semibold text-amber transition hover:bg-amber/15 disabled:opacity-50"
                title="Auto-fills all fields with a realistic demo report"
              >
                <Zap size={12} /> {autoFilling ? 'Filling…' : 'Auto-fill demo report'}
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-300 sm:col-span-2">
                Issue title
                <input
                  className={`input form-input mt-2 ${fieldErrors.title ? 'form-error' : ''}`}
                  aria-invalid={Boolean(fieldErrors.title)}
                  maxLength="100"
                  value={form.title}
                  onChange={e => update('title', e.target.value)}
                  placeholder="e.g. Deep pothole near the metro feeder stop"
                />
                {fieldErrors.title && <p className="field-error">↑ {fieldErrors.title}</p>}
              </label>
              <label className="block text-sm font-semibold text-slate-300 sm:col-span-2">
                Issue description
                <textarea
                  className="input mt-2 min-h-28 resize-y"
                  maxLength="500"
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  placeholder="What is happening, and what risk does it create?"
                />
                {fieldErrors.description && <p className="field-error">↑ {fieldErrors.description}</p>}
                <p className={`description-count ${form.description.length >= 490 ? 'count-danger' : form.description.length >= 400 ? 'count-warning' : ''}`}>
                  {form.description.length} / 500
                </p>
                <p className="mt-1 text-[11px] text-slate-500">Be specific — AI performs better with more detail</p>
              </label>
              <label className="block text-sm font-semibold text-slate-300">
                Location / landmark
                <div className="mt-2 flex gap-2">
                  <input
                    className={`input form-input ${fieldErrors.location ? 'form-error' : ''}`}
                    aria-invalid={Boolean(fieldErrors.location)}
                    value={form.location}
                    onChange={e => update('location', e.target.value)}
                    placeholder="Road, landmark or coordinates"
                  />
                  <button onClick={useLocation} type="button" className="btn-secondary shrink-0 !px-3" aria-label="Use my location">
                    <Crosshair size={18} />
                  </button>
                </div>
                {fieldErrors.location && <p className="field-error">↑ {fieldErrors.location}</p>}
                {locationState && <span className="mt-2 block text-xs text-slate-500">{locationState}</span>}
              </label>
              <label className="block text-sm font-semibold text-slate-300">
                Ward / area <span className="font-normal text-slate-500">(optional)</span>
                <input
                  className="input form-input mt-2"
                  value={form.area}
                  onChange={e => update('area', e.target.value)}
                  placeholder="e.g. Whitefield"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-300">
                Category <span className="font-normal text-slate-500">(optional)</span>
                <select
                  className="filter-select form-input mt-2 !w-full"
                  value={form.category}
                  onChange={e => update('category', e.target.value)}
                >
                  <option value="">Let AI categorise this (recommended)</option>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              <div className="text-sm font-semibold text-slate-300">
                <span>Photo <span className="font-normal text-slate-500">(optional)</span></span>
                {form.image ? (
                  <div className="relative mt-2 overflow-hidden rounded-xl border border-line">
                    <img src={form.image} alt="Selected issue preview" className="h-28 w-full object-cover" width="600" height="112" loading="lazy" />
                    <button onClick={() => update('image', '')} className="absolute right-2 top-2 rounded bg-ink/85 p-1.5 text-white"><X size={15} /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    aria-label="Upload issue photo"
                    className="mt-2 flex h-[108px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-raised/40 text-xs text-slate-400 hover:border-civic hover:text-sky-200"
                  >
                    <UploadCloud size={21} />
                    <span className="mt-2">Upload image</span>
                  </button>
                )}
                <input ref={fileRef} className="hidden" type="file" accept="image/*" onChange={pickImage} />
              </div>
            </div>
            <div className="mt-5 rounded-xl border border-line bg-ink/40 p-3 text-xs text-slate-500">
              <FileImage className="mr-1 inline" size={14} />
              Any photo you add is stored only in this browser as part of this MVP.
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            <h2 className="heading text-2xl">Review before analysis</h2>
            <div className="mt-5 rounded-xl border border-line bg-ink/55 p-5">
              <p className="font-bold text-slate-100">{form.title}</p>
              <p className="mt-2 text-sm text-slate-400">{form.description}</p>
              <div className="mt-4 grid gap-2 border-t border-line pt-4 text-sm text-slate-300">
                <p><b className="text-slate-500">Location:</b> {form.location}</p>
                {form.area && <p><b className="text-slate-500">Area:</b> {form.area}</p>}
                <p><b className="text-slate-500">Category:</b> {form.category || 'AI suggestion requested'}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2 rounded-xl border border-amber-400/25 bg-amber-400/[.06] p-4 text-sm text-amber-100">
              <AlertTriangle className="shrink-0" size={18} />
              This creates a local prototype report. It does not notify an official authority.
            </div>
          </div>
        )}

        {error && (
          <p className="mx-auto mt-5 max-w-2xl rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>
        )}

        <div className="mx-auto mt-7 flex max-w-2xl justify-between gap-3 border-t border-line pt-6">
          {step ? (
            <button onClick={() => setStep(0)} className="btn-secondary"><ArrowLeft size={16} />Edit</button>
          ) : (
            <span />
          )}
          {step === 0 ? (
            <button ref={reviewBtnRef} onClick={review} className="review-button btn-primary">
              Review report <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={submit} disabled={loading} className="btn-primary">
              {loading ? (
                <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Preparing analysis…</>
              ) : (
                <><Sparkles size={17} />Analyse &amp; save report</>
              )}
            </button>
          )}
        </div>
      </section>
    </main>
  )
}
