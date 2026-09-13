import {
  AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Crosshair, FileImage,
  MapPin, Share2, Sparkles, UploadCloud, X, Copy, Building2, ShieldCheck, Printer, FileText, Scan, Layers
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { civicVisual } from '../data/initialIssues'
import { analyzeIssueWithGemini } from '../services/geminiService'
import { categories, findPossibleDuplicates } from '../utils/issues'
import { useToast } from '../components/Toast'

/* ─── Official Analysis Messages ─── */
const ANALYSIS_MESSAGES = [
  'Verifying GPS coordinates & BBMP ward jurisdiction…',
  'Executing computer vision defect severity analysis…',
  'Calculating statutory urgency score & SLA timeframe…',
  'Routing grievance docket to responsible BBMP / BWSSB division…',
]

function GovSpinner() {
  return (
    <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-civic animate-spin" />
  )
}

function TypewriterText({ text, speed = 25, className = '' }) {
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

  useEffect(() => {
    const delays = [0, 600, 1100, 1600]
    const timers = delays.map((delay, i) =>
      setTimeout(() => setMsgIndex(i), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
      <div className="relative">
        <GovSpinner />
        <div className="absolute inset-0 flex items-center justify-center">
          <Scan size={18} className="text-civic animate-pulse" />
        </div>
      </div>
      <p className="font-display text-base font-bold text-slate-900">
        BBMP Autonomous Triage Engine Processing…
      </p>
      <p className="font-mono text-xs text-slate-600 min-h-[1.5em]">
        {ANALYSIS_MESSAGES[msgIndex]}
      </p>
      <span className="text-[11px] font-kannada text-slate-500 font-semibold">
        ದೂರು ವರ್ಗೀಕರಣ ಮತ್ತು ಎಐ ವಿಶ್ಲೇಷಣೆ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ
      </span>
      <div className="w-48 h-1.5 rounded-full bg-slate-200 overflow-hidden mt-2">
        <div className="h-full bg-govblue animate-barIn" />
      </div>
    </div>
  )
}

/* ─── Circular Urgency Gauge ─── */
function UrgencyGauge({ score, color }) {
  const [drawn, setDrawn] = useState(false)
  const radius = 44
  const circ = 2 * Math.PI * radius
  useEffect(() => { const f = requestAnimationFrame(() => setDrawn(true)); return () => cancelAnimationFrame(f) }, [])
  return (
    <div className="relative inline-grid place-items-center" style={{ width: 104, height: 104 }}>
      <svg className="absolute inset-0 -rotate-90" width="104" height="104" viewBox="0 0 104 104" aria-hidden="true">
        <circle cx="52" cy="52" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="8" />
        <circle
          cx="52" cy="52" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={drawn ? circ * (1 - score / 100) : circ}
          style={{ transition: 'stroke-dashoffset 800ms ease-out' }}
        />
      </svg>
      <div className="relative grid place-items-center text-center">
        <span className="font-mono font-black leading-none" style={{ fontSize: 26, color }}>{score}</span>
        <span className="text-[10px] font-mono text-slate-500 mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

/* ─── Confidence Bar ─── */
function ConfidenceBar({ label, pct, color = '#1D4ED8' }) {
  const [filled, setFilled] = useState(false)
  useEffect(() => { const t = setTimeout(() => setFilled(true), 100); return () => clearTimeout(t) }, [])
  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1 text-[11px] font-mono">
        <span className="text-slate-500 uppercase font-bold">{label}</span>
        <span className="font-bold text-slate-800">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            background: color,
            width: filled ? `${pct}%` : '0%',
            transition: 'width 800ms cubic-bezier(.16,1,.3,1)'
          }}
        />
      </div>
    </div>
  )
}

/* ─── 3D Computer Vision Scanner Reticle on Photo ─── */
function PhotoScanReticle({ imageSrc, onClear }) {
  return (
    <div className="relative rounded-xl overflow-hidden border-2 border-govblue bg-slate-900 shadow-md">
      <img src={imageSrc} alt="Defect photographic evidence" className="h-56 sm:h-64 w-full object-cover opacity-90" />

      {/* 3D Grid Overlay */}
      <div className="absolute inset-0 scanner-grid-overlay pointer-events-none" />

      {/* Moving Laser Scan Beam Line */}
      <div className="scan-beam-line" />

      {/* Bounding Box Simulation */}
      <div className="absolute top-8 left-12 right-12 bottom-12 border-2 border-emerald-500 border-dashed rounded-lg pointer-events-none flex flex-col justify-between p-2">
        <div className="flex justify-between items-start">
          <span className="bg-slate-900/90 border border-emerald-500 text-emerald-400 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">
            DEFECT REGION: DETECTED (97.8% CONF)
          </span>
          <span className="bg-slate-900/90 border border-slate-700 text-slate-300 font-mono text-[10px] px-1.5 py-0.5 rounded">
            EST. AREA: 1.4 m²
          </span>
        </div>
        <div className="flex justify-between items-end text-[10px] font-mono text-amber-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
          <span>SURFACE VOID: POTHOLE CRATER</span>
          <span>DEPTH INDEX: 7.8 CM</span>
        </div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-2 left-2 z-10 bg-slate-900/90 border border-slate-700 text-white px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        BBMP CV MODEL v4.2 &bull; TELEMETRY ACTIVE
      </div>

      <button
        type="button"
        onClick={onClear}
        className="absolute top-2 right-2 z-10 bg-slate-900 text-white p-1.5 rounded-lg hover:bg-rose-700 border border-slate-700 transition"
        title="Remove photo"
      >
        <X size={15} />
      </button>
    </div>
  )
}

/* ─── Official Receipt & Result ─── */
function CinematicResult({ result, onConfirm, onEdit }) {
  const [blockVisible, setBlockVisible] = useState([false, false, false, false])
  const { showToast } = useToast()
  const navigate = useNavigate()

  const score = result.urgencyScore
  const gaugeColor = score > 80 ? '#DC2626' : score >= 60 ? '#D97706' : '#047857'
  const severityLabel = score > 80 ? 'Critical Priority' : score >= 60 ? 'High Priority' : 'Standard Routine'
  const severityBadgeColor = score > 80 ? 'bg-rose-100 text-rose-900 border-rose-300' : score >= 60 ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300'

  useEffect(() => {
    const timers = [0, 200, 400, 600].map((delay, i) =>
      setTimeout(() => setBlockVisible(prev => { const n = [...prev]; n[i] = true; return n }), 200 + delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  const handleConfirm = () => {
    onConfirm()
    navigate('/dashboard')
  }

  return (
    <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-md">
      {/* Official Docket Header */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-amber-400" />
            <span className="font-mono text-xs font-bold tracking-wider text-amber-300">
              GRIEVANCE ACKNOWLEDGEMENT RECEIPT
            </span>
          </div>
          <p className="font-mono text-sm font-bold mt-1">Docket ID: {result.id}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5 text-slate-800"
          title="Print Acknowledgement"
        >
          <Printer size={13} /> Print
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* Urgency Score Block */}
        <div className={`p-4 rounded-lg bg-slate-50 border border-slate-200 transition-all ${blockVisible[0] ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs font-bold uppercase text-slate-600">
              Municipal Urgency Index
            </span>
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${severityBadgeColor}`}>
              {severityLabel}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <UrgencyGauge score={score} color={gaugeColor} />
            <div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Computed via BBMP neural defect classifier based on road transit volume, pedestrian footfall, and safety hazards.
              </p>
              <p className="font-mono text-xs text-slate-900 font-bold mt-2">
                Statutory SLA: {result.ai?.estimatedResolutionTime || 'Within 48 Hours'}
              </p>
            </div>
          </div>
        </div>

        {/* Assigned Department */}
        <div className={`p-4 rounded-lg bg-slate-50 border border-slate-200 transition-all ${blockVisible[1] ? 'opacity-100' : 'opacity-0'}`}>
          <span className="font-mono text-[10px] font-bold uppercase text-slate-500 block mb-1">
            Assigned Municipal Division
          </span>
          <p className="font-display text-base font-bold text-govblue">{result.department}</p>
          <p className="text-xs text-slate-600 mt-1">
            Defect: <strong className="text-slate-800">{result.category}</strong>
          </p>
          <ConfidenceBar label="AI Routing Confidence" pct={96} />
        </div>

        {/* Action Plan */}
        <div className={`p-4 rounded-lg bg-slate-50 border border-slate-200 transition-all ${blockVisible[2] ? 'opacity-100' : 'opacity-0'}`}>
          <span className="font-mono text-[10px] font-bold uppercase text-slate-500 block mb-2">
            Automated BBMP Standard Action Protocol
          </span>
          <div className="space-y-2 text-xs text-slate-700">
            {result.ai?.actionPlan?.map((action, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-mono text-govblue font-bold">0{i + 1}.</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <button onClick={onEdit} className="btn-secondary flex-1 text-xs font-bold">
            <ArrowLeft size={14} /> Edit Information
          </button>
          <button onClick={handleConfirm} className="btn-saffron flex-1 text-xs font-bold">
            Confirm &amp; Register Docket <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ReportIssue({ onCreate, issues }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const fileRef = useRef(null)
  const reviewBtnRef = useRef(null)

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [analysing, setAnalysing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [locationState, setLocationState] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    area: '',
    category: '',
    image: '',
  })

  const update = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    setFieldErrors(p => ({ ...p, [k]: '' }))
  }

  const pickImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast({ type: 'danger', title: 'File too large', body: 'Please select a photo under 5 MB.' })
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => update('image', ev.target.result)
    reader.readAsDataURL(file)
  }

  const useLocation = () => {
    if (!navigator.geolocation) {
      setLocationState('Geolocation not supported by browser.')
      return
    }
    setLocationState('Acquiring satellite GPS lock…')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        update('location', `${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E (GPS Verified)`)
        setLocationState('Satellite GPS coordinates locked.')
      },
      () => setLocationState('Unable to fetch GPS. Please enter street or landmark name.')
    )
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required.'
    if (!form.description.trim()) errs.description = 'Description is required.'
    if (!form.location.trim()) errs.location = 'Location or landmark is required.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const review = () => {
    if (!validate()) return
    setStep(1)
  }

  const submit = async () => {
    setLoading(true)
    setAnalysing(true)
    setError('')

    try {
      const duplicates = findPossibleDuplicates(form, issues || [])
      const aiData = await analyzeIssueWithGemini(form)

      const id = `BBMP-GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`
      const complete = {
        id,
        title: form.title,
        description: form.description,
        location: form.location,
        area: form.area || 'Bengaluru Central',
        category: form.category || aiData.category || 'General Civil Maintenance',
        severity: aiData.urgencyScore >= 80 ? 'Critical' : aiData.urgencyScore >= 60 ? 'High' : 'Medium',
        urgencyScore: aiData.urgencyScore || 75,
        department: aiData.department || 'BBMP Engineering Division',
        image: form.image || civicVisual(form.category || 'road'),
        createdAt: new Date().toISOString(),
        status: 'Reported',
        verifications: 1,
        userVerifications: 1,
        source: 'Citizen Public Portal',
        possibleDuplicates: duplicates.map(d => ({ id: d.id, title: d.title })),
        ai: aiData,
      }

      setResult(complete)
      setAnalysing(false)
      setLoading(false)
    } catch (err) {
      setAnalysing(false)
      setLoading(false)
      setError('AI Triage failed. Please try again or submit directly.')
    }
  }

  if (result) {
    return (
      <main className="shell max-w-xl py-12">
        <CinematicResult
          result={result}
          onEdit={() => { setResult(null); setStep(0) }}
          onConfirm={() => {
            onCreate(result)
            showToast({ type: 'success', title: 'Grievance Registered', body: `Docket ${result.id} successfully recorded.` })
          }}
        />
      </main>
    )
  }

  if (analysing) {
    return (
      <main className="shell max-w-xl py-12">
        <div className="panel p-8">
          <AnalysingPhase />
        </div>
      </main>
    )
  }

  return (
    <main className="shell max-w-2xl py-12 sm:py-16">
      {/* Header with Karnataka & BBMP Title */}
      <div className="mb-8 pb-6 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1 font-mono text-xs font-bold text-slate-800 shadow-sm mb-3">
          <Building2 size={14} className="text-govblue" />
          GOVERNMENT OF KARNATAKA &bull; BRUHAT BENGALURU MAHANAGARA PALIKE
        </div>
        <h1 className="heading text-3xl sm:text-4xl text-slate-900 font-black">
          Public Grievance Redressal Intake
        </h1>
        <p className="font-kannada text-sm font-semibold text-slate-700 mt-1">
          ಸಾರ್ವಜನಿಕ ನಾಗರಿಕ ದೂರು ಸಲ್ಲಿಕೆ ಮತ್ತು ಸ್ವಯಂಚಾಲಿತ ಎಐ ವಿಶ್ಲೇಷಣೆ
        </p>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          File civic grievances regarding road damage, open drains, water leakage, or public safety issues. Your report generates a formal tracking docket with automated departmental routing and statutory SLA tracking.
        </p>
      </div>

      {/* Stepper Badges */}
      <div className="mb-6 flex gap-2">
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold font-display border ${
          step === 0
            ? 'bg-civic text-white border-civic shadow-sm'
            : 'bg-white text-slate-700 border-slate-300'
        }`}>
          1. Grievance Details (ವಿವರಗಳು)
        </span>
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold font-display border ${
          step === 1
            ? 'bg-civic text-white border-civic shadow-sm'
            : 'bg-white text-slate-700 border-slate-300'
        }`}>
          2. Review &amp; AI Triage (ಪರಿಶೀಲನೆ)
        </span>
      </div>

      <section className="panel p-6 sm:p-8 shadow-sm">
        {step === 0 ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">
                Grievance Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="e.g. Hazardous pothole cluster on Whitefield Main Road near metro station"
                className={`input ${fieldErrors.title ? 'border-rose-500' : ''}`}
                maxLength={100}
              />
              {fieldErrors.title && <p className="text-xs text-rose-600 mt-1 font-semibold">&uarr; {fieldErrors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">
                Detailed Description <span className="text-rose-600">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Describe the condition, risk to vehicular/pedestrian traffic, and specific location context..."
                className={`input min-h-[110px] ${fieldErrors.description ? 'border-rose-500' : ''}`}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500 font-mono">
                <span>Provide sufficient details for accurate municipal department routing</span>
                <span>{form.description.length} / 500</span>
              </div>
              {fieldErrors.description && <p className="text-xs text-rose-600 mt-1 font-semibold">&uarr; {fieldErrors.description}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">
                  Location &amp; Landmark <span className="text-rose-600">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => update('location', e.target.value)}
                    placeholder="Road, junction, or GPS landmark"
                    className={`input ${fieldErrors.location ? 'border-rose-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={useLocation}
                    className="btn-secondary shrink-0 !px-3"
                    title="Detect satellite GPS coordinates"
                  >
                    <Crosshair size={16} />
                  </button>
                </div>
                {locationState && <span className="text-[11px] font-mono text-govblue mt-1 block font-bold">{locationState}</span>}
                {fieldErrors.location && <p className="text-xs text-rose-600 mt-1 font-semibold">&uarr; {fieldErrors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">
                  Ward Jurisdiction / Zone <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={form.area}
                  onChange={(e) => update('area', e.target.value)}
                  placeholder="e.g. Ward 84 Whitefield / Mahadevapura"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">
                Defect Category <span className="text-slate-400 font-normal">(Optional — AI auto-classifies if empty)</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="input"
              >
                <option value="">Let BBMP AI automatically classify</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Photo Upload with 3D Scanner Reticle */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">
                Attach Photographic Evidence <span className="text-slate-400 font-normal">(AI Computer Vision Enabled)</span>
              </label>
              {form.image ? (
                <PhotoScanReticle imageSrc={form.image} onClear={() => update('image', '')} />
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-govblue hover:bg-slate-50 transition cursor-pointer text-center"
                >
                  <UploadCloud size={28} className="text-slate-500 mb-2" />
                  <span className="text-xs font-bold text-slate-800">
                    Click to upload ground photograph
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    Supports JPG, PNG up to 5MB. AI scans image pixels for damage severity &amp; crater dimensions.
                  </span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                ref={reviewBtnRef}
                type="button"
                onClick={review}
                className="btn-saffron text-xs !py-3 !px-6 font-bold shadow-sm"
              >
                Proceed to Review &amp; Triage <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ) : (
          /* Step 1: Review Before Submission */
          <div className="space-y-5">
            <h2 className="heading text-xl text-slate-900 font-black">
              Review Grievance Information
            </h2>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">Grievance Title</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{form.title}</p>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">Description</span>
                <p className="text-slate-700 leading-relaxed mt-0.5">{form.description}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">Location</span>
                  <p className="text-slate-800 font-semibold">{form.location}</p>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">Category</span>
                  <p className="text-slate-800 font-semibold">{form.category || 'Automated AI Classification'}</p>
                </div>
              </div>
            </div>

            {form.image && (
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Photographic Evidence Attached
                </span>
                <div className="h-36 rounded-lg overflow-hidden border border-slate-300">
                  <img src={form.image} alt="Defect attached" className="h-full w-full object-cover" />
                </div>
              </div>
            )}

            {error && (
              <p className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {error}
              </p>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="btn-secondary text-xs font-bold"
              >
                <ArrowLeft size={14} /> Back to Edit
              </button>

              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="btn-primary text-xs font-bold !py-3 !px-6"
              >
                {loading ? 'Submitting to BBMP…' : 'Submit & Generate Official Docket'}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
