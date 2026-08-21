'use client'
import { useState, useRef, useEffect } from 'react'
import { Globe, Check } from 'lucide-react'
import { LOCALES, LOCALE_LABELS } from '@/lib/i18n/dictionaries'
import { useLang } from './LanguageProvider'

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)} aria-label="Change language" className={`flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-ink-muted hover:text-brand-teal transition-colors ${compact ? 'p-2' : ''}`}>
        <Globe size={14}/> {!compact && locale.toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-surface-border rounded-xl shadow-card-lg overflow-hidden z-50">
          {LOCALES.map(l => (
            <button key={l} onClick={() => { setLocale(l); setOpen(false) }} className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs font-mono text-ink-muted hover:bg-surface-subtle hover:text-ink transition-colors">
              {LOCALE_LABELS[l]}
              {locale === l && <Check size={13} className="text-brand-orange"/>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
