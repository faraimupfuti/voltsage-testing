'use client'
import { useEffect, useState } from 'react'
import { Cookie, Shield, ChevronDown, ChevronUp } from 'lucide-react'

export const CONSENT_KEY = 'voltsage_cookie_consent'
export const CONSENT_EVENT = 'voltsage:consent-change'
export const OPEN_CONSENT_EVENT = 'voltsage:open-consent'

export interface ConsentValue { analytics: boolean; ts: number }

export function readConsent(): ConsentValue | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ConsentValue
  } catch { return null }
}

function writeConsent(v: ConsentValue) {
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(v)) } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: v }))
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [analytics, setAnalytics] = useState(true)

  useEffect(() => {
    const existing = readConsent()
    if (!existing) setVisible(true)
    else setAnalytics(existing.analytics)

    const onReopen = () => {
      const current = readConsent()
      setAnalytics(current ? current.analytics : true)
      setExpanded(false)
      setVisible(true)
    }
    window.addEventListener(OPEN_CONSENT_EVENT, onReopen)
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, onReopen)
  }, [])

  const acceptAll = () => { writeConsent({ analytics: true, ts: Date.now() }); setVisible(false) }
  const necessaryOnly = () => { writeConsent({ analytics: false, ts: Date.now() }); setVisible(false) }
  const saveChoices = () => { writeConsent({ analytics, ts: Date.now() }); setVisible(false) }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[300] p-3 sm:p-4">
      <div className="max-w-3xl mx-auto card p-5 sm:p-6 shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
            <Cookie size={16} className="text-brand-orange" />
          </div>
          <div>
            <h3 className="font-disp font-bold text-base text-ink mb-1">Your privacy choices</h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              We use essential cookies to run this site, and optional analytics cookies to understand how visitors use our tools. We only turn analytics on with your consent. See our{' '}
              <a href="/privacy" className="text-brand-orange underline underline-offset-2">Privacy Policy</a> for details.
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-ink-faint hover:text-brand-orange transition-colors mb-4"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Manage preferences
        </button>

        {expanded && (
          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-subtle border border-surface-border">
              <div>
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-ink uppercase tracking-wider"><Shield size={12} /> Necessary</div>
                <p className="text-[11px] text-ink-faint mt-0.5">Required for the site and sizing tools to work. Always on.</p>
              </div>
              <div className="w-10 h-6 rounded-full bg-ink-faint/30 flex items-center px-0.5 flex-shrink-0 cursor-not-allowed">
                <div className="w-5 h-5 rounded-full bg-white shadow ml-auto" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-subtle border border-surface-border">
              <div>
                <div className="font-mono text-xs font-bold text-ink uppercase tracking-wider">Analytics</div>
                <p className="text-[11px] text-ink-faint mt-0.5">Helps us understand tool usage. Anonymised, no ad tracking.</p>
              </div>
              <button
                onClick={() => setAnalytics(v => !v)}
                aria-pressed={analytics}
                aria-label="Toggle analytics cookies"
                className="w-10 h-6 rounded-full flex items-center px-0.5 flex-shrink-0 transition-colors"
                style={{ background: analytics ? '#2621FF' : '#cbd5e1' }}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${analytics ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {expanded ? (
            <button onClick={saveChoices} className="btn-primary flex-1 justify-center">Save preferences</button>
          ) : (
            <button onClick={acceptAll} className="btn-primary flex-1 justify-center">Accept all</button>
          )}
          <button onClick={necessaryOnly} className="btn-secondary flex-1 justify-center">Necessary only</button>
        </div>
      </div>
    </div>
  )
}
