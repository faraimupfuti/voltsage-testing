'use client'
import { useState, useMemo, useCallback, useRef } from 'react'
import { Battery, BatteryFull, Clock, Zap, FileDown, Loader2, HelpCircle } from 'lucide-react'
import { calculateBatteryRuntime } from '@/lib/calculations'
import { generateSizingReportPDF } from '@/lib/pdfReport'
import { useLang } from '@/components/LanguageProvider'
import { LeadLock } from '@/components/AccessGate'
import TourGuide, { TourHandle, TourStep } from '@/components/TourGuide'

function RingGauge({ pct, color, label, value, unit }: { pct:number; color:string; label:string; value:string; unit:string }) {
  const R = 54, circ = 2 * Math.PI * R
  const offset = circ * (1 - Math.min(pct, 1))
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg width={136} height={136} viewBox="0 0 136 136" className="ring-svg">
          <circle className="ring-track" cx={68} cy={68} r={R} />
          <circle className="ring-fill" cx={68} cy={68} r={R}
            style={{ stroke: color, strokeDasharray: circ, strokeDashoffset: offset }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-mono font-bold text-2xl leading-none" style={{ color }}>{value}</div>
          <div className="font-mono text-xs text-ink-faint mt-1">{unit}</div>
        </div>
      </div>
      <div className="text-xs font-mono uppercase tracking-wider text-ink-faint text-center">{label}</div>
    </div>
  )
}

