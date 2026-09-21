/**
 * Geolocation -> Peak Sun Hours (PSH) resolution.
 *
 * Order of precedence for the PSH value assigned to a detected location:
 *   1. The VoltSage PSH table  — if the location's country (or, inside Zimbabwe,
 *      its province) is one of the table entries.
 *   2. NASA POWER climatology  — long-term average all-sky solar irradiance at the
 *      exact coordinates (kWh/m²/day, which is numerically equal to PSH).
 *   3. Latitude model          — last-resort offline estimate, so a value is ALWAYS
 *      produced even if every network call fails.
 *
 * Nothing in here throws: every network step is wrapped and falls through to the
 * next one, and resolveSite() always resolves with a usable DetectedSite.
 */
import { PSH_TABLE, PSHOption } from './calculations'

export type PshSource = 'table' | 'nasa' | 'model'
export type GeoFailure = 'denied' | 'unavailable' | 'timeout' | 'unsupported'

export interface DetectedSite {
  lat: number
  lon: number
  /** true when the position came from the network (IP) rather than device GPS/Wi-Fi */
  approximate: boolean
  /** Human-readable location for reports, e.g. "Borrowdale, Harare, Zimbabwe" */
  place: string
  country: string
  countryCode: string
  region: string
  /** id of the matching PSH table entry, or null when the location isn't in the table */
  pshId: string | null
  psh: number
  pshSource: PshSource
  /** short name shown next to the PSH value (table label, or "City, Country") */
  label: string
  detectedAt: number
}

interface GeoPlace { city: string; region: string; country: string; countryCode: string }

// ------------------------------------------------------------------ helpers
const norm = (s: string) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()

const isNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n)

const round = (n: number, d: number) => { const f = Math.pow(10, d); return Math.round(n * f) / f }

export function formatCoords(lat: number, lon: number): string {
  return `${Math.abs(lat).toFixed(3)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(3)}° ${lon >= 0 ? 'E' : 'W'}`
}

function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const R = 6371, rad = Math.PI / 180
  const dLat = (bLat - aLat) * rad, dLon = (bLon - aLon) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

function allOptions(): PSHOption[] { return PSH_TABLE.flatMap(g => g.options) }
function optionById(id: string): PSHOption | null { return allOptions().find(o => o.id === id) ?? null }

// ------------------------------------------------------ table matching
const COUNTRY_CODE_TO_ID: Record<string, string> = {
  DZ: 'algeria', TD: 'chad', EG: 'egypt', LY: 'libya', MR: 'mauritania', NE: 'niger', SD: 'sudan',
  BW: 'botswana', NA: 'namibia', ZM: 'zambia',
  AO: 'angola', SZ: 'eswatini', MW: 'malawi', MZ: 'mozambique', ZA: 'southafrica', TZ: 'tanzania',
  CM: 'cameroon', CI: 'cotedivoire', GH: 'ghana', KE: 'kenya', NG: 'nigeria', RW: 'rwanda', SN: 'senegal', UG: 'uganda',
  BI: 'burundi', CD: 'drc', GQ: 'eqguinea', GA: 'gabon', LR: 'liberia', SL: 'sierraleone',
}

const COUNTRY_NAME_TO_ID: Record<string, string> = {
  algeria: 'algeria', chad: 'chad', egypt: 'egypt', libya: 'libya', mauritania: 'mauritania', niger: 'niger', sudan: 'sudan',
  botswana: 'botswana', namibia: 'namibia', zambia: 'zambia', angola: 'angola',
  eswatini: 'eswatini', swaziland: 'eswatini', malawi: 'malawi', mozambique: 'mozambique',
  'south africa': 'southafrica', tanzania: 'tanzania', 'united republic of tanzania': 'tanzania',
  cameroon: 'cameroon', 'cote d ivoire': 'cotedivoire', 'ivory coast': 'cotedivoire', ghana: 'ghana', kenya: 'kenya',
  nigeria: 'nigeria', rwanda: 'rwanda', senegal: 'senegal', uganda: 'uganda', burundi: 'burundi',
  'dr congo': 'drc', 'democratic republic of the congo': 'drc', 'congo the democratic republic of the': 'drc',
  'congo kinshasa': 'drc', 'equatorial guinea': 'eqguinea', gabon: 'gabon', liberia: 'liberia', 'sierra leone': 'sierraleone',
}

/** Approximate province centres, used to pick a Zimbabwe province from raw coordinates. */
const ZW_PROVINCE_CENTRES: { id: string; lat: number; lon: number }[] = [
  { id: 'bulawayo', lat: -20.15, lon: 28.58 },
  { id: 'harare', lat: -17.83, lon: 31.05 },
  { id: 'manicaland', lat: -18.97, lon: 32.67 },
  { id: 'mashcentral', lat: -17.30, lon: 31.33 },
  { id: 'masheast', lat: -18.19, lon: 31.55 },
  { id: 'mashwest', lat: -17.36, lon: 30.20 },
  { id: 'masvingo', lat: -20.07, lon: 30.83 },
  { id: 'matnorth', lat: -18.37, lon: 26.50 },
  { id: 'matsouth', lat: -20.93, lon: 29.00 },
  { id: 'midlands', lat: -19.45, lon: 29.82 },
]

