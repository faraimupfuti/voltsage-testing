'use client'
import { Zap, ChevronDown, Sun, Battery, BarChart3 } from 'lucide-react'
import { useLang } from './LanguageProvider'

export default function Hero() {
  const { t } = useLang()
  const STATS=[{val:t.hero.stat1v,label:t.hero.stat1l},{val:t.hero.stat2v,label:t.hero.stat2l},{val:t.hero.stat3v,label:t.hero.stat3l},{val:t.hero.stat4v,label:t.hero.stat4l}]
  const TOOL_PILLS=[{icon:<BarChart3 size={14}/>,label:t.hero.pill1,color:'#1B17FF',href:'#sizing'},{icon:<Sun size={14}/>,label:t.hero.pill2,color:'#1e293b',href:'#agricultural'},{icon:<Battery size={14}/>,label:t.hero.pill3,color:'#0f172a',href:'#battery'}]
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-white pt-16">
      <div className="absolute inset-0 bg-dots opacity-60 pointer-events-none"/>
      <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full pointer-events-none orb-pulse" style={{background:'radial-gradient(circle,rgba(27,23,255,0.07) 0%,transparent 70%)'}}/>
      <div className="absolute bottom-20 left-0 w-[400px] h-[400px] rounded-full pointer-events-none orb-pulse" style={{background:'radial-gradient(circle,rgba(15,23,42,0.07) 0%,transparent 70%)',animationDelay:'2s'}}/>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="section-eyebrow mb-6">{t.hero.eyebrow}</div>
            <h1 className="font-disp font-extrabold text-4xl sm:text-5xl md:text-6xl xl:text-7xl leading-[1.05] sm:leading-[1.0] tracking-tight text-ink mb-6">
              {t.hero.h1a}<br/><span className="brand-text">{t.hero.h1b}</span><br/>{t.hero.h1c}
            </h1>
            <p className="text-lg text-ink-muted leading-relaxed mb-4 max-w-lg">{t.hero.p1.split('{free}')[0]}<strong className="text-ink font-semibold">{t.hero.p1Strong}</strong>{t.hero.p1.split('{free}')[1]}</p>
            <p className="text-base text-ink-faint mb-8 max-w-md">{t.hero.p2}</p>
            <div className="flex flex-wrap gap-4 mb-10">
              <a href="#sizing" className="btn-primary"><Zap size={16}/> {t.hero.cta1}</a>
              <a href="#why" className="btn-secondary">{t.hero.cta2}</a>
            </div>
            <div className="flex flex-wrap gap-3 mb-10">
              {TOOL_PILLS.map(t=>(
                <a key={t.label} href={t.href} className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white font-mono text-xs font-semibold uppercase tracking-wider transition-all hover:shadow-md hover:-translate-y-0.5" style={{borderColor:`${t.color}40`,color:t.color}}>
                  {t.icon} {t.label}
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
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="absolute top-6 right-0 w-72 h-48 rounded-2xl border border-surface-border bg-surface-subtle rotate-3 shadow-card"/>
            <div className="absolute top-3 right-3 w-72 h-48 rounded-2xl border border-surface-border bg-white rotate-1 shadow-card"/>
            <div className="relative w-80 rounded-2xl bg-white border border-surface-border shadow-card-lg p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint mb-1">Sizing result</div>
                  <div className="font-disp font-bold text-lg text-ink uppercase">Harare Residence</div>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#1B17FF,#14109E)'}}>
                  <Sun size={18} className="text-white"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[{label:'Daily energy',val:'8.4',unit:'kWh/day',color:'#14109E'},{label:'Peak demand',val:'2.8',unit:'kW',color:'#1B17FF'},{label:'Inverter size',val:'5',unit:'kW',color:'#0f172a'},{label:'PV array',val:'4.0',unit:'kWp',color:'#1e293b'}].map(r=>(
                  <div key={r.label} className="bg-surface-subtle rounded-xl p-3">
                    <div className="text-[9px] font-mono uppercase tracking-wider text-ink-faint mb-1">{r.label}</div>
                    <div className="font-mono font-bold text-xl leading-none" style={{color:r.color}}>{r.val}<span className="text-xs font-normal text-ink-faint ml-0.5">{r.unit}</span></div>
                  </div>
                ))}
              </div>
              <div className="bg-surface-subtle rounded-xl p-3">
                <div className="text-[9px] font-mono uppercase tracking-wider text-ink-faint mb-2">24-hour load profile</div>
                <div className="flex items-end gap-0.5 h-10">
                  {[1,1,1,2,2,3,5,7,6,5,5,6,5,4,5,6,7,8,7,6,5,3,2,1].map((v,i)=>(
                    <div key={i} className="flex-1 rounded-sm" style={{height:`${(v/8)*100}%`,background:(i<6||i>=18)?'#0f172a':'#1B17FF',opacity:0.75}}/>
                  ))}
                </div>
                <div className="flex justify-between mt-1.5 text-[8px] font-mono text-ink-faint">
                  <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
                </div>
              </div>
              <a href="#sizing" className="mt-4 btn-primary w-full justify-center text-xs"><Zap size={13}/> Try the sizing tool</a>
            </div>
            <div className="absolute -bottom-4 left-4 bg-white rounded-xl shadow-card-md px-4 py-3 border border-surface-border flex items-center gap-3 z-20">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg,#1e293b,#0f172a)'}}><Battery size={15} className="text-white"/></div>
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-ink-faint">Battery runtime</div>
                <div className="font-mono font-bold text-sm text-ink">5 kWh → 7.6 hrs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"><ChevronDown size={22} className="text-ink-faint"/></div>
    </section>
  )
}
