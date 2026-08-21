'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import Header from '@/components/Header'
import { Footer } from '@/components/ContactAndFooter'
import Reveal from '@/components/Reveal'
import { LeadLock } from '@/components/AccessGate'
import {
  NetworkLoadRow, calculateNetworkLoadProfile,
  SiteSupplyOption, SITE_SUPPLY_OPTIONS, SitePhase,
  EnergyGoal, ENERGY_GOALS, GOAL_ELIGIBILITY, CONDITIONAL_GOALS,
  calculatePremiumScenarios, selectInverter, getBatteryModuleOptions, checkPvCompatibility,
  PSH_TABLE, findPSH,
} from '@/lib/calculations'
import { Plus, Trash2, ChevronDown, ChevronRight, Check, ArrowRight, ArrowLeft, Zap, Cable, Box, FileText, Sparkles, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'

const STEPS = ['Loads', 'Site Supply', 'Energy Goals', 'Design']
let rid = 1000

function RC({label,value,unit,accent=false}:{label:string;value:string;unit:string;accent?:boolean}){
  return <div className="bg-surface-subtle rounded-xl p-3.5 border border-surface-border">
    <div className="text-[9px] font-mono uppercase tracking-widest text-ink-faint mb-1">{label}</div>
    <div className="font-mono font-bold text-xl leading-none" style={{color:accent?'#1B17FF':'#0f172a'}}>{value}<span className="text-xs font-normal text-ink-faint ml-1">{unit}</span></div>
  </div>
}

export default function NetworkDesignPage(){
  const [step,setStep]=useState(1)
  const [rows,setRows]=useState<NetworkLoadRow[]>([])
  const [psh,setPsh]=useState('harare')
  const [site,setSite]=useState<SiteSupplyOption|null>(null)
  const [phase,setPhase]=useState<SitePhase>('1')
  const [siteNote,setSiteNote]=useState('')
  const [goals,setGoals]=useState<EnergyGoal[]>([])
  const [importedFrom,setImportedFrom]=useState<string|null>(null)

  useEffect(()=>{
    try{
      const raw=localStorage.getItem('voltsage_network_transfer')
      if(raw){
        const data=JSON.parse(raw)
        if(data.rows&&data.rows.length){setRows(data.rows);setImportedFrom(data.source);if(data.psh)setPsh(data.psh)}
      }
    }catch{}
  },[])

  const addRow=useCallback(()=>{rid++;setRows(p=>[...p,{id:rid,name:'',qty:1,watts:100,surge:1,from:'06:00',to:'18:00'}])},[])
  const updateRow=useCallback((id:number,patch:Partial<NetworkLoadRow>)=>{setRows(p=>p.map(r=>r.id===id?{...r,...patch}:r))},[])
  const removeRow=useCallback((id:number)=>setRows(p=>p.filter(r=>r.id!==id)),[])

  const validRows=useMemo(()=>rows.filter(r=>r.name.trim()&&r.watts>0),[rows])
  const baseline=useMemo(()=>calculateNetworkLoadProfile(validRows,findPSH(psh).psh),[validRows,psh])

  const eligibleGoals=useMemo(()=>site?GOAL_ELIGIBILITY[site]:[],[site])
  const conditionalSet=useMemo(()=>new Set(site?CONDITIONAL_GOALS[site]||[]:[]),[site])

  // Site changed -> drop any selected goals no longer eligible
  useEffect(()=>{ setGoals(p=>p.filter(g=>eligibleGoals.includes(g))) },[eligibleGoals])

  const toggleGoal=(g:EnergyGoal)=>{
    setGoals(p=>{
      if(p.includes(g)) return p.filter(x=>x!==g)
      if(p.length>=3) return p
      let next=[...p,g]
      // Mutual exclusivity: Energy Independence No-Export vs Export
      if(g==='independence_export') next=next.filter(x=>x!=='independence_no_export')
      if(g==='independence_no_export') next=next.filter(x=>x!=='independence_export')
      return next
    })
  }

  const scenarios=useMemo(()=>calculatePremiumScenarios(baseline,goals),[baseline,goals])

  const canNext = step===1 ? validRows.length>0 : step===2 ? !!site : step===3 ? goals.length>0 : true

  return (
    <>
      <Header/>
      <main className="bg-white">
        <section className="pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="section-eyebrow">Premium Design Tool</div>
            <h1 className="font-disp font-extrabold text-4xl sm:text-5xl text-ink uppercase leading-tight mb-4">Low-Voltage <span className="brand-text">Network Design</span></h1>
            <p className="text-ink-muted text-lg leading-relaxed max-w-2xl mb-10">
              Takes your load profile and turns it into a site-specific energy system design — accounting for your
              existing electricity supply and what you actually want the system to achieve, not just a generic size.
            </p>
          </Reveal>

          {importedFrom && (
            <Reveal>
              <div className="flex items-center gap-3 mb-8 px-4 py-3 rounded-xl bg-teal-50 border border-teal-200 text-sm font-mono text-teal-700">
                <Sparkles size={16} className="flex-shrink-0"/> Imported {rows.length} load{rows.length!==1?'s':''} from your {importedFrom} Sizing Tool results.
              </div>
            </Reveal>
          )}

          <Reveal delay={80}>
          <div className="tool-frame mb-8">
            <div className="tool-frame-inner">
              <div className="flex flex-wrap items-center gap-1.5 px-4 sm:px-6 py-4 border-b border-surface-border bg-white overflow-x-auto">
                {STEPS.map((label,i)=>{
                  const n=i+1, active=step===n, done=step>n
                  return (
                    <div key={label} className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={()=>{if(done)setStep(n)}} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider transition-all ${active?'tab-active bg-surface-muted':done?'text-brand-teal cursor-pointer':'text-ink-faint cursor-default'}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${active?'bg-brand-orange text-white':done?'bg-brand-teal text-white':'bg-surface-border text-ink-faint'}`}>{done?<Check size={11}/>:n}</span>
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                      {i<STEPS.length-1 && <ChevronRight size={13} className="text-ink-faint flex-shrink-0"/>}
                    </div>
                  )
                })}
              </div>

              <div className="p-5 sm:p-8">
                {step===1 && (
                  <div>
                    <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                      <div>
                        <h2 className="font-disp font-bold text-lg text-ink mb-1">Load Profile Manager</h2>
                        <p className="text-sm text-ink-muted">Add, edit or remove the loads this system needs to power.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase text-ink-faint">Location</span>
                        <div className="relative">
                          <select value={psh} onChange={e=>setPsh(e.target.value)} className="tool-input text-xs !pr-7 min-w-[160px] sm:min-w-[200px]">
                            {PSH_TABLE.map(g=><optgroup key={g.group} label={g.group}>{g.options.map(o=><option key={o.id} value={o.id}>{o.label} — {o.psh} PSH</option>)}</optgroup>)}
                          </select>
                          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"/>
                        </div>
                      </div>
                    </div>

                    {rows.length>0 && <div className="grid grid-cols-2 sm:grid-cols-[1fr_56px_72px_56px_84px_84px_32px] gap-2 px-1 mb-2">
                      {['Load name','Qty','Watts','Surge×','From','To',''].map((h,i)=><span key={i} className={`block text-[10px] font-mono uppercase tracking-wider text-ink-faint mb-1 ${i===0?'col-span-2 sm:col-span-1':''}`}>{h}</span>)}
                    </div>}
                    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1 mb-4">
                      {rows.map(r=>(
                        <div key={r.id} className="grid grid-cols-2 sm:grid-cols-[1fr_56px_72px_56px_84px_84px_32px] gap-2 items-center">
                          <input value={r.name} onChange={e=>updateRow(r.id,{name:e.target.value})} placeholder="e.g. Water pump" className="col-span-2 sm:col-span-1 tool-input text-xs"/>
                          <input type="number" min={1} value={r.qty===0?'':r.qty} onChange={e=>{const v=e.target.value;updateRow(r.id,{qty:v===''?0:Math.max(0,parseInt(v)||0)})}} onBlur={()=>{if(!r.qty||r.qty<1)updateRow(r.id,{qty:1})}} className="tool-input text-center text-xs !px-1"/>
                          <input type="number" min={0} value={r.watts===0?'':r.watts} onChange={e=>{const v=e.target.value;updateRow(r.id,{watts:v===''?0:parseFloat(v)||0})}} onBlur={()=>{if(!r.watts)updateRow(r.id,{watts:100})}} className="tool-input text-center text-xs !px-1"/>
                          <input type="number" min={1} step={0.5} value={r.surge===0?'':r.surge} onChange={e=>{const v=e.target.value;updateRow(r.id,{surge:v===''?0:parseFloat(v)||0})}} onBlur={()=>{if(!r.surge||r.surge<1)updateRow(r.id,{surge:1})}} className="tool-input text-center text-xs !px-1"/>
                          <input type="time" value={r.from} onChange={e=>updateRow(r.id,{from:e.target.value})} className="tool-input text-xs !px-1"/>
                          <input type="time" value={r.to} onChange={e=>updateRow(r.id,{to:e.target.value})} className="tool-input text-xs !px-1"/>
                          <button onClick={()=>removeRow(r.id)} className="text-ink-faint hover:text-red-500 transition-colors flex justify-center"><Trash2 size={14}/></button>
                        </div>
                      ))}
                      {rows.length===0 && <div className="text-center text-ink-faint font-mono text-xs py-8 border border-dashed border-surface-border rounded-xl">No loads yet — add one below, or send a load profile here from the free sizing tools.</div>}
                    </div>
                    <button onClick={addRow} className="btn-teal py-2 px-4 text-xs mb-8"><Plus size={14}/> Add load</button>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <RC label="Daily energy" value={baseline.Ed_kWh.toFixed(2)} unit="kWh/day" accent/>
                      <RC label="Peak demand" value={baseline.Peak_kW.toFixed(2)} unit="kW"/>
                      <RC label="Surge demand" value={baseline.Surge_kW.toFixed(2)} unit="kW"/>
                      <RC label="Baseline inverter" value={String(baseline.invSize)} unit="kW" accent/>
                      <RC label="Baseline battery" value={baseline.CbattRounded.toFixed(1)} unit="kWh"/>
                      <RC label="Baseline PV array" value={baseline.PpvRounded.toFixed(2)} unit="kWp"/>
                    </div>
                  </div>
                )}

                {step===2 && (
                  <div>
                    <h2 className="font-disp font-bold text-lg text-ink mb-1">Site Energy Supply Configuration</h2>
                    <p className="text-sm text-ink-muted mb-6">What electricity supply already exists at the site?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {SITE_SUPPLY_OPTIONS.map(opt=>(
                        <button key={opt.id} onClick={()=>setSite(opt.id)} className={`text-left p-4 rounded-xl border transition-all ${site===opt.id?'border-brand-orange bg-brand-orange/5 shadow-card-md':'border-surface-border hover:border-surface-border2 bg-white'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${site===opt.id?'border-brand-orange bg-brand-orange':'border-surface-border'}`}>{site===opt.id&&<Check size={10} className="text-white"/>}</span>
                            <span className="font-mono text-xs font-bold uppercase text-ink">{opt.label}</span>
                          </div>
                          <p className="text-xs text-ink-muted pl-6">{opt.body}</p>
                        </button>
                      ))}
                    </div>

                    <label className="text-[10px] font-mono uppercase tracking-wider text-ink-faint block mb-2">Supply phase</label>
                    <div className="flex rounded-lg overflow-hidden border border-surface-border w-fit mb-6">
                      {(['1','3'] as SitePhase[]).map(p=>(
                        <button key={p} onClick={()=>setPhase(p)} className={`px-5 py-2 text-xs font-mono uppercase tracking-wider transition-all ${phase===p?'tab-active bg-surface-muted':'text-ink-faint bg-white'}`}>{p==='1'?'Single-phase':'Three-phase'}</button>
                      ))}
                    </div>

                    <label className="text-[10px] font-mono uppercase tracking-wider text-ink-faint block mb-1.5">Tell us more about your existing setup (optional)</label>
                    <textarea value={siteNote} onChange={e=>setSiteNote(e.target.value)} rows={3} placeholder="e.g. 5kVA generator, existing 3kW solar array installed 2022…" className="tool-input text-sm w-full"/>
                  </div>
                )}

                {step===3 && (
                  <div>
                    <h2 className="font-disp font-bold text-lg text-ink mb-1">Energy Goals</h2>
                    <p className="text-sm text-ink-muted mb-2">Select up to 3 goals, in order of priority. Only goals compatible with your site supply are shown.</p>
                    {goals.length>0 && <p className="text-xs font-mono text-brand-orange mb-6">Priority order: {goals.map((g,i)=>`${i+1}. ${ENERGY_GOALS.find(e=>e.id===g)?.label}`).join('  ·  ')}</p>}
                    {goals.length===0 && <div className="mb-6"/>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ENERGY_GOALS.filter(g=>eligibleGoals.includes(g.id)).map(g=>{
                        const idx=goals.indexOf(g.id), on=idx>-1
                        const disabled=!on&&goals.length>=3
                        return (
                          <button key={g.id} onClick={()=>toggleGoal(g.id)} disabled={disabled} className={`text-left p-4 rounded-xl border transition-all ${on?'border-brand-teal bg-teal-50 shadow-card-md':disabled?'border-surface-border bg-surface-subtle opacity-50 cursor-not-allowed':'border-surface-border hover:border-surface-border2 bg-white'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 text-[10px] font-bold ${on?'border-brand-teal bg-brand-teal text-white':'border-surface-border text-transparent'}`}>{on?idx+1:''}</span>
                              <span className="font-mono text-xs font-bold uppercase text-ink">{g.label}</span>
                              {conditionalSet.has(g.id) && <span className="text-[9px] font-mono uppercase text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">Conditional</span>}
                            </div>
                            <p className="text-xs text-ink-muted pl-7">{g.body}</p>
                          </button>
                        )
                      })}
                    </div>
                    {conditionalSet.size>0 && <p className="text-[11px] text-ink-faint mt-4 flex items-center gap-1.5"><Info size={12}/> Goals marked Conditional require confirming export/net-metering availability with your utility before they're fully applicable.</p>}
                  </div>
                )}

                {step===4 && (
                  <LeadLock>
                  <div>
                    <h2 className="font-disp font-bold text-lg text-ink mb-1">System Design</h2>
                    <p className="text-sm text-ink-muted mb-6">Each selected goal produces its own independent design scenario — adjustments are not combined.</p>

                    <div className="rounded-xl border border-surface-border p-4 mb-8 bg-surface-subtle">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint mb-3">Free-tool baseline</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-sm">
                        <div><span className="block text-ink-faint text-[10px] uppercase">Inverter</span><span className="text-ink font-semibold">{baseline.invSize} kW</span></div>
                        <div><span className="block text-ink-faint text-[10px] uppercase">Surge</span><span className="text-ink font-semibold">{baseline.Surge_kW.toFixed(2)} kW</span></div>
                        <div><span className="block text-ink-faint text-[10px] uppercase">Battery</span><span className="text-ink font-semibold">{baseline.CbattRounded.toFixed(1)} kWh</span></div>
                        <div><span className="block text-ink-faint text-[10px] uppercase">PV array</span><span className="text-ink font-semibold">{baseline.PpvRounded.toFixed(2)} kWp</span></div>
                      </div>
                    </div>

                    <div className="space-y-6 mb-8">
                      {scenarios.map((sc,i)=>{
                        const goalMeta=ENERGY_GOALS.find(g=>g.id===sc.goal)
                        const invRes=selectInverter(sc,phase)
                        const battOpts=invRes.inverter?getBatteryModuleOptions(invRes.inverter,sc):[]
                        const pvCheck=invRes.inverter?checkPvCompatibility(sc,invRes.inverter):null
                        return (
                          <div key={sc.goal} className="rounded-2xl border-2 border-brand-orange bg-brand-orange/5 p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <span className="w-6 h-6 rounded-full bg-brand-orange text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">{i+1}</span>
                              <span className="font-disp font-bold text-base text-ink">{goalMeta?.label}</span>
                              <span className="text-[9px] font-mono uppercase text-ink-faint">{i===0?'Highest priority':i===1?'Secondary':'Tertiary'}</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                              <RC label="Inverter" value={sc.invSize.toFixed(1)} unit="kW" accent/>
                              <RC label="Surge" value={sc.surge.toFixed(2)} unit="kW"/>
                              <RC label="Battery" value={sc.battery.toFixed(2)} unit="kWh" accent/>
                              <RC label="PV array" value={sc.pv.toFixed(2)} unit="kWp"/>
                            </div>

                            {invRes.inverter ? (
                              <>
                                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-white border border-surface-border">
                                  <CheckCircle2 size={14} className="text-brand-teal flex-shrink-0"/>
                                  <span className="text-xs font-mono text-ink">Selected inverter: <strong>{invRes.inverter.tierId}</strong> — {invRes.inverter.capacityKva} kVA / {invRes.inverter.capacityKwCont} kW cont., {invRes.inverter.surgeWithstandKva} kVA surge withstand</span>
                                </div>

                                {battOpts.length>0 ? (
                                  <div className="mb-3">
                                    <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint mb-2">Battery module options ({invRes.inverter.batteryVoltageVdc}V)</div>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs font-mono">
                                        <thead><tr className="text-ink-faint uppercase text-[10px]"><th className="text-left py-1.5 pr-3">Module</th><th className="text-right py-1.5 px-3">Qty</th><th className="text-right py-1.5 px-3">Module kWh</th><th className="text-right py-1.5 pl-3">Resulting kWh</th></tr></thead>
                                        <tbody>
                                          {battOpts.map(o=>(
                                            <tr key={o.tierId} className="border-t border-surface-border">
                                              <td className="py-1.5 pr-3 text-ink">{o.tierId} <span className="text-ink-faint">({o.chemistry})</span></td>
                                              <td className="py-1.5 px-3 text-right text-ink font-semibold">{o.modules}</td>
                                              <td className="py-1.5 px-3 text-right text-ink-muted">{o.moduleKwh}</td>
                                              <td className="py-1.5 pl-3 text-right text-ink font-semibold">{o.resultingKwh}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs font-mono text-amber-700">
                                    <AlertTriangle size={13} className="flex-shrink-0"/> No compatible battery module found in the database for this inverter's system voltage ({invRes.inverter.batteryVoltageVdc}V) — high-voltage rack systems need direct engineering consultation.
                                  </div>
                                )}

                                {pvCheck && (
                                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono ${pvCheck.ok?'bg-teal-50 border-teal-200 text-teal-700':'bg-red-50 border-red-200 text-red-500'}`}>
                                    {pvCheck.ok?<CheckCircle2 size={13} className="flex-shrink-0"/>:<AlertTriangle size={13} className="flex-shrink-0"/>} {pvCheck.message}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs font-mono text-amber-700">
                                <AlertTriangle size={13} className="flex-shrink-0"/> {invRes.reason}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint mb-3">Next design stages</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                      {[
                        {icon:Cable,title:'Cable Sizing, Protection & Earthing',body:'Conductors, breakers, isolators, SPDs and earthing — requires electrical code data not yet loaded into the design engine.'},
                        {icon:Box,title:'Interactive 3D Visualisation',body:'A rotatable 3D model of your system, built from this exact design — not a generic illustration.'},
                        {icon:FileText,title:'Engineering Report & Bill of Quantities',body:'A full report combining this design with costed equipment and financial analysis.'},
                        {icon:Zap,title:'Switching & Source Management',body:'Changeover switches, ATS and AVS selection for multi-source sites.'},
                      ].map((s,i)=>(
                        <div key={i} className="rounded-xl border border-dashed border-surface-border p-4 opacity-80">
                          <div className="flex items-center gap-2 mb-1.5">
                            <s.icon size={15} className="text-ink-faint"/>
                            <span className="font-mono text-[10px] font-bold uppercase text-ink-faint tracking-wider">In Development</span>
                          </div>
                          <p className="text-sm font-semibold text-ink mb-1">{s.title}</p>
                          <p className="text-xs text-ink-faint leading-relaxed">{s.body}</p>
                        </div>
                      ))}
                    </div>

                    <a href="/#contact" className="btn-primary justify-center"><Zap size={13}/> Request this design from an engineer</a>
                    <p className="text-[10px] font-mono text-ink-faint leading-relaxed mt-4">This is a preliminary design based on a generic equipment database. Final equipment selection, cable sizing, protection and earthing must be completed and verified by a qualified Electrical Engineer before installation.</p>
                  </div>
                  </LeadLock>
                )}
              </div>

              <div className="flex justify-between items-center px-5 sm:px-8 py-5 border-t border-surface-border bg-surface-subtle">
                <button onClick={()=>setStep(s=>Math.max(1,s-1))} disabled={step===1} className="flex items-center gap-1.5 text-xs font-mono uppercase text-ink-faint hover:text-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><ArrowLeft size={13}/> Back</button>
                {step<4 ? (
                  <button onClick={()=>setStep(s=>Math.min(4,s+1))} disabled={!canNext} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">Continue <ArrowRight size={13}/></button>
                ) : <span/>}
              </div>
            </div>
          </div>
          </Reveal>
        </section>
      </main>
      <Footer/>
    </>
  )
}
