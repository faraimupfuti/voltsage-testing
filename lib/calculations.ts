export const STANDARD_INVERTER_SIZES=[1,1.5,2,2.5,3,3.5,4,5,6,8,10,12,15,20,25,30,40,50]
export function roundUpToStandardInverter(r:number){return STANDARD_INVERTER_SIZES.find(s=>s>=r)??(r>0?Math.ceil(r):0)}
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
  const inv=roundUpToStandardInverter(Pk*1.3),Cb=Math.ceil((Nk>0?(Nk*autonomy)/(dod*bEff):0)*2)/2
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
  const Pk=Pm/1000,Sk=(Pm+se)/1000,inv=roundUpToStandardInverter(Pk*1.3)
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
  const inv=roundUpToStandardInverter(Pk*1.3)
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
 * scenario computed fresh from the Free Sizing Tool baseline. Adjustments
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
}

/**
 * Section 3(i) — Inverter Selection.
 * Sequence is always Phase -> Surge Capability -> Capacity Matching, never
 * capacity-first, so an inverter with inadequate surge withstand can never
 * be selected just because its nominal capacity looks closest.
 */
export function selectInverter(scenario: PremiumScenario, phase: SitePhase): InverterSelectionResult {
  const phaseMatches = INVERTER_DB.filter(inv => inv.phases === Number(phase))
  const surgeOk = phaseMatches.filter(inv => inv.surgeWithstandKva > scenario.surge)
  if (!surgeOk.length) return { inverter: null, reason: `No ${phase}-phase inverter in the database has enough surge withstand for ${scenario.surge.toFixed(2)} kW of surge demand.` }
  let best = surgeOk[0], bestDiff = Math.abs(surgeOk[0].capacityKva - scenario.invSize)
  surgeOk.forEach(inv => { const d = Math.abs(inv.capacityKva - scenario.invSize); if (d < bestDiff) { best = inv; bestDiff = d } })
  return { inverter: best }
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

/** Section 3(iv) — PV Array Configuration check. */
export function checkPvCompatibility(scenario: PremiumScenario, inverter: GenericInverter): { ok:boolean; message:string } {
  const ok = scenario.pv <= inverter.pvMaxArrayKw
  return {
    ok,
    message: ok
      ? `${scenario.pv.toFixed(2)} kWp is within this inverter's ${inverter.pvMaxArrayKw} kW maximum PV array capacity.`
      : `${scenario.pv.toFixed(2)} kWp exceeds this inverter's ${inverter.pvMaxArrayKw} kW maximum PV array capacity — a larger inverter or split-array configuration is required.`,
  }
}
