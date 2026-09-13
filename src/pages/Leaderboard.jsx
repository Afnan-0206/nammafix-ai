import { Award, ArrowRight, CheckCircle2, ClipboardList, ShieldCheck, Trophy, Star, Medal, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import CountUp from '../components/CountUp'
import { use3DTilt } from '../hooks/use3DTilt'

function MedalCard3D({ name, kannada, unlocked, desc, tier, icon: Icon }) {
  const tilt = use3DTilt(12, 1000)

  const metalColor =
    tier === 'gold' ? 'from-amber-400 to-amber-600 text-amber-950 border-amber-400' :
    tier === 'silver' ? 'from-slate-200 to-slate-400 text-slate-900 border-slate-300' :
    tier === 'platinum' ? 'from-sky-300 to-blue-500 text-blue-950 border-blue-400' :
    'from-amber-600 to-amber-800 text-amber-100 border-amber-600'

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={tilt.style}
      className={`card-3d-wrapper rounded-xl border p-5 shadow-sm transition ${
        unlocked ? 'bg-white border-slate-300' : 'bg-slate-50 border-slate-200 opacity-60'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* 3D Medal Coin */}
        <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${metalColor} border-2 flex items-center justify-center shadow-md layer-z-2 shrink-0`}>
          <Icon size={24} />
        </div>

        <div className="layer-z-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-sm text-slate-900">{name}</h3>
            {unlocked && (
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded">
                Unlocked
              </span>
            )}
          </div>
          <p className="font-kannada text-[11px] font-semibold text-slate-500">{kannada}</p>
          <p className="text-xs text-slate-600 mt-1 leading-snug">{desc}</p>
        </div>
      </div>
    </div>
  )
}

export default function Leaderboard({ issues }) {
  const reportsSubmitted = issues.filter((issue) => issue.source === 'User Report' || issue.source === 'Citizen Public Portal').length
  const verificationsMade = issues.reduce((sum, issue) => sum + (issue.userVerifications || 0), 0)
  const resolvedUserReports = issues.filter((issue) => (issue.source === 'User Report' || issue.source === 'Citizen Public Portal') && issue.status === 'Resolved').length
  const points = reportsSubmitted * 50 + verificationsMade * 15 + resolvedUserReports * 30

  const rankTier =
    points >= 150 ? 'BBMP Civic Sentinel (ನಾಗರಿಕ ಕಾವಲುಗಾರ)' :
    points >= 60 ? 'BBMP Ward Guardian (ವಾರ್ಡ್ ರಕ್ಷಕ)' :
    points >= 15 ? 'Citizen Scout (ನಾಗರಿಕ ಸ್ಕೌಟ್)' :
    'Neighbourhood Watch (ಪ್ರಾರಂಭಿಕ ಸದಸ್ಯ)'

  const badges = [
    { name: 'First Civic Report', kannada: 'ಪ್ರಥಮ ದೂರು ಸಲ್ಲಿಕೆ', unlocked: reportsSubmitted >= 1, desc: 'Register 1 verified defect docket', icon: ClipboardList, tier: 'bronze' },
    { name: 'Community Validator', kannada: 'ವಾರ್ಡ್ ಪರಿಶೀಲಕ', unlocked: verificationsMade >= 2, desc: 'Verify 2 active community hazard dockets', icon: Users, tier: 'silver' },
    { name: 'Civic Champion', kannada: 'ನಾಗರಿಕ ಸಾಧಕ', unlocked: points >= 100, desc: 'Earn 100 municipal civic merit points', icon: Award, tier: 'gold' },
    { name: 'Statutory Resolution Sign-off', kannada: 'ಕಾಮಗಾರಿ ದೃಢೀಕರಣ', unlocked: resolvedUserReports >= 1, desc: 'Verify before/after road repair completion', icon: CheckCircle2, tier: 'platinum' },
  ]

  return (
    <main className="shell py-10 sm:py-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1 font-mono text-xs font-bold text-slate-800 shadow-sm mb-3">
            <Trophy size={14} className="text-amber-600" />
            BBMP CITIZEN RECOGNITION &bull; PUBLIC ENGAGEMENT
          </div>
          <h1 className="heading text-3xl sm:text-4xl text-slate-900 font-black">
            Citizen Civic Champions &amp; Ward Recognition
          </h1>
          <p className="font-kannada text-sm font-semibold text-slate-700 mt-1">
            ನಾಗರಿಕ ಶ್ರೇಯಾಂಕ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸಹಭಾಗಿತ್ವ ಗೌರವ
          </p>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
            Bruhat Bengaluru Mahanagara Palike rewards citizens who actively document infrastructure defects and verify contractor road repairs. Earn merit points to unlock civic achievement seals.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 self-start sm:self-auto text-right">
          <span className="font-mono text-[10px] text-amber-900 uppercase font-bold tracking-wider block">Official Rank Tier</span>
          <span className="font-display text-sm font-black text-slate-900 flex items-center gap-1.5 justify-end mt-1">
            <Star size={16} className="text-amber-600 fill-amber-600" /> {rankTier}
          </span>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4 my-8">
        <div className="p-5 rounded-xl border border-slate-300 bg-white shadow-sm">
          <span className="font-mono text-[11px] font-bold text-slate-500 uppercase block">Reports Filed</span>
          <div className="font-display text-3xl font-black text-slate-900 mt-1">
            <CountUp value={reportsSubmitted} />
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Official Dockets Logged</span>
        </div>

        <div className="p-5 rounded-xl border border-slate-300 bg-white shadow-sm">
          <span className="font-mono text-[11px] font-bold text-slate-500 uppercase block">Ground Verifications</span>
          <div className="font-display text-3xl font-black text-emerald-700 mt-1">
            <CountUp value={verificationsMade} />
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Community Endorsements</span>
        </div>

        <div className="p-5 rounded-xl border border-slate-300 bg-white shadow-sm">
          <span className="font-mono text-[11px] font-bold text-slate-500 uppercase block">Civic Merit Points</span>
          <div className="font-display text-3xl font-black text-govblue mt-1">
            <CountUp value={points} />
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Total Score Accumulated</span>
        </div>
      </div>

      {/* 3D Metallic Medal Showcase */}
      <div className="my-8">
        <h2 className="heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Medal size={20} className="text-govblue" /> Statutory Civic Achievement Seals
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {badges.map((b) => (
            <MedalCard3D key={b.name} {...b} />
          ))}
        </div>
      </div>

      {/* Point Rubric Section */}
      <div className="rounded-xl border border-slate-300 bg-white p-6 sm:p-8 shadow-sm my-8">
        <h2 className="heading text-lg font-bold text-slate-900 mb-2">
          BBMP Civic Merit Allocation Schedule
        </h2>
        <p className="text-xs text-slate-600 mb-6">
          Merit scores are audited according to citizen participation guidelines.
        </p>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-medium text-slate-800">
              Submit photo-verified road or civic infrastructure defect
            </span>
            <span className="font-mono font-bold text-govblue bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
              +50 Points
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-medium text-slate-800">
              Endorse and verify an active neighbourhood hazard docket
            </span>
            <span className="font-mono font-bold text-govblue bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
              +15 Points
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-medium text-slate-800">
              Inspect &amp; sign off completed on-ground contractor repair
            </span>
            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
              +30 Points
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-mono">
            BBMP Citizen Redressal Rules 2026 &bull; Public Service Guarantee
          </span>
          <Link to="/report" className="btn-primary text-xs font-bold">
            File a Grievance Now &rarr;
          </Link>
        </div>
      </div>
    </main>
  )
}
