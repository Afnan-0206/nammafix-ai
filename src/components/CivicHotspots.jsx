import { useState } from 'react'
import { MapPin, CheckCircle2, AlertTriangle, Building2, Phone, ShieldAlert, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { use3DTilt } from '../hooks/use3DTilt'

const ZONES = [
  {
    id: 'mahadevapura',
    name: 'Mahadevapura Zone',
    kannada: 'ಮಹಾದೇವಪುರ ವಲಯ',
    wards: 'Wards 81–86, 149–150 (Whitefield, Bellandur, Varthur, Hoodi)',
    aee: 'Sri. M. Suresh, Executive Engineer',
    phone: '080-28512211',
    activeHazards: 18,
    resolvedWeek: 42,
    slaCompliance: '94.2%',
    criticalAlert: 'Whitefield Main Rd asphalt resurfacing underway (Ward 84)',
    status: 'High Activity',
  },
  {
    id: 'bommanahalli',
    name: 'Bommanahalli Zone',
    kannada: 'ಬೊಮ್ಮನಹಳ್ಳಿ ವಲಯ',
    wards: 'Wards 174–176, 186–191 (HSR Layout, Begur, Hulimavu)',
    aee: 'Smt. Lakshmi Devi, AEE Road Works',
    phone: '080-25732244',
    activeHazards: 9,
    resolvedWeek: 38,
    slaCompliance: '96.8%',
    criticalAlert: '27th Main HSR drainage desilting completed',
    status: 'Routine',
  },
  {
    id: 'east',
    name: 'East Zone',
    kannada: 'ಪೂರ್ವ ವಲಯ',
    wards: 'Wards 78–80, 88–92 (Indiranagar, Halasuru, Cox Town)',
    aee: 'Sri. P. N. Murthy, Joint Commissioner',
    phone: '080-22975800',
    activeHazards: 12,
    resolvedWeek: 51,
    slaCompliance: '98.1%',
    criticalAlert: '100ft Road storm water drain slab inspection',
    status: 'Routine',
  },
  {
    id: 'south',
    name: 'South Zone',
    kannada: 'ದಕ್ಷಿಣ ವಲಯ',
    wards: 'Wards 142–148, 168–172 (Jayanagar, JP Nagar, Basavanagudi)',
    aee: 'Sri. K. Ramesh, Superintending Engineer',
    phone: '080-26563388',
    activeHazards: 7,
    resolvedWeek: 46,
    slaCompliance: '97.5%',
    criticalAlert: '4th Block Jayanagar pedestrian pathway repair complete',
    status: 'Optimal',
  },
  {
    id: 'west',
    name: 'West Zone',
    kannada: 'ಪಶ್ಚಿಮ ವಲಯ',
    wards: 'Wards 94–101 (Malleshwaram, Rajajinagar, Gandhinagar)',
    aee: 'Sri. H. V. Girish, Chief Engineer',
    phone: '080-23342200',
    activeHazards: 11,
    resolvedWeek: 39,
    slaCompliance: '95.6%',
    criticalAlert: 'Sampige Road streetlight transformer upgrade',
    status: 'Routine',
  },
]

export default function CivicHotspots() {
  const [activeZone, setActiveZone] = useState(ZONES[0])
  const tilt = use3DTilt(8, 1200)

  return (
    <section className="my-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-govblue/10 border border-govblue/20 text-govblue font-mono text-xs font-bold uppercase mb-2">
            <Building2 size={13} /> BBMP Zonal Operations Directory
          </div>
          <h2 className="heading text-2xl sm:text-3xl text-slate-900">
            Bengaluru 8-Zone Civic Redressal Radar
          </h2>
          <p className="muted mt-1 max-w-2xl text-slate-600">
            Direct telemetry from Bruhat Bengaluru Mahanagara Palike zonal headquarters. Track active work orders, ward engineers, and SLA performance.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="btn-secondary text-xs shrink-0 self-start sm:self-auto font-bold"
        >
          View All 198 Wards <ArrowRight size={14} />
        </Link>
      </div>

      {/* Zone Selector Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 thin-scrollbar">
        {ZONES.map((zone) => (
          <button
            key={zone.id}
            onClick={() => setActiveZone(zone)}
            className={`px-4 py-2.5 rounded-lg font-display text-xs font-bold shrink-0 transition flex flex-col items-start ${
              activeZone.id === zone.id
                ? 'bg-civic text-white shadow-sm'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{zone.name}</span>
            <span className={`text-[10px] font-kannada font-normal ${activeZone.id === zone.id ? 'text-amber-300' : 'text-slate-500'}`}>
              {zone.kannada}
            </span>
          </button>
        ))}
      </div>

      {/* 3D Tilt Zonal Matrix Card */}
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        style={tilt.style}
        className="card-3d-wrapper rounded-xl border border-slate-300 bg-white p-6 sm:p-8 shadow-md"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Zone Status */}
          <div className="lg:col-span-2 space-y-4 layer-z-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl font-black text-slate-900 flex items-center gap-2">
                  <MapPin size={22} className="text-govblue" /> {activeZone.name}
                </h3>
                <p className="text-sm font-semibold text-slate-600 mt-0.5">{activeZone.wards}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                activeZone.status === 'High Activity'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}>
                ● {activeZone.status}
              </span>
            </div>

            {/* Critical Field Alert */}
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3 text-xs leading-relaxed">
              <ShieldAlert size={18} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Active Zonal Work Order: </strong>
                <span>{activeZone.criticalAlert}</span>
              </div>
            </div>

            {/* Responsible Engineer & Helplines */}
            <div className="grid sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">Zonal Executive Engineer</span>
                <span className="text-slate-900 font-bold mt-0.5 block">{activeZone.aee}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">Control Room Line</span>
                <span className="text-govblue font-mono font-bold mt-0.5 flex items-center gap-1.5">
                  <Phone size={13} /> {activeZone.phone}
                </span>
              </div>
            </div>
          </div>

          {/* 3D KPI Metrics Column */}
          <div className="space-y-3 layer-z-2 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-6 pt-4 lg:pt-0">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-mono text-[11px] font-bold text-slate-500 uppercase block">Pending Grievances</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-3xl font-black text-slate-900">{activeZone.activeHazards}</span>
                <span className="font-mono text-xs text-rose-700 font-semibold">Under Inspection</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-mono text-[11px] font-bold text-slate-500 uppercase block">Resolved (Last 7 Days)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-3xl font-black text-emerald-700">{activeZone.resolvedWeek}</span>
                <span className="font-mono text-xs text-emerald-800 font-semibold">Repairs Certified</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-mono text-[11px] font-bold text-slate-500 uppercase block">SLA Compliance Rate</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-3xl font-black text-govblue">{activeZone.slaCompliance}</span>
                <span className="font-mono text-xs text-slate-600 font-semibold">On-Time Target</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
