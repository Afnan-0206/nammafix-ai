import { Menu, X, PhoneCall, Globe, Building2, ShieldAlert } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

const links = [
  ['Home', '/', 'ಮುಖಪುಟ'],
  ['File Grievance', '/report', 'ದೂರು ದಾಖಲಿಸಿ'],
  ['Ward Registry', '/dashboard', 'ವಾರ್ಡ್ ನೋಂದಣಿ'],
  ['Municipal Console', '/authority', 'ಅಧಿಕಾರಿಗಳ ಕನ್ಸೋಲ್'],
  ['Impact SLAs', '/impact', 'ಪ್ರಗತಿ ವರದಿ'],
  ['Citizen Champions', '/leaderboard', 'ನಾಗರಿಕ ಶ್ರೇಯಾಂಕ'],
]

function BBMPSeal() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-civic text-white shadow-sm border border-slate-700">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L3 7V12C3 17.5 7 21 12 22C17 21 21 17.5 21 12V7L12 2Z" fill="#0A2540" stroke="#D97706" strokeWidth="1.8" />
        <path d="M12 6V18M7 12H17" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [fontSize, setFontSize] = useState('normal')
  const location = useLocation()

  const toggleFontSize = (size) => {
    setFontSize(size)
    if (size === 'large') document.documentElement.style.fontSize = '18px'
    else if (size === 'small') document.documentElement.style.fontSize = '14px'
    else document.documentElement.style.fontSize = '16px'
  }

  const navClass = ({ isActive }) =>
    `px-3 py-2 text-xs font-bold font-display rounded-md transition ${
      isActive
        ? 'bg-civic text-white'
        : 'text-slate-700 hover:text-civic hover:bg-slate-100'
    }`

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200">
      {/* Karnataka Flag Ribbon */}
      <div className="karnataka-ribbon w-full" />

      {/* Official Government Top Utility Bar */}
      <div className="gov-top-bar py-1.5 px-4 sm:px-8">
        <div className="shell flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-3">
            <span className="font-kannada font-semibold text-amber-300">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</span>
            <span className="text-slate-400">|</span>
            <span className="font-semibold text-slate-100">Government of Karnataka · Bruhat Bengaluru Mahanagara Palike</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300 font-mono text-[11px]">
            <a href="tel:1533" className="flex items-center gap-1.5 text-amber-300 hover:text-white transition font-semibold">
              <PhoneCall size={12} /> Helpline: 1533
            </a>
            <span className="hidden sm:inline text-slate-500">|</span>
            <div className="hidden sm:flex items-center gap-1">
              <span>Text:</span>
              <button onClick={() => toggleFontSize('small')} className={`px-1 rounded ${fontSize === 'small' ? 'bg-slate-700 text-white' : 'hover:text-white'}`}>A-</button>
              <button onClick={() => toggleFontSize('normal')} className={`px-1 rounded ${fontSize === 'normal' ? 'bg-slate-700 text-white' : 'hover:text-white'}`}>A</button>
              <button onClick={() => toggleFontSize('large')} className={`px-1 rounded ${fontSize === 'large' ? 'bg-slate-700 text-white' : 'hover:text-white'}`}>A+</button>
            </div>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="font-kannada text-slate-200">ಕನ್ನಡ / English</span>
          </div>
        </div>
      </div>

      {/* Main Official Navigation Header */}
      <div className="shell flex h-16 items-center justify-between gap-4">
        <NavLink to="/" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
          <BBMPSeal />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-base sm:text-lg font-black tracking-tight text-civic">
                NammaFix <span className="text-govblue">AI</span>
              </span>
              <span className="hidden md:inline text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300">
                BBMP PORTAL
              </span>
            </div>
            <p className="font-kannada text-[11px] text-slate-500 font-medium leading-none mt-0.5">
              ಬೃಹತ್ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ
            </p>
          </div>
        </NavLink>

        {/* Desktop Links */}
        <nav aria-label="Primary navigation" className="hidden min-[1120px]:flex items-center gap-1">
          {links.map(([name, path, kannada]) => (
            <NavLink key={path} to={path} className={navClass}>
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Call to Action Button */}
        <div className="flex items-center gap-3">
          <NavLink to="/report" className="btn-saffron text-xs !px-4 !py-2 shadow-sm font-bold">
            File Grievance / ದೂರು ಸಲ್ಲಿಸಿ
          </NavLink>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 min-[1120px]:hidden border border-slate-200"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {open && (
        <nav aria-label="Mobile navigation" className="border-t border-slate-200 bg-white px-4 py-3 min-[1120px]:hidden shadow-md">
          <div className="shell grid gap-1.5 px-0">
            {links.map(([name, path, kannada]) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-bold ${
                    isActive ? 'bg-civic text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
                onClick={() => setOpen(false)}
              >
                <span>{name}</span>
                <span className="font-kannada text-[11px] opacity-75">{kannada}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
