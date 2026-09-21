// ---------------------------------------------------------------------------
// VoltSage DC Cable Sizing Tool — standalone calculation engine
//
// Implements the spec in "VoltSage DC Cable Sizing" (stand-alone tool):
//   - PV Module Cable Sizing (PV string/array → inverter MPPT)
//   - Battery Cable Sizing (battery → inverter)
//
// All tables below are implemented as configurable data (per the spec's
// note that these "shall be implemented as configurable data rather than
// hard-coded calculation constants"), not as inline magic numbers in the
// calculation functions.
// ---------------------------------------------------------------------------

export type DcCableApplication = 'pv' | 'battery'
export type SizingMode = 'standard' | 'advanced'

// ---- Cable databases -------------------------------------------------------
// current_rating_continuous_a: reference continuous current rating (A) for
//   single-core XLPE/XLPO cable, enclosed in conduit/trunking, per the
//   VoltSage generic cable database (pv_cable_database_generic.csv /
//   dc_battery_cable_database_generic.csv).
// resistance_ohm_per_km_20c: conductor resistance at 20°C (Ω/km).

export interface DcCableDbRow {
  id: string
  mm2: number
  currentRatingContinuousA: number
  resistanceOhmPerKm20C: number
}

// pv_cable_database_generic.csv
export const PV_CABLE_DATABASE: DcCableDbRow[] = [
  { id: 'PV01', mm2: 2.5, currentRatingContinuousA: 30, resistanceOhmPerKm20C: 7.98 },
  { id: 'PV02', mm2: 4, currentRatingContinuousA: 40, resistanceOhmPerKm20C: 4.95 },
  { id: 'PV03', mm2: 6, currentRatingContinuousA: 55, resistanceOhmPerKm20C: 3.30 },
  { id: 'PV04', mm2: 10, currentRatingContinuousA: 75, resistanceOhmPerKm20C: 1.91 },
  { id: 'PV05', mm2: 16, currentRatingContinuousA: 100, resistanceOhmPerKm20C: 1.21 },
  { id: 'PV06', mm2: 25, currentRatingContinuousA: 127, resistanceOhmPerKm20C: 0.78 },
  { id: 'PV07', mm2: 35, currentRatingContinuousA: 158, resistanceOhmPerKm20C: 0.554 },
]

// dc_battery_cable_database_generic.csv
export const DC_BATTERY_CABLE_DATABASE: DcCableDbRow[] = [
  { id: 'DC01', mm2: 16, currentRatingContinuousA: 100, resistanceOhmPerKm20C: 1.21 },
  { id: 'DC02', mm2: 25, currentRatingContinuousA: 127, resistanceOhmPerKm20C: 0.78 },
  { id: 'DC03', mm2: 35, currentRatingContinuousA: 158, resistanceOhmPerKm20C: 0.554 },
  { id: 'DC04', mm2: 50, currentRatingContinuousA: 192, resistanceOhmPerKm20C: 0.386 },
  { id: 'DC05', mm2: 70, currentRatingContinuousA: 246, resistanceOhmPerKm20C: 0.272 },
  { id: 'DC06', mm2: 95, currentRatingContinuousA: 298, resistanceOhmPerKm20C: 0.206 },
  { id: 'DC07', mm2: 120, currentRatingContinuousA: 346, resistanceOhmPerKm20C: 0.161 },
  { id: 'DC08', mm2: 150, currentRatingContinuousA: 399, resistanceOhmPerKm20C: 0.129 },
  { id: 'DC09', mm2: 185, currentRatingContinuousA: 456, resistanceOhmPerKm20C: 0.106 },
  { id: 'DC10', mm2: 240, currentRatingContinuousA: 538, resistanceOhmPerKm20C: 0.0801 },
]

// ---- IEC 60364-5-52 derating factors (90°C XLPE/EPR insulation) ----------

