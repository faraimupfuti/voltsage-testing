export const STANDARD_INVERTER_SIZES=[1,1.5,2,3,3.6,5,6,8,10,12,15,20,25,30,40,50,60,75,100,125,150,200,250,500,1000]
export function roundUpToStandardInverter(r:number){return STANDARD_INVERTER_SIZES.find(s=>s>=r)??(r>0?Math.ceil(r):0)}
/**
 * VoltSage Inverter Size Recommendation Logic (per the Inverter Size Recommendation
 * Logic Update spec). The recommended inverter is the LARGER of two independently
 * rounded-to-standard-tier sizes:
 *  - Peak-based:  peak demand x 1.30, rounded up to the nearest standard tier.
 *  - Surge-based: surge demand rounded up to the next whole kW, halved (the model
 *    assumes an inverter can deliver ~2x its rated capacity during surge), then
 *    rounded up to the nearest standard tier.
 * This ensures the inverter is adequately sized for both continuous operating
 * demand and motor/pump/compressor starting/surge requirements.
 */
export function calculateInverterSize(peakKw:number,surgeKw:number):number{
  const peakBased=roundUpToStandardInverter(peakKw*1.3)
  const surgeBased=roundUpToStandardInverter(Math.ceil(surgeKw)/2)
  return Math.max(peakBased,surgeBased)
}
export interface PSHOption{id:string;label:string;psh:number}
export interface PSHGroup{group:string;options:PSHOption[]}
export const PSH_TABLE:PSHGroup[]=[{group:'Zimbabwe — by province',options:[{id:'bulawayo',label:'Bulawayo',psh:5.8},{id:'harare',label:'Harare',psh:5.6},{id:'manicaland',label:'Manicaland',psh:5.5},{id:'mashcentral',label:'Mashonaland Central',psh:5.7},{id:'masheast',label:'Mashonaland East',psh:5.7},{id:'mashwest',label:'Mashonaland West',psh:5.8},{id:'masvingo',label:'Masvingo',psh:5.9},{id:'matnorth',label:'Matabeleland North',psh:6.0},{id:'matsouth',label:'Matabeleland South',psh:6.1},{id:'midlands',label:'Midlands',psh:5.8}]},{group:'Africa — Category A (6.5 h/day)',options:[{id:'algeria',label:'Algeria',psh:6.5},{id:'chad',label:'Chad',psh:6.5},{id:'egypt',label:'Egypt',psh:6.5},{id:'libya',label:'Libya',psh:6.5},{id:'mauritania',label:'Mauritania',psh:6.5},{id:'niger',label:'Niger',psh:6.5},{id:'sudan',label:'Sudan',psh:6.5}]},{group:'Africa — Category B (6.0 h/day)',options:[{id:'botswana',label:'Botswana',psh:6.0},{id:'namibia',label:'Namibia',psh:6.0},{id:'zambia',label:'Zambia',psh:6.0}]},{group:'Africa — Category C (5.8 h/day)',options:[{id:'angola',label:'Angola',psh:5.8},{id:'eswatini',label:'Eswatini',psh:5.8},{id:'malawi',label:'Malawi',psh:5.8},{id:'mozambique',label:'Mozambique',psh:5.8},{id:'southafrica',label:'South Africa',psh:5.8},{id:'tanzania',label:'Tanzania',psh:5.8}]},{group:'Africa — Category D (5.5 h/day)',options:[{id:'cameroon',label:'Cameroon',psh:5.5},{id:'cotedivoire',label:"Côte d'Ivoire",psh:5.5},{id:'ghana',label:'Ghana',psh:5.5},{id:'kenya',label:'Kenya',psh:5.5},{id:'nigeria',label:'Nigeria',psh:5.5},{id:'rwanda',label:'Rwanda',psh:5.5},{id:'senegal',label:'Senegal',psh:5.5},{id:'uganda',label:'Uganda',psh:5.5}]},{group:'Africa — Category E (5.0 h/day)',options:[{id:'burundi',label:'Burundi',psh:5.0},{id:'drc',label:'DR Congo',psh:5.0},{id:'eqguinea',label:'Equatorial Guinea',psh:5.0},{id:'gabon',label:'Gabon',psh:5.0},{id:'liberia',label:'Liberia',psh:5.0},{id:'sierraleone',label:'Sierra Leone',psh:5.0}]}]
export function findPSH(id:string):PSHOption{for(const g of PSH_TABLE){const f=g.options.find(o=>o.id===id);if(f)return f}return PSH_TABLE[0].options[1]}
export type ApplianceType='power'|'energy'
export interface Appliance{id:string;name:string;cat:string;type:ApplianceType;watt?:number;kwh?:number;surge?:number;runningWatt?:number;dutyCycle?:number;brief?:boolean;warn?:boolean}
export const APPLIANCE_CATALOG:Appliance[]=[{id:'ledbulb',name:'LED Bulb',cat:'Lighting',type:'power',watt:10},{id:'leddownlight',name:'LED Downlight',cat:'Lighting',type:'power',watt:12},{id:'seclight',name:'Security Light (LED)',cat:'Lighting',type:'power',watt:30},{id:'flood',name:'Floodlight (LED)',cat:'Lighting',type:'power',watt:50},{id:'tv1',name:'LED TV (32–43")',cat:'Entertainment & Electronics',type:'power',watt:80},{id:'tv2',name:'LED TV (50–65")',cat:'Entertainment & Electronics',type:'power',watt:120},{id:'decoder',name:'Decoder',cat:'Entertainment & Electronics',type:'power',watt:20},{id:'router',name:'WiFi Router',cat:'Entertainment & Electronics',type:'power',watt:15},{id:'laptop',name:'Laptop',cat:'Entertainment & Electronics',type:'power',watt:65},{id:'desktop',name:'Desktop Computer',cat:'Entertainment & Electronics',type:'power',watt:250},{id:'printer',name:'Printer',cat:'Entertainment & Electronics',type:'power',watt:100},{id:'fridge_bar',name:'Bar Fridge (150 L)',cat:'Refrigeration',type:'energy',runningWatt:100,surge:6,dutyCycle:0.35,kwh:1.0},{id:'fridge_single',name:'Single Door Fridge (250 L)',cat:'Refrigeration',type:'energy',runningWatt:150,surge:6,dutyCycle:0.35,kwh:1.5},{id:'fridge_double',name:'Double Door Fridge',cat:'Refrigeration',type:'energy',runningWatt:250,surge:6,dutyCycle:0.35,kwh:1.6},{id:'fridge_sxs',name:'Side-by-Side Refrigerator',cat:'Refrigeration',type:'energy',runningWatt:400,surge:6,dutyCycle:0.35,kwh:3.0},{id:'fridge_commercial',name:'Commercial Display Fridge',cat:'Refrigeration',type:'energy',runningWatt:800,surge:5,dutyCycle:0.35,kwh:10.0},{id:'chestfreezer',name:'Chest Freezer',cat:'Refrigeration',type:'energy',runningWatt:200,surge:6,dutyCycle:0.35,kwh:1.7},{id:'uprightfreezer',name:'Upright Freezer',cat:'Refrigeration',type:'energy',runningWatt:260,surge:6,dutyCycle:0.35,kwh:2.2},{id:'boreholesmall',name:'Borehole Pump — Small (0.75 kW)',cat:'Water Systems',type:'power',watt:750,surge:3},{id:'boreholemed',name:'Borehole Pump — Medium (1.1 kW)',cat:'Water Systems',type:'power',watt:1100,surge:3},{id:'boreholelarge',name:'Borehole Pump — Large (1.5 kW)',cat:'Water Systems',type:'power',watt:1500,surge:3},{id:'booster',name:'Booster Pump',cat:'Water Systems',type:'power',watt:370,surge:3},{id:'microwave',name:'Microwave',cat:'Kitchen',type:'power',watt:1200,brief:true},{id:'kettle',name:'Electric Kettle',cat:'Kitchen',type:'power',watt:2000,brief:true},{id:'airfryer',name:'Air Fryer',cat:'Kitchen',type:'power',watt:1500,brief:true},{id:'blender',name:'Blender',cat:'Kitchen',type:'power',watt:500,brief:true},{id:'toaster',name:'Toaster',cat:'Kitchen',type:'power',watt:1000,brief:true},{id:'ceilingfan',name:'Ceiling Fan',cat:'Climate Control',type:'power',watt:60},{id:'pedestalfan',name:'Pedestal Fan',cat:'Climate Control',type:'power',watt:80},{id:'acsmall',name:'Small Air Conditioner (9000 BTU)',cat:'Climate Control',type:'power',watt:900,surge:3},{id:'acmed',name:'Medium Air Conditioner (12000 BTU)',cat:'Climate Control',type:'power',watt:1200,surge:3},{id:'aclarge',name:'Large Air Conditioner (18000 BTU)',cat:'Climate Control',type:'power',watt:1800,surge:3},{id:'washer',name:'Washing Machine',cat:'Laundry',type:'power',watt:500},{id:'dryer',name:'Tumble Dryer',cat:'Laundry',type:'power',watt:3000},{id:'iron',name:'Iron',cat:'Laundry',type:'power',watt:1200},{id:'stove',name:'Electric Stove Plate',cat:'High Power Loads',type:'power',watt:2000,warn:true},{id:'oven',name:'Oven',cat:'High Power Loads',type:'power',watt:4000,warn:true},{id:'instantheater',name:'Instant Water Heater',cat:'High Power Loads',type:'power',watt:6500,warn:true},{id:'poolheat',name:'Pool Heat Pump',cat:'High Power Loads',type:'power',watt:3500,warn:true,surge:3}]
export function findAppliance(id:string){return APPLIANCE_CATALOG.find(a=>a.id===id)}
export function timeToHours(from:string,to:string){if(!from||!to)return 0;const[fh,fm]=from.split(':').map(Number),[th,tm]=to.split(':').map(Number);let d=(th+tm/60)-(fh+fm/60);if(d<=0)d+=24;return d}
export function periodRange(from:string,to:string){const[fh,fm]=from.split(':').map(Number);const s=fh+fm/60;return{start:s,end:s+timeToHours(from,to)}}
export function nightHoursForPeriod(from:string,to:string){const{start,end}=periodRange(from,to);const N=[[18,30],[-6,6]] as const;let n=0;N.forEach(([s,e])=>{n+=Math.max(0,Math.min(end,e)-Math.max(start,s))});return Math.min(n,end-start)}
export function isActiveAtSlot(t:number,s:number,e:number){return(t>=s&&t<e)||(t+24>=s&&t+24<e)}
export interface ApplianceRow{rowId:number;applianceId:string;qty:number;periods:{from:string;to:string}[];customWatt?:number|null;miscName?:string;miscWatt?:number}
export interface AgEquipmentRow{rowId:number;eqId:string;name:string;kw:number;customKW?:number|null;surge:number;qty:number;periods:{from:string;to:string}[]}
export interface SizingResult{Ed_kWh:number;Enight_kWh:number;Eday_kWh:number;Peak_kW:number;Surge_kW:number;invSize:number;CbattRounded:number;PpvRounded:number;panelCount:number;autonomyHours:number;profile:number[];catTotalsWh:Record<string,number>}
export function calculateResidentialSizing(rows:ApplianceRow[],mode:'standard'|'advanced',psh:number,autonomy:number,dod=0.8,bEff=0.95,cEff=0.85,mu=0.75,pWp=550):SizingResult{
  const S=48,H=0.5,p=new Array<number>(S).fill(0);let Ew=0,En=0,Ed=0;const cats:Record<string,number>={}
  rows.forEach(r=>{const a=findAppliance(r.applianceId);if(!a)return
    if(a.type==='energy'){const w=r.qty*(a.kwh??0)*1000;Ew+=w;cats[a.cat]=(cats[a.cat]??0)+w;En+=w/2;Ed+=w/2;for(let s=0;s<S;s++)p[s]+=(r.qty*(a.kwh??0))/24*1000}
    else{const w=r.miscWatt??(mode==='advanced'&&r.customWatt?r.customWatt:(a.watt??0));r.periods.forEach(pr=>{const h=timeToHours(pr.from,pr.to),nh=nightHoursForPeriod(pr.from,pr.to);Ew+=r.qty*w*h;En+=r.qty*w*nh;Ed+=r.qty*w*(h-nh);cats[a.cat]=(cats[a.cat]??0)+r.qty*w*h;const{start,end}=periodRange(pr.from,pr.to);for(let s=0;s<S;s++)if(isActiveAtSlot(s*H,start,end))p[s]+=r.qty*w})}})
  let Pm=0,tm=0;p.forEach((w,s)=>{if(w>Pm){Pm=w;tm=s}});const tM=tm*H;let se=0
  rows.forEach(r=>{const a=findAppliance(r.applianceId);if(!a||(a.surge??1)<=1)return
    if(a.type==='energy'){se+=r.qty*(a.runningWatt??0)*((a.surge??1)-1)}
    else{const w=r.miscWatt??(mode==='advanced'&&r.customWatt?r.customWatt:(a.watt??0));if(r.periods.some(pr=>{const{start,end}=periodRange(pr.from,pr.to);return isActiveAtSlot(tM,start,end)}))se+=r.qty*w*((a.surge??1)-1)}})
  const Ek=Ew/1000,Nk=En/1000,Dk=Ed/1000,Pk=Pm/1000,Sk=(Pm+se)/1000
  const inv=calculateInverterSize(Pk,Sk),Cb=Math.ceil((Nk>0?(Nk*autonomy)/(dod*bEff):0)*2)/2
  const ah=Nk/12>0?(Cb*dod*bEff)/(Nk/12):0,pv=Math.ceil(((Dk+(Cb>0?Cb/cEff:0))/(psh*mu))*2)/2
  return{Ed_kWh:Ek,Enight_kWh:Nk,Eday_kWh:Dk,Peak_kW:Pk,Surge_kW:Sk,invSize:inv,CbattRounded:Cb,PpvRounded:pv,panelCount:Math.ceil(pv*1000/pWp),autonomyHours:ah,profile:p,catTotalsWh:cats}
}
export interface BatteryRuntimeResult{usableKWh:number;runtimeHours:number;runtimeAtPeakHours:number|null;runtimeAtAvgHours:number|null}
export function calculateBatteryRuntime(c:number,d:number,e:number,l:number,s?:SizingResult):BatteryRuntimeResult{const u=c*(d/100)*(e/100);return{usableKWh:u,runtimeHours:l>0?u/l:0,runtimeAtPeakHours:s&&s.Peak_kW>0?u/s.Peak_kW:null,runtimeAtAvgHours:s&&s.Ed_kWh/24>0?u/(s.Ed_kWh/24):null}}
export interface AgEquipment{id:string;name:string;kw:number;surge:number}
export type AgActivity='Irrigation'|'Dairy Farming'|'Poultry Farming'|'Piggery'|'Greenhouse Farming'|'Crop Processing'|'Mixed Farming'
export const AG_ACTIVITIES:Record<AgActivity,AgEquipment[]>={'Irrigation':[{id:'borehole',name:'Borehole Pump',kw:7.5,surge:3.0},{id:'river_pump',name:'River / Surface Pump',kw:5.5,surge:3.0},{id:'booster',name:'Booster Pump',kw:2.2,surge:3.0},{id:'fertigation',name:'Fertigation Pump',kw:1.5,surge:3.0},{id:'centrepivot',name:'Centre Pivot Motor',kw:3.0,surge:2.5}],'Dairy Farming':[{id:'milking',name:'Milking Machine',kw:3.0,surge:3.0},{id:'milk_cooling',name:'Milk Cooling Compressor',kw:5.5,surge:3.5},{id:'water_pump',name:'Water Pump',kw:1.5,surge:3.0},{id:'vent_fan',name:'Ventilation Fan',kw:1.1,surge:2.5}],'Poultry Farming':[{id:'vent_fan',name:'Ventilation Fan',kw:0.75,surge:2.5},{id:'lighting',name:'Poultry Lighting',kw:0.5,surge:1.0},{id:'feeder',name:'Automatic Feeder',kw:0.37,surge:2.5},{id:'water_pump',name:'Water Pump',kw:0.75,surge:3.0}],'Piggery':[{id:'vent_fan',name:'Ventilation Fan',kw:0.75,surge:2.5},{id:'feed_mixer',name:'Feed Mixer',kw:2.2,surge:2.5},{id:'water_pump',name:'Water Pump',kw:0.75,surge:3.0}],'Greenhouse Farming':[{id:'irrig_pump',name:'Irrigation Pump',kw:2.2,surge:3.0},{id:'circ_pump',name:'Circulation Pump',kw:1.1,surge:3.0},{id:'ext_fan',name:'Extraction Fan',kw:1.5,surge:2.5},{id:'gh_light',name:'Greenhouse Lighting',kw:1.0,surge:1.0}],'Crop Processing':[{id:'hammer_mill',name:'Hammer Mill',kw:7.5,surge:2.5},{id:'maize_mill',name:'Maize Mill',kw:5.5,surge:2.5},{id:'oil_press',name:'Oil Press',kw:4.0,surge:2.5},{id:'grain_clean',name:'Grain Cleaner',kw:2.2,surge:2.5},{id:'conveyor',name:'Conveyor',kw:1.5,surge:2.5}],'Mixed Farming':[{id:'borehole',name:'Borehole Pump',kw:7.5,surge:3.0},{id:'milking',name:'Milking Machine',kw:3.0,surge:3.0},{id:'vent_fan',name:'Ventilation Fan',kw:0.75,surge:2.5},{id:'hammer_mill',name:'Hammer Mill',kw:7.5,surge:2.5},{id:'irrig_pump',name:'Irrigation / Booster',kw:2.2,surge:3.0},{id:'feed_mixer',name:'Feed Mixer',kw:2.2,surge:2.5}]}
export function calculateAgriculturalSizing(rows:AgEquipmentRow[],mode:'standard'|'advanced',psh:number,autonomy:number,dod=0.8,bEff=0.95,cEff=0.85,mu=0.75,pWp=550):SizingResult{
  const S=48,H=0.5,p=new Array<number>(S).fill(0);let Ed=0,En=0,Ey=0
  rows.forEach(r=>{const kw=mode==='advanced'&&r.customKW?r.customKW:r.kw;r.periods.forEach(pr=>{const h=timeToHours(pr.from,pr.to),nh=nightHoursForPeriod(pr.from,pr.to);Ed+=r.qty*kw*h;En+=r.qty*kw*nh;Ey+=r.qty*kw*(h-nh);const{start,end}=periodRange(pr.from,pr.to);for(let s=0;s<S;s++)if(isActiveAtSlot(s*H,start,end))p[s]+=r.qty*kw*1000})})
  let Pm=0,tm=0;p.forEach((w,s)=>{if(w>Pm){Pm=w;tm=s}});const tM=tm*H;let se=0
  rows.forEach(r=>{if(r.surge<=1)return;const kw=mode==='advanced'&&r.customKW?r.customKW:r.kw;if(r.periods.some(pr=>{const{start,end}=periodRange(pr.from,pr.to);return isActiveAtSlot(tM,start,end)}))se+=r.qty*kw*1000*(r.surge-1)})
  const Pk=Pm/1000,Sk=(Pm+se)/1000,inv=calculateInverterSize(Pk,Sk)
  const Cb=Math.ceil((En>0?(En*autonomy)/(dod*bEff):0)*2)/2,ah=En/12>0?(Cb*dod*bEff)/(En/12):0
  const pv=Math.ceil(((Ey+(Cb>0?Cb/cEff:0))/(psh*mu))*2)/2
  return{Ed_kWh:Ed,Enight_kWh:En,Eday_kWh:Ey,Peak_kW:Pk,Surge_kW:Sk,invSize:inv,CbattRounded:Cb,PpvRounded:pv,panelCount:Math.ceil(pv*1000/pWp),autonomyHours:ah,profile:p,catTotalsWh:{}}
}

