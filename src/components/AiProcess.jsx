import { BrainCircuit, CheckCircle2, ClipboardCheck, Route, ScanSearch, ShieldCheck } from 'lucide-react'

const steps = [
  ['01', 'Reads the report', 'Uses the photo, description and location as report context.', ScanSearch],
  ['02', 'Suggests a category', 'Classifies the likely type of civic issue.', BrainCircuit],
  ['03', 'Estimates urgency', 'Creates a transparent severity and urgency suggestion.', ShieldCheck],
  ['04', 'Suggests a department', 'Provides a likely team for a future civic workflow.', Route],
  ['05', 'Drafts next actions', 'Creates a practical three-step response checklist.', ClipboardCheck],
  ['06', 'Supports civic tracking', 'Shows verification and status updates in real time.', CheckCircle2],
]

export default function AiProcess() {
  return (
    <section className="py-12 sm:py-14">
      <div className="mb-8 text-center">
        <p className="section-label justify-center">Automated Triage Framework</p>
        <h2 className="heading text-2xl sm:text-3xl text-slate-900 font-bold">
          Intelligent Triage &amp; Action Planning
        </h2>
        <p className="muted mx-auto mt-2 max-w-2xl text-slate-600 text-sm">
          NammaFix AI automatically categorises, estimates statutory urgency, and drafts actionable civic response plans for fast municipal routing.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map(([number, title, text, Icon]) => (
          <article className="panel relative p-5 bg-white border border-slate-300 shadow-sm" key={number}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-govblue">
                <Icon size={20} />
              </div>
              <span className="font-mono text-xs font-bold text-slate-500">{number}</span>
            </div>
            <p className="mb-1 text-sm font-bold text-slate-900">{title}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