/** Ambient-temperature correction factor table. IEC reference condition = 30°C. */
export const AMBIENT_TEMP_FACTORS: { ambientC: number; factor: number }[] = [
  { ambientC: 10, factor: 1.15 },
  { ambientC: 15, factor: 1.12 },
  { ambientC: 20, factor: 1.08 },
  { ambientC: 25, factor: 1.04 },
  { ambientC: 30, factor: 1.00 },
  { ambientC: 35, factor: 0.96 },
  { ambientC: 40, factor: 0.91 },
  { ambientC: 45, factor: 0.87 },
  { ambientC: 50, factor: 0.82 },
  { ambientC: 55, factor: 0.76 },
  { ambientC: 60, factor: 0.71 },
  { ambientC: 65, factor: 0.65 },
  { ambientC: 70, factor: 0.58 },
  { ambientC: 75, factor: 0.50 },
  { ambientC: 80, factor: 0.41 },
  { ambientC: 85, factor: 0.29 },
]

/** Grouping / number-of-DC-circuits correction factor table (bunched/enclosed, touching). */
export const GROUPING_FACTORS: { circuits: number; factor: number }[] = [
  { circuits: 1, factor: 1.00 },
  { circuits: 2, factor: 0.80 },
  { circuits: 3, factor: 0.70 },
  { circuits: 4, factor: 0.65 },
  { circuits: 5, factor: 0.60 },
  { circuits: 6, factor: 0.57 },
  { circuits: 7, factor: 0.54 },
  { circuits: 8, factor: 0.52 },
  { circuits: 9, factor: 0.50 },
  { circuits: 12, factor: 0.45 },
  { circuits: 16, factor: 0.41 },
  { circuits: 20, factor: 0.38 },
]

export const DEFAULT_AMBIENT_C = 40
export const DEFAULT_CIRCUITS = 1
export const DEFAULT_MAX_VOLTAGE_DROP_PCT = 3

/** Copper temperature coefficient of resistance, per °C. */
export const COPPER_TEMP_COEFF = 0.00393
/** Conservative assumed conductor operating temperature for resistance correction (cable's max continuous rating). */
export const ASSUMED_CONDUCTOR_TEMP_C = 90
/** R90 = R20 x RESISTANCE_TEMP_MULTIPLIER (derived from the copper temperature-coefficient equation at 90°C). */
export const RESISTANCE_TEMP_MULTIPLIER = 1 + COPPER_TEMP_COEFF * (ASSUMED_CONDUCTOR_TEMP_C - 20) // ≈ 1.275

export function getAmbientTempFactor(ambientC: number): number {
  const exact = AMBIENT_TEMP_FACTORS.find(p => p.ambientC === ambientC)
  if (exact) return exact.factor
  // Fallback for an untabulated value: nearest tabulated ambient point.
  const nearest = [...AMBIENT_TEMP_FACTORS].sort((a, b) => Math.abs(a.ambientC - ambientC) - Math.abs(b.ambientC - ambientC))[0]
  return nearest.factor
}

export function getGroupingFactor(circuits: number): number {
  const exact = GROUPING_FACTORS.find(p => p.circuits === circuits)
  if (exact) return exact.factor
  // Fallback: use the next-lower tabulated circuit count's factor (never overstate ampacity for an intermediate/untabulated count).
  const applicable = [...GROUPING_FACTORS].filter(p => p.circuits <= circuits).sort((a, b) => b.circuits - a.circuits)[0]
  return applicable ? applicable.factor : GROUPING_FACTORS[0].factor
}

/** k_total = k_temp x k_group */
export function combinedDeratingFactor(ambientC: number, circuits: number): number {
  return getAmbientTempFactor(ambientC) * getGroupingFactor(circuits)
}

/** R90 ≈ 1.275 x R20 */
export function resistanceAtAssumedTemp(r20OhmPerKm: number): number {
  return r20OhmPerKm * RESISTANCE_TEMP_MULTIPLIER
}

// ---- PV Module Cable Sizing -----------------------------------------------

export interface PvCableSizingInputs {
  estimatedCableLengthM: number // one-way
  maxOperatingPvInputCurrentA: number
  pvInputVoltageMinV: number
  pvInputVoltageMaxV: number
  ambientC: number
  numberOfCircuits: number
  maxVoltageDropPct: number
}