// ============================================================
// Low-Voltage Network Design Tool — Stage 1 (Load Profile Manager)
// and Stage 2 (System Design Engine, first-pass heuristic rules).
// Electrical Design (cables/protection/earthing) and 3D
// Visualisation are NOT implemented — they require an equipment
// database and electrical code data not yet defined.
// ============================================================

export interface NetworkLoadRow { id:number; name:string; qty:number; watts:number; surge:number; from:string; to:string }

/** Baseline load-profile calculation for freely-named custom loads (not tied to the appliance catalog). */
export function calculateNetworkLoadProfile(rows:NetworkLoadRow[], psh:number, autonomy=8, dod=0.8, bEff=0.95, cEff=0.85, mu=0.75, pWp=550):SizingResult {
  const S=48,H=0.5,p=new Array<number>(S).fill(0)
  let Ed=0,En=0,Ey=0
  rows.forEach(r=>{
    const h=timeToHours(r.from,r.to), nh=nightHoursForPeriod(r.from,r.to)
    Ed+=r.qty*r.watts*h; En+=r.qty*r.watts*nh; Ey+=r.qty*r.watts*(h-nh)
    const{start,end}=periodRange(r.from,r.to)
    for(let s=0;s<S;s++) if(isActiveAtSlot(s*H,start,end)) p[s]+=r.qty*r.watts
  })
  let Pm=0,tm=0; p.forEach((w,s)=>{if(w>Pm){Pm=w;tm=s}}); const tM=tm*H
  let se=0
  rows.forEach(r=>{
    if(r.surge<=1) return
    const{start,end}=periodRange(r.from,r.to)
    if(isActiveAtSlot(tM,start,end)) se+=r.qty*r.watts*(r.surge-1)
  })
  const Ek=Ed/1000, Nk=En/1000, Dk=Ey/1000, Pk=Pm/1000, Sk=(Pm+se)/1000
  const inv=calculateInverterSize(Pk,Sk)
  const Cb=Math.ceil((Nk>0?(Nk*autonomy)/(dod*bEff):0)*2)/2
  const ah=Nk/12>0?(Cb*dod*bEff)/(Nk/12):0
  const pv=Math.ceil(((Dk+(Cb>0?Cb/cEff:0))/(psh*mu))*2)/2
  return{Ed_kWh:Ek,Enight_kWh:Nk,Eday_kWh:Dk,Peak_kW:Pk,Surge_kW:Sk,invSize:inv,CbattRounded:Cb,PpvRounded:pv,panelCount:Math.ceil(pv*1000/pWp),autonomyHours:ah,profile:p,catTotalsWh:{}}
}

