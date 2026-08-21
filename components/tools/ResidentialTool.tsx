'use client'
import{useState,useCallback,useEffect,useRef}from'react'
import{Plus,Trash2,Zap,Clock,X,ChevronDown,FileDown,Loader2,HelpCircle}from'lucide-react'
import{APPLIANCE_CATALOG,ApplianceRow,PSH_TABLE,findPSH,calculateResidentialSizing,SizingResult}from'@/lib/calculations'
import{generateSizingReportPDF}from'@/lib/pdfReport'
import{LeadLock}from'@/components/AccessGate'
import{useLang}from'@/components/LanguageProvider'
import TourGuide,{TourHandle,TourStep}from'@/components/TourGuide'
const CC:Record<string,string>={'Lighting':'#1B17FF','Entertainment & Electronics':'#4640FF','Refrigeration':'#14109E','Water Systems':'#8D88FF','Kitchen':'#0A0880','Climate Control':'#312ECC','Laundry':'#64748b','High Power Loads':'#0f172a','Miscellaneous':'#94a3b8'}
const CATS=[...new Set(APPLIANCE_CATALOG.map(a=>a.cat))]
let rs=0
function Lbl({c,span}:{c:React.ReactNode;span?:boolean}){return<span className={`block text-[10px] font-mono uppercase tracking-wider text-ink-faint mb-1 ${span?'col-span-2 sm:col-span-1':''}`}>{c}</span>}
function RC({label,value,unit,accent=false,amber=false}:{label:string;value:string;unit:string;accent?:boolean;amber?:boolean}){
  const col=amber?'#1B17FF':accent?'#0f172a':'#1e293b'
  return<div className="bg-surface-subtle rounded-xl p-4 border border-surface-border"><div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint mb-1">{label}</div><div className="font-mono font-bold text-2xl leading-none" style={{color:col}}>{value}<span className="text-sm font-normal text-ink-faint ml-1">{unit}</span></div></div>
}
function drawHist(canvas:HTMLCanvasElement,profile:number[]){
  const ctx=canvas.getContext('2d');if(!ctx)return
  const W=canvas.width,H=canvas.height;ctx.clearRect(0,0,W,H)
  const mW=Math.max(1,...profile),pL=46,pB=32,pT=14,pR=14,plotW=W-pL-pR,plotH=H-pT-pB,bW=plotW/24
  for(let i=0;i<=5;i++){const y=pT+plotH-(i/5)*plotH;ctx.strokeStyle='#e2e8f0';ctx.lineWidth=i===0?1.5:0.8;ctx.setLineDash(i===0?[]:[3,4]);ctx.beginPath();ctx.moveTo(pL,y);ctx.lineTo(pL+plotW,y);ctx.stroke();ctx.setLineDash([]);const v=(i/5)*mW;ctx.fillStyle='#94a3b8';ctx.font='9px JetBrains Mono,monospace';ctx.textAlign='right';ctx.fillText(v>=1000?`${(v/1000).toFixed(1)}`:`${Math.round(v)}`,pL-4,y+3.5)}
  ctx.save();ctx.translate(10,pT+plotH/2);ctx.rotate(-Math.PI/2);ctx.font='9px JetBrains Mono,monospace';ctx.fillStyle='#94a3b8';ctx.textAlign='center';ctx.fillText('kW',0,0);ctx.restore()
  for(let h=0;h<24;h++){const avg=((profile[h*2]??0)+(profile[h*2+1]??0))/2,bH=(avg/mW)*plotH,x=pL+h*bW,n=h<6||h>=18;const g=ctx.createLinearGradient(0,pT+plotH-bH,0,pT+plotH);g.addColorStop(0,n?'rgba(15,23,42,0.85)':'rgba(27,23,255,0.85)');g.addColorStop(1,'rgba(0,0,0,0.02)');ctx.fillStyle=g;ctx.fillRect(x+1,pT+plotH-bH,Math.max(1,bW-2),bH)}
  ctx.fillStyle='#94a3b8';ctx.font='9px JetBrains Mono,monospace';ctx.textAlign='center'
  for(let h=0;h<24;h+=3)ctx.fillText(`${String(h).padStart(2,'0')}:00`,pL+h*bW+bW/2,pT+plotH+12)
  ctx.fillText('Hour of day',pL+plotW/2,pT+plotH+26)
  ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pL,pT);ctx.lineTo(pL,pT+plotH+1);ctx.stroke();ctx.beginPath();ctx.moveTo(pL,pT+plotH);ctx.lineTo(pL+plotW,pT+plotH);ctx.stroke()
}
export default function ResidentialTool(){
  const{t}=useLang()
  const[rows,setRows]=useState<ApplianceRow[]>([])
  const[sc,setSc]=useState('Lighting')
  const[si,setSi]=useState(APPLIANCE_CATALOG.find(a=>a.cat==='Lighting')?.id??'')
  const[psh,setPsh]=useState('harare')
  const[mode,setMode]=useState<'standard'|'advanced'>('standard')
  const[mW,setMW]=useState(0),[mD,setMD]=useState(''),[mF,setMF]=useState('06:00'),[mT,setMT]=useState('22:00')
  const[result,setResult]=useState<SizingResult|null>(null)
  const[pdfBusy,setPdfBusy]=useState(false)
  const hRef=useRef<HTMLCanvasElement>(null)
  useEffect(()=>{if(!rows.length){setResult(null);return};setResult(calculateResidentialSizing(rows,mode,findPSH(psh).psh,1))},[rows,psh,mode])
  useEffect(()=>{if(!hRef.current)return;if(!result){hRef.current.getContext('2d')?.clearRect(0,0,600,180);return};drawHist(hRef.current,result.profile)},[result])
  const downloadPDF=useCallback(async()=>{
    if(!result)return
    setPdfBusy(true)
    try{
      const body=rows.map(r=>{const a=APPLIANCE_CATALOG.find(ap=>ap.id===r.applianceId);const nm=r.miscName??a?.name??'Unknown';const ie=a?.type==='energy'
        const w=r.miscWatt??(mode==='advanced'&&r.customWatt?r.customWatt:(a?.watt??0))
        const period=ie?'Continuous · 35% duty':r.periods.map(p=>`${p.from}–${p.to}`).join(', ')
        return[nm,String(r.qty),ie?`${a?.kwh??0} kWh/day`:`${w} W`,period]
      })
      await generateSizingReportPDF({
        toolName:'Residential Solar Sizing Report',
        subtitle:'Load profile and recommended inverter, battery and PV array sizing for a residential or small commercial site.',
        location:findPSH(psh).label,
        mode,
        metrics:[
          {label:'Daily energy',value:result.Ed_kWh.toFixed(2),unit:'kWh/day'},
          {label:'Peak demand',value:result.Peak_kW.toFixed(2),unit:'kW'},
          {label:'Recommended inverter size',value:String(result.invSize),unit:'kW'},
          {label:'Recommended surge withstand',value:result.Surge_kW.toFixed(2),unit:'kW'},
          {label:'Recommended battery',value:result.CbattRounded.toFixed(1),unit:'kWh'},
          {label:'Recommended PV array',value:result.PpvRounded.toFixed(2),unit:'kWp'},
        ],
        highlight:`≈ ${result.panelCount} panels @ 550 Wp  ·  Night ${result.Enight_kWh.toFixed(2)} kWh  ·  Day ${result.Eday_kWh.toFixed(2)} kWh`,
        chartImage:hRef.current?.toDataURL('image/png')??null,
        tables:[{title:'Load inputs',head:['Appliance','Qty','Power / Energy','Operating period'],body}],
      })
    }finally{setPdfBusy(false)}
  },[result,rows,mode,psh])
  const add=useCallback(()=>{const a=APPLIANCE_CATALOG.find(ap=>ap.id===si);if(!a)return;if(mode==='standard'&&rows.length>=15){alert('Standard: max 15');return};rs++;setRows(p=>[...p,{rowId:rs,applianceId:si,qty:1,periods:[{from:'18:00',to:'22:00'}],customWatt:null}])},[si,rows.length,mode])
  const addM=useCallback(()=>{if(mW<=0){alert('Enter W>0');return};rs++;setRows(p=>[...p,{rowId:rs,applianceId:'__misc__',qty:1,periods:[{from:mF,to:mT}],miscName:mD||'Misc',miscWatt:mW}])},[mW,mD,mF,mT])
  const rm=(id:number)=>setRows(p=>p.filter(r=>r.rowId!==id))
  const upd=(id:number,patch:Partial<ApplianceRow>)=>setRows(p=>p.map(r=>r.rowId===id?{...r,...patch}:r))
  const addP=(id:number)=>setRows(p=>p.map(r=>r.rowId===id?{...r,periods:[...r.periods,{from:'06:00',to:'08:00'}]}:r))
  const rmP=(id:number,i:number)=>setRows(p=>p.map(r=>r.rowId===id?{...r,periods:r.periods.filter((_,j)=>j!==i)}:r))
  const updP=(id:number,i:number,f:'from'|'to',v:string)=>setRows(p=>p.map(r=>r.rowId!==id?r:{...r,periods:r.periods.map((p,j)=>j===i?{...p,[f]:v}:p)}))
  const tourRef=useRef<TourHandle>(null)
  const TOUR_STEPS:TourStep[]=[
    {target:'[data-tour="res-card"]',title:'Welcome to the Sizing Tool',body:'This tool builds a real 24-hour load profile from the appliances you add, then recommends the right inverter, battery and PV array. Let\'s walk through it.'},
    {target:'[data-tour="res-mode"]',title:'Standard or Advanced',body:'Standard mode is enough for most homes — up to 15 appliances. Advanced unlocks unlimited appliances, custom power overrides and multiple daily run periods per appliance.'},
    {target:'[data-tour="res-location"]',title:'Choose your location',body:'Solar output depends on peak sun hours, which vary by region. Pick the province or country closest to you for an accurate result.'},
    {target:'[data-tour="res-catalog"]',title:'Browse appliance categories',body:'Appliances are grouped by category — Lighting, Refrigeration, Kitchen, and so on. Tap a category to filter the list below.'},
    {target:'[data-tour="res-add"]',title:'Add an appliance',body:'Pick an appliance from the dropdown and click Add. It\'ll appear in your list below with a default running time you can adjust.'},
    {target:'[data-tour="res-rows"]',title:'Your appliance list',body:'Each row shows the appliance, how many you have (Qty), and when it runs (From / To). Click the trash icon to remove a row.'},
    {target:'[data-tour="res-misc"]',title:'Something not in the list?',body:'Use "Add miscellaneous load" for any appliance that isn\'t in our catalog — just enter its power rating and when it runs.'},
    {target:'[data-tour="res-chart"]',title:'Your 24-hour load profile',body:'This chart shows your electricity use hour by hour — dark bars for night, blue for day. It updates live as you add appliances.'},
    {target:'[data-tour="res-metrics"]',title:'Your recommended system', body:'Daily energy, peak demand, and the recommended inverter, battery and PV array size — calculated the same way a qualified engineer would size it.'},
    {target:'[data-tour="res-pdf"]',title:'Download your report',body:'Get a branded PDF with your full results and load profile — handy to compare against any installer quote.'},
    {target:'[data-tour="res-cta"]',title:'Want a hand from a real engineer?',body:'When you\'re ready, request a detailed design and one of our engineers will take it from here. That\'s the full tour — happy sizing!'},
  ]
  const sendToNetworkDesign=useCallback(()=>{
    if(!result)return
    const netRows:{id:number;name:string;qty:number;watts:number;surge:number;from:string;to:string}[]=[]
    let nid=1
    rows.forEach(r=>{
      const a=APPLIANCE_CATALOG.find(ap=>ap.id===r.applianceId)
      const nm=r.miscName??a?.name??'Unknown'
      if(a?.type==='energy'){
        const w=Math.round(((a.kwh??0)*1000)/24)
        netRows.push({id:nid++,name:nm,qty:r.qty,watts:w,surge:a.surge??1,from:'00:00',to:'23:59'})
      }else{
        const w=r.miscWatt??(mode==='advanced'&&r.customWatt?r.customWatt:(a?.watt??0))
        r.periods.forEach(p=>netRows.push({id:nid++,name:nm,qty:r.qty,watts:w,surge:a?.surge??1,from:p.from,to:p.to}))
      }
    })
    try{localStorage.setItem('voltsage_network_transfer',JSON.stringify({source:'Residential',rows:netRows,psh}))}catch{}
    window.location.href='/network-design'
  },[rows,result,mode,psh])
  return(
    <section id="sizing" className="py-24 bg-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-10">
          <div className="section-eyebrow">Free tool — Residential &amp; Small Commercial</div>
          <h2 className="font-disp font-extrabold text-4xl sm:text-5xl text-ink uppercase leading-tight mb-4">Solar Sizing Tool</h2>
          <p className="text-ink-muted text-base leading-relaxed">Add your appliances and operating times. The tool builds a real 24-hour load profile and sizes your inverter, battery and PV array — the same methodology a qualified engineer uses.</p>
        </div>
        <div className="tool-frame">
        <div className="card-flat tool-frame-inner" data-tour="res-card">
          <div className="flex flex-wrap gap-4 items-center justify-between px-6 py-4 border-b border-surface-border bg-white">
            <div className="flex items-center gap-3" data-tour="res-mode">
              <span className="text-xs font-mono uppercase text-ink-faint">{t.toolsCommon.mode}</span>
              <div className="flex rounded-lg overflow-hidden border border-surface-border">
                {(['standard','advanced']as const).map(m=><button key={m} onClick={()=>setMode(m)} className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all ${mode===m?'tab-active bg-surface-muted':'text-ink-faint bg-white'}`}>{m==='standard'?t.toolsCommon.standard:t.toolsCommon.advanced}</button>)}
              </div>
              {mode==='advanced'&&<span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">Power override &amp; multiple periods</span>}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2" data-tour="res-location">
                <span className="text-xs font-mono uppercase text-ink-faint">{t.toolsCommon.location}</span>
                <div className="relative">
                  <select value={psh} onChange={e=>setPsh(e.target.value)} className="tool-input text-xs !pr-7 min-w-[160px] sm:min-w-[210px]">
                    {PSH_TABLE.map(g=><optgroup key={g.group} label={g.group}>{g.options.map(o=><option key={o.id} value={o.id}>{o.label} — {o.psh} PSH</option>)}</optgroup>)}
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"/>
                </div>
              </div>
              <button onClick={()=>tourRef.current?.start()} title="Take the tour" className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-ink-faint hover:text-brand-orange transition-colors flex-shrink-0 border border-surface-border hover:border-brand-orange/40 rounded-lg px-2.5 py-1.5"><HelpCircle size={13}/> Tutorial</button>
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-surface-border bg-white">
            <div className="p-6 flex flex-col gap-4">
              <h3 className="font-mono text-xs uppercase tracking-widest text-ink-faint">Appliance schedule</h3>
              <div className="flex flex-wrap gap-2" data-tour="res-catalog">
                {CATS.map(cat=><button key={cat} onClick={()=>{setSc(cat);setSi(APPLIANCE_CATALOG.find(a=>a.cat===cat)?.id??'')}} className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider border transition-all ${sc===cat?'border-brand-teal text-brand-teal bg-teal-50':'border-surface-border text-ink-faint bg-white'}`} style={{borderLeftColor:CC[cat],borderLeftWidth:3}}>{cat}</button>)}
              </div>
              <div className="flex gap-2" data-tour="res-add">
                <select value={si} onChange={e=>setSi(e.target.value)} className="tool-input flex-1 text-xs">
                  {APPLIANCE_CATALOG.filter(a=>a.cat===sc).map(a=><option key={a.id} value={a.id}>{a.name} {a.type==='power'?`(${a.watt}W)`:`(${a.kwh} kWh/day)`}</option>)}
                </select>
                <button onClick={add} className="btn-teal flex-shrink-0 py-2 px-4 text-xs"><Plus size={14}/> Add</button>
              </div>
              {rows.length>0&&<div className="grid grid-cols-2 sm:grid-cols-[1fr_68px_96px_96px_32px] gap-2 px-1">{['Appliance','Qty','From','To',''].map((h,i)=><Lbl key={i} c={h} span={i===0}/>)}</div>}
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1" data-tour="res-rows">
                {rows.length===0&&<div className="text-center py-10 text-ink-faint font-mono text-xs uppercase">Add appliances above to start sizing ↑</div>}
                {rows.map(r=>{const a=APPLIANCE_CATALOG.find(ap=>ap.id===r.applianceId);const nm=r.miscName??a?.name??'Unknown';const ie=a?.type==='energy';return(
                  <div key={r.rowId} className="rounded-xl bg-surface-subtle border border-surface-border p-3 flex flex-col gap-2">
                    <div className="grid grid-cols-2 sm:grid-cols-[1fr_68px_96px_96px_32px] gap-2 items-center">
                      <div className="col-span-2 sm:col-span-1 font-mono text-[11px] text-ink truncate">{a?.warn&&<span className="text-red-500 mr-1">⚠</span>}{nm}</div>
                      <input type="number" min={1} value={r.qty===0?'':r.qty} onChange={e=>{const v=e.target.value;upd(r.rowId,{qty:v===''?0:Math.max(0,parseInt(v)||0)})}} onBlur={()=>{if(!r.qty||r.qty<1)upd(r.rowId,{qty:1})}} className="tool-input text-center text-sm font-semibold !px-1"/>
                      {ie?<div className="col-span-2 text-ink-faint font-mono text-[10px] flex items-center pl-1">continuous · 35% duty</div>:<><input type="time" value={r.periods[0]?.from??'06:00'} onChange={e=>updP(r.rowId,0,'from',e.target.value)} className="tool-input text-xs"/><input type="time" value={r.periods[0]?.to??'22:00'} onChange={e=>updP(r.rowId,0,'to',e.target.value)} className="tool-input text-xs"/></>}
                      <button onClick={()=>rm(r.rowId)} className="text-ink-faint hover:text-red-500 flex items-center justify-center"><Trash2 size={13}/></button>
                    </div>
                    {mode==='advanced'&&!ie&&(
                      <div className="flex flex-col gap-2 pl-2 border-l-2 border-brand-teal/30">
                        <div className="flex items-center gap-2 flex-wrap"><Lbl c="Custom power (W)"/><input type="number" min={1} placeholder={String(a?.watt??0)} value={r.customWatt??''} onChange={e=>upd(r.rowId,{customWatt:e.target.value===''?null:parseFloat(e.target.value)})} className="tool-input text-xs w-24"/>{r.customWatt&&<span className="text-[10px] font-mono text-amber-600">override: {r.customWatt}W</span>}</div>
                        {r.periods.slice(1).map((p,idx)=>(<div key={idx} className="flex items-center gap-2 flex-wrap"><Lbl c={`Period ${idx+2}`}/><span className="text-[10px] font-mono text-ink-faint">From</span><input type="time" value={p.from} onChange={e=>updP(r.rowId,idx+1,'from',e.target.value)} className="tool-input text-xs w-24"/><span className="text-[10px] font-mono text-ink-faint">To</span><input type="time" value={p.to} onChange={e=>updP(r.rowId,idx+1,'to',e.target.value)} className="tool-input text-xs w-24"/><button onClick={()=>rmP(r.rowId,idx+1)} className="text-ink-faint hover:text-red-500"><X size={12}/></button></div>))}
                        <button onClick={()=>addP(r.rowId)} className="self-start flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase border border-brand-teal/40 text-brand-teal hover:bg-teal-50 transition-all"><Clock size={11}/> Add another period</button>
                      </div>
                    )}
                  </div>)})}
              </div>
              <div className="text-xs font-mono text-ink-faint">{rows.length} / {mode==='standard'?'15':'∞'} appliances</div>
              <details className="rounded-xl border border-surface-border overflow-hidden" data-tour="res-misc">
                <summary className="px-4 py-3 text-xs font-mono uppercase tracking-wider text-brand-teal cursor-pointer bg-teal-50 list-none flex items-center gap-2"><Plus size={12}/> Add miscellaneous load</summary>
                <div className="p-4 bg-white grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Lbl c="Description"/><input value={mD} onChange={e=>setMD(e.target.value)} placeholder="e.g. Gate motor" className="tool-input text-xs"/></div>
                  <div><Lbl c="Power (W)"/><input type="number" min={0} value={mW===0?'':mW} onChange={e=>{const v=e.target.value;setMW(v===''?0:parseFloat(v)||0)}} className="tool-input text-xs"/></div>
                  <div><Lbl c="Time of use"/><div className="flex gap-1"><div className="flex-1"><Lbl c="From"/><input type="time" value={mF} onChange={e=>setMF(e.target.value)} className="tool-input text-xs"/></div><div className="flex-1"><Lbl c="To"/><input type="time" value={mT} onChange={e=>setMT(e.target.value)} className="tool-input text-xs"/></div></div></div>
                  <div className="col-span-2"><button onClick={addM} className="btn-primary w-full justify-center">Add miscellaneous load</button></div>
                </div>
              </details>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <h3 className="font-mono text-xs uppercase tracking-widest text-ink-faint">Results — {findPSH(psh).label}</h3>
              <LeadLock>
              <div className="bg-surface-subtle rounded-xl p-3 border border-surface-border" data-tour="res-chart">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-ink-faint uppercase">24-hour load profile</span>
                  <div className="flex gap-3 text-[9px] font-mono text-ink-faint"><span><span className="inline-block w-2 h-2 rounded-sm mr-1 align-middle" style={{background:'#0f172a'}}/>Night</span><span><span className="inline-block w-2 h-2 rounded-sm mr-1 align-middle" style={{background:'#1B17FF'}}/>Day</span></div>
                </div>
                <canvas ref={hRef} width={560} height={160} className="w-full rounded-lg" style={{height:120}}/>
                {!result&&<div className="text-center text-ink-faint font-mono text-xs py-2">Add appliances to see your load profile →</div>}
              </div>
              <div className="grid grid-cols-2 gap-3" data-tour="res-metrics">
                <RC label="Daily energy" value={result?result.Ed_kWh.toFixed(2):'—'} unit="kWh/day" accent/>
                <RC label="Peak demand" value={result?result.Peak_kW.toFixed(2):'—'} unit="kW" amber/>
                <RC label="Recommended inverter size" value={result?String(result.invSize):'—'} unit="kW"/>
                <RC label="Recommended surge withstand" value={result?result.Surge_kW.toFixed(2):'—'} unit="kW" amber/>
                <RC label="Recommended battery" value={result?result.CbattRounded.toFixed(1):'—'} unit="kWh" accent/>
                <RC label="Recommended PV array" value={result?result.PpvRounded.toFixed(2):'—'} unit="kWp"/>
              </div>
              {result&&<div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-xs font-mono text-teal-700">≈ {result.panelCount} panels @ 550 Wp · Night {result.Enight_kWh.toFixed(2)} kWh · Day {result.Eday_kWh.toFixed(2)} kWh</div>}
              {result&&(()=>{const t=result.Ed_kWh,e=Object.entries(result.catTotalsWh);if(!t||!e.length)return null;return(<div><Lbl c="Energy breakdown"/><div className="h-3 rounded-full overflow-hidden flex bg-surface-border">{e.map(([c,w])=><div key={c} style={{width:`${(w/1000/t)*100}%`,background:CC[c]??'#64748b'}} title={`${c}: ${(w/1000).toFixed(2)} kWh`} className="h-full"/>)}</div><div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">{e.map(([c,w])=><span key={c} className="flex items-center gap-1 text-[9px] font-mono text-ink-faint"><span className="w-2 h-2 rounded-sm" style={{background:CC[c]}}/>{c} {(w/1000).toFixed(1)} kWh</span>)}</div></div>)})()}
              <button onClick={downloadPDF} disabled={!result||pdfBusy} data-tour="res-pdf" className="btn-teal justify-center disabled:opacity-40 disabled:cursor-not-allowed">{pdfBusy?<Loader2 size={13} className="animate-spin"/>:<FileDown size={13}/>} {t.toolsCommon.downloadPdf}</button>
              {result&&<button onClick={sendToNetworkDesign} className="btn-secondary justify-center">Continue to Network Design →</button>}
              </LeadLock>
              <a href="#contact" data-tour="res-cta" className="btn-primary justify-center"><Zap size={13}/> {t.toolsCommon.requestDesign}</a>
              <p className="text-[10px] font-mono text-ink-faint leading-relaxed">Final system sizing and equipment selection should be reviewed and verified by a qualified Engineer or Solar Design Professional before installation.</p>
            </div>
          </div>
        </div>
        </div>
        <TourGuide ref={tourRef} tourId="residential" steps={TOUR_STEPS}/>
      </div>
    </section>
  )
}
