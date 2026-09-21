'use client'
import { Zap, ChevronDown, Sun, Battery, BarChart3 } from 'lucide-react'
import { useLang } from './LanguageProvider'
import SolarFlow from './SolarFlow'

export default function Hero() {
  const { t } = useLang()
  const STATS=[{val:t.hero.stat1v,label:t.hero.stat1l},{val:t.hero.stat2v,label:t.hero.stat2l},{val:t.hero.stat3v,label:t.hero.stat3l},{val:t.hero.stat4v,label:t.hero.stat4l}]
  const TOOL_PILLS=[{icon:<BarChart3 size={14}/>,label:t.hero.pill1,color:'#2621FF',href:'#sizing'},{icon:<Sun size={14}/>,label:t.hero.pill2,color:'#C6741E',href:'#agricultural'},{icon:<Battery size={14}/>,label:t.hero.pill3,color:'#0B1220',href:'#battery'}]
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-white pt-16">
      <div className="absolute inset-0 bg-schematic opacity-70 pointer-events-none"/>
      <div className="absolute top-10 right-[-120px] w-[560px] h-[560px] rounded-full pointer-events-none orb-pulse" style={{background:'radial-gradient(circle,rgba(38,33,255,0.08) 0%,transparent 70%)'}}/>
      <div className="absolute bottom-0 left-[-100px] w-[420px] h-[420px] rounded-full pointer-events-none orb-pulse" style={{background:'radial-gradient(circle,rgba(198,116,30,0.09) 0%,transparent 70%)',animationDelay:'3s'}}/>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
          <div>
            <div className="section-eyebrow">{t.hero.eyebrow}</div>
            <h1 className="font-disp font-extrabold text-4xl sm:text-5xl md:text-6xl xl:text-[4.5rem] leading-[1.05] tracking-tight text-ink mb-6">
              {t.hero.h1a}<br/><span className="brand-text">{t.hero.h1b}</span><br/>{t.hero.h1c}
            </h1>
            <p className="text-lg text-ink-muted leading-relaxed mb-4 max-w-lg">{t.hero.p1.split('{free}')[0]}<strong className="text-ink font-semibold">{t.hero.p1Strong}</strong>{t.hero.p1.split('{free}')[1]}</p>
            <p className="text-base text-ink-faint mb-8 max-w-md">{t.hero.p2}</p>
            <div className="flex flex-wrap gap-4 mb-10">
              <a href="#sizing" className="btn-primary"><Zap size={16}/> {t.hero.cta1}</a>
              <a href="#why" className="btn-secondary">{t.hero.cta2}</a>
            </div>
            <div className="flex flex-wrap gap-3 mb-10">
              {TOOL_PILLS.map(p=>(
                <a key={p.label} href={p.href} className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white font-mono text-xs font-semibold uppercase tracking-wider transition-all hover:shadow-md hover:-translate-y-0.5" style={{borderColor:`${p.color}40`,color:p.color}}>
                  {p.icon} {p.label}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap gap-8">
              {STATS.map(s=>(
                <div key={s.label}>
                  <div className="font-disp font-bold text-2xl brand-text-orange">{s.val}</div>
                  <div className="text-xs font-mono text-ink-faint uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Signature moment: the energy-flow schematic — sun to socket, drawn as one live circuit */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl border border-surface-border bg-white shadow-card-lg overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-5">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint mb-1">System trace — live estimate</div>
                  <div className="font-disp font-bold text-lg text-ink">Harare residence, 3-bed</div>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-brand-orange">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse"/>Sizing
                </span>
              </div>

              <SolarFlow className="w-full h-auto px-4 py-4"/>

              <div className="border-t border-surface-border px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-ink-faint">Battery runtime</div>
                  <div className="font-mono font-bold text-sm text-ink">5 kWh → 7.6 hrs</div>
                </div>
                <a href="#sizing" className="btn-primary text-xs"><Zap size={13}/> Try the sizing tool</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <a href="#why" aria-label="Scroll to learn more" className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"><ChevronDown size={22} className="text-ink-faint"/></a>
    </section>
  )
}