export type SiteSupplyOption = 'grid_only'|'grid_generator'|'generator_only'|'solar_only'|'solar_grid'|'solar_generator'|'solar_grid_generator'|'no_supply'
export const SITE_SUPPLY_OPTIONS: { id: SiteSupplyOption; label: string; body: string }[] = [
  { id: 'grid_only', label: 'Grid (Utility) Only', body: 'The site is currently supplied by the utility grid.' },
  { id: 'grid_generator', label: 'Grid + Generator', body: 'The site has both utility and generator supply.' },
  { id: 'generator_only', label: 'Generator Only', body: 'The site relies on a generator as its existing electricity source.' },
  { id: 'solar_only', label: 'Existing Solar Only', body: 'The site currently relies on an existing solar energy system.' },
  { id: 'solar_grid', label: 'Solar + Grid', body: 'The site has an existing solar system and utility connection.' },
  { id: 'solar_generator', label: 'Solar + Generator', body: 'The site has an existing solar system and generator.' },
  { id: 'solar_grid_generator', label: 'Solar + Grid + Generator', body: 'The site has an existing solar system, utility connection and generator.' },
  { id: 'no_supply', label: 'No Electricity Supply', body: 'The site has no existing solar system, utility connection or generator.' },
]

export type SitePhase = '1'|'3'

export type EnergyGoal = 'backup'|'independence_no_export'|'independence_export'|'max_solar'|'low_grid'|'cost'|'reliability'
export const ENERGY_GOALS: { id: EnergyGoal; label: string; body: string }[] = [
  { id: 'backup', label: 'Backup', body: 'Keep selected loads running during utility outages.' },
  { id: 'independence_no_export', label: 'Energy Independence (No Export)', body: 'Reduce or eliminate dependence on external electricity sources without exporting electricity.' },
  { id: 'independence_export', label: 'Energy Independence (Export)', body: 'Reduce dependence on external electricity sources while allowing excess generation to be exported where permitted.' },
  { id: 'max_solar', label: 'Maximum Solar Utilisation', body: 'Use as much available solar energy as practically possible.' },
  { id: 'low_grid', label: 'Low Grid / Fuel Consumption', body: 'Minimise electricity purchased from the utility grid.' },
  { id: 'cost', label: 'Cost Optimisation', body: 'Minimise the lifetime cost of energy for the site.' },
  { id: 'reliability', label: 'Maximum Reliability', body: 'Prioritise continuity of supply, even if this requires a larger system or higher investment.' },
]

/** Which goals are selectable for each site supply configuration — per the VoltSage goal mapping matrix. Absence = not applicable. */
export const GOAL_ELIGIBILITY: Record<SiteSupplyOption, EnergyGoal[]> = {
  grid_only:             ['backup','independence_no_export','independence_export','max_solar','low_grid','cost','reliability'],
  grid_generator:        ['backup','independence_no_export','independence_export','max_solar','low_grid','cost','reliability'],
  generator_only:        ['backup','independence_no_export','max_solar','cost','reliability'],
  solar_only:            ['independence_no_export','max_solar','cost','reliability'],
  solar_grid:            ['independence_no_export','independence_export','max_solar','low_grid','cost','reliability'],
  solar_generator:       ['independence_no_export','max_solar','cost','reliability'],
  solar_grid_generator:  ['independence_no_export','independence_export','max_solar','low_grid','cost','reliability'],
  no_supply:             ['independence_no_export','max_solar','cost','reliability'],
}

/** Goals shown as "Conditional" — technically selectable, but require confirming export/net-metering availability. */
export const CONDITIONAL_GOALS: Partial<Record<SiteSupplyOption, EnergyGoal[]>> = {
  grid_only: ['independence_export'],
  grid_generator: ['independence_export'],
  solar_grid: ['independence_export'],
  solar_grid_generator: ['independence_export'],
}

/** Exact goal adjustment percentages — Section 3 of the VoltSage Premium System Design Engine spec. */
export const GOAL_ADJUSTMENTS: Record<EnergyGoal, { inv:number; pv:number; batt:number }> = {
  backup:                  { inv:0.05, pv:0.05, batt:0.05 },
  independence_no_export:  { inv:0.20, pv:0.25, batt:0.40 },
  independence_export:     { inv:0.15, pv:0.20, batt:0.10 },
  max_solar:               { inv:0.20, pv:0.25, batt:0.20 },
  low_grid:                { inv:0.15, pv:0.20, batt:0.20 },
  cost:                    { inv:0.10, pv:0.10, batt:0.05 },
  reliability:             { inv:0.15, pv:0.20, batt:0.60 },
}

export interface PremiumScenario {
  goal: EnergyGoal
  invSize: number   // kW, adjusted (not yet rounded to a standard inverter tier)
  surge: number      // kW
  battery: number    // kWh
  pv: number         // kWp
}

/**
 * Section 3 — System Design Engine.
 * Each selected goal (up to 3, in priority order) produces an INDEPENDENT
 * scenario computed fresh from the Sizing Tool baseline. Adjustments
 * are NOT cumulative across goals, per spec.
 */
export function calculatePremiumScenarios(baseline: SizingResult, goals: EnergyGoal[]): PremiumScenario[] {
  return goals.slice(0, 3).map(goal => {
    const adj = GOAL_ADJUSTMENTS[goal]
    return {
      goal,
      invSize: Math.round(baseline.invSize * (1 + adj.inv) * 10) / 10,
      surge: Math.round(baseline.Surge_kW * (1 + adj.inv) * 100) / 100,
      battery: Math.round(baseline.CbattRounded * (1 + adj.batt) * 100) / 100,
      pv: Math.round(baseline.PpvRounded * (1 + adj.pv) * 100) / 100,
    }
  })
}

// ============================================================
// Section 2 — Generic Equipment Database (Energy Generation & Storage)
// Seeded directly from the VoltSage generic inverter/battery database.
// Electrical Conductors, Protection/Isolation and Switching categories
// are named in the spec but no data or selection rules were provided
// for them, so they are intentionally not implemented here.
// ============================================================

export interface GenericInverter {
  tierId:string; capacityKva:number; capacityKwCont:number; phases:1|3
  surgeWithstandKva:number; surgeWithstandKw:number; surgeMultiplier:number; surgeDurationS:number
  pvVocMaxV:number; pvMpptRangeV:string; mpptTrackers:number; pvMaxArrayKw:number; batteryVoltageVdc:string
}
export const INVERTER_DB: GenericInverter[] = [
  { tierId:'T01', capacityKva:1,  capacityKwCont:0.8,  phases:1, surgeWithstandKva:2,   surgeWithstandKw:1.6,  surgeMultiplier:2,   surgeDurationS:10, pvVocMaxV:100,  pvMpptRangeV:'30-90',   mpptTrackers:1, pvMaxArrayKw:1,  batteryVoltageVdc:'12' },
  { tierId:'T02', capacityKva:2,  capacityKwCont:1.6,  phases:1, surgeWithstandKva:4,   surgeWithstandKw:3.2,  surgeMultiplier:2,   surgeDurationS:10, pvVocMaxV:145,  pvMpptRangeV:'60-115',  mpptTrackers:1, pvMaxArrayKw:2.4,batteryVoltageVdc:'24' },
  { tierId:'T03', capacityKva:3,  capacityKwCont:2.4,  phases:1, surgeWithstandKva:6,   surgeWithstandKw:4.8,  surgeMultiplier:2,   surgeDurationS:10, pvVocMaxV:145,  pvMpptRangeV:'60-115',  mpptTrackers:1, pvMaxArrayKw:3,  batteryVoltageVdc:'24' },
  { tierId:'T04', capacityKva:5,  capacityKwCont:4,    phases:1, surgeWithstandKva:10,  surgeWithstandKw:8,    surgeMultiplier:2,   surgeDurationS:10, pvVocMaxV:450,  pvMpptRangeV:'120-430', mpptTrackers:2, pvMaxArrayKw:6.5,batteryVoltageVdc:'48' },
  { tierId:'T05', capacityKva:6,  capacityKwCont:4.8,  phases:1, surgeWithstandKva:12,  surgeWithstandKw:9.6,  surgeMultiplier:2,   surgeDurationS:10, pvVocMaxV:500,  pvMpptRangeV:'120-450', mpptTrackers:2, pvMaxArrayKw:7.8,batteryVoltageVdc:'48' },
  { tierId:'T06', capacityKva:8,  capacityKwCont:6.4,  phases:1, surgeWithstandKva:16,  surgeWithstandKw:12.8, surgeMultiplier:2,   surgeDurationS:10, pvVocMaxV:500,  pvMpptRangeV:'120-450', mpptTrackers:2, pvMaxArrayKw:9.5,batteryVoltageVdc:'48' },
  { tierId:'T07', capacityKva:10, capacityKwCont:8,    phases:1, surgeWithstandKva:20,  surgeWithstandKw:16,   surgeMultiplier:2,   surgeDurationS:10, pvVocMaxV:600,  pvMpptRangeV:'150-500', mpptTrackers:2, pvMaxArrayKw:12, batteryVoltageVdc:'48' },
  { tierId:'T08', capacityKva:12, capacityKwCont:9.6,  phases:1, surgeWithstandKva:24,  surgeWithstandKw:19.2, surgeMultiplier:2,   surgeDurationS:10, pvVocMaxV:600,  pvMpptRangeV:'150-500', mpptTrackers:3, pvMaxArrayKw:14, batteryVoltageVdc:'48' },
  { tierId:'T09', capacityKva:15, capacityKwCont:12,   phases:1, surgeWithstandKva:30,  surgeWithstandKw:24,   surgeMultiplier:2,   surgeDurationS:10, pvVocMaxV:850,  pvMpptRangeV:'200-800', mpptTrackers:3, pvMaxArrayKw:18, batteryVoltageVdc:'48/96' },
  { tierId:'T10', capacityKva:10, capacityKwCont:8,    phases:3, surgeWithstandKva:15,  surgeWithstandKw:12,   surgeMultiplier:1.5, surgeDurationS:10, pvVocMaxV:600,  pvMpptRangeV:'150-550', mpptTrackers:2, pvMaxArrayKw:12, batteryVoltageVdc:'48/100' },
  { tierId:'T11', capacityKva:15, capacityKwCont:12,   phases:3, surgeWithstandKva:22.5,surgeWithstandKw:18,   surgeMultiplier:1.5, surgeDurationS:10, pvVocMaxV:850,  pvMpptRangeV:'200-800', mpptTrackers:3, pvMaxArrayKw:18, batteryVoltageVdc:'48/100' },
  { tierId:'T12', capacityKva:20, capacityKwCont:16,   phases:3, surgeWithstandKva:30,  surgeWithstandKw:24,   surgeMultiplier:1.5, surgeDurationS:10, pvVocMaxV:1000, pvMpptRangeV:'200-950', mpptTrackers:4, pvMaxArrayKw:24, batteryVoltageVdc:'200-500 (HV)' },
  { tierId:'T13', capacityKva:30, capacityKwCont:24,   phases:3, surgeWithstandKva:45,  surgeWithstandKw:36,   surgeMultiplier:1.5, surgeDurationS:10, pvVocMaxV:1000, pvMpptRangeV:'200-950', mpptTrackers:4, pvMaxArrayKw:36, batteryVoltageVdc:'200-500 (HV)' },
  { tierId:'T14', capacityKva:40, capacityKwCont:32,   phases:3, surgeWithstandKva:55,  surgeWithstandKw:44,   surgeMultiplier:1.4, surgeDurationS:10, pvVocMaxV:1000, pvMpptRangeV:'200-950', mpptTrackers:6, pvMaxArrayKw:48, batteryVoltageVdc:'200-500 (HV)' },
  { tierId:'T15', capacityKva:50, capacityKwCont:40,   phases:3, surgeWithstandKva:65,  surgeWithstandKw:52,   surgeMultiplier:1.3, surgeDurationS:10, pvVocMaxV:1000, pvMpptRangeV:'200-950', mpptTrackers:6, pvMaxArrayKw:60, batteryVoltageVdc:'200-500 (HV)' },
]