export const STANDARD_PV_DEFAULTS = {
  ambientC: DEFAULT_AMBIENT_C,
  numberOfCircuits: DEFAULT_CIRCUITS,
  maxVoltageDropPct: DEFAULT_MAX_VOLTAGE_DROP_PCT,
}

export interface DcCableCandidateResult {
  cable: DcCableDbRow
  kTotal: number
  correctedAmpacityA: number
  ampacityPass: boolean
  voltageDropAbsoluteV: number
  voltageDropPctAtMin?: number // PV: %VD evaluated against V_pv_min
  voltageDropPctAtMax?: number // PV: %VD evaluated against V_pv_max
  voltageDropPct?: number // Battery: single %VD
  voltageDropPass: boolean
  overallPass: boolean
}

export interface PvCableSizingResult {
  inputs: PvCableSizingInputs
  designCurrentA: number
  circuitLengthM: number // two-way
  kTemp: number
  kGroup: number
  kTotal: number
  candidates: DcCableCandidateResult[]
  recommended: DcCableCandidateResult | null
}

export function sizePvCable(inputs: PvCableSizingInputs): PvCableSizingResult {
  const designCurrentA = inputs.maxOperatingPvInputCurrentA
  const circuitLengthM = 2 * inputs.estimatedCableLengthM
  const kTemp = getAmbientTempFactor(inputs.ambientC)
  const kGroup = getGroupingFactor(inputs.numberOfCircuits)
  const kTotal = kTemp * kGroup

  const candidates: DcCableCandidateResult[] = PV_CABLE_DATABASE
    .slice()
    .sort((a, b) => a.mm2 - b.mm2)
    .map(cable => {
      const correctedAmpacityA = cable.currentRatingContinuousA * kTotal
      const ampacityPass = correctedAmpacityA >= designCurrentA
      const r90 = resistanceAtAssumedTemp(cable.resistanceOhmPerKm20C)
      const voltageDropAbsoluteV = designCurrentA * r90 * (circuitLengthM / 1000)
      const voltageDropPctAtMin = inputs.pvInputVoltageMinV > 0 ? (voltageDropAbsoluteV / inputs.pvInputVoltageMinV) * 100 : Infinity
      const voltageDropPctAtMax = inputs.pvInputVoltageMaxV > 0 ? (voltageDropAbsoluteV / inputs.pvInputVoltageMaxV) * 100 : Infinity
      const voltageDropPass = voltageDropPctAtMin <= inputs.maxVoltageDropPct && voltageDropPctAtMax <= inputs.maxVoltageDropPct
      return {
        cable, kTotal, correctedAmpacityA, ampacityPass,
        voltageDropAbsoluteV, voltageDropPctAtMin, voltageDropPctAtMax, voltageDropPass,
        overallPass: ampacityPass && voltageDropPass,
      }
    })

  const recommended = candidates.find(c => c.overallPass) ?? null

  return { inputs, designCurrentA, circuitLengthM, kTemp, kGroup, kTotal, candidates, recommended }
}

// ---- Battery Cable Sizing ---------------------------------------------------

export interface BatteryCableSizingInputs {
  maxChargeDischargeCurrentA: number
  batteryVoltageV: number
  estimatedCableLengthM: number // one-way
  ambientC: number
  numberOfCircuits: number
  maxVoltageDropPct: number
}

export const STANDARD_BATTERY_DEFAULTS = {
  ambientC: DEFAULT_AMBIENT_C,
  numberOfCircuits: DEFAULT_CIRCUITS,
  maxVoltageDropPct: DEFAULT_MAX_VOLTAGE_DROP_PCT,
}

export interface BatteryCableSizingResult {
  inputs: BatteryCableSizingInputs
  designCurrentA: number
  circuitLengthM: number // two-way
  kTemp: number
  kGroup: number
  kTotal: number
  candidates: DcCableCandidateResult[]
  recommended: DcCableCandidateResult | null
}

