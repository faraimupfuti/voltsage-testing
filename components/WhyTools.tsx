'use client'
import { ShieldCheck, Clock, BadgeCheck, Calculator, MapPin, Gift } from 'lucide-react'
import Reveal from './Reveal'
import { useLang } from './LanguageProvider'

const WHY_META = [
  { icon: Calculator, color: '#1B17FF' },
  { icon: ShieldCheck, color: '#0f172a' },
  { icon: BadgeCheck, color: '#1e293b' },
  { icon: Clock, color: '#14109E' },
  { icon: MapPin, color: '#4640FF' },
  { icon: Gift, color: '#64748b' },
]
const TOOLS_META = [
  { href: '#sizing', color: '#0f172a' },
  { href: '#agricultural', color: '#1e293b' },
  { href: '#battery', color: '#1B17FF' },
]

export default function WhyTools() {
  const { t } = useLang()
  const WHY = t.why1.items.map((it, i) => ({ ...it, ...WHY_META[i] }))
  const TOOLS = t.why2.tools.map((it, i) => ({ ...it, ...TOOLS_META[i] }))

  return (
    <>
      <section id="why" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <div className="section-eyebrow justify-center">{t.why1.eyebrow}</div>
            <h2 className="font-disp font-extrabold text-4xl sm:text-5xl text-ink uppercase leading-tight mb-5">{t.why1.h2a}<br/><span className="brand-text">{t.why1.h2b}</span></h2>
            <p className="text-ink-muted text-lg">{t.why1.sub}</p>
          </div>
          <div className="flex justify-center mb-14">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-amber-200 bg-amber-50">
              <span className="text-xl">💡</span>
              <span className="font-mono text-sm text-ink-muted uppercase tracking-wider">{t.why1.badgePre}<strong className="text-ink">{t.why1.badgeStrong}</strong>{t.why1.badgePost}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY.map((b,i)=>(
              <Reveal key={i} delay={i*70} className="card p-6 group relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{background:`linear-gradient(90deg,${b.color},transparent)`}}/>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${b.color}12`}}>
                    <b.icon size={20} style={{color:b.color}}/>
                  </div>
                  <h3 className="font-disp font-bold text-sm text-ink uppercase leading-tight">{b.title}</h3>
                </div>
                <p className="text-ink-muted text-sm leading-relaxed">{b.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 bg-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <div className="section-eyebrow">{t.why2.eyebrow}</div>
            <h2 className="font-disp font-extrabold text-4xl sm:text-5xl text-ink uppercase leading-tight mb-4">{t.why2.h2a}<br/><span className="brand-text">{t.why2.h2b}</span></h2>
            <p className="text-ink-muted text-base leading-relaxed">{t.why2.sub}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {TOOLS.map((t2,i)=>(
              <Reveal key={i} delay={i*90} className="gradient-border rounded-2xl overflow-hidden">
                <div className="card-flat p-6 h-full flex flex-col">
                  <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{color:t2.color}}>{t2.who}</div>
                  <h3 className="font-disp font-bold text-xl text-ink uppercase mb-3">{t2.name}</h3>
                  <p className="text-ink-muted text-sm flex-1 mb-6 leading-relaxed">{t2.what}</p>
                  <a href={t2.href} className={`${i===2?'btn-primary':'btn-teal'} justify-center`}>{t2.cta}</a>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 rounded-2xl border border-surface-border bg-white p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-disp font-bold text-2xl text-ink uppercase mb-3">{t.why2.compareTitle}<span className="brand-text-teal">{t.why2.compareTitleAccent}</span>{t.why2.compareTitlePost}</h3>
                <p className="text-ink-muted text-sm leading-relaxed mb-4">{t.why2.compareBody}</p>
              </div>
              <div className="flex flex-col gap-3">
                {t.why2.points.map((p,i)=>{
                  const ok = i===3
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 text-[10px] font-bold ${ok?'text-white':'text-red-500 bg-red-50 border border-red-200'}`} style={ok?{background:'linear-gradient(135deg,#1e293b,#0f172a)'}:{}}>
                        {ok?'✓':'✕'}
                      </span>
                      <p className={`text-sm font-mono ${ok?'text-ink font-semibold':'text-ink-muted'}`}>{p}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