export interface GenericBattery {
  tierId:string; chemistry:string; nominalVoltageVdc:number; capacityAh:number; capacityKwhNominal:number
  recommendedDodPct:number; usableKwh:number; roundTripEfficiencyPct:number; cycleLife:number; stackable:string
}
export const BATTERY_DB: GenericBattery[] = [
  { tierId:'B01', chemistry:'LiFePO4', nominalVoltageVdc:12, capacityAh:100, capacityKwhNominal:1.28,  recommendedDodPct:90, usableKwh:1.15, roundTripEfficiencyPct:95, cycleLife:4000, stackable:'Series/parallel' },
  { tierId:'B02', chemistry:'LiFePO4', nominalVoltageVdc:12, capacityAh:200, capacityKwhNominal:2.56,  recommendedDodPct:90, usableKwh:2.3,  roundTripEfficiencyPct:95, cycleLife:4000, stackable:'Series/parallel' },
  { tierId:'B03', chemistry:'LiFePO4', nominalVoltageVdc:24, capacityAh:100, capacityKwhNominal:2.56,  recommendedDodPct:90, usableKwh:2.3,  roundTripEfficiencyPct:95, cycleLife:4000, stackable:'Series/parallel' },
  { tierId:'B04', chemistry:'LiFePO4', nominalVoltageVdc:48, capacityAh:100, capacityKwhNominal:5.12,  recommendedDodPct:90, usableKwh:4.61, roundTripEfficiencyPct:95, cycleLife:5000, stackable:'Building block' },
  { tierId:'B05', chemistry:'LiFePO4', nominalVoltageVdc:48, capacityAh:150, capacityKwhNominal:7.68,  recommendedDodPct:90, usableKwh:6.91, roundTripEfficiencyPct:95, cycleLife:5000, stackable:'Yes' },
  { tierId:'B06', chemistry:'LiFePO4', nominalVoltageVdc:48, capacityAh:200, capacityKwhNominal:10.24, recommendedDodPct:90, usableKwh:9.22, roundTripEfficiencyPct:95, cycleLife:6000, stackable:'Yes' },
  { tierId:'B07', chemistry:'LiFePO4', nominalVoltageVdc:48, capacityAh:280, capacityKwhNominal:14.34, recommendedDodPct:90, usableKwh:12.9,roundTripEfficiencyPct:95, cycleLife:6000, stackable:'Yes' },
  { tierId:'B08', chemistry:'LiFePO4', nominalVoltageVdc:51.2,capacityAh:100, capacityKwhNominal:5.12, recommendedDodPct:90, usableKwh:4.61,roundTripEfficiencyPct:95, cycleLife:6000, stackable:'HV rack stack' },
  { tierId:'B09', chemistry:'Tubular Lead-Acid', nominalVoltageVdc:12, capacityAh:100, capacityKwhNominal:1.2, recommendedDodPct:50, usableKwh:0.6, roundTripEfficiencyPct:85, cycleLife:1200, stackable:'Parallel bank' },
  { tierId:'B10', chemistry:'Tubular Lead-Acid', nominalVoltageVdc:12, capacityAh:200, capacityKwhNominal:2.4, recommendedDodPct:50, usableKwh:1.2, roundTripEfficiencyPct:85, cycleLife:1200, stackable:'Series only' },
  { tierId:'B11', chemistry:'AGM Lead-Acid', nominalVoltageVdc:12, capacityAh:100, capacityKwhNominal:1.2, recommendedDodPct:50, usableKwh:0.6, roundTripEfficiencyPct:85, cycleLife:600, stackable:'Series only' },
  { tierId:'B12', chemistry:'Gel Lead-Acid', nominalVoltageVdc:12, capacityAh:100, capacityKwhNominal:1.2, recommendedDodPct:50, usableKwh:0.6, roundTripEfficiencyPct:85, cycleLife:900, stackable:'Series only' },
  { tierId:'B13', chemistry:'Tubular Gel', nominalVoltageVdc:2,  capacityAh:800, capacityKwhNominal:1.6, recommendedDodPct:70, usableKwh:1.12,roundTripEfficiencyPct:85, cycleLife:3000, stackable:'Banks of 24' },
]

export interface InverterSelectionResult {
  inverter: GenericInverter | null
  reason?: string // set when no inverter could be matched
  pvFallbackApplied?: boolean       // true if the closest-capacity inverter couldn't fit the PV array and a different one was substituted
  closestCapacityInverter?: GenericInverter // the inverter that WOULD have been picked on capacity alone
  pvUnresolvable?: boolean          // true if no phase+surge-eligible inverter fits the required PV array
}

/**
 * Section 3(i) — Inverter Selection.
 * Sequence is always Phase -> Surge Capability -> Capacity Matching, never
 * capacity-first, so an inverter with inadequate surge withstand can never
 * be selected just because its nominal capacity looks closest.
 *
 * Section 3(iv) Step 1 addendum — if the closest-capacity inverter can't
 * accommodate the scenario's PV array, the engine "must flag the
 * configuration for further adjustment or select an alternative inverter".
 * Here we take the second path automatically: among the same phase+surge
 * eligible set, walk outward from the closest-capacity match (by distance)
 * and substitute the nearest one that also satisfies pv_max_array_power_kW.
 * If none exist, we fall back to the closest-capacity inverter and let
 * checkPvCompatibility() report the failure so the user can adjust the design.
 */
export function selectInverter(scenario: PremiumScenario, phase: SitePhase): InverterSelectionResult {
  const phaseMatches = INVERTER_DB.filter(inv => inv.phases === Number(phase))
  const surgeOk = phaseMatches.filter(inv => inv.surgeWithstandKva > scenario.surge)
  if (!surgeOk.length) return { inverter: null, reason: `No ${phase}-phase inverter in the database has enough surge withstand for ${scenario.surge.toFixed(2)} kW of surge demand.` }

  const byCloseness = [...surgeOk].sort((a, b) => Math.abs(a.capacityKva - scenario.invSize) - Math.abs(b.capacityKva - scenario.invSize))
  const closest = byCloseness[0]
  if (closest.pvMaxArrayKw >= scenario.pv) return { inverter: closest }

  const fallback = byCloseness.find(inv => inv.pvMaxArrayKw >= scenario.pv)
  if (fallback) return { inverter: fallback, pvFallbackApplied: true, closestCapacityInverter: closest }

  return { inverter: closest, closestCapacityInverter: closest, pvUnresolvable: true }
}

export interface BatteryModuleOption { tierId:string; chemistry:string; moduleKwh:number; modules:number; resultingKwh:number }

/**
 * Section 3(ii)-(iii) — Battery Configuration.
 * Matches battery products to the inverter's battery_voltage_vdc (first
 * numeric token, to handle dual-voltage entries like "48/96"). Module count
 * is rounded to the nearest whole module per the spec's worked examples.
 */
export function getBatteryModuleOptions(inverter: GenericInverter, scenario: PremiumScenario): BatteryModuleOption[] {
  const voltMatch = inverter.batteryVoltageVdc.match(/[\d.]+/)
  if (!voltMatch) return []
  const targetV = parseFloat(voltMatch[0])
  return BATTERY_DB
    .filter(b => Math.abs(b.nominalVoltageVdc - targetV) < 0.01)
    .map(b => {
      const modules = Math.max(1, Math.round(scenario.battery / b.capacityKwhNominal))
      return { tierId: b.tierId, chemistry: b.chemistry, moduleKwh: b.capacityKwhNominal, modules, resultingKwh: Math.round(modules * b.capacityKwhNominal * 100) / 100 }
    })
    .sort((a,b) => a.moduleKwh - b.moduleKwh)
}

/** Section 3(iv) Step 1 — PV Array Configuration: max array power check. */
export function checkPvCompatibility(scenario: PremiumScenario, inverter: GenericInverter): { ok:boolean; message:string } {
  const ok = scenario.pv <= inverter.pvMaxArrayKw
  return {
    ok,
    message: ok
      ? `${scenario.pv.toFixed(2)} kWp is within this inverter's ${inverter.pvMaxArrayKw} kW maximum PV array capacity.`
      : `${scenario.pv.toFixed(2)} kWp exceeds this inverter's ${inverter.pvMaxArrayKw} kW maximum PV array capacity — a larger inverter or split-array configuration is required.`,
  }
}

// ============================================================
// Section 3(iv) Steps 2-3 — PV Module Selection & String Configuration
// Seeded directly from pv_module_database_generic.csv.
// ============================================================

export interface GenericPvModule {
  tierId:string; technology:string; ratedPowerW:number; cellCount:number
  vocV:number; vmpV:number; iscA:number; impA:number; efficiencyPct:number
  lengthMm:number; widthMm:number; thicknessMm:number; weightKg:number
  powerTempCoeffPctPerC:number; vocTempCoeffPctPerC:number; typicalApplication:string
}
export const PV_MODULE_DB: GenericPvModule[] = [
  { tierId:'M01', technology:'Polycrystalline', ratedPowerW:150, cellCount:36,  vocV:22,   vmpV:18,   iscA:8.8,  impA:8.3,  efficiencyPct:15,   lengthMm:1480, widthMm:670,  thicknessMm:35, weightKg:12,   powerTempCoeffPctPerC:-0.45, vocTempCoeffPctPerC:-0.34, typicalApplication:'Small rural/off-grid systems, portable setups' },
  { tierId:'M02', technology:'Polycrystalline', ratedPowerW:250, cellCount:60,  vocV:37.5, vmpV:30.5, iscA:8.6,  impA:8.2,  efficiencyPct:15.5, lengthMm:1650, widthMm:992,  thicknessMm:35, weightKg:19,   powerTempCoeffPctPerC:-0.41, vocTempCoeffPctPerC:-0.32, typicalApplication:'Budget residential systems' },
  { tierId:'M03', technology:'Monocrystalline PERC', ratedPowerW:330, cellCount:60,  vocV:40.5, vmpV:33.4, iscA:10.5, impA:9.9,  efficiencyPct:19,   lengthMm:1956, widthMm:992,  thicknessMm:40, weightKg:20,   powerTempCoeffPctPerC:-0.37, vocTempCoeffPctPerC:-0.29, typicalApplication:'Standard residential' },
  { tierId:'M04', technology:'Monocrystalline PERC Half-Cut', ratedPowerW:400, cellCount:120, vocV:45.9, vmpV:38.5, iscA:11.13,impA:10.39,efficiencyPct:20.1, lengthMm:1755, widthMm:1038, thicknessMm:35, weightKg:20.5, powerTempCoeffPctPerC:-0.35, vocTempCoeffPctPerC:-0.27, typicalApplication:'Residential, small commercial' },
  { tierId:'M05', technology:'Monocrystalline Half-Cut Bifacial', ratedPowerW:450, cellCount:144, vocV:51.3, vmpV:42.7, iscA:11.29,impA:10.54,efficiencyPct:20.9, lengthMm:1909, widthMm:1134, thicknessMm:35, weightKg:24.5, powerTempCoeffPctPerC:-0.34, vocTempCoeffPctPerC:-0.26, typicalApplication:'Residential, small commercial, agricultural' },
  { tierId:'M06', technology:'Monocrystalline Half-Cut Bifacial', ratedPowerW:550, cellCount:144, vocV:49.7, vmpV:41.8, iscA:13.94,impA:13.05,efficiencyPct:21.3, lengthMm:2279, widthMm:1134, thicknessMm:35, weightKg:27.5, powerTempCoeffPctPerC:-0.34, vocTempCoeffPctPerC:-0.26, typicalApplication:'Commercial, agricultural, large residential arrays' },
  { tierId:'M07', technology:'Monocrystalline TOPCon Large-Format Bifacial', ratedPowerW:610, cellCount:132, vocV:53.4, vmpV:44.5, iscA:14.35,impA:13.7, efficiencyPct:22.3, lengthMm:2465, widthMm:1134, thicknessMm:35, weightKg:32.5, powerTempCoeffPctPerC:-0.3,  vocTempCoeffPctPerC:-0.25, typicalApplication:'Commercial, agricultural, ground-mount/utility-adjacent arrays' },
]
export function findPvModule(tierId:string){ return PV_MODULE_DB.find(m=>m.tierId===tierId) }