const inZimbabweBox = (lat: number, lon: number) => lat >= -22.5 && lat <= -15.6 && lon >= 25.2 && lon <= 33.1

function zimbabweProvince(region: string, lat: number, lon: number): PSHOption | null {
  const r = norm(region).replace(/\b(province|metropolitan)\b/g, '').replace(/\s+/g, ' ').trim()
  if (r) {
    const zw = PSH_TABLE.find(g => g.group.startsWith('Zimbabwe'))
    const hit = zw?.options.find(o => norm(o.label) === r)
    if (hit) return hit
  }
  let best: { id: string; d: number } | null = null
  for (const c of ZW_PROVINCE_CENTRES) {
    const d = haversineKm(lat, lon, c.lat, c.lon)
    if (!best || d < best.d) best = { id: c.id, d }
  }
  return best ? optionById(best.id) : null
}

/** Finds the PSH table entry (if any) that covers a location. */
export function matchPshTable(p: { countryCode?: string; country?: string; region?: string; lat: number; lon: number }): PSHOption | null {
  const cc = (p.countryCode || '').toUpperCase()
  const country = norm(p.country || '')
  const inZw = cc === 'ZW' || country === 'zimbabwe' || (!cc && !country && inZimbabweBox(p.lat, p.lon))
  if (inZw) return zimbabweProvince(p.region || '', p.lat, p.lon)
  const id = COUNTRY_CODE_TO_ID[cc] ?? COUNTRY_NAME_TO_ID[country]
  return id ? optionById(id) : null
}

// ----------------------------------------------------- offline PSH model
/**
 * Coarse annual-average daily insolation (kWh/m²/day == PSH) by absolute latitude.
 * Only used when NASA POWER can't be reached — deliberately conservative.
 */
const LAT_PSH_ANCHORS: [number, number][] = [
  [0, 5.0], [10, 5.4], [20, 5.9], [30, 5.5], [40, 4.3], [50, 3.1], [60, 2.4], [70, 1.9], [90, 1.5],
]
export function estimatePshFromLatitude(lat: number): number {
  const a = Math.min(90, Math.max(0, Math.abs(lat)))
  for (let i = 1; i < LAT_PSH_ANCHORS.length; i++) {
    const [x1, y1] = LAT_PSH_ANCHORS[i], [x0, y0] = LAT_PSH_ANCHORS[i - 1]
    if (a <= x1) return round(y0 + ((a - x0) / (x1 - x0)) * (y1 - y0), 2)
  }
  return 1.5
}

