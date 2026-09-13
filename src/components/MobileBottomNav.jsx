import { BarChart3, FilePlus2, Home, LayoutDashboard, Menu, ShieldCheck, Trophy, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useState } from 'react'

const mainTabs = [
  [Home, 'Home', '/'],
  [FilePlus2, 'File', '/report'],
  [LayoutDashboard, 'Registry', '/dashboard'],
  [ShieldCheck, 'Console', '/authority'],
]

const moreTabs = [
  [BarChart3, 'Impact & SLAs', '/impact'],
  [Trophy, 'Citizen Champions', '/leaderboard'],
]

export default function MobileBottomNav() {
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white border-t border-slate-300 grid grid-cols-5 h-14 items-center px-1 shadow-lg">
        {mainTabs.map(([Icon, label, path]) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold font-display ${
                isActive ? 'text-civic' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}

        <button
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold font-display text-slate-500 hover:text-slate-800"
          onClick={() => setMoreOpen(true)}
          aria-label="Open more navigation"
        >
          <Menu size={18} />
          <span>More</span>
        </button>
      </nav>

      {moreOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 flex items-end sm:hidden"
          onMouseDown={() => setMoreOpen(false)}
        >
          <section
            className="w-full bg-white rounded-t-2xl p-5 border-t border-slate-300 shadow-2xl space-y-3"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-display font-bold text-sm text-slate-900">Additional Public Services</span>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1 rounded text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-1">
              {moreTabs.map(([Icon, label, path]) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  <Icon size={16} className="text-govblue" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  )
}
