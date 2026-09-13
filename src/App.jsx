import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import MobileBottomNav from './components/MobileBottomNav'
import LoadingScreen from './components/LoadingScreen'
import PresentationMode from './components/PresentationMode'
import Onboarding from './components/Onboarding'
import InstallPrompt from './components/InstallPrompt'
import { useToast } from './components/Toast'
import Home from './pages/Home'
import ReportIssue from './pages/ReportIssue'
import Dashboard from './pages/Dashboard'
import IssueDetail from './pages/IssueDetail'
import AuthorityConsole from './pages/AuthorityConsole'
import Impact from './pages/Impact'
import Leaderboard from './pages/Leaderboard'
import { loadIssues, persistIssues } from './utils/issues'

export default function App() { 
  const [issues, setIssues] = useState(loadIssues); 
  const [loading, setLoading] = useState(true); 
  const location = useLocation(); 
  const { showToast } = useToast(); 

  useEffect(() => { 
    try { 
      persistIssues(issues) 
    } catch(e) { 
      if (e.name === 'QuotaExceededError') { 
        const pruned = issues.slice(0, issues.length - 2); 
        persistIssues(pruned); 
        setIssues(pruned); 
        showToast({ type: 'info', title: 'Storage limit reached', body: 'Oldest 2 reports removed to make space.' }) 
      } 
    } 
  }, [issues]); 

  useEffect(() => { 
    const sections = [...document.querySelectorAll('#main-content main > section')]; 
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; 
    if (reduced || !('IntersectionObserver' in window)) { 
      sections.forEach((section) => section.classList.add('is-visible')); 
      return undefined 
    } 
    sections.forEach((section, index) => { 
      section.classList.add('reveal-section'); 
      section.style.transitionDelay = `${index * 60}ms` 
    }); 
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { 
      if (entry.isIntersecting) { 
        entry.target.classList.add('is-visible'); 
        observer.unobserve(entry.target) 
      } 
    }), { threshold: .15, rootMargin: '0px 0px -50px 0px' }); 
    sections.forEach((section) => observer.observe(section)); 
    return () => observer.disconnect() 
  }, [location.pathname]); 

  const createIssue = (issue) => { 
    setIssues((current) => [issue, ...current]); 
    showToast({ type: 'success', title: 'Report filed · AI analysis ready', body: 'Your report was saved successfully.' }); 
    if (issue.possibleDuplicates?.length) showToast({ type: 'warning', title: 'Similar report already exists', body: issue.possibleDuplicates[0].title }) 
  }; 

  const updateIssue = (id, patch) => { 
    const before = issues.find((issue) => issue.id === id); 
    setIssues((current) => current.map((issue) => issue.id === id ? { ...issue, ...patch } : issue)); 
    if (patch.status && before?.status !== patch.status) showToast({ type: 'info', title: `Status updated to ${patch.status}`, body: 'Status changed successfully.' }) 
  }; 

  const verifyIssue = (id) => { 
    const issue = issues.find((item) => item.id === id); 
    if (issue?.userVerifications) { 
      showToast({ type: 'warning', title: 'Already verified by you', body: 'One verification is enough.' }); 
      return 
    } 
    setIssues((current) => current.map((item) => item.id === id ? { ...item, verifications: item.verifications + 1, userVerifications: 1, status: item.status === 'Reported' ? 'Verified' : item.status } : item)); 
    showToast({ type: 'success', title: 'Issue verified', body: '+ 15 points earned' }) 
  }; 

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}
      <Navbar />
      <PresentationMode />
      <Onboarding />
      <InstallPrompt />
      <div id="main-content" className="page-enter" key={location.pathname}>
        <Routes>
          <Route path="/" element={<Home issues={issues} />} />
          <Route path="/report" element={<ReportIssue onCreate={createIssue} issues={issues} />} />
          <Route path="/dashboard" element={<Dashboard issues={issues} onVerify={verifyIssue} />} />
          <Route path="/issues/:issueId" element={<IssueDetail issues={issues} onVerify={verifyIssue} onUpdate={updateIssue} />} />
          <Route path="/authority" element={<AuthorityConsole issues={issues} onUpdate={updateIssue} />} />
          <Route path="/impact" element={<Impact issues={issues} />} />
          <Route path="/leaderboard" element={<Leaderboard issues={issues} />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
          <Route path="/404" element={<NotFound />} />
        </Routes>
      </div>
      <MobileBottomNav />

      {/* Official Government of Karnataka & BBMP Public Portal Footer */}
      <footer className="border-t border-slate-300 bg-white text-slate-700 mt-16">
        <div className="karnataka-ribbon w-full" />
        <div className="shell py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-black text-slate-900">
                NammaFix <span className="text-govblue">AI</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300">
                GOVT PORTAL
              </span>
            </div>
            <p className="font-kannada text-slate-800 font-semibold leading-relaxed">
              ಬೃಹತ್ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ ಸಾರ್ವಜನಿಕ ನಾಗರಿಕ ದೂರು ನಿವಾರಣಾ ವ್ಯವಸ್ಥೆ.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Official public civic grievance redressal and autonomous municipal triage platform. Serving 198 wards of Bengaluru under the Karnataka Public Services Guarantee Act (Sakala).
            </p>
            <div className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-mono text-slate-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              BBMP Central Server Node &bull; Operational
            </div>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-slate-900 font-bold mb-3">Citizen Terminals</p>
            <ul className="space-y-2 font-medium text-slate-600">
              <li><a href="/report" className="hover:text-govblue transition">File a Grievance (ದೂರು ದಾಖಲಿಸಿ)</a></li>
              <li><a href="/dashboard" className="hover:text-govblue transition">Public Ward Registry (ವಾರ್ಡ್ ನೋಂದಣಿ)</a></li>
              <li><a href="/authority" className="hover:text-govblue transition">Municipal AEE Console (ಅಧಿಕಾರಿಗಳ ಕನ್ಸೋಲ್)</a></li>
              <li><a href="/leaderboard" className="hover:text-govblue transition">Citizen Champions (ನಾಗರಿಕ ಶ್ರೇಯಾಂಕ)</a></li>
              <li><a href="/impact" className="hover:text-govblue transition">Statutory SLAs &amp; Impact (ಪ್ರಗತಿ ವರದಿ)</a></li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-slate-900 font-bold mb-3">Statutory Departments</p>
            <ul className="space-y-2 text-slate-600">
              <li><span>BBMP Major Roads &amp; Infrastructure</span></li>
              <li><span>BWSSB Water Supply &amp; Drainage</span></li>
              <li><span>BESCOM Electrical Public Safety</span></li>
              <li><span>BBMP Solid Waste Management (SWM)</span></li>
              <li><span>Storm Water Drains (SWD) Wing</span></li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-slate-900 font-bold mb-3">Municipal Head Office</p>
            <div className="space-y-2 text-slate-600 leading-relaxed">
              <p>
                <strong>Bruhat Bengaluru Mahanagara Palike (BBMP)</strong><br />
                N.R. Square, Hudson Circle,<br />
                Bengaluru, Karnataka 560002
              </p>
              <p className="font-mono pt-1">
                Toll-Free Helpline: <strong className="text-slate-900">1533</strong><br />
                Central Control: <strong className="text-slate-900">080-22660000</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="shell border-t border-slate-200 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <p>&copy; {new Date().getFullYear()} Government of Karnataka &bull; Bruhat Bengaluru Mahanagara Palike. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Right to Information (RTI Act 2005)</span>
            <span>&bull;</span>
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:underline cursor-pointer">Citizen Charter</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 text-center bg-slate-50 py-16">
      <div className="max-w-md p-8 bg-white border border-slate-300 rounded-xl shadow-sm">
        <p className="font-mono text-5xl font-black text-slate-300">404</p>
        <h1 className="heading mt-4 text-2xl font-bold text-slate-900">Public Record Not Found</h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          The civic docket or municipal portal page you are looking for has not been registered or has been archived.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a className="btn-primary text-xs font-bold" href="/">Return to Home</a>
          <a className="btn-secondary text-xs font-bold" href="/report">File New Grievance</a>
        </div>
      </div>
    </main>
  )
}