export function sizeBatteryCable(inputs: BatteryCableSizingInputs): BatteryCableSizingResult {
  const designCurrentA = inputs.maxChargeDischargeCurrentA
  const circuitLengthM = 2 * inputs.estimatedCableLengthM
  const kTemp = getAmbientTempFactor(inputs.ambientC)
  const kGroup = getGroupingFactor(inputs.numberOfCircuits)
  const kTotal = kTemp * kGroup

  const candidates: DcCableCandidateResult[] = DC_BATTERY_CABLE_DATABASE
    .slice()
    .sort((a, b) => a.mm2 - b.mm2)
    .map(cable => {
      const correctedAmpacityA = cable.currentRatingContinuousA * kTotal
      const ampacityPass = correctedAmpacityA >= designCurrentA
      const r90 = resistanceAtAssumedTemp(cable.resistanceOhmPerKm20C)
      const voltageDropAbsoluteV = designCurrentA * r90 * (circuitLengthM / 1000)
      const voltageDropPct = inputs.batteryVoltageV > 0 ? (voltageDropAbsoluteV / inputs.batteryVoltageV) * 100 : Infinity
      const voltageDropPass = voltageDropPct <= inputs.maxVoltageDropPct
      return {
        cable, kTotal, correctedAmpacityA, ampacityPass,
        voltageDropAbsoluteV, voltageDropPct, voltageDropPass,
        overallPass: ampacityPass && voltageDropPass,
      }
    })

  const recommended = candidates.find(c => c.overallPass) ?? null

  return { inputs, designCurrentA, circuitLengthM, kTemp, kGroup, kTotal, candidates, recommended }
}

// ---- Shared copy (info bubbles / explanations) -----------------------------

export const PV_CURRENT_LABELS = [
  'Maximum PV Input Current', 'Max. PV Input Current', 'Maximum Operating PV Input Current',
  'Max. Operating Input Current', 'Maximum Input Current', 'Max. Input Current per MPPT',
  'Maximum MPPT Input Current', 'Max. DC Input Current',
]

export const PV_VOLTAGE_RANGE_LABELS = [
  'PV Input Voltage Range', 'MPPT Voltage Range', 'MPPT Operating Voltage Range',
  'MPPT Voltage', 'MPPT Range', 'Operating Voltage Range', 'DC Input Voltage Range',
]

export const BATTERY_CURRENT_LABELS = [
  'Maximum Charging Current', 'Maximum Charge Current', 'Maximum Discharging Current',
  'Maximum Discharge Current', 'Maximum Battery Current', 'Maximum Battery Charge/Discharge Current',
  'Max. Continuous Charge/Discharge Current',
]

export const BATTERY_VOLTAGE_LABELS = [
  'Battery Voltage', 'Nominal Battery Voltage', 'Rated Battery Voltage',
  'Nominal DC Voltage', 'Battery System Voltage', 'DC Battery Voltage',
]

export const AMPACITY_PASS_EXPLANATION = 'Ampacity ensures the cable can safely carry the required current without excessive heating. When correctly installed and protected, an adequately rated cable reduces the risk of overheating and fire.'
export const AMPACITY_FAIL_EXPLANATION = 'This cable is not adequately rated to carry the required current under the specified installation conditions. An undersized cable can overheat and increase the risk of damage or fire.'
export const VOLTAGE_DROP_PASS_EXPLANATION_PV = 'Voltage drop indicates how much voltage is lost as power travels through the cable. Keeping voltage drop within the specified limit helps ensure efficient transfer of power from the PV modules to the inverter.'
export const VOLTAGE_DROP_PASS_EXPLANATION_BATTERY = 'Voltage drop indicates how much voltage is lost as power travels through the cable. Keeping voltage drop within the specified limit helps ensure efficient transfer of power from the Battery to the inverter.'
export const VOLTAGE_DROP_FAIL_EXPLANATION = 'The voltage loss in this cable exceeds the specified limit. A high voltage drop can reduce the voltage available at the inverter and result in less efficient power transfer.'
export const NO_CABLE_SATISFIES_MESSAGE = 'No available cable size satisfies the requirements. Consider increasing the cable size beyond the available database, or review the system configuration.'
export const ASSUMED_CABLE_TYPE = 'XLPE/XLPO'
