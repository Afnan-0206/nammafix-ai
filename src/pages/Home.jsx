import { ArrowRight, Bot, Camera, CheckCircle2, ShieldCheck, Users, Building2, PhoneCall, FileText, CheckCheck, Clock, MapPin, Wrench, Eye, ShieldAlert, Sparkles, Layers, Globe } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import HeroAnalysisCard from '../components/HeroAnalysisCard'
import BengaluruDigitalTwin from '../components/BengaluruDigitalTwin'
import ThreeCityCanvas from '../components/ThreeCityCanvas'
import ThreeMachineryViewer from '../components/ThreeMachineryViewer'
import CivicHotspots from '../components/CivicHotspots'
import { use3DTilt } from '../hooks/use3DTilt'

const features = [
  {
    icon: Camera,
    title: 'Visual Evidence Intake',
    kannada: 'ಛಾಯಾಚಿತ್ರ ಸಾಕ್ಷ್ಯ ಸಲ್ಲಿಕೆ',
    copy: 'Upload high-resolution geotagged photographs. Computer vision extracts defect severity, GPS coordinates, and ward jurisdiction.',
  },
  {
    icon: Bot,
    title: 'Autonomous AI Triage',
    kannada: 'ಸ್ವಯಂಚಾಲಿತ ಎಐ ವರ್ಗೀಕರಣ',
    copy: 'Deterministic neural triage assigns severity scores (0-100) and routes grievances directly to BBMP, BWSSB, or BESCOM.',
  },
  {
    icon: Users,
    title: 'Citizen Community Verification',
    kannada: 'ಸಾರ್ವಜನಿಕ ಪರಿಶೀಲನೆ',
    copy: 'Neighbours and commuters confirm active ground hazards with one click, elevating urgent community priorities to ward engineers.',
  },
  {
    icon: ShieldCheck,
    title: 'Statutory SLA Enforcement',
    kannada: 'ಕಡ್ಡಾಯ ಸೇವಾ ಮಟ್ಟದ ಭರವಸೆ',
    copy: 'Mandatory resolution timeframes (24h to 72h) backed by official BBMP citizen charters and public executive audit trails.',
  },
]

const steps = [
  {
    step: '01',
    title: 'Citizen Files Grievance',
    kannada: 'ದೂರು ಸಲ್ಲಿಕೆ',
    copy: 'Submit location & photos in under 45 seconds via public mobile or web portal.',
    sla: 'Instant Docket Generated',
  },
  {
    step: '02',
    title: 'Automated AI Triage',
    kannada: 'ಎಐ ವಿಶ್ಲೇಷಣೆ',
    copy: 'AI computes urgency index and assigns responsible BBMP engineering division.',
    sla: '< 2.0 Seconds',
  },
  {
    step: '03',
    title: 'AEE Ward Inspection',
    kannada: 'ಸ್ಥಳ ಪರಿಶೀಲನೆ',
    copy: 'Assistant Executive Engineer verifies site safety and issues contractor work order.',
    sla: 'Within 12 Hours',
  },
  {
    step: '04',
    title: 'On-Ground Roadwork',
    kannada: 'ಕಾಮಗಾರಿ ಅನುಷ್ಠಾನ',
    copy: 'Contractor deploys asphalt pavers, desilting machinery, or electrical repair crew.',
    sla: 'Within 24–48 Hours',
  },
  {
    step: '05',
    title: 'Citizen Sign-off & Audit',
    kannada: 'ಸಾರ್ವಜನಿಕ ಧೃಡೀಕರಣ',
    copy: 'Before/after photos verified by citizen reporters before grievance closure is logged.',
    sla: 'Public Audit Certified',
  },
]

function FeatureCard3D({ feature }) {
  const tilt = use3DTilt(10, 1000)
  const Icon = feature.icon

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={tilt.style}
      className="card-3d-wrapper rounded-xl border border-slate-300 bg-white p-6 shadow-sm hover:border-slate-400 flex flex-col justify-between"
    >
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 border border-slate-300 text-civic layer-z-2 mb-4">
          <Icon size={24} />
        </div>
        <h3 className="font-display text-lg font-bold text-slate-900 layer-z-1">
          {feature.title}
        </h3>
        <p className="font-kannada text-xs font-semibold text-amber-700 mt-0.5">
          {feature.kannada}
        </p>
        <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed layer-z-1">
          {feature.copy}
        </p>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500 layer-z-1">
        <span>BBMP e-Gov Benchmark</span>
        <span className="text-emerald-700 font-bold">Standard 100%</span>
      </div>
    </div>
  )
}

