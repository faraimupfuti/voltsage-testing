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
  calculatePremiumScenarios, selectInverter, getBatteryModuleOptions, checkPvCompatibility, BatteryModuleOption,
  PV_MODULE_DB, findPvModule, calculatePvArrayConfig, GenericPvModule, PvArrayConfigResult,
  designBatteryCircuit, designPvCircuit, designAcCircuit, CircuitDesign, GenericInverter,
  recommendSwitching, SwitchingRecommendation,
  designEarthing, EarthingDesign,
  buildScenarioBOQ, BoqRow,
  DeratingConditions, DEFAULT_DERATING, CABLE_DERATING_AMBIENT_OPTIONS, CABLE_DERATING_GROUPING, CABLE_DERATING_INSTALL,
} from '@/lib/calculations'
import { Plus, Trash2, ChevronDown, ChevronRight, Check, ArrowRight, ArrowLeft, Zap, FileText, Sparkles, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { generateSizingReportPDF } from '@/lib/pdfReport'
import { usePshSelection, PshSelect, LocationStatus, useReportDetails } from '@/components/tools/SiteTools'

const STEPS = ['Loads', 'Site Supply', 'Energy Goals', 'Design']
let rid = 1000

function RC({label,value,unit,accent=false}:{label:string;value:string;unit:string;accent?:boolean}){
  return <div className="bg-surface-subtle rounded-xl p-3.5 border border-surface-border">
    <div className="text-[9px] font-mono uppercase tracking-widest text-ink-faint mb-1">{label}</div>
    <div className="font-mono font-bold text-xl leading-none" style={{color:accent?'#2621FF':'#0B1220'}}>{value}<span className="text-xs font-normal text-ink-faint ml-1">{unit}</span></div>
  </div>
}

function CircuitCard({title,circuit}:{title:string;circuit:CircuitDesign|null}){
  if(!circuit) return null
  return (
    <div className="rounded-lg border border-surface-border bg-surface-subtle p-3">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">{title}</span>
        <span className="text-[10px] font-mono text-ink-faint">{circuit.designCurrentA} A design current</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div><span className="block text-ink-faint text-[9px] uppercase">Cable</span><span className="text-ink">{circuit.cable?`${circuit.cable.tierId} (${circuit.cable.mm2}mm²)`:'—'}</span>{circuit.cable && circuit.deratingFactor!==undefined && circuit.deratingFactor<1 && <span className="block text-[9px] text-amber-600">{circuit.cable.currentA}A rated → {circuit.deratedAmpacityA}A derated (×{circuit.deratingFactor})</span>}</div>
        <div><span className="block text-ink-faint text-[9px] uppercase">Breaker</span><span className="text-ink">{circuit.protection?`${circuit.protection.tierId} (${circuit.protection.currentA}A)`:'—'}</span></div>
        <div><span className="block text-ink-faint text-[9px] uppercase">Isolator</span><span className="text-ink">{circuit.isolator?`${circuit.isolator.tierId} (${circuit.isolator.currentA}A)`:'—'}</span></div>
        <div><span className="block text-ink-faint text-[9px] uppercase">{circuit.fuse!==undefined?'Fuse':circuit.spd?'SPD':''}</span><span className="text-ink">{circuit.fuse?`${circuit.fuse.tierId} (${circuit.fuse.currentA}A)`:circuit.spd?`${circuit.spd.tierId} (${circuit.spd.spdType})`:circuit.fuse===null?'Not required':'—'}</span></div>
      </div>
      {circuit.protectionExceedsCable && <div className="mt-2 text-[11px] text-red-500">Selected protection device ({circuit.protection?.currentA}A) exceeds this cable's derated ampacity ({circuit.deratedAmpacityA}A) — the cable needs upsizing, not the breaker downsizing, per the "protect the cable" rule.</div>}
      {!circuit.cable && <div className="mt-2 text-[11px] text-red-500">No database cable rated for this current — exceeds largest generic tier, needs a manufacturer-specific or paralleled-conductor design.</div>}
      {circuit.note && <div className="mt-2 text-[11px] text-amber-600">{circuit.note}</div>}
    </div>
  )
}

function SwitchingCard({switching}:{switching:SwitchingRecommendation|null}){
  if(!switching) return null
  if(!switching.needed){
    return (
      <div className="rounded-lg border border-surface-border bg-surface-subtle p-3">
        <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint mb-1">Source switching</div>
        <div className="text-xs font-mono text-ink-muted">{switching.reason}</div>
      </div>
    )
  }
  return (
    <div className="rounded-lg border border-surface-border bg-surface-subtle p-3">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">Source switching</span>
        <span className="text-[10px] font-mono text-ink-faint">{switching.designCurrentA} A design current</span>
      </div>
      <div className="text-[11px] font-mono text-ink-muted mb-2">{switching.reason}</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
        <div className="bg-white rounded-md p-2 border border-surface-border">
          <span className="block text-ink-faint text-[9px] uppercase">Manual changeover</span>
          <span className="text-ink">{switching.manual?`${switching.manual.tierId} (${switching.manual.currentA}A)`:'No fitting tier'}</span>
        </div>
        <div className="bg-white rounded-md p-2 border border-surface-border">
          <span className="block text-ink-faint text-[9px] uppercase">Automatic — ATS (certified)</span>
          <span className="text-ink">{switching.ats?`${switching.ats.tierId} (${switching.ats.currentA}A, ${switching.ats.transferTimeS}s)`:'No fitting tier'}</span>
        </div>
        <div className="bg-white rounded-md p-2 border border-surface-border">
          <span className="block text-ink-faint text-[9px] uppercase">Automatic — AVS (budget)</span>
          <span className="text-ink">{switching.avs?`${switching.avs.tierId} (${switching.avs.currentA}A, ${switching.avs.transferTimeS}s)`:'No fitting tier'}</span>
        </div>
      </div>
      {switching.avsCaution && switching.avsWarning && (
        <div className="flex items-start gap-2 mt-2 px-2.5 py-2 rounded-md bg-amber-50 border border-amber-200 text-[11px] text-amber-700">
          <AlertTriangle size={12} className="flex-shrink-0 mt-0.5"/> {switching.avsWarning}
        </div>
      )}
    </div>
  )
}

function EarthingCard({earthing}:{earthing:EarthingDesign|null}){
  if(!earthing || !earthing.points.length) return null
  return (
    <div className="rounded-lg border border-surface-border bg-surface-subtle p-3">
      <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint mb-2">Earthing &amp; RCD</div>
      <div className="space-y-1.5 mb-2">
        {earthing.points.map(p=>(
          <div key={p.label} className="flex items-center justify-between text-xs font-mono bg-white rounded-md px-2.5 py-1.5 border border-surface-border">
            <span className="text-ink-muted">{p.label}</span>
            <span className="text-ink font-semibold">{p.conductorCsaMm2} mm²</span>
          </div>
        ))}
        <div className="flex items-center justify-between text-xs font-mono bg-white rounded-md px-2.5 py-1.5 border border-surface-border">
          <span className="text-ink-muted">RCD (AC output)</span>
          <span className="text-ink font-semibold">{earthing.rcd.ratingMa}mA — {earthing.rcd.type}</span>
        </div>
      </div>
      <p className="text-[10px] text-ink-faint leading-relaxed">{earthing.rcd.note} Earth electrode resistance is site- and soil-dependent and needs a physical earth test — not calculable from equipment data alone.</p>
    </div>
  )
}

function DiagramNode({label,active,onClick,muted=false}:{label:string;active:boolean;onClick:()=>void;muted?:boolean}){
  return (
    <button onClick={onClick} className={`text-left px-3 py-2.5 rounded-lg border text-xs font-mono whitespace-nowrap transition-colors ${active?'border-brand-teal bg-teal-50 text-teal-700':muted?'border-dashed border-surface-border2 bg-white text-ink-faint':'border-surface-border bg-white text-ink hover:border-brand-teal/50'}`}>
      {label}
    </button>
  )
}

interface DiagramSpec { id:string; label:string; specLines:string[] }

function SystemDiagram({site,phase,inverter,battOpt,pvModule,pvArray,acCircuit,pvCircuit,battCircuit,switching}:{
  site:SiteSupplyOption; phase:SitePhase; inverter:GenericInverter; battOpt:BatteryModuleOption|null
  pvModule:GenericPvModule|null; pvArray:PvArrayConfigResult|null
  acCircuit:CircuitDesign|null; pvCircuit:CircuitDesign|null; battCircuit:CircuitDesign|null
  switching:SwitchingRecommendation|null
}){
  const [sel,setSel]=useState<string>('inverter')
  const hasPv = !!(pvModule && pvArray?.feasible)
  const nodes: DiagramSpec[] = [
    ...(hasPv?[{id:'pv',label:'PV Array',specLines:[`${pvModule!.tierId} — ${pvModule!.ratedPowerW}W ${pvModule!.technology}`,`${pvArray!.panelCount} modules, ${pvArray!.recommended?.seriesCount}S×${pvArray!.recommended?.parallelCount}P`,`${pvArray!.actualPvKwp.toFixed(2)} kWp actual array capacity`]}]:[]),
    ...(hasPv?[{id:'dcprot',label:'DC Protection',specLines:[pvCircuit?.cable?`Cable: ${pvCircuit.cable.tierId} (${pvCircuit.cable.mm2}mm²)`:'—',pvCircuit?.protection?`Breaker: ${pvCircuit.protection.tierId} (${pvCircuit.protection.currentA}A)`:'—',pvCircuit?.isolator?`Isolator: ${pvCircuit.isolator.tierId}`:'—',pvCircuit?.spd?`SPD: ${pvCircuit.spd.tierId} (${pvCircuit.spd.spdType})`:'—']}]:[]),
    {id:'inverter',label:'Inverter',specLines:[`${inverter.tierId} — ${inverter.capacityKva} kVA / ${inverter.capacityKwCont} kW cont.`,`${inverter.surgeWithstandKva} kVA surge withstand`,`${inverter.mpptTrackers} MPPT tracker(s), ${inverter.phases}-phase`,`Battery bus: ${inverter.batteryVoltageVdc}Vdc`]},
    {id:'battery',label:'Battery Bank',specLines:battOpt?[`${battOpt.tierId} — ${battOpt.chemistry}`,`${battOpt.modules} × ${battOpt.moduleKwh} kWh module`,`${battOpt.resultingKwh} kWh total`,battCircuit?`Cable: ${battCircuit.cable?.tierId??'—'}, Breaker: ${battCircuit.protection?.tierId??'—'}`:'']:['No compatible battery module']},
    {id:'acprot',label:'AC Protection',specLines:[acCircuit?.cable?`Cable: ${acCircuit.cable.tierId} (${acCircuit.cable.mm2}mm²)`:'—',acCircuit?.protection?`Breaker: ${acCircuit.protection.tierId} (${acCircuit.protection.currentA}A)`:'—',acCircuit?.isolator?`Isolator: ${acCircuit.isolator.tierId}`:'—',acCircuit?.spd?`SPD: ${acCircuit.spd.tierId} (${acCircuit.spd.spdType})`:'—']},
    ...(switching?.needed?[{id:'switching',label:'Switching',specLines:[switching.reason,switching.ats?`ATS: ${switching.ats.tierId} (${switching.ats.currentA}A)`:'',switching.manual?`Manual: ${switching.manual.tierId} (${switching.manual.currentA}A)`:'',switching.avs?`AVS: ${switching.avs.tierId} (${switching.avs.currentA}A)`:''].filter(Boolean)}]:[]),
    {id:'loads',label:'Site Loads',specLines:['Selected appliance/load list from Stage 1']},
  ]
  const gridInvolved = ['grid_only','grid_generator','solar_grid','solar_grid_generator'].includes(site)
  const generatorInvolved = ['grid_generator','generator_only','solar_generator','solar_grid_generator'].includes(site)
  const active = nodes.find(n=>n.id===sel) ?? nodes[nodes.length-1]

  return (
    <div className="rounded-xl border border-surface-border bg-white p-4">
      <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint mb-3">Interactive system diagram — click a component</div>
      {(gridInvolved||generatorInvolved) && (
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {gridInvolved && <DiagramNode label="Utility Grid" active={false} onClick={()=>{}} muted/>}
          {generatorInvolved && <DiagramNode label="Generator" active={false} onClick={()=>{}} muted/>}
          <span className="text-ink-faint text-xs">↘</span>
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {nodes.filter(n=>n.id!=='battery').map((n,i,arr)=>(
          <div key={n.id} className="flex items-center gap-2">
            <DiagramNode label={n.label} active={sel===n.id} onClick={()=>setSel(n.id)}/>
            {i<arr.length-1 && <ArrowRight size={13} className="text-ink-faint flex-shrink-0"/>}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mb-3 pl-4">
        <span className="text-ink-faint text-xs">↕ DC bus</span>
        <DiagramNode label="Battery Bank" active={sel==='battery'} onClick={()=>setSel('battery')}/>
      </div>
      <div className="rounded-lg bg-surface-subtle border border-surface-border p-3">
        <div className="text-xs font-mono font-semibold text-ink mb-1.5">{active.label}</div>
        <ul className="space-y-0.5">
          {active.specLines.filter(Boolean).map((l,i)=><li key={i} className="text-[11px] font-mono text-ink-muted">{l}</li>)}
        </ul>
      </div>
      <p className="text-[10px] text-ink-faint mt-3 leading-relaxed">2D interactive placeholder for the full rotatable 3D visualisation — driven by the same design data as the rest of this stage, not a generic illustration.</p>
    </div>
  )
}

export default function NetworkDesignPage(){
  const [step,setStep]=useState(1)
  const [rows,setRows]=useState<NetworkLoadRow[]>([])
  const sel=usePshSelection('harare')
  const pshVal=sel.resolved.psh
  const report=useReportDetails()
  const [site,setSite]=useState<SiteSupplyOption|null>(null)
  const [phase,setPhase]=useState<SitePhase>('1')
  const [siteNote,setSiteNote]=useState('')
  const [goals,setGoals]=useState<EnergyGoal[]>([])
  const [importedFrom,setImportedFrom]=useState<string|null>(null)
  const [pvModuleSel,setPvModuleSel]=useState<Record<string,string>>({})
  const [battModuleSel,setBattModuleSel]=useState<Record<string,string>>({})
  const [derating,setDerating]=useState<DeratingConditions>(DEFAULT_DERATING)

  useEffect(()=>{
    try{
      const raw=localStorage.getItem('voltsage_network_transfer')
      if(raw){
        const data=JSON.parse(raw)
        if(data.rows&&data.rows.length){setRows(data.rows);setImportedFrom(data.source);if(data.psh)sel.setId(data.psh)}
      }
    }catch{}
  },[])

  const addRow=useCallback(()=>{rid++;setRows(p=>[...p,{id:rid,name:'',qty:1,watts:100,surge:1,from:'06:00',to:'18:00'}])},[])
  const updateRow=useCallback((id:number,patch:Partial<NetworkLoadRow>)=>{setRows(p=>p.map(r=>r.id===id?{...r,...patch}:r))},[])
  const removeRow=useCallback((id:number)=>setRows(p=>p.filter(r=>r.id!==id)),[])

  const validRows=useMemo(()=>rows.filter(r=>r.name.trim()&&r.watts>0),[rows])
  const baseline=useMemo(()=>calculateNetworkLoadProfile(validRows,pshVal),[validRows,pshVal])

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
            <h1 className="font-disp font-extrabold text-4xl sm:text-5xl text-ink leading-tight mb-4">Low-Voltage <span className="brand-text">Network Design</span></h1>
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
                        <PshSelect sel={sel} className="min-w-[160px] sm:min-w-[200px]"/>
                      </div>
                    </div>
                    <div className="mb-4 rounded-lg overflow-hidden border border-surface-border"><LocationStatus sel={sel}/></div>

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
                      {rows.length===0 && <div className="text-center text-ink-faint font-mono text-xs py-8 border border-dashed border-surface-border rounded-xl">No loads yet — add one below, or send a load profile here from the premium sizing tools.</div>}
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
                      <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint mb-3">Assessment baseline</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-sm">
                        <div><span className="block text-ink-faint text-[10px] uppercase">Inverter</span><span className="text-ink font-semibold">{baseline.invSize} kW</span></div>
                        <div><span className="block text-ink-faint text-[10px] uppercase">Surge</span><span className="text-ink font-semibold">{baseline.Surge_kW.toFixed(2)} kW</span></div>
                        <div><span className="block text-ink-faint text-[10px] uppercase">Battery</span><span className="text-ink font-semibold">{baseline.CbattRounded.toFixed(1)} kWh</span></div>
                        <div><span className="block text-ink-faint text-[10px] uppercase">PV array</span><span className="text-ink font-semibold">{baseline.PpvRounded.toFixed(2)} kWp</span></div>
                      </div>
                    </div>

                    <div className="mb-8">{report.form}</div>

                    <div className="rounded-xl border border-surface-border p-4 mb-8 bg-white">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint mb-3">Site installation conditions (applies to the draft electrical design below)</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="text-xs font-mono">
                          <span className="block text-ink-faint text-[9px] uppercase mb-1">Ambient temperature</span>
                          <select value={derating.ambientC} onChange={e=>setDerating(d=>({...d,ambientC:Number(e.target.value)}))} className="w-full border border-surface-border rounded-md px-2 py-1.5 bg-white text-ink">
                            {CABLE_DERATING_AMBIENT_OPTIONS.map(t=><option key={t} value={t}>{t}°C</option>)}
                          </select>
                        </label>
                        <label className="text-xs font-mono">
                          <span className="block text-ink-faint text-[9px] uppercase mb-1">Grouped circuits</span>
                          <select value={derating.groupingCircuits} onChange={e=>setDerating(d=>({...d,groupingCircuits:Number(e.target.value)}))} className="w-full border border-surface-border rounded-md px-2 py-1.5 bg-white text-ink">
                            {CABLE_DERATING_GROUPING.map(g=><option key={g.label} value={g.minCircuits}>{g.label}</option>)}
                          </select>
                        </label>
                        <label className="text-xs font-mono">
                          <span className="block text-ink-faint text-[9px] uppercase mb-1">Installation method</span>
                          <select value={derating.installLabel} onChange={e=>setDerating(d=>({...d,installLabel:e.target.value}))} className="w-full border border-surface-border rounded-md px-2 py-1.5 bg-white text-ink">
                            {CABLE_DERATING_INSTALL.map(i=><option key={i.label} value={i.label}>{i.label}</option>)}
                          </select>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-6 mb-8">
                      {scenarios.map((sc,i)=>{
                        const goalMeta=ENERGY_GOALS.find(g=>g.id===sc.goal)
                        const invRes=selectInverter(sc,phase)
                        const battOpts=invRes.inverter?getBatteryModuleOptions(invRes.inverter,sc):[]
                        const selectedBattOpt=battOpts.find(o=>o.tierId===(battModuleSel[sc.goal]??battOpts[0]?.tierId))??battOpts[0]??null
                        const pvCheck=invRes.inverter?checkPvCompatibility(sc,invRes.inverter):null
                        const modTierId=pvModuleSel[sc.goal]||'M03'
                        const selMod=findPvModule(modTierId)
                        const pvArray=(invRes.inverter&&pvCheck?.ok&&selMod)?calculatePvArrayConfig(sc,invRes.inverter,selMod):null
                        const battCircuit=invRes.inverter?designBatteryCircuit(invRes.inverter,sc,derating):null
                        const pvCircuit=(invRes.inverter&&selMod&&pvArray)?designPvCircuit(selMod,invRes.inverter,pvArray,derating):null
                        const acCircuit=invRes.inverter?designAcCircuit(invRes.inverter,phase,derating):null
                        const switching=(invRes.inverter&&site)?recommendSwitching(site,phase,invRes.inverter):null
                        const earthing=invRes.inverter?designEarthing(battCircuit,pvCheck?.ok?pvCircuit:null,acCircuit):null
                        const boq=invRes.inverter?buildScenarioBOQ({inverter:invRes.inverter,battOpt:selectedBattOpt,pvModule:selMod??null,pvArray:pvCheck?.ok?pvArray:null,battCircuit,pvCircuit:pvCheck?.ok?pvCircuit:null,acCircuit,switching,earthing}):[]
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

                                {invRes.pvFallbackApplied && invRes.closestCapacityInverter && (
                                  <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs font-mono text-amber-700">
                                    <Info size={13} className="flex-shrink-0"/> The closest-capacity inverter ({invRes.closestCapacityInverter.tierId}) can't fit this scenario's {sc.pv.toFixed(2)} kWp PV array, so {invRes.inverter.tierId} was substituted instead.
                                  </div>
                                )}

                                {invRes.pvUnresolvable && (
                                  <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs font-mono text-red-500">
                                    <AlertTriangle size={13} className="flex-shrink-0"/> No {phase}-phase inverter with enough surge withstand can also fit this scenario's {sc.pv.toFixed(2)} kWp PV array — the design requires splitting the array across multiple inverters or reducing PV capacity.
                                  </div>
                                )}

                                {battOpts.length>0 ? (
                                  <div className="mb-3">
                                    <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint mb-2">Battery module options ({invRes.inverter.batteryVoltageVdc}V) — select one for the BOQ</div>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs font-mono">
                                        <thead><tr className="text-ink-faint uppercase text-[10px]"><th className="text-left py-1.5 pr-3"></th><th className="text-left py-1.5 pr-3">Module</th><th className="text-right py-1.5 px-3">Qty</th><th className="text-right py-1.5 px-3">Module kWh</th><th className="text-right py-1.5 pl-3">Resulting kWh</th></tr></thead>
                                        <tbody>
                                          {battOpts.map(o=>{
                                            const isSel=(battModuleSel[sc.goal]??battOpts[0]?.tierId)===o.tierId
                                            return (
                                            <tr key={o.tierId} className={`border-t border-surface-border cursor-pointer ${isSel?'bg-teal-50/60':''}`} onClick={()=>setBattModuleSel(p=>({...p,[sc.goal]:o.tierId}))}>
                                              <td className="py-1.5 pr-1 w-5"><input type="radio" checked={isSel} onChange={()=>setBattModuleSel(p=>({...p,[sc.goal]:o.tierId}))} /></td>
                                              <td className="py-1.5 pr-3 text-ink">{o.tierId} <span className="text-ink-faint">({o.chemistry})</span></td>
                                              <td className="py-1.5 px-3 text-right text-ink font-semibold">{o.modules}</td>
                                              <td className="py-1.5 px-3 text-right text-ink-muted">{o.moduleKwh}</td>
                                              <td className="py-1.5 pl-3 text-right text-ink font-semibold">{o.resultingKwh}</td>
                                            </tr>
                                          )})}
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
                                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono mb-3 ${pvCheck.ok?'bg-teal-50 border-teal-200 text-teal-700':'bg-red-50 border-red-200 text-red-500'}`}>
                                    {pvCheck.ok?<CheckCircle2 size={13} className="flex-shrink-0"/>:<AlertTriangle size={13} className="flex-shrink-0"/>} {pvCheck.message}
                                  </div>
                                )}

                                {pvCheck?.ok && (
                                  <div className="rounded-lg border border-surface-border bg-white p-3.5">
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                      <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">PV module &amp; string configuration</div>
                                      <select value={modTierId} onChange={e=>setPvModuleSel(p=>({...p,[sc.goal]:e.target.value}))} className="text-xs font-mono border border-surface-border rounded-md px-2 py-1 bg-white text-ink">
                                        {PV_MODULE_DB.map(m=>(
                                          <option key={m.tierId} value={m.tierId}>{m.tierId} — {m.ratedPowerW}W {m.technology}</option>
                                        ))}
                                      </select>
                                    </div>

                                    {pvArray && (
                                      pvArray.feasible ? (
                                        <>
                                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 font-mono text-xs">
                                            <div><span className="block text-ink-faint text-[9px] uppercase">Panel count</span><span className="text-ink font-semibold">{pvArray.panelCount} × {selMod!.ratedPowerW}W</span></div>
                                            <div><span className="block text-ink-faint text-[9px] uppercase">Actual PV array</span><span className="text-ink font-semibold">{pvArray.actualPvKwp.toFixed(2)} kWp</span></div>
                                            <div><span className="block text-ink-faint text-[9px] uppercase">Series window</span><span className="text-ink font-semibold">{pvArray.seriesMin}–{pvArray.seriesMaxFinal} modules</span></div>
                                            <div><span className="block text-ink-faint text-[9px] uppercase">Recommended</span><span className="text-brand-teal font-semibold">{pvArray.recommended!.seriesCount}S × {pvArray.recommended!.parallelCount}P</span></div>
                                          </div>
                                          {pvArray.validConfigs.length>1 && (
                                            <div className="overflow-x-auto">
                                              <table className="w-full text-xs font-mono">
                                                <thead><tr className="text-ink-faint uppercase text-[9px]"><th className="text-left py-1 pr-3">Config</th><th className="text-right py-1 px-3">Series</th><th className="text-right py-1 pl-3">Parallel strings</th></tr></thead>
                                                <tbody>
                                                  {pvArray.validConfigs.map(c=>{
                                                    const isRec=c.seriesCount===pvArray.recommended!.seriesCount
                                                    return (
                                                      <tr key={c.seriesCount} className={`border-t border-surface-border ${isRec?'bg-teal-50/60':''}`}>
                                                        <td className="py-1 pr-3 text-ink">{c.seriesCount}S × {c.parallelCount}P {isRec&&<span className="text-brand-teal">(recommended)</span>}</td>
                                                        <td className="py-1 px-3 text-right text-ink-muted">{c.seriesCount}</td>
                                                        <td className="py-1 pl-3 text-right text-ink-muted">{c.parallelCount}</td>
                                                      </tr>
                                                    )
                                                  })}
                                                </tbody>
                                              </table>
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs font-mono text-amber-700">
                                          <AlertTriangle size={13} className="flex-shrink-0"/> {pvArray.message}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}

                                <div className="rounded-lg border border-dashed border-surface-border2 bg-white p-3.5">
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">Electrical design — draft</span>
                                    <span className="text-[9px] font-mono uppercase text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">Pending engineering review</span>
                                  </div>
                                  <div className="space-y-2">
                                    <CircuitCard title="Battery ↔ Inverter DC" circuit={battCircuit}/>
                                    {pvCheck?.ok && pvArray?.feasible && <CircuitCard title="PV String / Array DC" circuit={pvCircuit}/>}
                                    <CircuitCard title={`Inverter AC Output (${phase}-phase)`} circuit={acCircuit}/>
                                    <SwitchingCard switching={switching}/>
                                    <EarthingCard earthing={earthing}/>
                                  </div>
                                  <p className="text-[10px] text-ink-faint mt-2 leading-relaxed">Provisional sizing using a standard 1.25× continuous-current margin, ambient/grouping/installation-method derating from the generic cable derating table, and (for earthing/RCD) generic IEC 60364 conventions since VoltSage hasn't published an earthing database yet — none of this is cross-checked against a formal VoltSage Electrical Design Specification. For engineering review only.</p>
                                </div>

                                {invRes.inverter && (
                                  <SystemDiagram
                                    site={site!} phase={phase} inverter={invRes.inverter} battOpt={selectedBattOpt}
                                    pvModule={pvCheck?.ok?selMod??null:null} pvArray={pvCheck?.ok?pvArray:null}
                                    acCircuit={acCircuit} pvCircuit={pvCheck?.ok?pvCircuit:null} battCircuit={battCircuit}
                                    switching={switching}
                                  />
                                )}

                                {boq.length>0 && (
                                  <div className="rounded-xl border border-surface-border bg-white p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">Bill of quantities (draft)</span>
                                      <button
                                        onClick={()=>report.run(async client=>{
                                          await generateSizingReportPDF({
                                            preparedFor:client,
                                            psh:pshVal,
                                            toolName:'VoltSage Premium Engineering Report',
                                            subtitle:`${ENERGY_GOALS.find(g=>g.id===sc.goal)?.label ?? sc.goal} design scenario — preliminary system architecture and bill of quantities.`,
                                            location:sel.resolved.label,
                                            metrics:[
                                              {label:'Inverter',value:invRes.inverter!.tierId,unit:`${invRes.inverter!.capacityKva} kVA`},
                                              {label:'Battery',value:selectedBattOpt?selectedBattOpt.tierId:'—',unit:selectedBattOpt?`${selectedBattOpt.resultingKwh} kWh`:''},
                                              {label:'PV array',value:pvCheck?.ok&&pvArray?.feasible?`${pvArray.panelCount} modules`:'—',unit:pvCheck?.ok&&pvArray?.feasible?`${pvArray.actualPvKwp.toFixed(2)} kWp`:''},
                                              {label:'Site phase',value:phase,unit:'phase'},
                                            ],
                                            tables:[
                                              {title:'Bill of Quantities', head:['Category','Item','Specification','Qty','Unit'], body:boq.map(r=>[r.category,r.item,r.spec,String(r.qty),r.unit])},
                                            ],
                                            disclaimer:"This is a preliminary design generated from a generic equipment database using provisional sizing rules pending VoltSage's formal Electrical Design Specification. Final equipment selection, cable sizing, protection and earthing must be completed and verified by a qualified Electrical Engineer before installation.",
                                          })
                                        })}
                                        className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-brand-teal hover:text-teal-700 transition-colors"
                                      ><FileText size={12}/> Download report (PDF)</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs font-mono">
                                        <thead><tr className="text-ink-faint uppercase text-[9px]"><th className="text-left py-1.5 pr-3">Category</th><th className="text-left py-1.5 px-3">Item</th><th className="text-left py-1.5 px-3">Spec</th><th className="text-right py-1.5 pl-3">Qty</th></tr></thead>
                                        <tbody>
                                          {boq.map((r,i)=>(
                                            <tr key={i} className="border-t border-surface-border">
                                              <td className="py-1.5 pr-3 text-ink-faint">{r.category}</td>
                                              <td className="py-1.5 px-3 text-ink">{r.item}</td>
                                              <td className="py-1.5 px-3 text-ink-muted">{r.spec}</td>
                                              <td className="py-1.5 pl-3 text-right text-ink font-semibold">{r.qty} {r.unit.startsWith('run')?'':r.unit}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                    <p className="text-[10px] text-ink-faint mt-2 leading-relaxed">Cable quantities are per continuous run — exact lengths depend on physical site layout and are confirmed on site survey, not calculable from equipment data alone.</p>
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
