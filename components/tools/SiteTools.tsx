'use client'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronDown, Loader2, LocateFixed, MapPin, AlertTriangle } from 'lucide-react'
import { PSH_TABLE, findPSH } from '@/lib/calculations'
import { DetectedSite } from '@/lib/geoPsh'
import { useSite, ReportDetails } from '@/components/SiteProvider'
import { useLang } from '@/components/LanguageProvider'

export const AUTO_ID = 'auto'
const KNOWN_IDS = new Set(PSH_TABLE.flatMap(g => g.options.map(o => o.id)))

export interface ResolvedPsh { id: string; label: string; psh: number }
export interface PshSelection {
  /** value bound to the <select>; a table id, or AUTO_ID for a detected location that isn't in the table */
  id: string
  setId: (id: string) => void
  /** what the calculations should use — always a valid label + PSH number */
  resolved: ResolvedPsh
  site: DetectedSite | null
  /** put the selection back on the detected location (used by "Re-detect") */
  followDetected: () => void
}

/**
 * Location -> PSH selection shared by every sizing tool.
 * - Starts geolocation on mount (once per page — the provider de-duplicates it).
 * - When a location is detected it selects the matching table entry, or, when the
 *   location isn't in the table, a "detected location" entry carrying the
 *   satellite-derived PSH for those exact coordinates.
 * - As soon as the user picks something manually, auto-selection stops overriding them.
 */
export function usePshSelection(defaultId = 'harare'): PshSelection {
  const { geo, detect } = useSite()
  const site = geo.site
  const [rawId, setRawId] = useState(defaultId)
  const touched = useRef(false)

  useEffect(() => { detect() }, [detect])

  useEffect(() => {
    if (site && !touched.current) setRawId(site.pshId ?? AUTO_ID)
  }, [site])

  const setId = useCallback((id: string) => {
    if (id !== AUTO_ID && !KNOWN_IDS.has(id)) return
    touched.current = true
    setRawId(id)
  }, [])

  const followDetected = useCallback(() => {
    touched.current = false
    setRawId(prev => (site ? site.pshId ?? AUTO_ID : prev))
  }, [site])

  const id = rawId === AUTO_ID ? (site && site.pshId === null ? AUTO_ID : site?.pshId ?? defaultId) : KNOWN_IDS.has(rawId) ? rawId : defaultId
  const resolved = useMemo<ResolvedPsh>(() => {
    if (id === AUTO_ID && site) return { id: AUTO_ID, label: site.label, psh: site.psh }
    const o = findPSH(id === AUTO_ID ? defaultId : id)
    return { id: o.id, label: o.label, psh: o.psh }
  }, [id, site, defaultId])

  return { id, setId, resolved, site, followDetected }
}

export function PshSelect({ sel, className = '' }: { sel: PshSelection; className?: string }) {
  const { t } = useLang()
  const site = sel.site
  return (
    <div className="relative">
      <select value={sel.id} onChange={e => sel.setId(e.target.value)} aria-label={t.toolsCommon.location} className={`tool-input text-xs !pr-7 ${className}`}>
        {site && site.pshId === null && (
          <optgroup label={t.site.detectedGroup}>
            <option value={AUTO_ID}>{site.label} — {site.psh} PSH</option>
          </optgroup>
        )}
        {PSH_TABLE.map(g => (
          <optgroup key={g.group} label={g.group}>
            {g.options.map(o => <option key={o.id} value={o.id}>{o.label} — {o.psh} PSH</option>)}
          </optgroup>
        ))}
      </select>
      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
    </div>
  )
}