function StepCard3D({ item }) {
  const tilt = use3DTilt(8, 1000)

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={tilt.style}
      className="card-3d-wrapper rounded-xl border border-slate-300 bg-white p-5 shadow-sm flex flex-col justify-between hover:border-slate-400 transition"
    >
      <div>
        <div className="flex items-center justify-between mb-3 layer-z-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-civic text-white font-mono text-xs font-bold">
            {item.step}
          </span>
          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
            SLA MILESTONE
          </span>
        </div>
        <h3 className="font-display text-sm font-bold text-slate-900 layer-z-1">
          {item.title}
        </h3>
        <p className="font-kannada text-[11px] font-semibold text-amber-700 mt-0.5">
          {item.kannada}
        </p>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed layer-z-1">
          {item.copy}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 font-mono text-[10px] text-govblue font-bold flex items-center gap-1 layer-z-1">
        <Clock size={12} /> {item.sla}
      </div>
    </div>
  )
}

export default function Home({ issues = [] }) {
  const [digitalTwinMode, setDigitalTwinMode] = useState('geospatial') // 'geospatial' | 'wardSimulation'

  return (
    <main className="bg-slate-50 text-slate-900">
      {/* Official Government Live Ticker Strip */}
      <section className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-8">
        <div className="shell flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
              BBMP Live Grievance Dispatch Feed:
            </span>
          </div>
          <div className="overflow-hidden whitespace-nowrap text-xs font-mono text-slate-700">
            <span className="inline-block animate-float">
              [Ward 84 Whitefield] Rapid asphalt road patch completed (09:42 AM) &bull; [Ward 150 Bellandur] Drainage culvert desilting certified (10:15 AM) &bull; [Ward 174 HSR Layout] Junction high-mast light restored (11:05 AM) &bull; [Ward 94 Malleshwaram] Footpath slab replaced (11:30 AM)
            </span>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="shell py-10 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_.9fr] items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1 font-mono text-xs font-bold text-slate-800 shadow-sm mb-4">
              <Building2 size={14} className="text-govblue" />
              GREATER BENGALURU AUTHORITY (GBA) &bull; 5 CITY CORPORATIONS
            </div>

            <h1 className="heading text-3xl sm:text-5xl lg:text-6xl leading-tight font-extrabold text-slate-900">
              Bengaluru Civic Grievance &amp; AI Redressal Portal
            </h1>

            <p className="font-kannada text-base font-semibold text-slate-700 mt-2">
              ಬೃಹತ್ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ ನಾಗರಿಕ ದೂರು ನಿವಾರಣಾ ಪೋರ್ಟಲ್
            </p>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Official public gateway for reporting road hazards, water fractures, garbage overflow, and public safety issues. Connected directly to Bengaluru's GIS infrastructure matrix, autonomous AI departmental triage, and statutory SLA enforcement.
            </p>

            {/* Official Call to Actions */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/report" className="btn-saffron text-sm !px-6 !py-3 font-bold shadow-sm">
                File a Grievance (ದೂರು ಸಲ್ಲಿಸಿ) <ArrowRight size={16} />
              </Link>
              <Link to="/dashboard" className="btn-secondary text-sm !px-6 !py-3 font-bold">
                View Public Ward Registry
              </Link>
            </div>

            {/* Official BBMP KPI Badges */}
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-slate-200 pt-6">
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">Active Wards</span>
                <span className="font-display text-2xl font-black text-slate-900 mt-0.5 block">198</span>
                <span className="text-[10px] text-emerald-800 font-semibold">Citywide Coverage</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">AI Triage Speed</span>
                <span className="font-display text-2xl font-black text-govblue mt-0.5 block">&lt; 2.0s</span>
                <span className="text-[10px] text-slate-600 font-medium">Instant Routing</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">SLA Compliance</span>
                <span className="font-display text-2xl font-black text-emerald-700 mt-0.5 block">98.2%</span>
                <span className="text-[10px] text-slate-600 font-medium">Statutory Standard</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Hero Docket */}
          <div>
            <HeroAnalysisCard />
          </div>
        </div>
      </section>

      {/* Flagship Geospatial Digital-Twin Infrastructure Matrix */}
      <section className="shell my-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-govblue uppercase tracking-wider">
              <Globe size={14} /> Real Geospatial Digital-Twin Layer Stack
            </div>
            <h2 className="heading text-2xl sm:text-3xl mt-1 text-slate-900">
              Bengaluru Urban Infrastructure Matrix &bull; Live 3D Twin
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Geospatially projected across Greater Bengaluru. Inspect real-coordinate Namma Metro corridors, Rajakaluve stormwater drainage channels, lakes, arterial road traffic states, and live grievance dockets with real-time flood simulation.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-300 self-start sm:self-auto">
            <button
              onClick={() => setDigitalTwinMode('geospatial')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                digitalTwinMode === 'geospatial'
                  ? 'bg-civic text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              <Layers size={13} /> Geospatial Twin (WGS84)
            </button>
            <button
              onClick={() => setDigitalTwinMode('wardSimulation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                digitalTwinMode === 'wardSimulation'
                  ? 'bg-civic text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              <Building2 size={13} /> Micro-Ward Topography
            </button>
          </div>
        </div>

        {digitalTwinMode === 'geospatial' ? (
          <BengaluruDigitalTwin issues={issues} />
        ) : (
          <ThreeCityCanvas />
        )}
      </section>

      {/* BBMP Integrated Command Center Showcase */}
      <section className="shell my-16">
        <div className="rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-md">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-300 font-mono text-xs font-bold uppercase w-fit mb-3">
                <ShieldCheck size={14} className="text-govblue" /> Smart Governance Infrastructure
              </span>
              <h2 className="heading text-2xl sm:text-3xl text-slate-900 font-black leading-tight">
                BBMP Smart City Integrated Command &amp; Control Centre
              </h2>
              <p className="font-kannada text-sm font-semibold text-slate-700 mt-1">
                ಬೆಂಗಳೂರು ಮಹಾನಗರ ಸಮಗ್ರ ಕಮಾಂಡ್ ಮತ್ತು ಕಂಟ್ರೋಲ್ ಸೆಂಟರ್
              </p>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                NammaFix AI connects citizen mobile reports directly to Bengaluru's central municipal command matrix. Assistant Executive Engineers, zonal supervisors, and on-ground contractors coordinate road repairs with photographic audit chains.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="block text-slate-900 font-bold">RTI Act Compliant</strong>
                  <span className="text-slate-500 text-[11px]">Sec 4(1)(b) public audit logs</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="block text-slate-900 font-bold">Helpline 1533 Direct</strong>
                  <span className="text-slate-500 text-[11px]">Toll-free citizen voice integration</span>
                </div>
              </div>

              <div className="mt-6">
                <Link to="/authority" className="btn-primary text-xs font-bold">
                  Access Municipal Command Console &rarr;
                </Link>
              </div>
            </div>

            <div className="relative min-h-[300px] lg:min-h-[420px] bg-slate-100 border-t lg:border-t-0 lg:border-l border-slate-200">
              <img
                src="/bbmp_command_center.jpg"
                alt="BBMP Smart City Integrated Command & Control Center"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 3D Municipal Machinery Exploration */}
      <section className="shell my-16">
        <div className="mb-4">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-govblue uppercase tracking-wider">
            <Wrench size={14} /> Municipal Engineering Technology
          </div>
          <h2 className="heading text-2xl sm:text-3xl mt-1 text-slate-900">
            BBMP High-Velocity Road Maintenance Fleet
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Interactive 3D model of modern automated equipment deployed across Bengaluru's municipal corporations. Inspect hydraulic patching systems and telemetry controllers.
          </p>
        </div>

        <ThreeMachineryViewer />
      </section>

      {/* 5-Step Civic Complaint Lifecycle */}
      <section className="shell my-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-mono text-xs font-bold text-govblue uppercase tracking-wider">
            Standard Operating Procedure
          </span>
          <h2 className="heading text-2xl sm:text-4xl text-slate-900 font-black mt-1">
            5-Stage Grievance Resolution Lifecycle
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Every citizen report follows an automated statutory workflow with transparent milestone sign-offs.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((item) => (
            <StepCard3D key={item.step} item={item} />
          ))}
        </div>
      </section>

      {/* 3D Interactive Feature Grid */}
      <section className="shell my-16">
        <div className="max-w-2xl mb-8">
          <span className="font-mono text-xs font-bold text-govblue uppercase tracking-wider">
            Public Governance Architecture
          </span>
          <h2 className="heading text-2xl sm:text-3xl text-slate-900 font-black mt-1">
            Engineered for 14 Million Citizens
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Built to Indian Public Sector &amp; e-Governance digital service benchmarks.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard3D key={feature.title} feature={feature} />
          ))}
        </div>
      </section>

      {/* On-Ground Roadwork Showcase */}
      <section className="shell my-16">
        <div className="rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-md">
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-[280px] lg:min-h-[380px] bg-slate-100 border-b lg:border-b-0 lg:border-r border-slate-200">
              <img
                src="/bbmp_road_inspection.jpg"
                alt="BBMP civil engineers inspecting road resurfacing in Bengaluru"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="p-8 lg:p-10 flex flex-col justify-center">
              <span className="font-mono text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                &bull; Certified Field Execution
              </span>
              <h2 className="heading text-2xl sm:text-3xl text-slate-900 font-black leading-tight">
                Rapid Road Surface Restoration Program
              </h2>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                BBMP road engineering squads utilize modern asphalt compactors, sensor-based gradient analyzers, and rapid curing bituminous mixes. Citizens can inspect completion certificates directly on their complaint tracking page.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link to="/report" className="btn-primary text-xs font-bold">
                  Report a Road Pothole &rarr;
                </Link>
                <Link to="/impact" className="btn-secondary text-xs font-bold">
                  View Ward SLA Metrics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8-Zone Civic Operations Radar */}
      <div className="shell my-16">
        <CivicHotspots />
      </div>
    </main>
  )
}