/** Parses an inverter's "150-500" style MPPT voltage range string into {min,max}. */
function parseMpptRange(range:string):{min:number;max:number}{
  const m = range.match(/([\d.]+)\s*-\s*([\d.]+)/)
  return m ? { min: parseFloat(m[1]), max: parseFloat(m[2]) } : { min: 0, max: 0 }
}

export interface PvStringOption { seriesCount:number; parallelCount:number; balanced:boolean }
export interface PvArrayConfigResult {
  module: GenericPvModule
  panelCount: number              // rounded up to whole modules
  actualPvKwp: number             // panelCount x ratedPowerW / 1000
  seriesMin: number                // MPPT-voltage floor
  seriesMaxMppt: number             // MPPT-voltage ceiling
  seriesMaxVoc: number             // inverter max PV input voltage / module Voc
  seriesMaxFinal: number           // min(seriesMaxMppt, seriesMaxVoc)
  validConfigs: PvStringOption[]   // all series/parallel splits that use every panel in equal-length strings
  recommended: PvStringOption | null
  feasible: boolean
  message: string
}

/**
 * Section 3(iv) Steps 2-3 — PV Module Selection & String Configuration.
 * Given a selected module, calculates the panel count for the scenario's PV
 * capacity, the valid series-count window (MPPT min/max and Voc-max), then
 * picks the balanced series/parallel split per the spec's preference order:
 * equal-length strings > fewer parallel strings > fewer MPPTs used.
 */
export function calculatePvArrayConfig(scenario: PremiumScenario, inverter: GenericInverter, module: GenericPvModule): PvArrayConfigResult {
  const panelCount = Math.ceil((scenario.pv * 1000) / module.ratedPowerW)
  const actualPvKwp = Math.round((panelCount * module.ratedPowerW) / 10) / 100

  const mppt = parseMpptRange(inverter.pvMpptRangeV)
  const seriesMin = Math.ceil(mppt.min / module.vmpV)
  const seriesMaxMppt = Math.floor(mppt.max / module.vmpV)
  const seriesMaxVoc = Math.floor(inverter.pvVocMaxV / module.vocV)
  const seriesMaxFinal = Math.min(seriesMaxMppt, seriesMaxVoc)

  if (seriesMin > seriesMaxFinal || seriesMin < 1) {
    return { module, panelCount, actualPvKwp, seriesMin, seriesMaxMppt, seriesMaxVoc, seriesMaxFinal, validConfigs: [], recommended: null, feasible: false,
      message: `No valid series-string length exists for this module on this inverter (needs ${seriesMin}-${seriesMaxFinal} modules in series, which is empty or inverted) — choose a different module or inverter.` }
  }

  // Test every series count in [seriesMin, seriesMaxFinal] for a whole-number, equal-length parallel split.
  const validConfigs: PvStringOption[] = []
  for (let s = seriesMin; s <= seriesMaxFinal; s++) {
    if (panelCount % s === 0) validConfigs.push({ seriesCount: s, parallelCount: panelCount / s, balanced: true })
  }

  if (!validConfigs.length) {
    return { module, panelCount, actualPvKwp, seriesMin, seriesMaxMppt, seriesMaxVoc, seriesMaxFinal, validConfigs, recommended: null, feasible: false,
      message: `${panelCount} × ${module.tierId} modules cannot be split into equal-length strings within the ${seriesMin}-${seriesMaxFinal} series-count window — adjust the panel count or pick a different module.` }
  }

  // Preference order: fewer parallel strings first (== longer, fewer strings), then fewer MPPTs implied.
  const recommended = validConfigs.reduce((best, c) => c.parallelCount < best.parallelCount ? c : best, validConfigs[0])

  return { module, panelCount, actualPvKwp, seriesMin, seriesMaxMppt, seriesMaxVoc, seriesMaxFinal, validConfigs, recommended, feasible: true,
    message: `${recommended.seriesCount} modules in series × ${recommended.parallelCount} parallel string${recommended.parallelCount>1?'s':''} — ${panelCount} × ${module.tierId} panels, ${actualPvKwp.toFixed(2)} kWp actual array capacity.` }
}

// ============================================================
// Electrical Design Engine — DRAFT / PROVISIONAL
// The architecture doc (Sec. 9) and the goal-mapping doc explicitly defer
// cable/protection/switching methodology to "a separate VoltSage Electrical
// Design Specification" not yet provided. The selection RULES below (which
// database tier gets matched) are not spec-derived — they use a standard,
// widely-used 1.25x continuous-current design margin (the same convention
// behind NEC 690.8 / IEC 60364 string and main-conductor sizing) purely as
// a placeholder so the UI has real numbers instead of "coming soon".
// Cable selection DOES apply cable_derating_multiplier_table.csv (ambient
// temperature, circuit grouping, installation method) via
// cableDeratingFactor() below, using site conditions the user selects in
// the UI (default: 30C free-air single cable, i.e. no derating). Protection
// device and isolator selection do not apply any derating (their csvs
// don't define derating dependencies).
// This must be reviewed against VoltSage's own Electrical Design
// Specification before being treated as an engineering deliverable.
// ============================================================

export interface GenericCable { tierId:string; mm2:number; currentA:number; voltageV:number; cores?:number; phaseConfig?:'1'|'3'; insulationTempC:70|90 }
export const DC_BATTERY_CABLE_DB: GenericCable[] = [
  { tierId:'DC01', mm2:16,  currentA:100, voltageV:1000, insulationTempC:90 }, { tierId:'DC02', mm2:25,  currentA:127, voltageV:1000, insulationTempC:90 },
  { tierId:'DC03', mm2:35,  currentA:158, voltageV:1000, insulationTempC:90 }, { tierId:'DC04', mm2:50,  currentA:192, voltageV:1000, insulationTempC:90 },
  { tierId:'DC05', mm2:70,  currentA:246, voltageV:1000, insulationTempC:90 }, { tierId:'DC06', mm2:95,  currentA:298, voltageV:1000, insulationTempC:90 },
  { tierId:'DC07', mm2:120, currentA:346, voltageV:1000, insulationTempC:90 }, { tierId:'DC08', mm2:150, currentA:399, voltageV:1000, insulationTempC:90 },
  { tierId:'DC09', mm2:185, currentA:456, voltageV:1000, insulationTempC:90 }, { tierId:'DC10', mm2:240, currentA:538, voltageV:1000, insulationTempC:90 },
]
export const PV_CABLE_DB: GenericCable[] = [
  { tierId:'PV01', mm2:2.5, currentA:30,  voltageV:1500, insulationTempC:90 }, { tierId:'PV02', mm2:4,  currentA:40,  voltageV:1500, insulationTempC:90 },
  { tierId:'PV03', mm2:6,   currentA:55,  voltageV:1800, insulationTempC:90 }, { tierId:'PV04', mm2:10, currentA:75,  voltageV:1800, insulationTempC:90 },
  { tierId:'PV05', mm2:16,  currentA:100, voltageV:1800, insulationTempC:90 }, { tierId:'PV06', mm2:25, currentA:127, voltageV:1800, insulationTempC:90 },
  { tierId:'PV07', mm2:35,  currentA:158, voltageV:1800, insulationTempC:90 },
]
export const AC_CABLE_DB: GenericCable[] = [
  { tierId:'AC01', mm2:1.5, cores:3, currentA:18,  voltageV:500, phaseConfig:'1', insulationTempC:70 }, { tierId:'AC02', mm2:2.5, cores:3, currentA:25,  voltageV:500, phaseConfig:'1', insulationTempC:70 },
  { tierId:'AC03', mm2:4,   cores:3, currentA:34,  voltageV:500, phaseConfig:'1', insulationTempC:70 }, { tierId:'AC04', mm2:6,   cores:3, currentA:43,  voltageV:500, phaseConfig:'1', insulationTempC:70 },
  { tierId:'AC05', mm2:10,  cores:3, currentA:60,  voltageV:500, phaseConfig:'1', insulationTempC:70 }, { tierId:'AC06', mm2:16,  cores:3, currentA:80,  voltageV:750, phaseConfig:'1', insulationTempC:70 },
  { tierId:'AC07', mm2:25,  cores:3, currentA:101, voltageV:750, phaseConfig:'1', insulationTempC:70 }, { tierId:'AC08', mm2:35,  cores:3, currentA:126, voltageV:750, phaseConfig:'1', insulationTempC:70 },
  { tierId:'AC09', mm2:10,  cores:5, currentA:52,  voltageV:750, phaseConfig:'3', insulationTempC:70 }, { tierId:'AC10', mm2:16,  cores:5, currentA:69,  voltageV:750, phaseConfig:'3', insulationTempC:70 },
  { tierId:'AC11', mm2:25,  cores:5, currentA:87,  voltageV:750, phaseConfig:'3', insulationTempC:70 }, { tierId:'AC12', mm2:35,  cores:5, currentA:108, voltageV:750, phaseConfig:'3', insulationTempC:70 },
  { tierId:'AC13', mm2:50,  cores:5, currentA:131, voltageV:750, phaseConfig:'3', insulationTempC:70 },
]