/** One-line status under a tool's header: what was detected, where the PSH came from, and how to retry. */
export function LocationStatus({ sel }: { sel: PshSelection }) {
  const { t } = useLang()
  const { geo, detect } = useSite()
  const site = geo.site
  const retry = () => { sel.followDetected(); detect(true) }

  let body: React.ReactNode
  if (geo.status === 'detecting' && !site) {
    body = <span className="flex items-center gap-1.5"><Loader2 size={11} className="animate-spin" /> {t.site.detecting}</span>
  } else if (site) {
    const src = site.pshSource === 'table' ? t.site.srcTable : site.pshSource === 'nasa' ? t.site.srcNasa : t.site.srcModel
    body = (
      <span className="flex items-center gap-1.5 flex-wrap">
        <MapPin size={11} className="text-brand-teal flex-shrink-0" />
        <span className="text-ink">{site.place}</span>
        {site.approximate && <span>· {t.site.approx}</span>}
        <span>· {site.psh} PSH ({src})</span>
        {geo.status === 'detecting' && <Loader2 size={11} className="animate-spin" />}
      </span>
    )
  } else {
    body = (
      <span className="flex items-center gap-1.5 flex-wrap">
        <AlertTriangle size={11} className="text-amber-600 flex-shrink-0" />
        <span>{geo.reason === 'denied' ? t.site.denied : t.site.unavailable}</span>
      </span>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-2 border-b border-surface-border bg-surface-subtle text-[10px] font-mono text-ink-faint" aria-live="polite">
      {body}
      <button type="button" onClick={retry} disabled={geo.status === 'detecting'} className="flex items-center gap-1 uppercase tracking-wider hover:text-brand-teal transition-colors disabled:opacity-40">
        <LocateFixed size={11} /> {site ? t.site.redetect : t.site.useMyLocation}
      </button>
    </div>
  )
}

// ------------------------------------------------------------ report details
export interface ReportClient { name: string; company: string; location: string }

const clip = (s: string, n: number) => s.replace(/\s+/g, ' ').trim().slice(0, n)
export function cleanClient(d: ReportDetails): ReportClient {
  return { name: clip(d.name, 80), company: clip(d.company, 100), location: clip(d.location, 120) }
}

function ReportDetailsForm({ showErrors, error, rootRef }: { showErrors: boolean; error: string; rootRef: React.RefObject<HTMLDivElement> }) {
  const { t } = useLang()
  const uid = useId()
  const { details, setDetails, geo, detect } = useSite()
  const c = cleanClient(details)
  const bad = (v: string) => showErrors && !v
  const field = (key: keyof ReportDetails, label: string, max: number, auto: string, placeholder: string, extra?: React.ReactNode) => (
    <div className={key === 'location' ? 'sm:col-span-2' : ''}>
      <label htmlFor={`${uid}-${key}`} className="text-[10px] font-mono uppercase tracking-wider text-ink-faint block mb-1">{label} <span className="text-red-500">*</span></label>
      <input
        id={`${uid}-${key}`} data-field={key} type="text" value={details[key]} maxLength={max} autoComplete={auto}
        onChange={e => setDetails({ [key]: e.target.value } as Partial<ReportDetails>)}
        placeholder={placeholder} aria-invalid={bad(c[key])}
        className={`tool-input text-xs ${bad(c[key]) ? '!border-red-400' : ''}`}
      />
      {bad(c[key]) && <span className="text-[10px] font-mono text-red-500 mt-1 block">{t.site.required}</span>}
      {extra}
    </div>
  )
  return (
    <div ref={rootRef} className="rounded-xl border border-surface-border bg-surface-subtle p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">{t.site.reportDetails}</span>
        <button type="button" onClick={() => detect(true)} disabled={geo.status === 'detecting'} className="flex items-center gap-1 text-[10px] font-mono uppercase text-ink-faint hover:text-brand-teal transition-colors disabled:opacity-40">
          {geo.status === 'detecting' ? <Loader2 size={11} className="animate-spin" /> : <LocateFixed size={11} />} {t.site.useMyLocation}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {field('name', t.site.name, 80, 'name', 'Tendai Moyo')}
        {field('company', t.site.company, 100, 'organization', 'Moyo Farms (Pvt) Ltd',
          <button type="button" onClick={() => setDetails({ company: t.site.individual })} className="text-[10px] font-mono text-brand-teal hover:underline mt-1">{t.site.individualCta}</button>)}
        {field('location', t.site.siteLocation, 120, 'off', geo.status === 'detecting' ? t.site.detecting : 'Borrowdale, Harare, Zimbabwe')}
      </div>
      <p className="text-[10px] font-mono text-ink-faint leading-relaxed">{t.site.detailsNote}</p>
      {showErrors && (!c.name || !c.company || !c.location) && <p className="text-[11px] font-mono text-red-500" role="alert">{t.site.fillDetails}</p>}
      {error && <p className="text-[11px] font-mono text-red-500" role="alert">{error}</p>}
    </div>
  )
}

/**
 * Report gate for a tool's PDF button.
 *   const report = useReportDetails()
 *   ...render {report.form} above the button...
 *   onClick => report.run(async client => { ...generate the PDF with preparedFor: client... })
 * run() refuses (and highlights the missing fields) until name, company and location are
 * filled, and turns any PDF failure into an inline message instead of an unhandled error.
 */
export function useReportDetails() {
  const { t } = useLang()
  const { details, detect } = useSite()
  const [showErrors, setShowErrors] = useState(false)
  const [error, setError] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  // Tools without a PSH selector (Battery Runtime, DC Cable) still need the location for the report.
  useEffect(() => { detect() }, [detect])

  const run = useCallback(async (fn: (client: ReportClient) => Promise<void>) => {
    const c = cleanClient(details)
    const missing = (['name', 'company', 'location'] as const).find(k => !c[k])
    if (missing) {
      setShowErrors(true); setError('')
      rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      rootRef.current?.querySelector<HTMLInputElement>(`[data-field="${missing}"]`)?.focus({ preventScroll: true })
      return
    }
    setError('')
    try { await fn(c) } catch (e) { console.error('Report generation failed', e); setError(t.site.pdfError) }
  }, [details, t.site.pdfError])

  const form = <ReportDetailsForm showErrors={showErrors} error={error} rootRef={rootRef} />
  return { form, run }
}
