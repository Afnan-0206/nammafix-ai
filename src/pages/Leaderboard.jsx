import { Award, ArrowRight, CheckCircle2, ClipboardList, LockKeyhole, Sparkles, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import CountUp from '../components/CountUp'
const particles = Array.from({ length: 12 }, (_, index) => index)
export default function Leaderboard({ issues }) {
  const reportsSubmitted = issues.filter((issue) => issue.source === 'User Report').length
  const verificationsMade = issues.reduce((sum, issue) => sum + (issue.userVerifications || 0), 0)
  const resolvedUserReports = issues.filter((issue) => issue.source === 'User Report' && issue.status === 'Resolved').length
  const points = reportsSubmitted * 50 + verificationsMade * 15 + resolvedUserReports * 30
  const badges = [
    ['First Report', reportsSubmitted >= 1, 'Submit one local report', ClipboardList],
    ['Neighbour Check', verificationsMade >= 2, 'Verify two visible issues', Users],
    ['Civic Helper', points >= 100, 'Earn 100 participation points', Award],
    ['Follow-through', resolvedUserReports >= 1, 'Complete a local demo workflow', CheckCircle2],
  ]
  const stats = [[ClipboardList, reportsSubmitted, 'Reports submitted'], [Users, verificationsMade, 'Verifications made'], [Sparkles, points, 'Community points']]
  return (
    <main className="shell max-w-5xl py-12 sm:py-16">
      <p className="section-label">Browser-based participation</p>
      <h1 className="heading text-3xl sm:text-[32px]">Namma Civic Scoreboard</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Participation tracked in this browser. The real version would be city-wide.</p>
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map(([Icon, value, label]) => (
          <article className="panel p-6" key={label}>
            <span className="feature-icon"><Icon size={20} /></span>
            <p className="mt-5 font-display text-[40px] font-extrabold leading-none text-slate-100"><CountUp value={value} /></p>
            <p className="mt-2 text-[13px] text-slate-400">{label}</p>
          </article>
        ))}
      </section>
      {points === 0 ? (
        <div className="mt-5 flex flex-col items-center gap-4 rounded-xl border border-line bg-raised/40 p-8 text-center">
          <p className="text-[13px] text-slate-400 max-w-sm">
            File your first report to earn <span className="font-bold text-civic">30 points</span> and unlock your{' '}
            <span className="font-bold text-slate-200">First Report</span> badge
          </p>
          <Link to="/report" className="btn-primary !px-4 !py-2.5 text-sm">
            Report an Issue <ArrowRight size={15} />
          </Link>
        </div>
      ) : null}
      <section className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <article className="panel p-6">
          <p className="section-label">Points explained</p>
          <h2 className="heading text-xl">A simple participation model</h2>
          <div className="mt-5 divide-y divide-line border-y border-line">
            <p className="points-row flex items-center justify-between py-4 text-sm text-slate-300"><span>Submit a report</span><b className="data-mono text-civic">+50</b></p>
            <p className="points-row flex items-center justify-between py-4 text-sm text-slate-300"><span>Verify an issue</span><b className="data-mono text-civic">+15</b></p>
            <p className="points-row flex items-center justify-between py-4 text-sm text-slate-300"><span>Mark a user report resolved in demo</span><b className="data-mono text-civic">+30</b></p>
          </div>
          <Link className="btn-primary mt-6 w-full" to="/report">Report an Issue</Link>
        </article>
        <article className="panel p-6">
          <p className="section-label">Demo badges</p>
          <h2 className="heading text-xl">Progress in this browser</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {badges.map(([title, earned, rule, Icon]) => (
              <div className={`badge-card relative rounded-xl border p-4 ${earned ? 'badge-unlocked border-civic/50 bg-civic/[.05]' : 'badge-locked border-line bg-raised/40 opacity-65'}`} key={title}>
                {earned ? (
                  <>{particles.map((particle) => <span className="badge-confetti" style={{ '--particle': particle }} key={particle} />)}<Icon className="text-civic" size={22} /></>
                ) : (
                  <LockKeyhole className="text-slate-500" size={22} />
                )}
                <p className="mt-4 font-display text-sm font-bold text-slate-100">{title}</p>
                <p className="mt-1 text-[11px] leading-4 text-slate-400">{earned ? 'Unlocked in this browser' : rule}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  )
}
