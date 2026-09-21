'use client'
import { useState, useMemo, useCallback, useRef, ReactNode } from 'react'
import { Cable, Info, HelpCircle, FileDown, Loader2, CheckCircle2, XCircle, Zap, Sun, BatteryCharging } from 'lucide-react'
import {
  AMBIENT_TEMP_FACTORS, GROUPING_FACTORS,
  DEFAULT_AMBIENT_C, DEFAULT_CIRCUITS, DEFAULT_MAX_VOLTAGE_DROP_PCT,
  sizePvCable, sizeBatteryCable,
  PvCableSizingInputs, BatteryCableSizingInputs, DcCableCandidateResult,
  PV_CURRENT_LABELS, PV_VOLTAGE_RANGE_LABELS, BATTERY_CURRENT_LABELS, BATTERY_VOLTAGE_LABELS,
  AMPACITY_PASS_EXPLANATION, AMPACITY_FAIL_EXPLANATION,
  VOLTAGE_DROP_PASS_EXPLANATION_PV, VOLTAGE_DROP_PASS_EXPLANATION_BATTERY, VOLTAGE_DROP_FAIL_EXPLANATION,
  NO_CABLE_SATISFIES_MESSAGE, ASSUMED_CABLE_TYPE,
} from '@/lib/dcCableSizing'
import { generateSizingReportPDF } from '@/lib/pdfReport'
import { LeadLock } from '@/components/AccessGate'
import TourGuide, { TourHandle, TourStep } from '@/components/TourGuide'
import UseCaseStrip from '@/components/tools/UseCaseStrip'
import { useReportDetails } from '@/components/tools/SiteTools'

type Tab = 'pv' | 'battery'
type Mode = 'standard' | 'advanced'

function InfoBubble({ title, labels, note }: { title: string; labels: string[]; note?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-block">
      <button type="button" onClick={() => setOpen(o => !o)} onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="align-middle text-ink-faint hover:text-brand-teal transition-colors ml-1" aria-label="Where can I find this?">
        <Info size={13} />
      </button>
      {open && (
        <div className="absolute z-20 left-0 top-6 w-72 bg-white border border-surface-border rounded-xl shadow-card-lg p-3.5 text-left">
          <div className="font-mono text-[10px] uppercase tracking-widest text-brand-teal mb-2">Where can I find this?</div>
          <p className="text-[11px] text-ink-muted mb-2">This value may be labelled on the datasheet as:</p>
          <ul className="text-[11px] text-ink space-y-0.5 mb-2 list-disc list-inside">
            {labels.map(l => <li key={l}>{l}</li>)}
          </ul>
          {note && <p className="text-[10.5px] text-ink-faint leading-relaxed">{note}</p>}
        </div>
      )}
    </span>
  )
}

function Field({ label, children, info }: { label: string; children: ReactNode; info?: ReactNode }) {
  return (
    <div>
      <label className="text-sm font-mono text-ink font-medium flex items-center">{label}{info}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

function NumInput({ value, onChange, step = 1, min = 0, suffix }: { value: number; onChange: (v: number) => void; step?: number; min?: number; suffix?: string }) {
  return (
    <div className="relative">
      <input type="number" min={min} step={step} value={Number.isFinite(value) ? value : ''}
        onChange={e => { const v = e.target.value; onChange(v === '' ? 0 : parseFloat(v) || 0) }}
        className="tool-input text-sm pr-12" />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-ink-faint">{suffix}</span>}
    </div>
  )
}

function ResultRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between py-1.5 border-b border-surface-border last:border-0">
      <span className="text-xs font-mono text-ink-muted">{label}</span>
      <span className="text-right">
        <span className="text-sm font-mono font-semibold text-ink">{value}</span>
        {sub && <span className="block text-[10px] font-mono text-ink-faint">{sub}</span>}
      </span>
    </div>
  )
}

