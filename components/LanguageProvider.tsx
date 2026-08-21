'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Locale, LOCALES, dictionaries } from '@/lib/i18n/dictionaries'

interface LangCtx {
  locale: Locale
  setLocale: (l: Locale) => void
  t: typeof dictionaries['en']
}

const Ctx = createContext<LangCtx | null>(null)
export function useLang() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useLang must be used within LanguageProvider')
  return c
}

const STORAGE_KEY = 'voltsage_locale'

function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored && LOCALES.includes(stored)) return stored
    const nav = (navigator.language || 'en').slice(0, 2).toLowerCase() as Locale
    if (LOCALES.includes(nav)) return nav
  } catch { /* ignore */ }
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => { setLocaleState(detectLocale()) }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch { /* ignore */ }
  }

  return (
    <Ctx.Provider value={{ locale, setLocale, t: dictionaries[locale] }}>
      {children}
    </Ctx.Provider>
  )
}
