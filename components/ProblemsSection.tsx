'use client'
import { AlertTriangle, BadgeDollarSign, HelpCircle, FileWarning, Gauge, ShieldOff } from 'lucide-react'
import Reveal from './Reveal'
import { useLang } from './LanguageProvider'

const META = [
  { icon: <Gauge size={22}/>, color: '#1B17FF' },
  { icon: <BadgeDollarSign size={22}/>, color: '#14109E' },
  { icon: <HelpCircle size={22}/>, color: '#0f172a' },
  { icon: <FileWarning size={22}/>, color: '#1e293b' },
  { icon: <AlertTriangle size={22}/>, color: '#4640FF' },
  { icon: <ShieldOff size={22}/>, color: '#64748b' },
]

export default function ProblemsSection() {
  const { t } = useLang()
  const PROBLEMS = t.problems.items.map((it, i) => ({ ...it, ...META[i] }))

  return (
    <section id="problems" className="py-24 bg-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-14">
          <div className="section-eyebrow">{t.problems.eyebrow}</div>
          <h2 className="font-disp font-extrabold text-4xl sm:text-5xl text-ink uppercase leading-tight mb-5">{t.problems.h2a}<br/><span className="brand-text">{t.problems.h2b}</span></h2>
          <p className="text-ink-muted text-lg leading-relaxed">{t.problems.sub}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROBLEMS.map((p,i)=>(
            <Reveal key={i} delay={i*70} className="card p-6 problem-card group" style={{borderLeftColor:p.color}}>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{background:`${p.color}12`}}><span style={{color:p.color}}>{p.icon}</span></div>
                <h3 className="font-disp font-bold text-base text-ink uppercase leading-tight pt-1">{p.title}</h3>
              </div>
              <p className="text-ink-muted text-sm leading-relaxed mb-4">{p.body}</p>
              <div className="border-t border-surface-border pt-3"><p className="text-xs font-mono" style={{color:p.color}}>{p.stat}</p></div>
            </Reveal>
          ))}
        </div>
        <div className="mt-12 rounded-2xl overflow-hidden border border-surface-border" style={{background:'linear-gradient(135deg,rgba(27,23,255,0.04),rgba(15,23,42,0.04))'}}>
          <div className="p-8 flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div>
              <h3 className="font-disp font-bold text-2xl text-ink uppercase mb-2">{t.problems.ctaTitle}</h3>
              <p className="text-ink-muted text-sm">{t.problems.ctaBody}</p>
            </div>
            <a href="#sizing" className="btn-primary flex-shrink-0">{t.problems.ctaBtn}</a>
          </div>
        </div>
      </div>
    </section>
  )
}