export interface GenericProtectionDevice { tierId:string; currentA:number; voltageV:number; category:'pv'|'battery'|'ac1'|'ac3' }
export const DC_BREAKER_DB: GenericProtectionDevice[] = [
  { tierId:'DB01', currentA:16,  voltageV:1000, category:'pv' }, { tierId:'DB02', currentA:20,  voltageV:1000, category:'pv' },
  { tierId:'DB03', currentA:25,  voltageV:1000, category:'pv' }, { tierId:'DB04', currentA:32,  voltageV:1000, category:'pv' },
  { tierId:'DB05', currentA:40,  voltageV:1000, category:'pv' }, { tierId:'DB06', currentA:63,  voltageV:1000, category:'pv' },
  { tierId:'DB07', currentA:100, voltageV:125,  category:'battery' }, { tierId:'DB08', currentA:160, voltageV:125,  category:'battery' },
  { tierId:'DB09', currentA:250, voltageV:125,  category:'battery' }, { tierId:'DB10', currentA:400, voltageV:125,  category:'battery' },
]
export const DC_FUSE_DB: GenericProtectionDevice[] = [
  { tierId:'DF01', currentA:10,  voltageV:1000, category:'pv' }, { tierId:'DF02', currentA:15,  voltageV:1000, category:'pv' },
  { tierId:'DF03', currentA:20,  voltageV:1000, category:'pv' }, { tierId:'DF04', currentA:30,  voltageV:1000, category:'pv' },
  { tierId:'DF05', currentA:125, voltageV:58,   category:'battery' }, { tierId:'DF06', currentA:200, voltageV:58,   category:'battery' },
  { tierId:'DF07', currentA:315, voltageV:80,   category:'battery' }, { tierId:'DF08', currentA:400, voltageV:80,   category:'battery' },
  { tierId:'DF09', currentA:630, voltageV:125,  category:'battery' },
]
export const DC_ISOLATOR_DB: GenericProtectionDevice[] = [
  { tierId:'DI01', currentA:16,  voltageV:1000, category:'pv' }, { tierId:'DI02', currentA:25,  voltageV:1000, category:'pv' },
  { tierId:'DI03', currentA:32,  voltageV:1000, category:'pv' }, { tierId:'DI04', currentA:40,  voltageV:1000, category:'pv' },
  { tierId:'DI05', currentA:63,  voltageV:1000, category:'pv' }, { tierId:'DI06', currentA:100, voltageV:120,  category:'battery' },
  { tierId:'DI07', currentA:160, voltageV:120,  category:'battery' }, { tierId:'DI08', currentA:250, voltageV:120,  category:'battery' },
  { tierId:'DI09', currentA:400, voltageV:120,  category:'battery' },
]
export const AC_BREAKER_DB: GenericProtectionDevice[] = [
  { tierId:'AB01', currentA:16,  voltageV:230, category:'ac1' }, { tierId:'AB02', currentA:20,  voltageV:230, category:'ac1' },
  { tierId:'AB03', currentA:32,  voltageV:230, category:'ac1' }, { tierId:'AB04', currentA:40,  voltageV:230, category:'ac1' },
  { tierId:'AB05', currentA:63,  voltageV:230, category:'ac1' }, { tierId:'AB06', currentA:100, voltageV:230, category:'ac1' },
  { tierId:'AB07', currentA:32,  voltageV:400, category:'ac3' }, { tierId:'AB08', currentA:63,  voltageV:400, category:'ac3' },
  { tierId:'AB09', currentA:100, voltageV:400, category:'ac3' }, { tierId:'AB10', currentA:160, voltageV:400, category:'ac3' },
]
export const AC_ISOLATOR_DB: GenericProtectionDevice[] = [
  { tierId:'AI01', currentA:20,  voltageV:230, category:'ac1' }, { tierId:'AI02', currentA:40,  voltageV:230, category:'ac1' },
  { tierId:'AI03', currentA:63,  voltageV:230, category:'ac1' }, { tierId:'AI04', currentA:100, voltageV:230, category:'ac1' },
  { tierId:'AI05', currentA:40,  voltageV:400, category:'ac3' }, { tierId:'AI06', currentA:100, voltageV:400, category:'ac3' },
  { tierId:'AI07', currentA:200, voltageV:400, category:'ac3' },
]
export interface GenericSpd { tierId:string; spdType:string; maxVoltage:number; nominalKa:number; maxKa:number }
export const DC_SPD_DB: GenericSpd[] = [
  { tierId:'DS01', spdType:'Type 2', maxVoltage:600,  nominalKa:5,    maxKa:20 },
  { tierId:'DS02', spdType:'Type 2', maxVoltage:1000, nominalKa:10,   maxKa:40 },
  { tierId:'DS03', spdType:'Type 1+2 combined', maxVoltage:1000, nominalKa:12.5, maxKa:25 },
  { tierId:'DS04', spdType:'Type 1+2 combined', maxVoltage:1500, nominalKa:20,   maxKa:40 },
]
export const AC_SPD_DB: GenericSpd[] = [
  { tierId:'AS01', spdType:'Type 2', maxVoltage:275, nominalKa:5,    maxKa:20 },
  { tierId:'AS02', spdType:'Type 2', maxVoltage:275, nominalKa:10,   maxKa:40 },
  { tierId:'AS03', spdType:'Type 1+2 combined', maxVoltage:275, nominalKa:12.5, maxKa:25 },
  { tierId:'AS04', spdType:'Type 1+2 combined', maxVoltage:275, nominalKa:25,   maxKa:50 },
]

const DESIGN_MARGIN = 1.25 // provisional continuous-current safety margin — see module header note

// ---- Cable derating, from cable_derating_multiplier_table.csv ----
export interface AmbientDeratingPoint { ambientC:number; insulationTempC:70|90; multiplier:number }
export const CABLE_DERATING_AMBIENT: AmbientDeratingPoint[] = [
  { ambientC:10, insulationTempC:70, multiplier:1.22 }, { ambientC:10, insulationTempC:90, multiplier:1.15 },
  { ambientC:15, insulationTempC:70, multiplier:1.17 }, { ambientC:15, insulationTempC:90, multiplier:1.12 },
  { ambientC:20, insulationTempC:70, multiplier:1.12 }, { ambientC:20, insulationTempC:90, multiplier:1.08 },
  { ambientC:25, insulationTempC:70, multiplier:1.06 }, { ambientC:25, insulationTempC:90, multiplier:1.04 },
  { ambientC:30, insulationTempC:70, multiplier:1 },    { ambientC:30, insulationTempC:90, multiplier:1 },
  { ambientC:35, insulationTempC:70, multiplier:0.94 }, { ambientC:35, insulationTempC:90, multiplier:0.96 },
  { ambientC:40, insulationTempC:70, multiplier:0.87 }, { ambientC:40, insulationTempC:90, multiplier:0.91 },
  { ambientC:45, insulationTempC:70, multiplier:0.79 }, { ambientC:45, insulationTempC:90, multiplier:0.87 },
  { ambientC:50, insulationTempC:70, multiplier:0.71 }, { ambientC:50, insulationTempC:90, multiplier:0.82 },
  { ambientC:55, insulationTempC:70, multiplier:0.61 }, { ambientC:55, insulationTempC:90, multiplier:0.76 },
  { ambientC:60, insulationTempC:70, multiplier:0.5 },  { ambientC:60, insulationTempC:90, multiplier:0.71 },
  { ambientC:65, insulationTempC:90, multiplier:0.65 }, { ambientC:70, insulationTempC:90, multiplier:0.58 },
]
export const CABLE_DERATING_AMBIENT_OPTIONS = [10,15,20,25,30,35,40,45,50,55,60,65,70]

export interface GroupingDeratingPoint { label:string; minCircuits:number; maxCircuits:number; multiplier:number }
export const CABLE_DERATING_GROUPING: GroupingDeratingPoint[] = [
  { label:'1 circuit', minCircuits:1, maxCircuits:1, multiplier:1 },
  { label:'2 circuits', minCircuits:2, maxCircuits:2, multiplier:0.8 },
  { label:'3 circuits', minCircuits:3, maxCircuits:3, multiplier:0.7 },
  { label:'4 circuits', minCircuits:4, maxCircuits:4, multiplier:0.65 },
  { label:'5 circuits', minCircuits:5, maxCircuits:5, multiplier:0.6 },
  { label:'6 circuits', minCircuits:6, maxCircuits:6, multiplier:0.57 },
  { label:'7 circuits', minCircuits:7, maxCircuits:7, multiplier:0.54 },
  { label:'8 circuits', minCircuits:8, maxCircuits:8, multiplier:0.52 },
  { label:'9 circuits', minCircuits:9, maxCircuits:9, multiplier:0.5 },
  { label:'10-12 circuits', minCircuits:10, maxCircuits:12, multiplier:0.45 },
  { label:'13-16 circuits', minCircuits:13, maxCircuits:16, multiplier:0.41 },
  { label:'17-20 circuits', minCircuits:17, maxCircuits:20, multiplier:0.38 },
  { label:'20+ circuits', minCircuits:21, maxCircuits:Infinity, multiplier:0.35 },
]

export interface InstallDeratingPoint { label:string; multiplier:number; note?:string }
export const CABLE_DERATING_INSTALL: InstallDeratingPoint[] = [
  { label:'Free air, single cable, spaced', multiplier:1 },
  { label:'Free air, single cable, touching wall/surface', multiplier:0.95 },
  { label:'Cable tray, multiple cables, not touching', multiplier:0.9 },
  { label:'Enclosed conduit, surface-mounted, shaded', multiplier:0.85 },
  { label:'Enclosed conduit, surface-mounted, unshaded/direct sun', multiplier:0.7, note:'Very common for PV DC home-run conduit on rooftops.' },
  { label:'Conduit embedded in wall or roof space (poor ventilation)', multiplier:0.65 },
  { label:'Direct buried in native soil, standard thermal resistivity', multiplier:0.8, note:'Approximation only — a dedicated buried-cable ampacity table technically applies.' },
  { label:'Underground in duct/conduit', multiplier:0.75, note:'Approximation only — a dedicated buried-cable ampacity table technically applies.' },
]

export interface DeratingConditions { ambientC:number; groupingCircuits:number; installLabel:string }
export const DEFAULT_DERATING: DeratingConditions = { ambientC:30, groupingCircuits:1, installLabel:CABLE_DERATING_INSTALL[0].label }

/** Combined derating multiplier for a cable of a given insulation rating under the given site conditions. Falls back to the nearest available ambient point if the exact one isn't tabulated for that insulation class. */
export function cableDeratingFactor(insulationTempC:70|90, cond:DeratingConditions): number {
  const ambientPts = CABLE_DERATING_AMBIENT.filter(p=>p.insulationTempC===insulationTempC)
  const ambient = ambientPts.find(p=>p.ambientC===cond.ambientC)
    ?? ambientPts.reduce((best,p)=>Math.abs(p.ambientC-cond.ambientC)<Math.abs(best.ambientC-cond.ambientC)?p:best, ambientPts[0])
  const grouping = CABLE_DERATING_GROUPING.find(g=>cond.groupingCircuits>=g.minCircuits && cond.groupingCircuits<=g.maxCircuits) ?? CABLE_DERATING_GROUPING[0]
  const install = CABLE_DERATING_INSTALL.find(i=>i.label===cond.installLabel) ?? CABLE_DERATING_INSTALL[0]
  return Math.round(ambient.multiplier * grouping.multiplier * install.multiplier * 1000) / 1000
}

function smallestFitting<T extends { currentA?:number }>(db: T[], minCurrent:number, extraFilter?: (t:T)=>boolean): T | null {
  const pool = extraFilter ? db.filter(extraFilter) : db
  const fits = pool.filter(t => (t.currentA ?? 0) >= minCurrent).sort((a,b)=>(a.currentA??0)-(b.currentA??0))
  return fits[0] ?? null
}

