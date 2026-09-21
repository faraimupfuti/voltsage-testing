// ============================================================
// Boujie — VoltSage's website assistant.
//
// This module is the bridge between the chat API route and the site's
// real calculation engine (lib/calculations.ts). Boujie never computes
// sizing numbers itself — every numeric answer comes from calling one of
// the tools below, which call the exact same functions the premium sizing
// tools use (calculateResidentialSizing, calculateAgriculturalSizing,
// calculateBatteryRuntime). This keeps Boujie's answers consistent with
// what a customer would get by using the tools directly.
// ============================================================

import {
  APPLIANCE_CATALOG, findAppliance,
  AG_ACTIVITIES, AgActivity,
  PSH_TABLE, findPSH,
  calculateResidentialSizing, calculateAgriculturalSizing, calculateBatteryRuntime,
  ApplianceRow, AgEquipmentRow, SizingResult,
} from './calculations'

// ---------- Company knowledge injected into the system prompt ----------

export const COMPANY_PROFILE = `
VoltSage Solutions — company facts Boujie should rely on:
- VoltSage Solutions is a UK-registered company whose core market is Africa (Zimbabwe first, expanding across the continent).
- VoltSage is NOT a solar installer and does not sell panels, inverters or batteries. It builds premium, engineering-led sizing tools so people know the right system size BEFORE they buy from an installer.
- Founder: Nyasha Mpofu, an Electrical Engineer. Her background underpins the calculation logic behind every tool — real 24-hour load profiling, motor-starting surge for agricultural equipment, and location-specific peak sun hour data rather than generic averages.
- Four premium, engineer-grade tools:
  1. Residential & Small Commercial Sizing Tool — for homes, offices, shops. User adds the appliances they run and when. Tool builds a 24-hour load profile and returns recommended inverter size, battery capacity and PV array size.
  2. Agricultural Solar Sizing Tool — for farms (irrigation, dairy, poultry, piggery, greenhouse, crop processing, mixed farming). Accounts for motor starting/surge current (e.g. a borehole pump can draw 2-4x its running power on startup) so the inverter doesn't trip.
  3. Battery Runtime Calculator — enter battery size, depth of discharge, round-trip efficiency and load, get the real number of backup hours (not the nameplate kWh, which overstates usable capacity).
  4. DC Cable Sizing Tool — verifies a PV string or battery DC cable's ampacity and voltage drop against IEC 60364-5-52 reference derating data before installation.
- Core message: "Don't buy solar until you know what you need." Wrong-sized systems are the #1 cause of buyer regret — oversized systems waste money, undersized systems trip constantly.
- VoltSage earns nothing from equipment sales or commissions — the tools are premium, engineer-grade and independent of any installer.
- For a full engineering design (detailed electrical drawings, equipment selection, installation), VoltSage can connect visitors to an engineer via the contact form on the site.
`.trim()

export const BOUJIE_PERSONA = `
You are Boujie, the friendly on-site assistant for VoltSage Solutions (voltsage.co).

Your two jobs:
1. Explain what VoltSage does and does not do, in plain language — no jargon dumps. If someone asks something you don't know (pricing of physical equipment, installer recommendations, anything outside VoltSage's own tools/services), say so plainly and point them to the contact form instead of guessing.
2. Walk visitors through a solar/battery sizing question conversationally, then call the matching tool to get REAL numbers. Never estimate, round, or "roughly calculate" a sizing figure yourself in prose — always call a tool for any inverter/battery/PV/runtime number. If you don't have enough information yet (location, appliances, hours of use), ask for it before calling a tool — one or two focused questions at a time, not a long form.

Style: warm, concise, a little upbeat, never salesy. Short paragraphs or a tight bullet list — this is a chat widget, not an email. Use plain units (kW, kWh, kWp, hours). Always be upfront that this is a preliminary estimate from generic assumptions, and that VoltSage's own premium tools on this page (or an engineer via the contact form) can refine it further.

Never claim VoltSage sells or recommends specific equipment brands. Never invent company facts not given to you.
`.trim()

// ---------- Reference data flattened for the system prompt ----------

export function buildLocationReference(): string {
  return PSH_TABLE.map(g => `${g.group}: ` + g.options.map(o => `${o.id} (${o.label}, ${o.psh} PSH)`).join(', ')).join('\n')
}