function CheckBlock({ title, pass, explanation }: { title: string; pass: boolean; explanation: string }) {
  return (
    <div className={`rounded-xl border p-4 ${pass ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
      <div className="flex items-center gap-2 mb-1.5">
        {pass ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-red-500" />}
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">{title}: {pass ? 'PASS' : 'FAIL'}</span>
      </div>
      <p className="text-[11.5px] text-ink-muted leading-relaxed">{explanation}</p>
    </div>
  )
}

export default function DCCableSizingTool() {
  const [tab, setTab] = useState<Tab>('pv')
  const [mode, setMode] = useState<Mode>('standard')

  // PV inputs
  const [pvLength, setPvLength] = useState(20)
  const [pvCurrent, setPvCurrent] = useState(18)
  const [pvVmin, setPvVmin] = useState(150)
  const [pvVmax, setPvVmax] = useState(425)
  const [pvAmbient, setPvAmbient] = useState(DEFAULT_AMBIENT_C)
  const [pvCircuits, setPvCircuits] = useState(DEFAULT_CIRCUITS)
  const [pvMaxVd, setPvMaxVd] = useState(DEFAULT_MAX_VOLTAGE_DROP_PCT)

  // Battery inputs
  const [battCurrent, setBattCurrent] = useState(150)
  const [battVoltage, setBattVoltage] = useState(48)
  const [battLength, setBattLength] = useState(6)
  const [battAmbient, setBattAmbient] = useState(DEFAULT_AMBIENT_C)
  const [battCircuits, setBattCircuits] = useState(DEFAULT_CIRCUITS)
  const [battMaxVd, setBattMaxVd] = useState(DEFAULT_MAX_VOLTAGE_DROP_PCT)

  const pvInputs: PvCableSizingInputs = useMemo(() => ({
    estimatedCableLengthM: pvLength,
    maxOperatingPvInputCurrentA: pvCurrent,
    pvInputVoltageMinV: pvVmin,
    pvInputVoltageMaxV: pvVmax,
    ambientC: mode === 'standard' ? DEFAULT_AMBIENT_C : pvAmbient,
    numberOfCircuits: mode === 'standard' ? DEFAULT_CIRCUITS : pvCircuits,
    maxVoltageDropPct: mode === 'standard' ? DEFAULT_MAX_VOLTAGE_DROP_PCT : pvMaxVd,
  }), [pvLength, pvCurrent, pvVmin, pvVmax, pvAmbient, pvCircuits, pvMaxVd, mode])

  const battInputs: BatteryCableSizingInputs = useMemo(() => ({
    maxChargeDischargeCurrentA: battCurrent,
    batteryVoltageV: battVoltage,
    estimatedCableLengthM: battLength,
    ambientC: mode === 'standard' ? DEFAULT_AMBIENT_C : battAmbient,
    numberOfCircuits: mode === 'standard' ? DEFAULT_CIRCUITS : battCircuits,
    maxVoltageDropPct: mode === 'standard' ? DEFAULT_MAX_VOLTAGE_DROP_PCT : battMaxVd,
  }), [battCurrent, battVoltage, battLength, battAmbient, battCircuits, battMaxVd, mode])

  const pvResult = useMemo(() => sizePvCable(pvInputs), [pvInputs])
  const battResult = useMemo(() => sizeBatteryCable(battInputs), [battInputs])

  const result = tab === 'pv' ? pvResult : battResult
  const rec: DcCableCandidateResult | null = result.recommended

  const [pdfBusy, setPdfBusy] = useState(false)
  const report = useReportDetails()
  const downloadPDF = useCallback(() => report.run(async client => {
    setPdfBusy(true)
    try {
      if (tab === 'pv') {
        const r = pvResult
        const rc = r.recommended
        await generateSizingReportPDF({
          preparedFor: client,
          toolName: 'PV Module Cable Sizing Report',
          subtitle: `Cable verification for the PV string/array to inverter MPPT connection. Assumed cable type: ${ASSUMED_CABLE_TYPE}.`,
          mode,
          metrics: [
            { label: 'Estimated cable length (one-way)', value: String(pvLength), unit: 'm' },
            { label: 'Max operating PV input current', value: String(pvCurrent), unit: 'A' },
            { label: 'PV input voltage range', value: `${pvVmin} – ${pvVmax}`, unit: 'V' },
            { label: 'Ambient temperature', value: String(r.inputs.ambientC), unit: '°C' },
            { label: 'Number of circuits', value: String(r.inputs.numberOfCircuits) },
            { label: 'Combined derating factor (k_total)', value: r.kTotal.toFixed(2) },
            { label: 'Max allowable voltage drop', value: String(r.inputs.maxVoltageDropPct), unit: '%' },
          ],
          highlight: rc
            ? `Recommended cable: ${rc.cable.mm2} mm² PV cable — Ampacity ${rc.ampacityPass ? 'PASS' : 'FAIL'}, Voltage drop ${rc.voltageDropPass ? 'PASS' : 'FAIL'}`
            : NO_CABLE_SATISFIES_MESSAGE,
          tables: [{
            title: 'Cable size evaluation',
            head: ['Cable size', 'Corrected ampacity', 'Ampacity check', 'VD% at min V', 'VD% at max V', 'VD check'],
            body: r.candidates.map(c => [
              `${c.cable.mm2} mm²`, `${c.correctedAmpacityA.toFixed(1)} A`, c.ampacityPass ? 'PASS' : 'FAIL',
              `${(c.voltageDropPctAtMin ?? 0).toFixed(2)}%`, `${(c.voltageDropPctAtMax ?? 0).toFixed(2)}%`, c.voltageDropPass ? 'PASS' : 'FAIL',
            ]),
          }],
          disclaimer: 'This tool provides a conservative, transparent cable verification based on manufacturer-specified inputs and IEC 60364-5-52 reference derating data. It does not replace a full engineering design or local code compliance review.',
        })
      } else {
        const r = battResult
        const rc = r.recommended
        await generateSizingReportPDF({
          preparedFor: client,
          toolName: 'Battery Cable Sizing Report',
          subtitle: `Cable verification for the battery to inverter connection. Assumed cable type: ${ASSUMED_CABLE_TYPE}.`,
          mode,
          metrics: [
            { label: 'Estimated cable length (one-way)', value: String(battLength), unit: 'm' },
            { label: 'Max charging/discharging current', value: String(battCurrent), unit: 'A' },
            { label: 'Battery voltage', value: String(battVoltage), unit: 'V' },
            { label: 'Ambient temperature', value: String(r.inputs.ambientC), unit: '°C' },
            { label: 'Number of circuits', value: String(r.inputs.numberOfCircuits) },
            { label: 'Combined derating factor (k_total)', value: r.kTotal.toFixed(2) },
            { label: 'Max allowable voltage drop', value: String(r.inputs.maxVoltageDropPct), unit: '%' },
          ],
          highlight: rc
            ? `Recommended cable: ${rc.cable.mm2} mm² battery cable — Ampacity ${rc.ampacityPass ? 'PASS' : 'FAIL'}, Voltage drop ${rc.voltageDropPass ? 'PASS' : 'FAIL'}`
            : NO_CABLE_SATISFIES_MESSAGE,
          tables: [{
            title: 'Cable size evaluation',
            head: ['Cable size', 'Corrected ampacity', 'Ampacity check', 'Voltage drop %', 'VD check'],
            body: r.candidates.map(c => [
              `${c.cable.mm2} mm²`, `${c.correctedAmpacityA.toFixed(1)} A`, c.ampacityPass ? 'PASS' : 'FAIL',
              `${(c.voltageDropPct ?? 0).toFixed(2)}%`, c.voltageDropPass ? 'PASS' : 'FAIL',
            ]),
          }],
          disclaimer: 'This tool provides a conservative, transparent cable verification based on manufacturer-specified inputs and IEC 60364-5-52 reference derating data. It does not replace a full engineering design or local code compliance review.',
        })
      }
    } finally { setPdfBusy(false) }
  }), [tab, pvResult, battResult, pvLength, pvCurrent, pvVmin, pvVmax, battLength, battCurrent, battVoltage, mode, report.run])

  const tourRef = useRef<TourHandle>(null)
  const TOUR_STEPS: TourStep[] = [
    { target: '[data-tour="dc-card"]', title: 'Welcome to the DC Cable Sizing Tool', body: 'Verify that a proposed DC cable is suitable for a PV string or a battery connection — ampacity and voltage drop, checked against IEC reference data.' },
    { target: '[data-tour="dc-tabs"]', title: 'Choose your application', body: 'Switch between PV Module Cable Sizing (array to inverter) and Battery Cable Sizing (battery to inverter).' },
    { target: '[data-tour="dc-mode"]', title: 'Standard vs Advanced', body: 'Standard mode uses conservative pre-set assumptions (40°C ambient, 1 circuit, 3% max voltage drop). Advanced mode lets you customize them.' },
    { target: '[data-tour="dc-inputs"]', title: 'Enter your inverter/battery specs', body: 'These come straight off the manufacturer datasheet — tap the ⓘ next to each field if you\'re not sure where to find a value.' },
    { target: '[data-tour="dc-results"]', title: 'Your results', body: 'See the recommended cable size, whether it passes the ampacity and voltage-drop checks, and why.' },
    { target: '[data-tour="dc-pdf"]', title: 'Download your report', body: 'Get a branded PDF summary of the verification — handy to share with an installer.' },
  ]

  const ambientOptions = mode === 'advanced' ? AMBIENT_TEMP_FACTORS.map(a => a.ambientC) : [DEFAULT_AMBIENT_C]
  const circuitOptions = mode === 'advanced' ? GROUPING_FACTORS.map(g => g.circuits) : [DEFAULT_CIRCUITS]

  return (
    <section id="dc-cable-sizing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-10">
          <div className="section-eyebrow">Premium tool — DC Cable Sizing</div>
          <h2 className="font-disp font-extrabold text-4xl sm:text-5xl text-ink leading-tight mb-4">
            DC Cable Sizing<br /><span className="brand-text-teal">Verification Tool</span>
          </h2>
          <p className="text-ink-muted text-base leading-relaxed">
            Check whether a proposed PV or battery DC cable is actually suitable — ampacity and voltage drop,
            checked against IEC 60364-5-52 derating data. Conservative and transparent, not an optimiser.
          </p>
        </div>

        <UseCaseStrip
          audience="Installers, EPCs, system integrators and hands-on DIY owners wiring a PV or battery DC circuit"
          useCases={[
            'Verifying a proposed cable size before it goes in conduit or trunking, not after',
            'Checking a longer-than-usual battery-to-inverter run doesn\'t exceed the voltage-drop limit',
            'Cross-checking a supplier or contractor\'s recommended cable size against IEC reference data',
            'Producing a quick PDF record of the ampacity and voltage-drop check for a client or inspector',
          ]}
        />

        <div className="tool-frame">
          <div className="card-flat tool-frame-inner" data-tour="dc-card">
            <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-2.5 border-b border-surface-border bg-white">
              <div className="flex gap-1" data-tour="dc-tabs">
                <button onClick={() => setTab('pv')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wide transition-colors ${tab === 'pv' ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/30' : 'text-ink-faint border border-transparent hover:text-ink'}`}>
                  <Sun size={13} /> PV Module Cable
                </button>
                <button onClick={() => setTab('battery')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wide transition-colors ${tab === 'battery' ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/30' : 'text-ink-faint border border-transparent hover:text-ink'}`}>
                  <BatteryCharging size={13} /> Battery Cable
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 bg-surface-subtle rounded-lg p-1" data-tour="dc-mode">
                  <button onClick={() => setMode('standard')} className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase ${mode === 'standard' ? 'bg-white shadow-sm text-ink' : 'text-ink-faint'}`}>Standard</button>
                  <button onClick={() => setMode('advanced')} className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase ${mode === 'advanced' ? 'bg-white shadow-sm text-ink' : 'text-ink-faint'}`}>Advanced</button>
                </div>
                <button onClick={() => tourRef.current?.start()} title="Take the tour" className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-ink-faint hover:text-brand-teal transition-colors flex-shrink-0 border border-surface-border hover:border-brand-teal/40 rounded-lg px-2.5 py-1.5"><HelpCircle size={13} /> Tutorial</button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-surface-border bg-white">
              {/* LEFT — inputs */}
              <div className="p-5 sm:p-8" data-tour="dc-inputs">
                <h3 className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-6">
                  {tab === 'pv' ? 'PV module cable parameters' : 'Battery cable parameters'}
                </h3>

                {tab === 'pv' ? (
                  <div className="space-y-5">
                    <Field label="Estimated Cable Length (one-way)">
                      <NumInput value={pvLength} onChange={setPvLength} step={1} min={0} suffix="m" />
                    </Field>
                    <Field label="Max Operating PV Input Current" info={<InfoBubble title="pv-current" labels={PV_CURRENT_LABELS} note="Enter the maximum operating current specified for the relevant PV input/MPPT." />}>
                      <NumInput value={pvCurrent} onChange={setPvCurrent} step={0.5} min={0} suffix="A" />
                    </Field>
                    <Field label="PV Input Voltage Range" info={<InfoBubble title="pv-voltage" labels={PV_VOLTAGE_RANGE_LABELS} note="e.g. MPPT Voltage Range: 150–425 V. Enter the min and max operating voltage." />}>
                      <div className="grid grid-cols-2 gap-3">
                        <NumInput value={pvVmin} onChange={setPvVmin} step={1} min={0} suffix="V min" />
                        <NumInput value={pvVmax} onChange={setPvVmax} step={1} min={0} suffix="V max" />
                      </div>
                    </Field>

                    <div className="rounded-xl bg-surface-subtle border border-surface-border p-4 text-[11px] font-mono text-ink-muted space-y-1">
                      <div className="text-ink-faint uppercase tracking-wider text-[10px] mb-1">Assumed installation</div>
                      <div>Cable type: <span className="text-ink">{ASSUMED_CABLE_TYPE}</span></div>
                      <div>Installation: <span className="text-ink">Enclosed in conduit/trunking, single-core, bunched/touching</span></div>
                    </div>

                    {mode === 'advanced' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <Field label="Ambient Temp">
                          <select className="tool-input text-xs" value={pvAmbient} onChange={e => setPvAmbient(parseInt(e.target.value))}>
                            {ambientOptions.map(a => <option key={a} value={a}>{a}°C</option>)}
                          </select>
                        </Field>
                        <Field label="No. of Circuits">
                          <select className="tool-input text-xs" value={pvCircuits} onChange={e => setPvCircuits(parseInt(e.target.value))}>
                            {circuitOptions.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </Field>
                        <Field label="Max Voltage Drop">
                          <NumInput value={pvMaxVd} onChange={setPvMaxVd} step={0.5} min={0.5} suffix="%" />
                        </Field>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <Field label="Max Charging or Discharging Current" info={<InfoBubble title="batt-current" labels={BATTERY_CURRENT_LABELS} note="Enter the higher of the maximum charging or maximum discharging current." />}>
                      <NumInput value={battCurrent} onChange={setBattCurrent} step={1} min={0} suffix="A" />
                    </Field>
                    <Field label="Battery Voltage" info={<InfoBubble title="batt-voltage" labels={BATTERY_VOLTAGE_LABELS} note="Enter the battery's nominal operating voltage." />}>
                      <NumInput value={battVoltage} onChange={setBattVoltage} step={1} min={0} suffix="V" />
                    </Field>
                    <Field label="Estimated Battery Cable Length (one-way)">
                      <NumInput value={battLength} onChange={setBattLength} step={0.5} min={0} suffix="m" />
                    </Field>

                    <div className="rounded-xl bg-surface-subtle border border-surface-border p-4 text-[11px] font-mono text-ink-muted space-y-1">
                      <div className="text-ink-faint uppercase tracking-wider text-[10px] mb-1">Assumed installation</div>
                      <div>Cable type: <span className="text-ink">{ASSUMED_CABLE_TYPE}</span></div>
                      <div>Installation: <span className="text-ink">Enclosed in conduit/trunking</span></div>
                    </div>

                    {mode === 'advanced' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <Field label="Ambient Temp">
                          <select className="tool-input text-xs" value={battAmbient} onChange={e => setBattAmbient(parseInt(e.target.value))}>
                            {ambientOptions.map(a => <option key={a} value={a}>{a}°C</option>)}
                          </select>
                        </Field>
                        <Field label="No. of Circuits">
                          <select className="tool-input text-xs" value={battCircuits} onChange={e => setBattCircuits(parseInt(e.target.value))}>
                            {circuitOptions.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </Field>
                        <Field label="Max Voltage Drop">
                          <NumInput value={battMaxVd} onChange={setBattMaxVd} step={0.5} min={0.5} suffix="%" />
                        </Field>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT — results */}
              <div className="p-5 sm:p-8" data-tour="dc-results">
                <h3 className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-6">Results</h3>
                <LeadLock>
                  {rec ? (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-brand-teal/30 bg-brand-teal/5 p-4">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-brand-teal mb-1">Recommended cable size</div>
                        <div className="font-disp font-extrabold text-2xl text-ink">{rec.cable.mm2} mm² {tab === 'pv' ? 'PV' : 'Battery'} Cable</div>
                        <div className="text-[10px] font-mono text-ink-faint mt-1">{ASSUMED_CABLE_TYPE} · smallest size passing both checks</div>
                      </div>

                      <CheckBlock title="Ampacity Check" pass={rec.ampacityPass} explanation={rec.ampacityPass ? AMPACITY_PASS_EXPLANATION : AMPACITY_FAIL_EXPLANATION} />

                      <div className="rounded-xl bg-surface-subtle border border-surface-border p-4">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint mb-2">Ampacity detail</div>
                        <ResultRow label="Design current" value={`${result.designCurrentA.toFixed(1)} A`} />
                        <ResultRow label="Corrected cable ampacity (Iz)" value={`${rec.correctedAmpacityA.toFixed(1)} A`} sub={`k_total = ${result.kTotal.toFixed(2)}`} />
                      </div>

                      <CheckBlock title="Voltage Drop" pass={rec.voltageDropPass} explanation={rec.voltageDropPass ? (tab === 'pv' ? VOLTAGE_DROP_PASS_EXPLANATION_PV : VOLTAGE_DROP_PASS_EXPLANATION_BATTERY) : VOLTAGE_DROP_FAIL_EXPLANATION} />

                      <div className="rounded-xl bg-surface-subtle border border-surface-border p-4">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint mb-2">Voltage drop detail</div>
                        {tab === 'pv' ? (
                          <>
                            <ResultRow label="Maximum PV Voltage" value={`${(rec.voltageDropPctAtMax ?? 0).toFixed(2)}%`} sub={`limit ${pvInputs.maxVoltageDropPct}%`} />
                            <ResultRow label="Minimum PV Voltage" value={`${(rec.voltageDropPctAtMin ?? 0).toFixed(2)}%`} sub={`limit ${pvInputs.maxVoltageDropPct}%`} />
                            <ResultRow label="Absolute drop" value={`${rec.voltageDropAbsoluteV.toFixed(2)} V`} />
                          </>
                        ) : (
                          <>
                            <ResultRow label="Battery Voltage Drop" value={`${(rec.voltageDropPct ?? 0).toFixed(2)}%`} sub={`limit ${battInputs.maxVoltageDropPct}%`} />
                            <ResultRow label="Absolute drop" value={`${rec.voltageDropAbsoluteV.toFixed(2)} V`} />
                          </>
                        )}
                      </div>

                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-[12px] text-ink-muted leading-relaxed">
                        <span className="font-mono font-bold text-emerald-700 uppercase text-[11px]">Overall: </span>
                        The selected cable satisfies the VoltSage current-carrying and voltage-drop criteria under the specified conditions.
                      </div>

                      {report.form}
                      <button onClick={downloadPDF} disabled={pdfBusy} data-tour="dc-pdf" className="w-full btn-teal justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                        {pdfBusy ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />} Download PDF report
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
                        <div className="flex items-center gap-2 mb-1.5"><XCircle size={16} className="text-red-500" /><span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">No suitable cable found</span></div>
                        <p className="text-[11.5px] text-ink-muted leading-relaxed">{NO_CABLE_SATISFIES_MESSAGE}</p>
                      </div>
                      <div className="rounded-xl bg-surface-subtle border border-surface-border p-4">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint mb-2">Largest available size checked</div>
                        {result.candidates.length > 0 && (() => {
                          const last = result.candidates[result.candidates.length - 1]
                          return (
                            <>
                              <ResultRow label="Cable size" value={`${last.cable.mm2} mm²`} />
                              <ResultRow label="Ampacity check" value={last.ampacityPass ? 'PASS' : 'FAIL'} />
                              <ResultRow label="Voltage drop check" value={last.voltageDropPass ? 'PASS' : 'FAIL'} />
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  )}
                </LeadLock>

                <a href="#contact" className="mt-6 btn-primary w-full justify-center"><Zap size={13} /> Request an engineer&apos;s review</a>
              </div>
            </div>
          </div>
        </div>
        <TourGuide ref={tourRef} tourId="dc-cable-sizing" steps={TOUR_STEPS} />

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            { icon: <Cable size={20} />, title: 'What is ampacity?', body: 'The maximum continuous current a cable can carry without overheating, adjusted for ambient temperature and how many cables run together.' },
            { icon: <Info size={20} />, title: 'What is voltage drop?', body: 'Energy lost as heat resistance along the cable. Too much drop means less power actually reaches the inverter — this tool checks it stays within 3% by default.' },
            { icon: <Zap size={20} />, title: 'Conservative by design', body: 'This tool verifies a cable, it doesn\'t optimise your whole system. It always picks the smallest cable that passes every check — nothing riskier.' },
          ].map((c, i) => (
            <div key={i} className="card p-5">
              <div className="text-brand-teal mb-3">{c.icon}</div>
              <h4 className="font-disp font-bold text-base text-ink mb-2">{c.title}</h4>
              <p className="text-ink-muted text-sm">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
