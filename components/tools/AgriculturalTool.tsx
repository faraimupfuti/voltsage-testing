'use client'
import{useState,useCallback,useEffect,useRef}from'react'
import{Plus,Trash2,Zap,Clock,X,ChevronDown,FileDown,Loader2,HelpCircle}from'lucide-react'
import{AG_ACTIVITIES,AgActivity,AgEquipmentRow,PSH_TABLE,findPSH,calculateAgriculturalSizing,SizingResult}from'@/lib/calculations'
import{generateSizingReportPDF}from'@/lib/pdfReport'
import{LeadLock}from'@/components/AccessGate'
import{useLang}from'@/components/LanguageProvider'
import TourGuide,{TourHandle,TourStep}from'@/components/TourGuide'
const IC:Record<string,string>={'Irrigation':'💧','Dairy Farming':'🐄','Poultry Farming':'🐓','Piggery':'🐷','Greenhouse Farming':'🌱','Crop Processing':'🌾','Mixed Farming':'🚜'}
let as=0
function Lbl({c,span}:{c:React.ReactNode;span?:boolean}){return<span className={`block text-[10px] font-mono uppercase tracking-wider text-ink-faint mb-1 ${span?'col-span-2 sm:col-span-1':''}`}>{c}</span>}
function RC({label,value,unit,accent=false,amber=false}:{label:string;value:string;unit:string;accent?:boolean;amber?:boolean}){const col=amber?'#1B17FF':accent?'#0f172a':'#1e293b';return<div className="bg-surface-subtle rounded-xl p-4 border border-surface-border"><div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint mb-1">{label}</div><div className="font-mono font-bold text-2xl leading-none" style={{color:col}}>{value}<span className="text-sm font-normal text-ink-faint ml-1">{unit}</span></div></div>}
function drawH(canvas:HTMLCanvasElement,profile:number[]){
  const ctx=canvas.getContext('2d');if(!ctx)return
  const W=canvas.width,H=canvas.height;ctx.clearRect(0,0,W,H)
  const mW=Math.max(1,...profile),pL=50,pB=34,pT=14,pR=14,plotW=W-pL-pR,plotH=H-pT-pB,bW=plotW/24
  for(let i=0;i<=5;i++){const y=pT+plotH-(i/5)*plotH;ctx.strokeStyle='#e2e8f0';ctx.lineWidth=i===0?1.5:0.8;ctx.setLineDash(i===0?[]:[3,4]);ctx.beginPath();ctx.moveTo(pL,y);ctx.lineTo(pL+plotW,y);ctx.stroke();ctx.setLineDash([]);const v=(i/5)*mW;ctx.fillStyle='#94a3b8';ctx.font='9px JetBrains Mono,monospace';ctx.textAlign='right';ctx.fillText(v>=1000?`${(v/1000).toFixed(1)}`:`${Math.round(v)}`,pL-4,y+3.5)}
  ctx.save();ctx.translate(10,pT+plotH/2);ctx.rotate(-Math.PI/2);ctx.font='9px JetBrains Mono,monospace';ctx.fillStyle='#94a3b8';ctx.textAlign='center';ctx.fillText('kW',0,0);ctx.restore()
  for(let h=0;h<24;h++){const avg=((profile[h*2]??0)+(profile[h*2+1]??0))/2,bH=(avg/mW)*plotH,x=pL+h*bW,n=h<6||h>=18;const g=ctx.createLinearGradient(0,pT+plotH-bH,0,pT+plotH);g.addColorStop(0,n?'rgba(15,23,42,0.85)':'rgba(27,23,255,0.85)');g.addColorStop(1,'rgba(0,0,0,0.02)');ctx.fillStyle=g;ctx.fillRect(x+1,pT+plotH-bH,Math.max(1,bW-2),bH)}
  ctx.fillStyle='#94a3b8';ctx.font='9px JetBrains Mono,monospace';ctx.textAlign='center'
  for(let h=0;h<24;h+=3)ctx.fillText(`${String(h).padStart(2,'0')}:00`,pL+h*bW+bW/2,pT+plotH+12)
  ctx.fillText('Hour of day',pL+plotW/2,pT+plotH+28)
  ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pL,pT);ctx.lineTo(pL,pT+plotH+1);ctx.stroke();ctx.beginPath();ctx.moveTo(pL,pT+plotH);ctx.lineTo(pL+plotW,pT+plotH);ctx.stroke()
}
export default function AgriculturalTool(){
  const{t}=useLang()
  const[act,setAct]=useState<AgActivity>('Irrigation')
  const[psh,setPsh]=useState('harare')
  const[mode,setMode]=useState<'standard'|'advanced'>('standard')
  const[rows,setRows]=useState<AgEquipmentRow[]>([])
  const[sel,setSel]=useState(AG_ACTIVITIES['Irrigation'][0].id)
  const[mN,setMN]=useState(''),[mK,setMK]=useState(0),[mF,setMF]=useState('06:00'),[mT,setMT]=useState('18:00')
  const[result,setResult]=useState<SizingResult|null>(null)
  const[pdfBusy,setPdfBusy]=useState(false)
  const hRef=useRef<HTMLCanvasElement>(null)
  useEffect(()=>{if(!rows.length){setResult(null);return};setResult(calculateAgriculturalSizing(rows,mode,findPSH(psh).psh,1))},[rows,psh,mode])
  useEffect(()=>{if(!hRef.current)return;if(!result){hRef.current.getContext('2d')?.clearRect(0,0,600,180);return};drawH(hRef.current,result.profile)},[result])
  useEffect(()=>{const eq=AG_ACTIVITIES[act];if(eq.length)setSel(eq[0].id)},[act])
  const downloadPDF=useCallback(async()=>{
    if(!result)return
    setPdfBusy(true)
    try{
      const body=rows.map(r=>{const kw=mode==='advanced'&&r.customKW?r.customKW:r.kw
        const period=r.periods.map(p=>`${p.from}–${p.to}`).join(', ')
        return[r.name,String(r.qty),`${kw} kW`,period]
      })
      await generateSizingReportPDF({
        toolName:'Agricultural Solar Sizing Report',
        subtitle:`Load profile and recommended inverter, battery and PV array sizing for a ${act.toLowerCase()} operation.`,
        location:findPSH(psh).label,
        mode,
        metrics:[
          {label:'Daily energy',value:result.Ed_kWh.toFixed(2),unit:'kWh/day'},
          {label:'Maximum running demand',value:result.Peak_kW.toFixed(2),unit:'kW'},
          {label:'Recommended inverter size',value:String(result.invSize),unit:'kW'},
          {label:'Recommended surge withstand',value:result.Surge_kW.toFixed(2),unit:'kW'},
          {label:'Recommended battery',value:result.CbattRounded.toFixed(1),unit:'kWh'},
          {label:'Recommended PV array',value:result.PpvRounded.toFixed(2),unit:'kWp'},
        ],
        highlight:`≈ ${result.panelCount} panels @ 550 Wp  ·  Night ${result.Enight_kWh.toFixed(2)} kWh  ·  Day ${result.Eday_kWh.toFixed(2)} kWh`,
        chartImage:hRef.current?.toDataURL('image/png')??null,
        tables:[{title:'Equipment schedule',head:['Equipment','Qty','Power','Operating period'],body}],
        disclaimer:'Inverter sized at 1.3× peak running demand to nearest standard size. Final system sizing and equipment selection must be verified by a qualified engineer before installation.',
      })
    }finally{setPdfBusy(false)}
  },[result,rows,mode,psh,act])
  const add=useCallback(()=>{const eq=AG_ACTIVITIES[act].find(e=>e.id===sel);if(!eq)return;as++;setRows(p=>[...p,{rowId:as,eqId:eq.id,name:eq.name,kw:eq.kw,surge:eq.surge,qty:1,periods:[{from:'06:00',to:'18:00'}],customKW:null}])},[act,sel])
  const addM=useCallback(()=>{if(mK<=0){alert('Enter kW>0');return};as++;setRows(p=>[...p,{rowId:as,eqId:'__misc__',name:mN||'Misc',kw:mK,surge:1,qty:1,periods:[{from:mF,to:mT}],customKW:null}])},[mK,mN,mF,mT])
  const rm=(id:number)=>setRows(p=>p.filter(r=>r.rowId!==id))
  const upd=(id:number,patch:Partial<AgEquipmentRow>)=>setRows(p=>p.map(r=>r.rowId===id?{...r,...patch}:r))
  const addP=(id:number)=>setRows(p=>p.map(r=>r.rowId===id?{...r,periods:[...r.periods,{from:'06:00',to:'08:00'}]}:r))
  const rmP=(id:number,i:number)=>setRows(p=>p.map(r=>r.rowId===id?{...r,periods:r.periods.filter((_,j)=>j!==i)}:r))
  const updP=(id:number,i:number,f:'from'|'to',v:string)=>setRows(p=>p.map(r=>r.rowId!==id?r:{...r,periods:r.periods.map((p,j)=>j===i?{...p,[f]:v}:p)}))
  const tourRef=useRef<TourHandle>(null)
  const TOUR_STEPS:TourStep[]=[
    {target:'[data-tour="ag-card"]',title:'Welcome to the Agricultural Sizing Tool',body:'Farm equipment behaves differently to household appliances — motors and pumps surge hard on startup. This tool accounts for that. Let\'s walk through it.'},
    {target:'[data-tour="ag-sectors"]',title:'Pick your farming sector',body:'Choose Irrigation, Dairy, Poultry, Piggery, Greenhouse, Crop Processing or Mixed Farming — this filters the equipment list to match. Switching sectors never clears equipment you\'ve already added, so feel free to mix equipment from more than one.'},
    {target:'[data-tour="ag-mode"]',title:'Standard or Advanced',body:'Standard covers most farms. Advanced unlocks custom power overrides per item and multiple daily run periods — handy for equipment that runs in more than one shift.'},
    {target:'[data-tour="ag-location"]',title:'Choose your location',body:'Pick the province or country closest to your farm for accurate peak-sun-hour data.'},
    {target:'[data-tour="ag-add"]',title:'Add equipment',body:'Select an item from the current sector\'s list and click Add — it\'ll appear below with a sensible default running time you can adjust.'},
    {target:'[data-tour="ag-rows"]',title:'Your equipment schedule',body:'Each row shows the equipment, quantity, and when it runs (From / To). This is the full list used for sizing, across every sector you\'ve added from.'},
    {target:'[data-tour="ag-misc"]',title:'Equipment not listed?',body:'Use "Add miscellaneous load" for anything not in our catalog — enter its power rating in kW and when it runs.'},
    {target:'[data-tour="ag-chart"]',title:'Your 24-hour load profile',body:'See your farm\'s electricity use hour by hour, built from everything in your equipment schedule.'},
    {target:'[data-tour="ag-metrics"]',title:'Your recommended system',body:'Daily energy, maximum running demand, and the recommended inverter, battery and PV array — sized to handle motor starting surge, not just steady running load.'},
    {target:'[data-tour="ag-pdf"]',title:'Download your report',body:'Get a branded PDF of your full results — useful to compare against any installer quote.'},
    {target:'[data-tour="ag-cta"]',title:'Want an engineer to take it further?',body:'Request a detailed agricultural design and one of our engineers will follow up. That\'s the full tour — happy sizing!'},
  ]
  const sendToNetworkDesign=useCallback(()=>{
    if(!result)return
    const netRows:{id:number;name:string;qty:number;watts:number;surge:number;from:string;to:string}[]=[]
    let nid=1
    rows.forEach(r=>{
      const w=mode==='advanced'&&r.customKW?r.customKW*1000:r.kw*1000
      r.periods.forEach(p=>netRows.push({id:nid++,name:r.name,qty:r.qty,watts:w,surge:r.surge??1,from:p.from,to:p.to}))
    })
    try{localStorage.setItem('voltsage_network_transfer',JSON.stringify({source:'Agricultural',rows:netRows,psh}))}catch{}
    window.location.href='/network-design'
  },[rows,result,mode,psh])
  return(
    <section id="agricultural" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-10">
          <div className="section-eyebrow">Free tool — Agricultural</div>
          <h2 className="font-disp font-extrabold text-4xl sm:text-5xl text-ink uppercase leading-tight mb-4">Agricultural<br/><span className="brand-text-teal">Solar Sizing Tool</span></h2>
          <p className="text-ink-muted text-base leading-relaxed">Farm loads are different. Pumps and motors draw <strong className="text-ink">2–3× their rated power on startup</strong>. Select your farm activity — the equipment list filters automatically.</p>
        </div>
        <div className="tool-frame">
        <div className="card-flat tool-frame-inner" data-tour="ag-card">
          <div className="flex flex-wrap gap-3 px-6 py-4 border-b border-surface-border bg-surface-subtle" data-tour="ag-sectors">
            {(Object.keys(AG_ACTIVITIES)as AgActivity[]).map(a=><button key={a} onClick={()=>setAct(a)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider border transition-all ${act===a?'border-brand-green text-brand-green bg-green-50':'border-surface-border text-ink-faint bg-white'}`}><span>{IC[a]}</span>{a}</button>)}
          </div>
          <div className="flex flex-wrap gap-4 items-center px-6 py-3 border-b border-surface-border bg-white">
            <div className="flex items-center gap-2" data-tour="ag-mode">
              <span className="text-xs font-mono uppercase text-ink-faint">{t.toolsCommon.mode}</span>
              <div className="flex rounded-lg overflow-hidden border border-surface-border">
                {(['standard','advanced']as const).map(m=><button key={m} onClick={()=>setMode(m)} className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all ${mode===m?'tab-active bg-surface-muted':'text-ink-faint bg-white'}`}>{m==='standard'?t.toolsCommon.standard:t.toolsCommon.advanced}</button>)}
              </div>
              {mode==='advanced'&&<span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">Power override &amp; multiple periods</span>}
            </div>
            <div className="flex items-center gap-2" data-tour="ag-location">
              <span className="text-xs font-mono uppercase text-ink-faint">{t.toolsCommon.location}</span>
              <div className="relative">
                <select value={psh} onChange={e=>setPsh(e.target.value)} className="tool-input text-xs !pr-7 min-w-[160px] sm:min-w-[200px]">
                  {PSH_TABLE.map(g=><optgroup key={g.group} label={g.group}>{g.options.map(o=><option key={o.id} value={o.id}>{o.label} — {o.psh} PSH</option>)}</optgroup>)}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"/>
              </div>
            </div>
            <button onClick={()=>tourRef.current?.start()} title="Take the tour" className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-ink-faint hover:text-brand-teal transition-colors flex-shrink-0 border border-surface-border hover:border-brand-teal/40 rounded-lg px-2.5 py-1.5"><HelpCircle size={13}/> Tutorial</button>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-surface-border bg-white">
            <div className="p-6 flex flex-col gap-4">
              <h3 className="font-mono text-xs uppercase tracking-widest text-ink-faint">Equipment schedule</h3>
              <div className="flex gap-2" data-tour="ag-add">
                <select value={sel} onChange={e=>setSel(e.target.value)} className="tool-input flex-1 text-xs">
                  {AG_ACTIVITIES[act].map(eq=><option key={eq.id} value={eq.id}>{eq.name} ({eq.kw} kW)</option>)}
                </select>
                <button onClick={add} className="btn-teal flex-shrink-0 py-2 px-4 text-xs"><Plus size={14}/> Add</button>
              </div>
              {rows.length>0&&<div className="grid grid-cols-2 sm:grid-cols-[1fr_68px_96px_96px_32px] gap-2 px-1">{['Equipment','Qty','From','To',''].map((h,i)=><Lbl key={i} c={h} span={i===0}/>)}</div>}
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1" data-tour="ag-rows">
                {rows.length===0&&<div className="text-center py-10 text-ink-faint font-mono text-xs uppercase">Add equipment above ↑</div>}
                {rows.map(r=>(
                  <div key={r.rowId} className="rounded-xl bg-surface-subtle border border-surface-border p-3 flex flex-col gap-2">
                    <div className="grid grid-cols-2 sm:grid-cols-[1fr_68px_96px_96px_32px] gap-2 items-center">
                      <div className="col-span-2 sm:col-span-1 font-mono text-[11px] text-ink truncate">{r.name}<span className="text-ink-faint ml-1 text-[10px]">({mode==='advanced'&&r.customKW?r.customKW:r.kw}kW)</span></div>
                      <input type="number" min={1} value={r.qty===0?'':r.qty} onChange={e=>{const v=e.target.value;upd(r.rowId,{qty:v===''?0:Math.max(0,parseInt(v)||0)})}} onBlur={()=>{if(!r.qty||r.qty<1)upd(r.rowId,{qty:1})}} className="tool-input text-center text-sm font-semibold !px-1"/>
                      <input type="time" value={r.periods[0]?.from??'06:00'} onChange={e=>updP(r.rowId,0,'from',e.target.value)} className="tool-input text-xs"/>
                      <input type="time" value={r.periods[0]?.to??'18:00'} onChange={e=>updP(r.rowId,0,'to',e.target.value)} className="tool-input text-xs"/>
                      <button onClick={()=>rm(r.rowId)} className="text-ink-faint hover:text-red-500 flex items-center justify-center"><Trash2 size={13}/></button>
                    </div>
                    {mode==='advanced'&&(
                      <div className="flex flex-col gap-2 pl-2 border-l-2 border-brand-green/30">
                        <div className="flex items-center gap-2 flex-wrap"><Lbl c="Custom power (kW)"/><input type="number" min={0.1} step={0.1} placeholder={String(r.kw)} value={r.customKW??''} onChange={e=>upd(r.rowId,{customKW:e.target.value===''?null:parseFloat(e.target.value)})} className="tool-input text-xs w-24"/>{r.customKW&&<span className="text-[10px] font-mono text-amber-600">override: {r.customKW} kW</span>}</div>
                        {r.periods.slice(1).map((p,idx)=>(<div key={idx} className="flex items-center gap-2 flex-wrap"><Lbl c={`Period ${idx+2}`}/><span className="text-[10px] font-mono text-ink-faint">From</span><input type="time" value={p.from} onChange={e=>updP(r.rowId,idx+1,'from',e.target.value)} className="tool-input text-xs w-24"/><span className="text-[10px] font-mono text-ink-faint">To</span><input type="time" value={p.to} onChange={e=>updP(r.rowId,idx+1,'to',e.target.value)} className="tool-input text-xs w-24"/><button onClick={()=>rmP(r.rowId,idx+1)} className="text-ink-faint hover:text-red-500"><X size={12}/></button></div>))}
                        <button onClick={()=>addP(r.rowId)} className="self-start flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase border border-brand-green/40 text-brand-green hover:bg-green-50 transition-all"><Clock size={11}/> Add another period</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-xs font-mono text-ink-faint">{rows.length} equipment items added</div>
              <details className="rounded-xl border border-surface-border overflow-hidden" data-tour="ag-misc">
                <summary className="px-4 py-3 text-xs font-mono uppercase tracking-wider text-brand-green cursor-pointer bg-green-50 list-none flex items-center gap-2"><Plus size={12}/> Add miscellaneous load</summary>
                <div className="p-4 bg-white grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Lbl c="Description"/><input value={mN} onChange={e=>setMN(e.target.value)} placeholder="e.g. Farm office lights" className="tool-input text-xs"/></div>
                  <div><Lbl c="Power (kW)"/><input type="number" min={0} step={0.1} value={mK===0?'':mK} onChange={e=>{const v=e.target.value;setMK(v===''?0:parseFloat(v)||0)}} className="tool-input text-xs"/></div>
                  <div><Lbl c="Time of use"/><div className="flex gap-1"><div className="flex-1"><Lbl c="From"/><input type="time" value={mF} onChange={e=>setMF(e.target.value)} className="tool-input text-xs"/></div><div className="flex-1"><Lbl c="To"/><input type="time" value={mT} onChange={e=>setMT(e.target.value)} className="tool-input text-xs"/></div></div></div>
                  <div className="col-span-2"><button onClick={addM} className="btn-teal w-full justify-center">Add miscellaneous load</button></div>
                </div>
              </details>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <h3 className="font-mono text-xs uppercase tracking-widest text-ink-faint">Results — {findPSH(psh).label}</h3>
              <LeadLock>
              <div className="bg-surface-subtle rounded-xl p-3 border border-surface-border" data-tour="ag-chart">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-ink-faint uppercase">24-hour load profile</span>
                  <div className="flex gap-3 text-[9px] font-mono text-ink-faint"><span><span className="inline-block w-2 h-2 rounded-sm mr-1 align-middle" style={{background:'#1B17FF'}}/>Day</span><span><span className="inline-block w-2 h-2 rounded-sm mr-1 align-middle" style={{background:'#0f172a'}}/>Night</span></div>
                </div>
                <canvas ref={hRef} width={560} height={180} className="w-full rounded-lg" style={{height:130}}/>
                {!result&&<div className="text-center text-ink-faint font-mono text-xs py-2">Add equipment to see profile →</div>}
              </div>
              <div className="grid grid-cols-2 gap-3" data-tour="ag-metrics">
                <RC label="Daily energy" value={result?result.Ed_kWh.toFixed(2):'—'} unit="kWh/day" accent/>
                <RC label="Maximum running demand" value={result?result.Peak_kW.toFixed(2):'—'} unit="kW" amber/>
                <RC label="Recommended inverter size" value={result?String(result.invSize):'—'} unit="kW"/>
                <RC label="Recommended surge withstand" value={result?result.Surge_kW.toFixed(2):'—'} unit="kW" amber/>
                <RC label="Recommended battery" value={result?result.CbattRounded.toFixed(1):'—'} unit="kWh" accent/>
                <RC label="Recommended PV array" value={result?result.PpvRounded.toFixed(2):'—'} unit="kWp"/>
              </div>
              {result&&<div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs font-mono text-green-700">≈ {result.panelCount} panels @ 550 Wp · Night {result.Enight_kWh.toFixed(2)} kWh · Day {result.Eday_kWh.toFixed(2)} kWh</div>}
              <button onClick={downloadPDF} disabled={!result||pdfBusy} data-tour="ag-pdf" className="btn-teal justify-center disabled:opacity-40 disabled:cursor-not-allowed">{pdfBusy?<Loader2 size={13} className="animate-spin"/>:<FileDown size={13}/>} {t.toolsCommon.downloadPdf}</button>
              {result&&<button onClick={sendToNetworkDesign} className="btn-secondary justify-center">Continue to Network Design →</button>}
              </LeadLock>
              <a href="#contact" data-tour="ag-cta" className="btn-teal justify-center"><Zap size={13}/> {t.toolsCommon.requestAgDesign}</a>
              <p className="text-[10px] font-mono text-ink-faint leading-relaxed">Inverter sized at 1.3× peak running demand to nearest standard size. Final design must be verified by a qualified engineer before installation.</p>
            </div>
          </div>
        </div>
        </div>
        <TourGuide ref={tourRef} tourId="agricultural" steps={TOUR_STEPS}/>
      </div>
    </section>
  )
}