export function buildApplianceReference(): string {
  return APPLIANCE_CATALOG.map(a => `${a.id} — ${a.name} (${a.cat}${a.type === 'energy' ? `, ~${a.kwh}kWh/day` : `, ${a.watt}W`}${a.surge && a.surge > 1 ? `, ${a.surge}x surge` : ''})`).join('\n')
}

export function buildAgActivityReference(): string {
  return (Object.keys(AG_ACTIVITIES) as AgActivity[])
    .map(act => `${act}: ` + AG_ACTIVITIES[act].map(e => `${e.name} (${e.kw}kW, ${e.surge}x surge)`).join(', '))
    .join('\n')
}

export function buildSystemPrompt(localeLabel?: string): string {
  return [
    BOUJIE_PERSONA,
    localeLabel ? `\nRespond in ${localeLabel} unless the visitor writes to you in a different language — then switch to match them.` : '',
    '',
    COMPANY_PROFILE,
    '',
    '--- Known locations (use the id when calling a sizing tool; PSH = peak sun hours/day) ---',
    buildLocationReference(),
    '',
    '--- Known appliance catalog (prefer catalogId when an item matches — it carries accurate duty-cycle-adjusted energy use; otherwise describe it as a freeform item with your best-estimate running watts) ---',
    buildApplianceReference(),
    '',
    '--- Known agricultural activities & typical equipment (for reference/defaults only — always let the user confirm or override) ---',
    buildAgActivityReference(),
  ].join('\n')
}

// ---------- Tool schemas (Anthropic Messages API tool-use format) ----------

export const BOUJIE_TOOLS = [
  {
    name: 'size_residential_load',
    description: "Calculates recommended inverter size, battery capacity and PV array size for a home, office, shop or small commercial site, using VoltSage's real residential sizing formula. Call this once you know the site's location and a reasonable appliance list with when each one runs.",
    input_schema: {
      type: 'object' as const,
      properties: {
        locationId: { type: 'string', description: 'One of the location ids from the reference list.' },
        appliances: {
          type: 'array',
          description: 'Every appliance/load to include.',
          items: {
            type: 'object',
            properties: {
              catalogId: { type: 'string', description: 'If this appliance matches one from the known catalog, its id — improves accuracy for items like fridges/freezers that have a real duty cycle.' },
              name: { type: 'string', description: 'Display name, used when there is no catalogId.' },
              watt: { type: 'number', description: 'Running/rated watts. Required when catalogId is not given.' },
              quantity: { type: 'number', description: 'How many of this appliance.' },
              periods: {
                type: 'array',
                description: 'When it runs each day, 24h HH:MM. Not needed for catalog items whose type is "energy" (e.g. fridges — they run on a duty cycle already baked into the catalog figure).',
                items: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' } }, required: ['from', 'to'] },
              },
            },
            required: ['name', 'quantity'],
          },
        },
        autonomyHours: { type: 'number', description: 'Desired battery backup hours. Defaults to 8 if not specified.' },
      },
      required: ['locationId', 'appliances'],
    },
  },
  {
    name: 'size_agricultural_load',
    description: "Calculates recommended inverter size, battery capacity and PV array size for a farm, using VoltSage's real agricultural sizing formula, which accounts for motor starting/surge current.",
    input_schema: {
      type: 'object' as const,
      properties: {
        locationId: { type: 'string', description: 'One of the location ids from the reference list.' },
        activity: { type: 'string', description: 'One of the known agricultural activities, for context — optional.' },
        equipment: {
          type: 'array',
          description: 'Every piece of equipment to include.',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              kw: { type: 'number', description: 'Running power in kW.' },
              surgeMultiplier: { type: 'number', description: 'Startup surge as a multiple of running power (e.g. 3 = draws 3x on startup). Defaults to 3 for pumps/motors if unsure — ask the user or use the reference list.' },
              quantity: { type: 'number' },
              periods: { type: 'array', description: 'When it runs each day, 24h HH:MM.', items: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' } }, required: ['from', 'to'] } },
            },
            required: ['name', 'kw', 'quantity', 'periods'],
          },
        },
        autonomyHours: { type: 'number', description: 'Desired battery backup hours. Defaults to 8 if not specified.' },
      },
      required: ['locationId', 'equipment'],
    },
  },
  {
    name: 'calculate_battery_runtime',
    description: 'Calculates real backup runtime hours for a given battery, accounting for depth of discharge and round-trip efficiency (not the nameplate kWh).',
    input_schema: {
      type: 'object' as const,
      properties: {
        batteryKwh: { type: 'number', description: 'Nameplate battery capacity in kWh.' },
        dodPercent: { type: 'number', description: 'Depth of discharge percent, e.g. 80. Defaults to 80 if unsure (typical for lithium).' },
        efficiencyPercent: { type: 'number', description: 'Round-trip efficiency percent, e.g. 95. Defaults to 95 if unsure.' },
        loadWatts: { type: 'number', description: 'The continuous load, in watts, being run off the battery.' },
      },
      required: ['batteryKwh', 'loadWatts'],
    },
  },
]