/** Selects the smallest cable whose DERATED ampacity (rated current x ambient x grouping x installation-method multipliers) still covers the design current, per cable_derating_multiplier_table.csv. */
function smallestFittingCable(db: GenericCable[], minCurrent:number, cond:DeratingConditions, extraFilter?: (c:GenericCable)=>boolean): { cable:GenericCable|null; deratingFactor:number; deratedAmpacityA:number|null } {
  const pool = extraFilter ? db.filter(extraFilter) : db
  const withDerating = pool.map(c => ({ c, factor: cableDeratingFactor(c.insulationTempC, cond) }))
    .map(x => ({ ...x, derated: Math.round(x.c.currentA * x.factor * 100) / 100 }))
    .filter(x => x.derated >= minCurrent)
    .sort((a,b) => a.c.currentA - b.c.currentA)
  if (!withDerating.length) return { cable:null, deratingFactor: pool[0] ? cableDeratingFactor(pool[0].insulationTempC, cond) : 1, deratedAmpacityA: null }
  return { cable: withDerating[0].c, deratingFactor: withDerating[0].factor, deratedAmpacityA: withDerating[0].derated }
}

export interface CircuitDesign { designCurrentA:number; cable:GenericCable|null; deratingFactor?:number; deratedAmpacityA?:number|null; protection:GenericProtectionDevice|null; protectionExceedsCable?:boolean; isolator:GenericProtectionDevice|null; fuse?:GenericProtectionDevice|null; spd?:GenericSpd|null; note?:string }

/** Per protection_database_notes.txt's "core selection rule": a breaker/fuse protects the cable, so it must never be rated above the cable's derated ampacity — that combination means the cable needs upsizing, not a bigger breaker. */
function exceedsCable(protection: GenericProtectionDevice|null, deratedAmpacityA: number|null|undefined): boolean {
  return !!protection && deratedAmpacityA != null && protection.currentA > deratedAmpacityA
}

/** Battery-to-inverter DC circuit: current from scenario inverter capacity at the battery's system voltage. */
export function designBatteryCircuit(inverter: GenericInverter, scenario: PremiumScenario, cond: DeratingConditions = DEFAULT_DERATING): CircuitDesign {
  const voltMatch = inverter.batteryVoltageVdc.match(/[\d.]+/)
  const battV = voltMatch ? parseFloat(voltMatch[0]) : 48
  const designCurrentA = Math.round(((scenario.invSize * 1000) / battV) * DESIGN_MARGIN * 10) / 10
  const { cable, deratingFactor, deratedAmpacityA } = smallestFittingCable(DC_BATTERY_CABLE_DB, designCurrentA, cond)
  const protection = smallestFitting(DC_BREAKER_DB, designCurrentA, d=>d.category==='battery')
  return {
    designCurrentA, cable, deratingFactor, deratedAmpacityA, protection,
    protectionExceedsCable: exceedsCable(protection, deratedAmpacityA),
    isolator: smallestFitting(DC_ISOLATOR_DB, designCurrentA, d=>d.category==='battery'),
  }
}

/** PV string + array-combiner DC circuit, from the module's Isc and the chosen string configuration. */
export function designPvCircuit(module: GenericPvModule, inverter: GenericInverter, pvArray: PvArrayConfigResult, cond: DeratingConditions = DEFAULT_DERATING): CircuitDesign | null {
  if (!pvArray.feasible || !pvArray.recommended) return null
  const stringCurrentA = Math.round(module.iscA * DESIGN_MARGIN * 100) / 100
  const arrayCurrentA = Math.round(module.iscA * pvArray.recommended.parallelCount * DESIGN_MARGIN * 100) / 100
  const minCableV = inverter.pvVocMaxV
  const { cable, deratingFactor, deratedAmpacityA } = smallestFittingCable(PV_CABLE_DB, stringCurrentA, cond, c=>c.voltageV>=minCableV)
  const protection = smallestFitting(DC_BREAKER_DB, arrayCurrentA, d=>d.category==='pv' && d.voltageV>=minCableV)
  return {
    designCurrentA: stringCurrentA, cable, deratingFactor, deratedAmpacityA, protection,
    protectionExceedsCable: exceedsCable(protection, deratedAmpacityA),
    isolator: smallestFitting(DC_ISOLATOR_DB, arrayCurrentA, d=>d.category==='pv' && d.voltageV>=minCableV),
    fuse: pvArray.recommended.parallelCount > 2 ? smallestFitting(DC_FUSE_DB, stringCurrentA, d=>d.category==='pv') : null,
    spd: DC_SPD_DB.filter(s=>s.maxVoltage>=minCableV && s.spdType.startsWith('Type 1+2')).sort((a,b)=>a.maxVoltage-b.maxVoltage)[0]
      ?? DC_SPD_DB.filter(s=>s.maxVoltage>=minCableV).sort((a,b)=>a.maxVoltage-b.maxVoltage)[0] ?? null,
    note: pvArray.recommended.parallelCount > 2 ? 'More than 2 parallel strings — individual string fusing recommended.' : undefined,
  }
}

/** Inverter AC output circuit, from the selected inverter's kVA rating and the site's phase configuration. */
export function designAcCircuit(inverter: GenericInverter, phase: SitePhase, cond: DeratingConditions = DEFAULT_DERATING): CircuitDesign {
  const is3 = Number(phase) === 3
  const designCurrentA = Math.round((is3 ? (inverter.capacityKva*1000)/(Math.sqrt(3)*400) : (inverter.capacityKva*1000)/230) * DESIGN_MARGIN * 10) / 10
  const cat = is3 ? 'ac3' : 'ac1'
  const { cable, deratingFactor, deratedAmpacityA } = smallestFittingCable(AC_CABLE_DB, designCurrentA, cond, c=>c.phaseConfig===(is3?'3':'1'))
  const protection = smallestFitting(AC_BREAKER_DB, designCurrentA, d=>d.category===cat)
  return {
    designCurrentA, cable, deratingFactor, deratedAmpacityA, protection,
    protectionExceedsCable: exceedsCable(protection, deratedAmpacityA),
    isolator: smallestFitting(AC_ISOLATOR_DB, designCurrentA, d=>d.category===cat),
    spd: (inverter.capacityKva <= 10 ? AC_SPD_DB[1] : inverter.capacityKva <= 20 ? AC_SPD_DB[2] : AC_SPD_DB[3]) ?? AC_SPD_DB[0],
  }
}

// ============================================================
// Switching / Source Management — Manual Changeover, ATS, AVS
// Section 2 category (iv). Seeded from manual_changeover_switch_database_
// generic.csv, ac_ats_database_generic.csv and ac_avs_database_generic.csv
// (the latter two corrected — the source files had their transfer-time
// ranges Excel-mangled into dates, e.g. "1-3" -> "1-Mar").
// Selection guidance (site sources, AVS backfeed caveat) follows
// protection_database_notes.txt's Manual/ATS/AVS section directly.
// ============================================================

export interface GenericSwitch { tierId:string; currentA:number; voltageV:number; poles:string; numberOfSources?:string; transferTimeS:string }
export const MANUAL_CHANGEOVER_DB: GenericSwitch[] = [
  { tierId:'MC01', currentA:32,  voltageV:230, poles:'1P', transferTimeS:'Manual (instant on operation)' },
  { tierId:'MC02', currentA:63,  voltageV:230, poles:'1P', transferTimeS:'Manual (instant on operation)' },
  { tierId:'MC03', currentA:100, voltageV:230, poles:'1P', transferTimeS:'Manual (instant on operation)' },
  { tierId:'MC04', currentA:63,  voltageV:400, poles:'3P', transferTimeS:'Manual (instant on operation)' },
  { tierId:'MC05', currentA:100, voltageV:400, poles:'3P', transferTimeS:'Manual (instant on operation)' },
  { tierId:'MC06', currentA:200, voltageV:400, poles:'3P', transferTimeS:'Manual (instant on operation)' },
]
export const AC_ATS_DB: GenericSwitch[] = [
  { tierId:'AT01', currentA:32,  voltageV:230, poles:'1P', numberOfSources:'2',      transferTimeS:'1-3' },
  { tierId:'AT02', currentA:63,  voltageV:230, poles:'1P', numberOfSources:'2',      transferTimeS:'1-3' },
  { tierId:'AT03', currentA:100, voltageV:230, poles:'1P', numberOfSources:'2 or 3', transferTimeS:'1-3' },
  { tierId:'AT04', currentA:63,  voltageV:400, poles:'3P', numberOfSources:'2',      transferTimeS:'1-3' },
  { tierId:'AT05', currentA:100, voltageV:400, poles:'3P', numberOfSources:'2 or 3', transferTimeS:'1-3' },
  { tierId:'AT06', currentA:200, voltageV:400, poles:'3P', numberOfSources:'2 or 3', transferTimeS:'1-3' },
]
export const AC_AVS_DB: GenericSwitch[] = [
  { tierId:'AV01', currentA:30,  voltageV:230, poles:'1P', transferTimeS:'5-10' },
  { tierId:'AV02', currentA:63,  voltageV:230, poles:'1P', transferTimeS:'5-10' },
  { tierId:'AV03', currentA:100, voltageV:230, poles:'1P', transferTimeS:'5-10' },
  { tierId:'AV04', currentA:63,  voltageV:400, poles:'3P', transferTimeS:'5-10' },
  { tierId:'AV05', currentA:100, voltageV:400, poles:'3P', transferTimeS:'5-10' },
]

export interface SwitchingRequirement { needed:boolean; sources:number; gridInvolved:boolean; generatorInvolved:boolean; reason:string }

/**
 * Determines whether AC transfer/changeover switching is required for a
 * site, and how many sources it must arbitrate. Only external AC sources
 * (grid, generator) need switching against the new inverter's output —
 * an existing solar system shares the AC/DC bus rather than being
 * switched, and a site with no existing supply or solar-only has nothing
 * external to transfer between.
 */
export function determineSwitchingRequirement(site: SiteSupplyOption): SwitchingRequirement {
  const gridInvolved = ['grid_only','grid_generator','solar_grid','solar_grid_generator'].includes(site)
  const generatorInvolved = ['grid_generator','generator_only','solar_generator','solar_grid_generator'].includes(site)
  const externalSources = (gridInvolved?1:0) + (generatorInvolved?1:0)
  if (externalSources === 0) {
    return { needed:false, sources:0, gridInvolved, generatorInvolved,
      reason: site==='no_supply' ? 'No existing electricity supply — the proposed system is the site\'s primary, standalone supply, so there is nothing to switch between.' : 'No grid or generator connection to arbitrate against — the existing solar system shares the DC/AC bus rather than requiring transfer switching.' }
  }
  const sources = externalSources + 1 // + the new inverter system
  return { needed:true, sources, gridInvolved, generatorInvolved,
    reason: `${sources}-source transfer switching needed between ${[gridInvolved&&'the utility grid',generatorInvolved&&'the generator','the new inverter system'].filter(Boolean).join(', ')}.` }
}

export interface SwitchingRecommendation extends SwitchingRequirement {
  designCurrentA: number
  manual: GenericSwitch | null
  ats: GenericSwitch | null
  avs: GenericSwitch | null
  avsCaution: boolean
  avsWarning?: string
}

