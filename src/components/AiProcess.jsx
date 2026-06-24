import { BrainCircuit, CheckCircle2, ClipboardCheck, Route, ScanSearch, ShieldCheck } from 'lucide-react'

const steps = [
  ['01', 'Reads the report', 'Uses the photo, description and location as report context.', ScanSearch],
  ['02', 'Suggests a category', 'Classifies the likely type of civic issue.', BrainCircuit],
  ['03', 'Estimates urgency', 'Creates a transparent severity and urgency suggestion.', ShieldCheck],
  ['04', 'Suggests a department', 'Provides a likely team for a future civic workflow.', Route],
  ['05', 'Drafts next actions', 'Creates a practical three-step response checklist.', ClipboardCheck],
  ['06', 'Supports local tracking', 'Shows verification and status changes in this browser demo.', CheckCircle2],
]

export default function AiProcess() {
  return <section className="py-12 sm:py-14"><div className="mb-8 text-center"><p className="section-label justify-center">How AI assists</p><h2 className="heading text-3xl sm:text-4xl">A transparent report-preparation process</h2><p className="muted mx-auto mt-3 max-w-2xl">Gemini or the demo fallback helps prepare a useful report. It does not send or resolve a complaint with a government system.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{steps.map(([number, title, text, Icon]) => <article className="panel relative p-5" key={number}><div className="mb-4 flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-civic/10 text-civic"><Icon size={20} /></div><span className="text-xs font-bold text-slate-600">{number}</span></div><p className="mb-1 text-sm font-bold text-slate-100">{title}</p><p className="text-sm leading-relaxed text-slate-400">{text}</p></article>)}</div></section>
}