export default function BatteryRuntimeTool() {
  const { t } = useLang()
  const [capacity, setCapacity] = useState(5)
  const [dod,      setDod]      = useState(80)
  const [eff,      setEff]      = useState(95)
  const [load,     setLoad]     = useState(1.0)

  const result = useMemo(() => calculateBatteryRuntime(capacity, dod, eff, load), [capacity, dod, eff, load])
  const runtimePct = result.runtimeHours / 24
  const usablePct  = result.usableKWh / Math.max(capacity, 0.1)
  const [pdfBusy, setPdfBusy] = useState(false)
  const downloadPDF = useCallback(async () => {
    setPdfBusy(true)
    try {
      await generateSizingReportPDF({
        toolName: 'Battery Runtime Report',
        subtitle: 'Usable energy and estimated backup runtime for the battery and load parameters entered below.',
        metrics: [
          { label: 'Battery capacity (rated)', value: String(capacity), unit: 'kWh' },
          { label: 'Depth of discharge', value: String(dod), unit: '%' },
          { label: 'Battery efficiency', value: String(eff), unit: '%' },
          { label: 'Connected load', value: load.toFixed(1), unit: 'kW' },
          { label: 'Usable energy', value: result.usableKWh.toFixed(2), unit: 'kWh' },
          { label: 'Runtime at this load', value: result.runtimeHours >= 24 ? '24+' : result.runtimeHours.toFixed(1), unit: 'hours' },
        ],
        highlight: `${capacity} kWh × ${dod}% DoD × ${eff}% efficiency = ${result.usableKWh.toFixed(2)} kWh usable  ·  ÷ ${load.toFixed(1)} kW load = ${result.runtimeHours.toFixed(1)} hours runtime`,
        tables: [{
          title: 'Common reference loads',
          head: ['Reference load', 'Estimated hours'],
          body: [
            ['Fridge + 6 LED lights + TV (0.65 kW)', `${(result.usableKWh / 0.65).toFixed(1)} hrs`],
            ['2 ACs + fridge + lights (2.8 kW)', `${(result.usableKWh / 2.8).toFixed(1)} hrs`],
            ['Borehole pump (1.1 kW)', `${(result.usableKWh / 1.1).toFixed(1)} hrs`],
            ['Home office — laptop + lights (0.2 kW)', `${(result.usableKWh / 0.2).toFixed(1)} hrs`],
          ],
        }],
      })
    } finally { setPdfBusy(false) }
  }, [capacity, dod, eff, load, result])

  const sliders = [
    { label:'Battery capacity', unit:'kWh', val:capacity, set:setCapacity, min:1, max:100, step:0.5, color:'#1B17FF' },
    { label:'Depth of discharge (DoD)', unit:'%', val:dod, set:setDod, min:10, max:100, step:5, color:'#0f172a', hint:'Lithium = 80% · Lead-acid = 50%' },
    { label:'Battery efficiency', unit:'%', val:eff, set:setEff, min:60, max:100, step:1, color:'#1e293b', hint:'Lithium = 95% · Lead-acid = 80–85%' },
    { label:'Connected load', unit:'kW', val:load, set:setLoad, min:0.1, max:30, step:0.1, color:'#1B17FF', hint:'Everything switched on simultaneously' },
  ]

  const tourRef = useRef<TourHandle>(null)
  const TOUR_STEPS: TourStep[] = [
    { target: '[data-tour="batt-card"]', title: 'Welcome to the Battery Runtime Calculator', body: 'This tool tells you exactly how many hours of backup a battery will give you — before you spend money on one. Let\'s walk through it.' },
    { target: '[data-tour="batt-sliders"]', title: 'Set your battery and load', body: 'Drag each slider: battery capacity, depth of discharge, efficiency, and the load you plan to run. Results update instantly as you move them.' },
    { target: '[data-tour="batt-manual"]', title: 'Prefer to type exact numbers?', body: 'Capacity and load can also be typed directly here if you already know the exact figures from a spec sheet.' },
    { target: '[data-tour="batt-gauges"]', title: 'Your results at a glance', body: 'The two rings show your runtime in hours at this load, and how much usable energy the battery actually provides after losses.' },
    { target: '[data-tour="batt-formula"]', title: 'How the math works', body: 'This breakdown shows exactly how usable energy and runtime are calculated, step by step — no black box.' },
    { target: '[data-tour="batt-reference"]', title: 'Common reference loads', body: 'See roughly how long your battery would last running everyday combinations like a fridge and lights, or a borehole pump.' },
    { target: '[data-tour="batt-pdf"]', title: 'Download your report', body: 'Get a branded PDF with your full results — handy to keep or share when comparing batteries.' },
    { target: '[data-tour="batt-cta"]', title: 'Want an engineer\'s opinion?', body: 'Request a battery design and one of our engineers will help you choose the right one. That\'s the full tour — happy calculating!' },
  ]

  return (
    <section id="battery" className="py-24 bg-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-10">
          <div className="section-eyebrow">Free tool — Battery Runtime</div>
          <h2 className="font-disp font-extrabold text-4xl sm:text-5xl text-ink uppercase leading-tight mb-4">
            Battery Runtime<br /><span className="brand-text-orange">Calculator</span>
          </h2>
          <p className="text-ink-muted text-base leading-relaxed">
            How long will your battery actually last? Enter the battery size, depth of discharge,
            efficiency and the load you plan to run. Get the exact hours of backup — before you buy.
          </p>
        </div>

        <div className="tool-frame">
        <div className="card-flat tool-frame-inner" data-tour="batt-card">
          <div className="flex justify-end px-6 py-2.5 border-b border-surface-border bg-white">
            <button onClick={()=>tourRef.current?.start()} title="Take the tour" className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-ink-faint hover:text-brand-orange transition-colors flex-shrink-0 border border-surface-border hover:border-brand-orange/40 rounded-lg px-2.5 py-1.5"><HelpCircle size={13}/> Tutorial</button>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-surface-border bg-white">
            {/* LEFT — inputs */}
            <div className="p-5 sm:p-8">
              <h3 className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-6">Battery parameters</h3>
              <div className="space-y-7" data-tour="batt-sliders">
                {sliders.map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between mb-2">
                      <div>
                        <label className="text-sm font-mono text-ink font-medium">{s.label}</label>
                        {s.hint && <p className="text-[10px] font-mono text-ink-faint mt-0.5">{s.hint}</p>}
                      </div>
                      <span className="font-mono font-bold text-base" style={{ color: s.color }}>{s.val} {s.unit}</span>
                    </div>
                    <div className="relative">
                      <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                        onChange={e => s.set(parseFloat(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{ accentColor: s.color, background: `linear-gradient(to right, ${s.color} ${((s.val - s.min) / (s.max - s.min)) * 100}%, #e2e8f0 ${((s.val - s.min) / (s.max - s.min)) * 100}%)` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Manual inputs */}
              <div className="mt-6 grid grid-cols-2 gap-3" data-tour="batt-manual">
                <div>
                  <label className="text-[10px] font-mono uppercase text-ink-faint block mb-1">Capacity (kWh)</label>
                  <input type="number" min={0.5} step={0.5} value={capacity===0?'':capacity} onChange={e=>{const v=e.target.value;setCapacity(v===''?0:parseFloat(v)||0)}} onBlur={()=>{if(!capacity||capacity<0.5)setCapacity(0.5)}} className="tool-input text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-ink-faint block mb-1">Load (kW)</label>
                  <input type="number" min={0.1} step={0.1} value={load===0?'':load} onChange={e=>{const v=e.target.value;setLoad(v===''?0:parseFloat(v)||0)}} onBlur={()=>{if(!load||load<0.1)setLoad(0.1)}} className="tool-input text-xs" />
                </div>
              </div>
            </div>

            {/* RIGHT — results */}
            <div className="p-5 sm:p-8 flex flex-col items-center justify-center">
              <h3 className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-8 self-start">Results</h3>

              <LeadLock>
              <div className="flex flex-wrap justify-center gap-10 mb-10" data-tour="batt-gauges">
                <RingGauge pct={runtimePct} color="#1B17FF" label="Runtime at this load" value={result.runtimeHours >= 24 ? '24+' : result.runtimeHours.toFixed(1)} unit="hours" />
                <RingGauge pct={usablePct}  color="#0f172a" label="Usable energy"        value={result.usableKWh.toFixed(2)} unit="kWh" />
              </div>

              {/* Formula */}
              <div className="w-full bg-surface-subtle rounded-2xl border border-surface-border p-5 mb-6" data-tour="batt-formula">
                <div className="font-mono text-[10px] text-ink-faint uppercase tracking-wider mb-3">How it&apos;s calculated</div>
                <div className="space-y-2 font-mono text-xs text-ink-muted">
                  <div className="flex justify-between"><span>Rated capacity</span><span className="text-ink font-semibold">{capacity} kWh</span></div>
                  <div className="flex justify-between"><span>× DoD ({dod}%)</span><span className="text-ink font-semibold">{(capacity*dod/100).toFixed(2)} kWh</span></div>
                  <div className="flex justify-between"><span>× efficiency ({eff}%)</span><span className="font-bold" style={{ color:'#0f172a' }}>{result.usableKWh.toFixed(2)} kWh usable</span></div>
                  <div className="h-px bg-surface-border my-1" />
                  <div className="flex justify-between"><span>÷ load ({load.toFixed(1)} kW)</span><span className="font-bold" style={{ color:'#1B17FF' }}>{result.runtimeHours.toFixed(1)} hours</span></div>
                </div>
              </div>

              {/* Reference loads */}
              <div className="w-full bg-surface-subtle rounded-xl p-4 text-xs font-mono text-ink-muted border border-surface-border" data-tour="batt-reference">
                <div className="flex items-center gap-2 mb-3 text-ink-faint"><Battery size={14}/><span className="uppercase tracking-wider">Common reference loads</span></div>
                {[
                  { label:'Fridge + 6 LED lights + TV', kw:0.65 },
                  { label:'2 ACs + fridge + lights',    kw:2.8 },
                  { label:'Borehole pump (1.1 kW)',      kw:1.1 },
                  { label:'Home office (laptop + lights)',kw:0.2 },
                ].map(ref=>(
                  <div key={ref.label} className="flex justify-between items-center py-1.5 border-b border-surface-border last:border-0">
                    <span>{ref.label}</span>
                    <span className="text-ink font-semibold">{(result.usableKWh/ref.kw).toFixed(1)} hrs</span>
                  </div>
                ))}
              </div>
              <button onClick={downloadPDF} disabled={pdfBusy} data-tour="batt-pdf" className="w-full btn-teal justify-center disabled:opacity-40 disabled:cursor-not-allowed">{pdfBusy?<Loader2 size={13} className="animate-spin"/>:<FileDown size={13}/>} {t.toolsCommon.downloadPdf}</button>
              </LeadLock>

              <a href="#contact" data-tour="batt-cta" className="mt-6 btn-primary w-full justify-center"><Zap size={13}/> {t.toolsCommon.requestBattery}</a>
            </div>
          </div>
        </div>
        </div>
        <TourGuide ref={tourRef} tourId="battery" steps={TOUR_STEPS}/>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            { icon:<Battery size={20}/>, title:'What is DoD?', body:'Depth of Discharge is how far you can run a battery down before damage occurs. A 5 kWh lithium battery at 80% DoD gives you 4 kWh — not 5 kWh.' },
            { icon:<BatteryFull size={20}/>, title:'What is efficiency?', body:'Not all energy going in comes back out. At 95% efficiency, for every 1 kWh you store, you get 0.95 kWh back. The rest is lost as heat.' },
            { icon:<Clock size={20}/>, title:'What is runtime?', body:'Runtime is usable energy divided by your connected load. Halve your load, double your runtime — but you have to calculate it first, before you buy.' },
          ].map((c,i)=>(
            <div key={i} className="card p-5">
              <div className="text-brand-teal mb-3">{c.icon}</div>
              <h4 className="font-disp font-bold text-base uppercase text-ink mb-2">{c.title}</h4>
              <p className="text-ink-muted text-sm">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