/** Recommends changeover/ATS/AVS tiers for a site+phase+inverter, with the backfeed-risk caution from protection_database_notes.txt applied whenever the grid is one of the sources. */
export function recommendSwitching(site: SiteSupplyOption, phase: SitePhase, inverter: GenericInverter): SwitchingRecommendation {
  const req = determineSwitchingRequirement(site)
  if (!req.needed) return { ...req, designCurrentA:0, manual:null, ats:null, avs:null, avsCaution:false }

  const is3 = Number(phase) === 3
  const designCurrentA = Math.round((is3 ? (inverter.capacityKva*1000)/(Math.sqrt(3)*400) : (inverter.capacityKva*1000)/230) * DESIGN_MARGIN * 10) / 10
  const voltageV = is3 ? 400 : 230
  const poles = is3 ? '3P' : '1P'

  const manual = smallestFitting(MANUAL_CHANGEOVER_DB, designCurrentA, s=>s.voltageV===voltageV && s.poles===poles)
  const ats = smallestFitting(AC_ATS_DB, designCurrentA, s=>s.voltageV===voltageV && s.poles===poles && (req.sources<3 || (s.numberOfSources??'').includes('3')))
  const avs = smallestFitting(AC_AVS_DB, designCurrentA, s=>s.voltageV===voltageV && s.poles===poles)

  return {
    ...req, designCurrentA, manual, ats, avs,
    avsCaution: req.gridInvolved,
    avsWarning: req.gridInvolved ? 'AVS units are a budget automatic-switching option, but are not always a verified break-before-make design — where the grid is one of the sources, a certified ATS or a mechanically-interlocked manual changeover is the safer choice to avoid backfeeding a line utility workers may assume is dead.' : undefined,
  }
}

// ============================================================
// Earthing & RCD — DRAFT / PROVISIONAL
// protection_database_notes.txt explicitly lists earthing/grounding sizing
// and RCD/ELCB protection as "not covered by any table so far" — there is
// no VoltSage-provided earthing database or methodology yet, generic or
// otherwise. Rather than leaving this stage blank, the sizing below uses
// IEC 60364-5-54 Table 54.2's public, widely-used minimum protective-
// conductor cross-section rule (Spe = Sph up to 16mm2, 16mm2 flat between
// 16-35mm2, Sph/2 above 35mm2), and a standard 30mA residual-current
// device convention for final AC circuits (IEC 60364-4-41). Same caveat
// as the rest of the Electrical Design section: this is a placeholder for
// engineering review, not a VoltSage-specified deliverable, and does not
// touch earth electrode resistance (soil-dependent, needs a site test).
// ============================================================

/** IEC 60364-5-54 Table 54.2 minimum protective-conductor cross-section rule, applied to whichever conductor a given circuit's protective/bonding conductor runs alongside. */
export function protectiveConductorCsaMm2(phaseCsaMm2: number): number {
  if (phaseCsaMm2 <= 16) return phaseCsaMm2
  if (phaseCsaMm2 <= 35) return 16
  return Math.round((phaseCsaMm2 / 2) * 10) / 10
}

export interface EarthingPoint { label:string; basedOnCsaMm2:number|null; conductorCsaMm2:number|null; note:string }
export interface EarthingDesign { points:EarthingPoint[]; rcd:{ratingMa:number; type:string; note:string} }

/**
 * Assembles the draft earthing/bonding conductor recommendation for a
 * scenario's three DC/AC circuits, plus a standard RCD recommendation for
 * the AC output. Any circuit without a selected cable is skipped rather
 * than guessed.
 */
export function designEarthing(battCircuit: CircuitDesign|null, pvCircuit: CircuitDesign|null, acCircuit: CircuitDesign|null): EarthingDesign {
  const points: EarthingPoint[] = []
  if (battCircuit?.cable) points.push({ label:'Battery bank equipment earth / bonding', basedOnCsaMm2:battCircuit.cable.mm2, conductorCsaMm2:protectiveConductorCsaMm2(battCircuit.cable.mm2), note:'Bonds the battery enclosure/rack to the main earthing system.' })
  if (pvCircuit?.cable) points.push({ label:'PV array frame bonding', basedOnCsaMm2:pvCircuit.cable.mm2, conductorCsaMm2:protectiveConductorCsaMm2(pvCircuit.cable.mm2), note:'Bonds module frames and mounting structure — separate from the DC negative/positive conductors.' })
  if (acCircuit?.cable) points.push({ label:'AC output protective earth (PE)', basedOnCsaMm2:acCircuit.cable.mm2, conductorCsaMm2:protectiveConductorCsaMm2(acCircuit.cable.mm2), note:'Runs with the AC output cable back to the distribution board earth bar.' })
  return {
    points,
    rcd: { ratingMa:30, type:'Type A (or Type B if the inverter datasheet specifies DC leakage current — confirm with manufacturer)',
      note:'30mA residual-current protection is standard practice for final AC circuits feeding socket outlets or the inverter output; exact type depends on the selected inverter\'s earth-leakage characteristics.' },
  }
}

// ============================================================
// Bill of Quantities — assembled from the same single-source-of-truth
// selections (inverter, battery option, PV module/string config, circuit
// designs, switching, earthing) already computed for a scenario. Cable
// quantities are per "run" (one continuous conductor set) since exact
// lengths depend on physical site layout, not equipment data — flagged in
// each row rather than guessed.
// ============================================================

export interface BoqRow { category:string; item:string; spec:string; qty:number; unit:string }

export function buildScenarioBOQ(opts: {
  inverter: GenericInverter
  battOpt: BatteryModuleOption | null
  pvModule: GenericPvModule | null
  pvArray: PvArrayConfigResult | null
  battCircuit: CircuitDesign | null
  pvCircuit: CircuitDesign | null
  acCircuit: CircuitDesign | null
  switching: SwitchingRecommendation | null
  earthing: EarthingDesign | null
}): BoqRow[] {
  const rows: BoqRow[] = []
  const { inverter, battOpt, pvModule, pvArray, battCircuit, pvCircuit, acCircuit, switching, earthing } = opts

  rows.push({ category:'Generation & Storage', item:`Inverter — ${inverter.tierId}`, spec:`${inverter.capacityKva} kVA / ${inverter.capacityKwCont} kW cont., ${inverter.phases}-phase`, qty:1, unit:'unit' })
  if (battOpt) rows.push({ category:'Generation & Storage', item:`Battery module — ${battOpt.tierId}`, spec:`${battOpt.chemistry}, ${battOpt.moduleKwh} kWh/module → ${battOpt.resultingKwh} kWh total`, qty:battOpt.modules, unit:'module' })
  if (pvModule && pvArray?.feasible) rows.push({ category:'Generation & Storage', item:`PV module — ${pvModule.tierId}`, spec:`${pvModule.ratedPowerW}W ${pvModule.technology}, ${pvArray.recommended?.seriesCount}S×${pvArray.recommended?.parallelCount}P`, qty:pvArray.panelCount, unit:'module' })

  if (battCircuit) {
    if (battCircuit.cable) rows.push({ category:'Conductors', item:`DC battery cable — ${battCircuit.cable.tierId}`, spec:`${battCircuit.cable.mm2}mm², ${battCircuit.designCurrentA}A design current`, qty:1, unit:'run (length TBC on site survey)' })
    if (battCircuit.protection) rows.push({ category:'Protection & Isolation', item:`DC battery breaker — ${battCircuit.protection.tierId}`, spec:`${battCircuit.protection.currentA}A, ${battCircuit.protection.voltageV}Vdc`, qty:1, unit:'unit' })
    if (battCircuit.isolator) rows.push({ category:'Protection & Isolation', item:`DC battery isolator — ${battCircuit.isolator.tierId}`, spec:`${battCircuit.isolator.currentA}A, ${battCircuit.isolator.voltageV}Vdc`, qty:1, unit:'unit' })
  }
  if (pvCircuit && pvArray?.recommended) {
    const strings = pvArray.recommended.parallelCount
    if (pvCircuit.cable) rows.push({ category:'Conductors', item:`PV string cable — ${pvCircuit.cable.tierId}`, spec:`${pvCircuit.cable.mm2}mm², ${pvCircuit.designCurrentA}A per string`, qty:strings, unit:'run (length TBC on site survey)' })
    if (pvCircuit.protection) rows.push({ category:'Protection & Isolation', item:`DC PV array breaker — ${pvCircuit.protection.tierId}`, spec:`${pvCircuit.protection.currentA}A, ${pvCircuit.protection.voltageV}Vdc`, qty:1, unit:'unit' })
    if (pvCircuit.isolator) rows.push({ category:'Protection & Isolation', item:`DC PV isolator — ${pvCircuit.isolator.tierId}`, spec:`${pvCircuit.isolator.currentA}A, ${pvCircuit.isolator.voltageV}Vdc`, qty:1, unit:'unit' })
    if (pvCircuit.fuse) rows.push({ category:'Protection & Isolation', item:`PV string fuse — ${pvCircuit.fuse.tierId}`, spec:`${pvCircuit.fuse.currentA}A`, qty:strings, unit:'unit' })
    if (pvCircuit.spd) rows.push({ category:'Protection & Isolation', item:`DC surge protection — ${pvCircuit.spd.tierId}`, spec:`${pvCircuit.spd.spdType}, ${pvCircuit.spd.maxVoltage}Vdc`, qty:1, unit:'unit' })
  }
  if (acCircuit) {
    if (acCircuit.cable) rows.push({ category:'Conductors', item:`AC output cable — ${acCircuit.cable.tierId}`, spec:`${acCircuit.cable.mm2}mm² × ${acCircuit.cable.cores} core, ${acCircuit.designCurrentA}A design current`, qty:1, unit:'run (length TBC on site survey)' })
    if (acCircuit.protection) rows.push({ category:'Protection & Isolation', item:`AC output breaker — ${acCircuit.protection.tierId}`, spec:`${acCircuit.protection.currentA}A, ${acCircuit.protection.voltageV}Vac`, qty:1, unit:'unit' })
    if (acCircuit.isolator) rows.push({ category:'Protection & Isolation', item:`AC output isolator — ${acCircuit.isolator.tierId}`, spec:`${acCircuit.isolator.currentA}A, ${acCircuit.isolator.voltageV}Vac`, qty:1, unit:'unit' })
    if (acCircuit.spd) rows.push({ category:'Protection & Isolation', item:`AC surge protection — ${acCircuit.spd.tierId}`, spec:`${acCircuit.spd.spdType}, ${acCircuit.spd.maxVoltage}Vac`, qty:1, unit:'unit' })
  }
  if (switching?.needed) {
    const chosen = switching.ats ?? switching.manual ?? switching.avs
    const kind = switching.ats ? `Automatic transfer switch — ${switching.ats.tierId}` : switching.manual ? `Manual changeover switch — ${switching.manual.tierId}` : switching.avs ? `AVS — ${switching.avs.tierId}` : null
    if (chosen && kind) rows.push({ category:'Switching & Source Management', item:kind, spec:`${chosen.currentA}A, ${chosen.voltageV}Vac, ${switching.sources}-source`, qty:1, unit:'unit' })
  }
  if (earthing?.points.length) {
    earthing.points.forEach(p => rows.push({ category:'Earthing', item:p.label, spec:`${p.conductorCsaMm2}mm² protective/bonding conductor`, qty:1, unit:'run (length TBC on site survey)' }))
    rows.push({ category:'Earthing', item:`RCD — ${earthing.rcd.ratingMa}mA`, spec:earthing.rcd.type, qty:1, unit:'unit' })
  }
  return rows
}
