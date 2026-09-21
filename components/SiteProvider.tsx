'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react'
import { useAccess } from '@/components/AccessGate'
import {
  DetectedSite, GeoFailure, getBrowserPosition, locateByNetwork, resolveSite, loadCachedSite, saveCachedSite,
} from '@/lib/geoPsh'

export interface ReportDetails { name: string; company: string; location: string }
export type GeoStatus = 'idle' | 'detecting' | 'ready' | 'failed'
export interface GeoState { status: GeoStatus; site: DetectedSite | null; reason: GeoFailure | null }

interface SiteCtx {
  geo: GeoState
  /** Starts detection once (idempotent). Pass true to force a fresh reading, e.g. from a "Re-detect" button. */
  detect: (force?: boolean) => void
  details: ReportDetails
  setDetails: (patch: Partial<ReportDetails>) => void
}

const noop = () => {}
const Ctx = createContext<SiteCtx>({
  geo: { status: 'idle', site: null, reason: null },
  detect: noop,
  details: { name: '', company: '', location: '' },
  setDetails: noop,
})
export const useSite = () => useContext(Ctx)

const DETAILS_KEY = 'voltsage_report_details'

export function SiteProvider({ children }: { children: ReactNode }) {
  const { lead } = useAccess()
  const [geo, setGeo] = useState<GeoState>({ status: 'idle', site: null, reason: null })
  const [details, setDetailsState] = useState<ReportDetails>({ name: '', company: '', location: '' })
  const startedRef = useRef(false)
  const runRef = useRef(0)
  const locEditedRef = useRef(false)
  const loadedRef = useRef(false)

  // ---- restore saved report details (client only) ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DETAILS_KEY)
      if (raw) {
        const d = JSON.parse(raw)
        const clean = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '')
        setDetailsState({ name: clean(d.name, 80), company: clean(d.company, 100), location: clean(d.location, 120) })
        locEditedRef.current = d.locEdited === true
      }
    } catch { /* corrupt or unavailable storage — start blank */ }
    loadedRef.current = true
  }, [])

  const persist = useCallback((d: ReportDetails) => {
    try { localStorage.setItem(DETAILS_KEY, JSON.stringify({ ...d, locEdited: locEditedRef.current })) } catch { /* ignore */ }
  }, [])

  const setDetails = useCallback((patch: Partial<ReportDetails>) => {
    if (typeof patch.location === 'string') locEditedRef.current = patch.location.trim() !== ''
    setDetailsState(prev => { const next = { ...prev, ...patch }; persist(next); return next })
  }, [persist])

  // ---- prefill: name from the sign-up lead, location from the detected place ----
  useEffect(() => {
    if (lead?.name) setDetailsState(prev => (prev.name ? prev : { ...prev, name: lead.name.slice(0, 80) }))
  }, [lead?.name])

  useEffect(() => {
    const place = geo.site?.place
    if (place && !locEditedRef.current) setDetailsState(prev => (prev.location === place ? prev : { ...prev, location: place.slice(0, 120) }))
  }, [geo.site])

  // ---- geolocation ----
  const detect = useCallback((force = false) => {
    if (!force && startedRef.current) return
    startedRef.current = true
    const id = ++runRef.current
    const alive = () => id === runRef.current
    ;(async () => {
      if (!force) {
        const cached = loadCachedSite()
        if (cached) { if (alive()) setGeo({ status: 'ready', site: cached, reason: null }); return }
      }
      if (alive()) setGeo(g => ({ ...g, status: 'detecting', reason: null }))
      const pos = await getBrowserPosition()
      let site: DetectedSite | null = null
      let reason: GeoFailure | null = null
      if ('lat' in pos) {
        site = await resolveSite(pos.lat, pos.lon, false)
      } else {
        reason = pos.error
        const net = await locateByNetwork()
        if (net) site = await resolveSite(net.lat, net.lon, true, net.hint)
      }
      if (!alive()) return
      if (site) { saveCachedSite(site); setGeo({ status: 'ready', site, reason }) }
      else setGeo({ status: 'failed', site: null, reason })
    })().catch(() => { if (alive()) setGeo({ status: 'failed', site: null, reason: 'unavailable' }) })
  }, [])

  const value = useMemo(() => ({ geo, detect, details, setDetails }), [geo, detect, details, setDetails])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