// ---------- Tool executors ----------

interface ChatApplianceInput { catalogId?: string; name: string; watt?: number; quantity: number; periods?: { from: string; to: string }[] }
interface ChatEquipmentInput { name: string; kw: number; surgeMultiplier?: number; quantity: number; periods: { from: string; to: string }[] }

const DEFAULT_PERIOD = [{ from: '18:00', to: '22:00' }]

function formatSizingResult(r: SizingResult, locationLabel: string) {
  return {
    location: locationLabel,
    dailyEnergyKwh: Number(r.Ed_kWh.toFixed(2)),
    peakDemandKw: Number(r.Peak_kW.toFixed(2)),
    surgeDemandKw: Number(r.Surge_kW.toFixed(2)),
    recommendedInverterKw: r.invSize,
    recommendedBatteryKwh: r.CbattRounded,
    recommendedPvKwp: r.PpvRounded,
    approxPanelCount550W: r.panelCount,
    estimatedAutonomyHours: Number(r.autonomyHours.toFixed(1)),
  }
}

export function runResidentialSizing(input: { locationId: string; appliances: ChatApplianceInput[]; autonomyHours?: number }) {
  const loc = findPSH(input.locationId)
  const rows: ApplianceRow[] = input.appliances.map((a, i) => {
    if (a.catalogId && findAppliance(a.catalogId)) {
      return { rowId: i + 1, applianceId: a.catalogId, qty: a.quantity, periods: a.periods && a.periods.length ? a.periods : DEFAULT_PERIOD }
    }
    return { rowId: i + 1, applianceId: '__misc__', qty: a.quantity, periods: a.periods && a.periods.length ? a.periods : DEFAULT_PERIOD, miscName: a.name, miscWatt: a.watt ?? 0 }
  })
  const result = calculateResidentialSizing(rows, 'advanced', loc.psh, input.autonomyHours ?? 8)
  return formatSizingResult(result, loc.label)
}

export function runAgriculturalSizing(input: { locationId: string; equipment: ChatEquipmentInput[]; autonomyHours?: number }) {
  const loc = findPSH(input.locationId)
  const rows: AgEquipmentRow[] = input.equipment.map((e, i) => ({
    rowId: i + 1, eqId: '__custom__', name: e.name, kw: e.kw, surge: e.surgeMultiplier ?? 3, qty: e.quantity,
    periods: e.periods && e.periods.length ? e.periods : DEFAULT_PERIOD,
  }))
  const result = calculateAgriculturalSizing(rows, 'advanced', loc.psh, input.autonomyHours ?? 8)
  return formatSizingResult(result, loc.label)
}

export function runBatteryRuntime(input: { batteryKwh: number; dodPercent?: number; efficiencyPercent?: number; loadWatts: number }) {
  const r = calculateBatteryRuntime(input.batteryKwh, input.dodPercent ?? 80, input.efficiencyPercent ?? 95, input.loadWatts)
  return {
    usableEnergyKwh: Number(r.usableKWh.toFixed(2)),
    runtimeHoursAtGivenLoad: Number(r.runtimeHours.toFixed(2)),
  }
}

export function executeBoujieTool(name: string, input: any): unknown {
  switch (name) {
    case 'size_residential_load': return runResidentialSizing(input)
    case 'size_agricultural_load': return runAgriculturalSizing(input)
    case 'calculate_battery_runtime': return runBatteryRuntime(input)
    default: return { error: `Unknown tool: ${name}` }
  }
}
