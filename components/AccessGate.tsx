'use client'
import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react'
import { X, User, Mail, Globe, Loader2, Lock } from 'lucide-react'
import { useLang } from './LanguageProvider'

interface Lead { name: string; country: string; email: string }
interface AccessCtx {
  lead: Lead | null
  requireLead: (onSuccess: () => void) => void
}

const Ctx = createContext<AccessCtx | null>(null)
export function useAccess() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAccess must be used within AccessProvider')
  return c
}

const LEAD_KEY = 'voltsage_lead'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AccessProvider({ children }: { children: ReactNode }) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [signupOpen, setSignupOpen] = useState(false)
  const pendingRef = useRef<(() => void) | null>(null)

  // Load any previously-captured lead from this browser.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LEAD_KEY)
      if (raw) setLead(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  const requireLead = useCallback((onSuccess: () => void) => {
    if (lead) { onSuccess(); return }
    pendingRef.current = onSuccess
    setSignupOpen(true)
  }, [lead])

  const handleSignupSuccess = (l: Lead) => {
    setLead(l)
    localStorage.setItem(LEAD_KEY, JSON.stringify(l))
    setSignupOpen(false)
    const cb = pendingRef.current; pendingRef.current = null
    if (cb) cb()
  }

  return (
    <Ctx.Provider value={{ lead, requireLead }}>
      {children}
      {signupOpen && <SignupModal defaultEmail={lead?.email} onClose={() => { setSignupOpen(false); pendingRef.current = null }} onSuccess={handleSignupSuccess} />}
    </Ctx.Provider>
  )
}

function ModalShell({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="relative w-full max-w-sm bg-white rounded-2xl border border-surface-border shadow-card-lg p-6">
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-ink-faint hover:text-ink transition-colors"><X size={18}/></button>
        {children}
      </div>
    </div>
  )
}

function SignupModal({ defaultEmail, onClose, onSuccess }: { defaultEmail?: string; onClose: () => void; onSuccess: (l: Lead) => void }) {
  const { t } = useLang()
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [email, setEmail] = useState(defaultEmail || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const WEBHOOK_URL = 'https://hook.us2.make.com/hj6qb3mklp74zq295uhwcrvl9p1fgtla'

  const submit = async () => {
    if (!name.trim() || !country.trim() || !EMAIL_RE.test(email)) {
      setError(t.signup.error); return
    }
    setBusy(true); setError('')
    try {
      // Sent directly from the browser to Make.com — "no-cors" mode is required
      // because Make.com's webhook doesn't return CORS headers, so this is a
      // fire-and-forget call: we can't read a status or response body back.
      // If the request throws here, it's a real network-level failure (e.g. no
      // internet connection) — it does NOT mean Make.com rejected the data.
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          name, country, email,
          source: 'voltsage-sizing-tools',
          page: typeof window !== 'undefined' ? window.location.href : undefined,
          ts: new Date().toISOString(),
        }),
      })
      onSuccess({ name, country, email })
    } catch (err: any) {
      setError('Could not reach the network. Please check your connection and try again.')
    } finally { setBusy(false) }
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center mb-3"><Lock size={17} className="text-brand-orange"/></div>
      <h3 className="font-disp font-bold text-lg text-ink mb-1">{t.signup.title}</h3>
      <p className="text-sm text-ink-muted mb-5">{t.signup.sub}</p>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-ink-faint block mb-1.5">{t.signup.name}</label>
          <div className="relative"><User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Tendai Moyo" className="tool-input !pl-10"/></div>
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-ink-faint block mb-1.5">{t.signup.country}</label>
          <div className="relative"><Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"/><input value={country} onChange={e=>setCountry(e.target.value)} placeholder="Zimbabwe" className="tool-input !pl-10"/></div>
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-ink-faint block mb-1.5">{t.signup.email}</label>
          <div className="relative"><Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"/><input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@email.com" className="tool-input !pl-10"/></div>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
      <button onClick={submit} disabled={busy} className="btn-primary w-full justify-center mt-5 disabled:opacity-50 disabled:cursor-not-allowed">
        {busy ? <Loader2 size={15} className="animate-spin"/> : null} {busy ? t.signup.submitting : t.signup.submit}
      </button>
      <p className="text-[10px] text-ink-faint mt-3 text-center">{t.signup.privacy}</p>
    </ModalShell>
  )
}

/** Wrap any results panel with this to blur/lock it until the visitor has signed up. */
export function LeadLock({ children }: { children: ReactNode }) {
  const { lead, requireLead } = useAccess()
  const { t } = useLang()
  if (lead) return <>{children}</>
  return (
    <div className="relative">
      <div className="pointer-events-none select-none filter blur-sm opacity-60">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <button onClick={() => requireLead(() => {})} className="btn-primary shadow-card-lg"><Lock size={13}/> {t.signup.lockCta}</button>
      </div>
    </div>
  )
}