// ---------------------------------------------------------- network calls
async function getJson(url: string, ms: number): Promise<any | null> {
  if (typeof fetch === 'undefined') return null
  const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timer = ctl ? setTimeout(() => ctl.abort(), ms) : null
  try {
    const res = await fetch(url, { signal: ctl?.signal, headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    if (timer) clearTimeout(timer)
  }
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

async function reverseGeocode(lat: number, lon: number): Promise<GeoPlace | null> {
  const a = await getJson(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`, 7000)
  if (a && (str(a.countryName) || str(a.countryCode))) {
    return {
      city: str(a.locality) || str(a.city),
      region: str(a.principalSubdivision),
      country: str(a.countryName),
      countryCode: str(a.countryCode),
    }
  }
  const b = await getJson(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=12&addressdetails=1&accept-language=en&lat=${lat}&lon=${lon}`, 7000)
  const ad = b?.address
  if (ad && (str(ad.country) || str(ad.country_code))) {
    return {
      city: str(ad.suburb) || str(ad.city) || str(ad.town) || str(ad.village) || str(ad.county),
      region: str(ad.state) || str(ad.region) || str(ad.province),
      country: str(ad.country),
      countryCode: str(ad.country_code).toUpperCase(),
    }
  }
  return null
}

/** Long-term average all-sky irradiance (kWh/m²/day) at the coordinates, from NASA POWER. */
export async function fetchNasaPsh(lat: number, lon: number): Promise<number | null> {
  const j = await getJson(
    `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lon}&latitude=${lat}&format=JSON`,
    10000,
  )
  const v = j?.properties?.parameter?.ALLSKY_SFC_SW_DWN?.ANN
  // NASA marks missing data with -999; anything outside a physical range is rejected.
  return isNum(v) && v > 0.5 && v < 12 ? round(v, 2) : null
}

// ------------------------------------------------------------ site building
function buildPlace(p: GeoPlace | null, lat: number, lon: number): { place: string; label: string } {
  if (!p) { const c = formatCoords(lat, lon); return { place: c, label: c } }
  const cleanRegion = p.region.replace(/\s+(Province|Metropolitan Province)$/i, '')
  const parts: string[] = []
  const push = (s: string) => { if (s && !parts.some(x => norm(x) === norm(s))) parts.push(s) }
  push(p.city); push(cleanRegion); push(p.country)
  const place = parts.join(', ') || formatCoords(lat, lon)
  const label = [p.city || cleanRegion, p.country].filter((s, i, a) => s && a.findIndex(x => norm(x) === norm(s)) === i).join(', ') || place
  return { place, label }
}

/**
 * Turns a coordinate into a full DetectedSite with a PSH value.
 * Never rejects — worst case is a latitude-model estimate labelled as such.
 */
export async function resolveSite(lat: number, lon: number, approximate: boolean, hint?: GeoPlace | null): Promise<DetectedSite> {
  const gp = (await reverseGeocode(lat, lon).catch(() => null)) ?? hint ?? null
  const { place, label } = buildPlace(gp, lat, lon)
  const base = {
    lat: round(lat, 5), lon: round(lon, 5), approximate, place,
    country: gp?.country ?? '', countryCode: gp?.countryCode ?? '', region: gp?.region ?? '',
    detectedAt: Date.now(),
  }
  const hit = matchPshTable({ countryCode: gp?.countryCode, country: gp?.country, region: gp?.region, lat, lon })
  if (hit) return { ...base, pshId: hit.id, psh: hit.psh, pshSource: 'table', label: hit.label }

  const nasa = await fetchNasaPsh(lat, lon).catch(() => null)
  if (nasa !== null) return { ...base, pshId: null, psh: nasa, pshSource: 'nasa', label }
  return { ...base, pshId: null, psh: estimatePshFromLatitude(lat), pshSource: 'model', label }
}

// -------------------------------------------------------- browser position
export type BrowserPosition = { lat: number; lon: number } | { error: GeoFailure }

export function getBrowserPosition(timeoutMs = 12000): Promise<BrowserPosition> {
  return new Promise(resolve => {
    try {
      if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve({ error: 'unsupported' })
      if (typeof window !== 'undefined' && window.isSecureContext === false) return resolve({ error: 'unsupported' })
      let done = false
      const finish = (v: BrowserPosition) => { if (!done) { done = true; resolve(v) } }
      // Safety net in case a browser never calls either callback.
      const guard = setTimeout(() => finish({ error: 'timeout' }), timeoutMs + 3000)
      navigator.geolocation.getCurrentPosition(
        pos => {
          clearTimeout(guard)
          const { latitude, longitude } = pos.coords
          if (isNum(latitude) && isNum(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) finish({ lat: latitude, lon: longitude })
          else finish({ error: 'unavailable' })
        },
        err => {
          clearTimeout(guard)
          finish({ error: err?.code === 1 ? 'denied' : err?.code === 3 ? 'timeout' : 'unavailable' })
        },
        { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 10 * 60 * 1000 },
      )
    } catch {
      resolve({ error: 'unavailable' })
    }
  })
}

/** Approximate position from the visitor's network — used only when device location is blocked/unavailable. */
export async function locateByNetwork(): Promise<{ lat: number; lon: number; hint: GeoPlace } | null> {
  const a = await getJson('https://ipwho.is/', 6000)
  if (a?.success !== false && isNum(a?.latitude) && isNum(a?.longitude)) {
    return { lat: a.latitude, lon: a.longitude, hint: { city: str(a.city), region: str(a.region), country: str(a.country), countryCode: str(a.country_code) } }
  }
  const b = await getJson('https://ipapi.co/json/', 6000)
  if (isNum(b?.latitude) && isNum(b?.longitude)) {
    return { lat: b.latitude, lon: b.longitude, hint: { city: str(b.city), region: str(b.region), country: str(b.country_name), countryCode: str(b.country_code) } }
  }
  return null
}

// ------------------------------------------------------------------ cache
const SITE_KEY = 'voltsage_site_v1'
const SITE_TTL_MS = 12 * 60 * 60 * 1000

export function loadCachedSite(): DetectedSite | null {
  try {
    const raw = localStorage.getItem(SITE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as DetectedSite
    const ok = s && isNum(s.lat) && isNum(s.lon) && isNum(s.psh) && s.psh > 0 && typeof s.place === 'string'
      && typeof s.label === 'string' && isNum(s.detectedAt) && Date.now() - s.detectedAt < SITE_TTL_MS
      && (s.pshId === null || optionById(s.pshId) !== null)
    return ok ? s : null
  } catch { return null }
}

export function saveCachedSite(s: DetectedSite) {
  try { if (!s.approximate) localStorage.setItem(SITE_KEY, JSON.stringify(s)) } catch { /* storage unavailable */ }
}
